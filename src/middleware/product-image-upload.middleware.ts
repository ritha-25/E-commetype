import { NextFunction, Request, Response } from "express";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
    fileFilter: (_req, file, callback) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new Error("Images must be JPEG, PNG, WebP, GIF, or AVIF"));
        }
        callback(null, true);
    },
}).array("images", 5);

export const uploadProductImages = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (error: unknown) => {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: error.message });
        }
        if (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : "Invalid image upload",
            });
        }
        next();
    });
};
