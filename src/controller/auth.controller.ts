import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import User from "../model/user.model";
import { sendOtpEmail, sendWelcomeEmail } from "../utils/email";
import { AuthRequest } from "../middleware/auth.middleware";

const signToken = (id: string) =>
    jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: (process.env.JWT_EXPIRES_IN || "14d") as SignOptions["expiresIn"],
    });

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                message: "Name, email, password and confirmPassword are required",
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password and confirmPassword do not match" });
        }
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already in use" });

        const user = await User.create({ name, email, password, role: "user" });

        try {
            await sendWelcomeEmail(user.email, user.name);
        } catch (emailErr) {
            console.error("Welcome email failed:", emailErr);
        }

        const token = signToken(user._id.toString());
        return res.status(201).json({
            message: "Registered successfully",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = signToken(user._id.toString());
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                sellerStatus: user.sellerStatus,
            },
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const applyToBecomeSeller = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role !== "user") {
            return res.status(400).json({ message: "Only customer accounts can apply to become sellers" });
        }
        if (user.sellerStatus === "pending") {
            return res.status(409).json({ message: "Seller application is already pending" });
        }

        user.sellerStatus = "pending";
        await user.save();
        return res.status(200).json({ message: "Seller application submitted", sellerStatus: user.sellerStatus });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const getSellerApplications = async (_req: Request, res: Response) => {
    try {
        const applications = await User.find({ role: "user", sellerStatus: "pending" })
            .select("name email sellerStatus");
        return res.status(200).json(applications);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const reviewSellerApplication = async (req: Request, res: Response) => {
    try {
        const { decision } = req.body;
        if (decision !== "approved" && decision !== "rejected") {
            return res.status(400).json({ message: "Decision must be approved or rejected" });
        }

        const user = await User.findOne({ _id: req.params.userId, sellerStatus: "pending", role: "user" });
        if (!user) return res.status(404).json({ message: "Pending seller application not found" });

        user.sellerStatus = decision;
        user.role = decision === "approved" ? "seller" : "user";
        await user.save();
        return res.status(200).json({
            message: `Seller application ${decision}`,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, sellerStatus: user.sellerStatus },
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: "If that email exists, an OTP has been sent" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        user.otpCode = otpHash;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        try {
            await sendOtpEmail(user.email, otp);
        } catch (emailErr) {
            user.otpCode = undefined;
            user.otpExpires = undefined;
            await user.save({ validateBeforeSave: false });
            console.error("OTP email failed:", emailErr);
            return res.status(500).json({ message: "Failed to send OTP email. Try again." });
        }

        return res.status(200).json({ message: "If that email exists, an OTP has been sent" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        const user = await User.findOne({
            email,
            otpCode: otpHash,
            otpExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const resetToken = jwt.sign(
            { id: user._id.toString(), purpose: "password-reset" },
            process.env.JWT_SECRET as string,
            { expiresIn: "5m" }
        );

        return res.status(200).json({ message: "OTP verified", resetToken });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: "Reset token and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET as string);
        } catch {
            return res.status(400).json({ message: "Reset token is invalid or expired" });
        }

        if (decoded.purpose !== "password-reset") {
            return res.status(400).json({ message: "Invalid token purpose" });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.password = newPassword;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};