import { Response } from "express";
import Cart from "../model/cart.model";
import Product from "../model/product.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const cart = await Cart.findOne({ _id: req.params.cartId, user: req.user?._id }).populate("items.product");
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        return res.status(200).json(cart);
    } catch (error) {
        console.error("Failed to get cart:", error);
        return res.status(500).json({ message: "Failed to get cart" });
    }
};

export const createCart = async (req: AuthRequest, res: Response) => {
    try {
        const existingCart = await Cart.findOne({ user: req.user?._id });
        if (existingCart) {
            return res.status(200).json({ message: "Cart already exists", cart: existingCart });
        }
        const cart = await Cart.create({ user: req.user?._id, items: [] });
        return res.status(201).json({ message: "Cart created", cart });
    } catch (error) {
        console.error("Failed to create cart:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "productId and a positive integer quantity are required" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const cart = await Cart.findOne({ _id: req.params.cartId, user: req.user?._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity + quantity > product.stock) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }
            existingItem.quantity += quantity;
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }
            cart.items.push({ product: product._id, quantity });
        }

        await cart.save();
        return res.status(200).json({ message: "Product added to cart", cart });
    } catch (error) {
        console.error("Failed to add product to cart:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
    try {
        const cart = await Cart.findOne({ _id: req.params.cartId, user: req.user?._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== req.params.productId
        );

        await cart.save();
        return res.status(200).json({ message: "Product removed from cart", cart });
    } catch (error) {
        console.error("Failed to remove product from cart:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
