import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import User from "../model/user.model";
import { sendOtpEmail, sendWelcomeEmail } from "../utils/email";

const signToken = (id: string) =>
    jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: (process.env.JWT_EXPIRES_IN || "14d") as SignOptions["expiresIn"],
    });

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already in use" });

        // Role is always "user" on self-registration — promote via DB only
        const user = await User.create({ name, email, password, role: "user" });

        // Send welcome email — non-blocking, don't fail registration if email fails
        try {
            await sendWelcomeEmail(user.email, user.name);
        } catch (emailErr) {
            console.error("Welcome email failed:", emailErr);
        }

        const token = signToken(user._id.toString());
        return res.status(201).json({ message: "Registered successfully", token });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }/* try {
            const { name, category, price, stock } = req.body;
            if (!name || !category || !price) {
                return res.status(400).json({ message: "Name, category and price are required" });
            }
    
            const product = await Product.create({ name, category, price, stock });
    
            try {
                const admins = await User.find({ role: "admin" }).select("email");
                const adminEmails = admins.map((admin) => admin.email);
                console.log("Sending product email to:", adminEmails);
    
                if (adminEmails.length > 0) {
                    await sendProductRegisteredEmail(adminEmails, name, price, stock);
                    console.log("Product email sent");
                }
            } catch (err) {
                console.error("Product email failed:", err);
            }
    
            return res.status(201).json({ message: "Product created", product });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }*/
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
        return res.status(200).json({ message: "Login successful", token });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// ─── FORGOT PASSWORD ────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Generates a 6-digit OTP, saves it hashed on the user, and emails it.
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        // Always respond with 200 so we don't leak whether an email exists
        if (!user) {
            return res.status(200).json({ message: "If that email exists, an OTP has been sent" });
        }

        // Generate 6-digit numeric OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hash before storing (so plain OTP isn't sitting in the DB)
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        user.otpCode = otpHash;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save({ validateBeforeSave: false });

        try {
            await sendOtpEmail(user.email, otp);
        } catch (emailErr) {
            // Roll back OTP fields if email fails
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

// ─── VERIFY OTP ─────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// Validates the OTP and returns a short-lived reset token.
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
            otpExpires: { $gt: new Date() }, // not expired
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Issue a short-lived reset token (5 min)
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

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Uses the resetToken from verifyOtp to set a new password.
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

        // Set new password — the pre-save hook will hash it
        user.password = newPassword;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};