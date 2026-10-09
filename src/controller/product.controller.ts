import { Request, Response } from "express";
import Product from "../model/product.model";
import User from "../model/user.model";
import { sendProductRegisteredEmail } from "../utils/email";

export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = 4;
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find().skip(skip).limit(limit),
            Product.countDocuments(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            page,
            totalPages,
            totalProducts: total,
            productsPerPage: limit,
            products,
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to get products" });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: "Failed to get product" });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
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
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const { name, category, price, stock } = req.body;
        if (name) product.name = name;
        if (category) product.category = category;
        if (price) product.price = price;
        if (stock !== undefined) product.stock = stock;

        await product.save();
        return res.status(200).json({ message: "Product updated", product });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};