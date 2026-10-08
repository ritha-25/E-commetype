import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../model/user.model";

const signToken = (id: string) =>
    jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: (process.env.JWT_EXPIRES_IN || "14d") as SignOptions["expiresIn"],
    });

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already in use" });

        const user = await User.create({ name, email, password, role });
        const token = signToken(user._id.toString());
        return res.status(201).json({ message: "Registered successfully", token });
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
        return res.status(200).json({ message: "Login successful", token });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};