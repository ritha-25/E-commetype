import { Router } from "express";
import { placeOrder, getOrders, getOrderById } from "../controller/order.controller";

const orderRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /api/order/{cartId}:
 *   post:
 *     summary: Place an order from a cart
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Order placed
 *       400:
 *         description: Cart is empty
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */
orderRouter.post("/order/:cartId", placeOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 */
orderRouter.get("/orders", getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 */
orderRouter.get("/orders/:id", getOrderById);

export default orderRouter;
