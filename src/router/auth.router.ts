import { Router } from "express";
import {
    register,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    applyToBecomeSeller,
    getSellerApplications,
    reviewSellerApplication,
} from "../controller/auth.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Validation error
 */
authRouter.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
authRouter.post("/login", login);

/**
 * @swagger
 * /api/auth/seller-application:
 *   post:
 *     summary: Apply for seller access
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller application submitted
 *       409:
 *         description: Application already pending
 */
authRouter.post("/seller-application", protect, applyToBecomeSeller);

/**
 * @swagger
 * /api/auth/seller-applications:
 *   get:
 *     summary: List pending seller applications (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending seller applications
 */
authRouter.get("/seller-applications", protect, restrictTo("admin"), getSellerApplications);

/**
 * @swagger
 * /api/auth/seller-applications/{userId}:
 *   patch:
 *     summary: Approve or reject a seller application (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Application reviewed
 *       404:
 *         description: Pending application not found
 */
authRouter.patch("/seller-applications/:userId", protect, restrictTo("admin"), reviewSellerApplication);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent to email (response is identical whether email exists or not)
 *       500:
 *         description: Failed to send OTP email
 */
authRouter.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and receive a reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "482910"
 *     responses:
 *       200:
 *         description: OTP verified — returns resetToken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 resetToken:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 */
authRouter.post("/verify-otp", verifyOtp);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using the reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resetToken, newPassword]
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid/expired token or weak password
 */
authRouter.post("/reset-password", resetPassword);

export default authRouter;
