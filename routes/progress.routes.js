import express from "express";
import { supabaseAdmin } from "../config/supabase.js";

import { protect } from "../middlewares/auth.middleware.js";

import {
    completeLesson,
    getMyProgress,
    getDashboardStats,
    getContinueLearning,
    getRecentActivity,
    getDashboardSummary,
} from "../controllers/progress.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Progress and dashboard APIs
 */

/**
 * @swagger
 * /api/progress/lessons/{id}/complete:
 *   post:
 *     summary: Complete a lesson
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *     responses:
 *       200:
 *         description: Lesson completed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.post(
    "/lessons/:id/complete",
    protect,
    completeLesson
);

/**
 * @swagger
 * /api/progress/my-progress:
 *   get:
 *     summary: Get current user progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User progress retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/my-progress",
    protect,
    getMyProgress
);

/**
 * @swagger
 * /api/progress/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/dashboard-stats",
    protect,
    getDashboardStats
);

/**
 * @swagger
 * /api/progress/debug/enrollments:
 *   get:
 *     summary: Debug enrollments table
 *     tags: [Progress]
 *     responses:
 *       200:
 *         description: Enrollments debug data
 */
router.get("/debug/enrollments", async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from("enrollments")
        .select("*");

    res.json({ data, error });
});

/**
 * @swagger
 * /api/progress/continue-learning:
 *   get:
 *     summary: Get continue learning courses
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Continue learning data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/continue-learning",
    protect,
    getContinueLearning
);

/**
 * @swagger
 * /api/progress/recent-activity:
 *   get:
 *     summary: Get recent activity
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/recent-activity",
    protect,
    getRecentActivity
);

/**
 * @swagger
 * /api/progress/dashboard-summary:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/dashboard-summary",
    protect,
    getDashboardSummary
);

export default router;