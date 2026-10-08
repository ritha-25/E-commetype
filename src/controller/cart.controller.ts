import { Request, Response } from "express";
import Cart from "../model/cart.model";
import Product from "../model/product.model";

export const getCart = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.findById(req.params.cartId).populate("items.product");
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: "Failed to get cart" });
    }
};

export const createCart = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.create({ items: [] });
        return res.status(201).json({ message: "Cart created", cart });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const addToCart = async (req: Request, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ message: "productId and quantity are required" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const cart = await Cart.findById(req.params.cartId);
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: product._id as any, quantity });
        }

        await cart.save();
        return res.status(200).json({ message: "Product added to cart", cart });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.findById(req.params.cartId);
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== req.params.productId
        );

        await cart.save();
        return res.status(200).json({ message: "Product removed from cart", cart });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};
