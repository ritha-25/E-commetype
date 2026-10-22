import { Response } from "express";
import Order from "../model/order.model";
import Cart from "../model/cart.model";
import Product from "../model/product.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const placeOrder = async (req: AuthRequest, res: Response) => {
    try {
        const cart = await Cart.findOne({ _id: req.params.cartId, user: req.user?._id }).populate("items.product");
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        if (cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

        for (const item of cart.items) {
            const product = item.product as any;
            if (!product) return res.status(400).json({ message: "A cart product is no longer available" });
            if (item.quantity <= 0) return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
            if (item.quantity > product.stock) return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.stock}` });
        }

        let total = 0;
        const orderItems = cart.items.map((item) => {
            const product = item.product as any;
            total += product.price * item.quantity;
            return {
                product: product._id,
                seller: product.seller,
                quantity: item.quantity,
                price: product.price,
            };
        });

        for (const item of cart.items) {
            const product = item.product as any;
            await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
        }

        const order = await Order.create({ items: orderItems, total, user: req.user?._id });

        cart.items = [];
        await cart.save();

        return res.status(201).json({ message: "Order placed", order });
    } catch (error) {
        console.error("Failed to place order:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const filter = req.user?.role === "admin"
            ? {}
            : req.user?.role === "seller"
                ? { "items.seller": req.user._id }
                : { user: req.user?._id };
        const orders = await Order.find(filter).populate("items.product");
        if (req.user?.role === "seller") {
            const sellerId = req.user._id.toString();
            return res.status(200).json(orders.map((order) => {
                const items = order.items.filter((item) => item.seller?.toString() === sellerId);
                return {
                    ...order.toObject(),
                    items,
                    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                };
            }));
        }
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Failed to get orders:", error);
        return res.status(500).json({ message: "Failed to get orders" });
    }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate("items.product");
        if (!order) return res.status(404).json({ message: "Order not found" });
        const isAdmin = req.user?.role === "admin";
        const isBuyer = order.user?.toString() === req.user?._id.toString();
        const isSeller = req.user?.role === "seller" &&
            order.items.some((item) => item.seller?.toString() === req.user?._id.toString());
        if (!isAdmin && !isBuyer && !isSeller) {
            return res.status(403).json({ message: "You do not have permission to view this order" });
        }
        if (isSeller && !isAdmin && !isBuyer) {
            const sellerId = req.user?._id.toString();
            const items = order.items.filter((item) => item.seller?.toString() === sellerId);
            return res.status(200).json({
                ...order.toObject(),
                items,
                total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            });
        }
        return res.status(200).json(order);
    } catch (error) {
        console.error("Failed to get order:", error);
        return res.status(500).json({ message: "Failed to get order" });
    }
};
