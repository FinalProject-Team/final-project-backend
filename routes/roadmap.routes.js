import express from "express";

import { protect } from "../middlewares/auth.middleware.js";

import {
    getRoadmap
} from "../controllers/roadmap.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/roadmap:
 *   get:
 *     summary: Get user roadmap
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roadmap fetched successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */
router.get(
    "/",
    protect,
    getRoadmap
);

export default router;