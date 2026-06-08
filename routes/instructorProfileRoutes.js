import express from "express";
import {
    getMyInstructorProfile,
    updateInstructorProfile,
    getInstructorProfileById
} from "../controllers/instructorProfileController.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// لازم يكون logged in
/**
 * @swagger
 * /api/instructor/profile/me:
 *   get:
 *     summary: Get logged-in instructor profile
 *     tags: [Instructor Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/me", protect, getMyInstructorProfile);

// router.get("/me", protect, getMyInstructorProfile);
/**
 * @swagger
 * /api/instructor/profile/me:
 *   put:
 *     summary: Update instructor profile
 *     tags: [Instructor Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *                 example: Cairo, Egypt
 *               website:
 *                 type: string
 *                 example: https://myportfolio.com
 *               github:
 *                 type: string
 *                 example: https://github.com/username
 *               linkedin:
 *                 type: string
 *                 example: https://linkedin.com/in/username
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/me", protect, updateInstructorProfile);

// public route (مفيش حماية)

/**
 * @swagger
 * /api/instructor/profile/{id}:
 *   get:
 *     summary: Get instructor public profile
 *     tags: [Instructor Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 */

router.get("/:id", getInstructorProfileById);

export default router;