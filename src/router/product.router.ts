import { Router } from "express";
import {
    getProducts,
    getProductById,
    getMyProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controller/product.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { uploadProductImages } from "../middleware/product-image-upload.middleware";

const productRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products (paginated, 4 per page)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number to retrieve
 *     responses:
 *       200:
 *         description: Paginated list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalProducts:
 *                   type: integer
 *                 productsPerPage:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 */
productRouter.get("/products", getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
productRouter.get("/products/:id", getProductById);

/**
 * @swagger
 * /api/seller/products:
 *   get:
 *     summary: List the signed-in seller's products (admin sees all)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller product inventory
 */
productRouter.get("/seller/products", protect, restrictTo("admin", "seller"), getMyProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product (admin or approved seller)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, category, price]
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
productRouter.post(
    "/products",
    protect,
    restrictTo("admin", "seller"),
    uploadProductImages,
    createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (admin or owning seller)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
productRouter.put(
    "/products/:id",
    protect,
    restrictTo("admin", "seller"),
    uploadProductImages,
    updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (admin or owning seller)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
productRouter.delete("/products/:id", protect, restrictTo("admin", "seller"), deleteProduct);

export default productRouter;
