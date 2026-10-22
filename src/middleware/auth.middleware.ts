import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../model/user.model";

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(401).json({ message: "User account not found" });
        }
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        console.error("Authentication failed:", error);
        return res.status(500).json({ message: "Authentication failed" });
    }
};

export const restrictTo = (...roles: IUser["role"][]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission" });
        }
        next();
    };
};
