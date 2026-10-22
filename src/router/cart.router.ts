import { Router } from "express";
import { getCart, createCart, addToCart, removeFromCart } from "../controller/cart.controller";
import { protect } from "../middleware/auth.middleware";

const cartRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management
 */

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Create a new cart
 *     tags: [Cart]
 *     responses:
 *       201:
 *         description: Cart created
 *       500:
 *         description: Server error
 */
cartRouter.post("/cart", protect, createCart);

/**
 * @swagger
 * /api/cart/{cartId}:
 *   get:
 *     summary: Get cart by ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart found
 *       404:
 *         description: Cart not found
 */
cartRouter.get("/cart/:cartId", protect, getCart);

/**
 * @swagger
 * /api/cart/{cartId}/add:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product added to cart
 *       404:
 *         description: Cart or product not found
 *       500:
 *         description: Server error
 */
cartRouter.post("/cart/:cartId/add", protect, addToCart);

/**
 * @swagger
 * /api/cart/{cartId}/remove/{productId}:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from cart
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */
cartRouter.delete("/cart/:cartId/remove/:productId", protect, removeFromCart);

export default cartRouter;
