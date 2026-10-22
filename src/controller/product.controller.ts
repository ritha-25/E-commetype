import { Request, Response } from "express";
import Product from "../model/product.model";
import User from "../model/user.model";
import { sendProductRegisteredEmail } from "../utils/email";
import {
    CloudinaryConfigurationError,
    CloudinaryUploadError,
    deleteProductImages,
    ProductImage,
    uploadProductImages,
} from "../config/cloudinary";
import { AuthRequest } from "../middleware/auth.middleware";

const requestImages = (req: Request): Express.Multer.File[] =>
    Array.isArray(req.files) ? req.files : [];

const canManageProduct = (req: AuthRequest, sellerId?: { toString(): string } | null) =>
    req.user?.role === "admin" ||
    (req.user?.role === "seller" && sellerId?.toString() === req.user._id.toString());

const validPrice = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0;
const validStock = (value: unknown): value is number =>
    typeof value === "number" && Number.isInteger(value) && value >= 0;
const numericField = (value: unknown): number | undefined => {
    if (value === undefined) return undefined;
    if (typeof value === "number") return value;
    return typeof value === "string" && value.trim() ? Number(value) : Number.NaN;
};

const removeUploadedImages = async (images: ProductImage[]) => {
    try {
        await deleteProductImages(images);
    } catch (error) {
        console.error("Failed to clean up product images:", error);
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = 4;
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find().skip(skip).limit(limit),
            Product.countDocuments(),
        ]);

        return res.status(200).json({
            page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            productsPerPage: limit,
            products,
        });
    } catch (error) {
        console.error("Failed to get products:", error);
        return res.status(500).json({ message: "Failed to get products" });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.status(200).json(product);
    } catch (error) {
        console.error("Failed to get product:", error);
        return res.status(500).json({ message: "Failed to get product" });
    }
};

export const getMyProducts = async (req: AuthRequest, res: Response) => {
    try {
        const products = req.user?.role === "admin"
            ? await Product.find()
            : await Product.find({ seller: req.user?._id });
        return res.status(200).json(products);
    } catch (error) {
        console.error("Failed to get seller products:", error);
        return res.status(500).json({ message: "Failed to get seller products" });
    }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
    const { name, category, price, stock } = req.body;
    const numericPrice = numericField(price);
    const numericStock = numericField(stock);
    if (typeof name !== "string" || !name.trim() ||
        typeof category !== "string" || !category.trim() ||
        !validPrice(numericPrice) || (stock !== undefined && !validStock(numericStock))) {
        return res.status(400).json({
            message: "Name, category, a non-negative numeric price, and a non-negative integer stock are required",
        });
    }

    let images: ProductImage[] = [];
    try {
        images = await uploadProductImages(requestImages(req));
        const product = await Product.create({
            name: name.trim(),
            category: category.trim(),
            price: numericPrice,
            stock: numericStock ?? 0,
            seller: req.user?.role === "seller" ? req.user._id : undefined,
            images,
        });

        try {
            const admins = await User.find({ role: "admin" }).select("email");
            const adminEmails = admins.map((admin) => admin.email);
            if (adminEmails.length > 0) {
                await sendProductRegisteredEmail(adminEmails, name, numericPrice, numericStock ?? 0);
            }
        } catch (error) {
            console.error("Product notification email failed:", error);
        }

        return res.status(201).json({ message: "Product created", product });
    } catch (error) {
        await removeUploadedImages(images);
        console.error("Failed to create product:", error);
        if (error instanceof CloudinaryConfigurationError) {
            return res.status(503).json({ message: error.message });
        }
        if (error instanceof CloudinaryUploadError) {
            return res.status(502).json({ message: "Cloudinary image upload failed" });
        }
        return res.status(500).json({ message: "Failed to create product" });
    }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
    let uploadedImages: ProductImage[] = [];
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (!canManageProduct(req, product.seller)) {
            return res.status(403).json({ message: "You can only manage your own products" });
        }
        const previousImages = product.images || [];

        const { name, category, price, stock } = req.body;
        const numericPrice = numericField(price);
        const numericStock = numericField(stock);
        const files = requestImages(req);
        if (name === undefined && category === undefined && price === undefined && stock === undefined && files.length === 0) {
            return res.status(400).json({ message: "Provide product fields or replacement images" });
        }
        if (name !== undefined && (typeof name !== "string" || !name.trim())) {
            return res.status(400).json({ message: "Name must be a non-empty string" });
        }
        if (category !== undefined && (typeof category !== "string" || !category.trim())) {
            return res.status(400).json({ message: "Category must be a non-empty string" });
        }
        if (price !== undefined && !validPrice(numericPrice)) {
            return res.status(400).json({ message: "Price must be a non-negative number" });
        }
        if (stock !== undefined && !validStock(numericStock)) {
            return res.status(400).json({ message: "Stock must be a non-negative integer" });
        }

        uploadedImages = await uploadProductImages(files);
        if (name !== undefined) product.name = name.trim();
        if (category !== undefined) product.category = category.trim();
        if (numericPrice !== undefined) product.price = numericPrice;
        if (numericStock !== undefined) product.stock = numericStock;
        if (uploadedImages.length > 0) product.images = uploadedImages;
        await product.save();

        if (uploadedImages.length > 0) {
            await removeUploadedImages(previousImages);
        }
        return res.status(200).json({ message: "Product updated", product });
    } catch (error) {
        await removeUploadedImages(uploadedImages);
        console.error("Failed to update product:", error);
        if (error instanceof CloudinaryConfigurationError) {
            return res.status(503).json({ message: error.message });
        }
        if (error instanceof CloudinaryUploadError) {
            return res.status(502).json({ message: "Cloudinary image upload failed" });
        }
        return res.status(500).json({ message: "Failed to update product" });
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (!canManageProduct(req, product.seller)) {
            return res.status(403).json({ message: "You can only manage your own products" });
        }

        await product.deleteOne();
        try {
            await deleteProductImages(product.images || []);
        } catch (error) {
            console.error("Product deleted, but Cloudinary image cleanup failed:", error);
            return res.status(200).json({
                message: "Product deleted; one or more images could not be removed from Cloudinary",
            });
        }
        return res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        console.error("Failed to delete product:", error);
        return res.status(500).json({ message: "Failed to delete product" });
    }
};
