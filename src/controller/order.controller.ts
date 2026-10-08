import { Request, Response } from "express";
import Order from "../model/order.model";
import Cart from "../model/cart.model";
import Product from "../model/product.model";

export const placeOrder = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.findById(req.params.cartId).populate("items.product");
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        if (cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

        for (const item of cart.items) {
            const product = item.product as any;
            if (item.quantity <= 0) return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
            if (item.quantity > product.stock) return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.stock}` });
        }

        let total = 0;
        const orderItems = cart.items.map((item) => {
            const product = item.product as any;
            total += product.price * item.quantity;
            return { product: product._id, quantity: item.quantity, price: product.price };
        });

        for (const item of cart.items) {
            const product = item.product as any;
            await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
        }

        const order = await Order.create({ items: orderItems, total });

        cart.items = [];
        await cart.save();

        return res.status(201).json({ message: "Order placed", order });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find().populate("items.product");
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: "Failed to get orders" });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate("items.product");
        if (!order) return res.status(404).json({ message: "Order not found" });
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: "Failed to get order" });
    }
};
