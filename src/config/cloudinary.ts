import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import { Express } from "express";

export class CloudinaryConfigurationError extends Error {}
export class CloudinaryUploadError extends Error {}

const getCloudinary = () => {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new CloudinaryConfigurationError(
            "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
        );
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });
    return cloudinary;
};

export interface ProductImage {
    url: string;
    publicId: string;
}

export const uploadProductImages = async (
    files: Express.Multer.File[]
): Promise<ProductImage[]> => {
    if (files.length === 0) return [];
    const client = getCloudinary();
    const uploaded: ProductImage[] = [];

    try {
        for (const file of files) {
            const result = await new Promise<UploadApiResponse>((resolve, reject) => {
                const stream = client.uploader.upload_stream(
                    { folder: "ecommerce/products", resource_type: "image" },
                    (error, response) => {
                        if (error) return reject(error);
                        if (!response) return reject(new Error("Cloudinary returned no upload result"));
                        resolve(response);
                    }
                );
                stream.end(file.buffer);
            });
            uploaded.push({ url: result.secure_url, publicId: result.public_id });
        }
        return uploaded;
    } catch (error) {
        await Promise.all(
            uploaded.map(({ publicId }) =>
                client.uploader.destroy(publicId).catch((cleanupError: unknown) => {
                    console.error("Failed to clean up Cloudinary upload:", cleanupError);
                })
            )
        );
        throw new CloudinaryUploadError(
            error instanceof Error ? error.message : "Cloudinary image upload failed"
        );
    }
};

export const deleteProductImages = async (images: ProductImage[]): Promise<void> => {
    if (images.length === 0) return;
    const client = getCloudinary();
    const results = await Promise.all(
        images.map(({ publicId }) => client.uploader.destroy(publicId))
    );
    if (results.some((result) => result.result !== "ok" && result.result !== "not found")) {
        throw new Error("Cloudinary could not delete one or more product images");
    }
};
