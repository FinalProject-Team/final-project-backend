import express from "express";
import { upload } from "../middlewares/upload.js";

import {
    register,
    login,
    getMe,
    updateProfile,
    googleLogin,
    uploadAvatar
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

console.log("AUTH ROUTES LOADED");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/* ───────────────────────── REGISTER ───────────────────────── */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *               - full_name
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 example: hager@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               confirmPassword:
 *                 type: string
 *                 example: 123456
 *               full_name:
 *                 type: string
 *                 example: Hager Nady
 *               phone:
 *                 type: string
 *                 example: "01000000000"
 *               role:
 *                 type: string
 *                 example: job_seeker
 * */
 
router.post("/register", register);

/* ───────────────────────── LOGIN ───────────────────────── */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: hager@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/* ───────────────────────── GOOGLE LOGIN ───────────────────────── */

/**
 * @swagger
 * /api/auth/google-login:
 *   post:
 *     summary: Google OAuth login (Supabase sync user)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: object
 *     responses:
 *       200:
 *         description: User synced successfully
 *       400:
 *         description: Bad request
 */
router.post("/google-login", googleLogin);

/* ───────────────────────── GET ME ───────────────────────── */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, getMe);

/* ───────────────────────── UPDATE PROFILE ───────────────────────── */

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", protect, updateProfile);

/* ───────────────────────── UPLOAD AVATAR ───────────────────────── */

/**
 * @swagger
 * /api/auth/upload-avatar:
 *   post:
 *     summary: Upload user avatar image
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 */
router.post(
    "/upload-avatar",
    protect,
    upload.single("avatar"),
    uploadAvatar
);

/* ───────────────────────── TEST ROUTE ───────────────────────── */

router.get("/test", (req, res) => {
    res.json({ message: "AUTH ROUTES WORKING" });
});

export default router;