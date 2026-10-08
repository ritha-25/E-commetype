import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../model/user.model";

export interface AuthRequest extends Request {
    user?: any;
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
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const restrictTo = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({ message: "You do not have permission" });
        }
        next();
    };
};
