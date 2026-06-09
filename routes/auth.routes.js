import express from "express";

import {
    register,
    login,
    getMe,
    updateProfile,
    googleLogin
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
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hager
 *               email:
 *                 type: string
 *                 example: hager@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", register);

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
 *                 description: Supabase authenticated user object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "123456789"
 *                   email:
 *                     type: string
 *                     example: "hager@gmail.com"
 *                   user_metadata:
 *                     type: object
 *                     properties:
 *                       full_name:
 *                         type: string
 *                         example: "Hager Nady"
 *                       avatar_url:
 *                         type: string
 *                         example: "https://..."
 *     responses:
 *       200:
 *         description: User synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "user"
 *       400:
 *         description: Bad request (missing user data)
 *       500:
 *         description: Server error
 */
router.post("/google-login", googleLogin);
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
 *               name:
 *                 type: string
 *                 example: Hager Nady
 *               bio:
 *                 type: string
 *                 example: Frontend Developer
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", protect, updateProfile);



/**
 * @swagger
 * /api/profile/upload-avatar:
 *   post:
 *     summary: Upload user avatar image
 *     description: Uploads a profile image and updates the user's avatar_url in profiles table.
 *     tags:
 *       - Profile
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
 *                 description: Profile image file (jpg, png, webp)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 avatar_url:
 *                   type: string
 *       400:
 *         description: Bad request (no file or upload error)
 *       500:
 *         description: Server error
 */

router.post(
    "/upload-avatar",
    protect,
    upload.single("avatar"),
    uploadAvatar
);

router.get("/test", (req, res) => {
    res.json({ message: "AUTH ROUTES WORKING" });
});
export default router;


