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
    getProgressDashboard
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


/**
 * @swagger
 * /api/progress/progress-dashboard:
 *   get:
 *     summary: Get full progress dashboard data (for Progress Page UI)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     overall_progress:
 *                       type: number
 *                       example: 43
 *                     current_streak:
 *                       type: number
 *                       example: 7
 *                     total_xp_this_month:
 *                       type: number
 *                       example: 4820
 *                     certificates_count:
 *                       type: number
 *                       example: 2
 *                 xp_growth:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       week:
 *                         type: string
 *                         example: "W2"
 *                       xp:
 *                         type: number
 *                         example: 1200
 *                 course_completion:
 *                   type: object
 *                   properties:
 *                     completed:
 *                       type: number
 *                       example: 12
 *                     in_progress:
 *                       type: number
 *                       example: 6
 *                     not_started:
 *                       type: number
 *                       example: 10
 *                 progress_per_course:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "React"
 *                       progress:
 *                         type: number
 *                         example: 62
 *                 daily_learning_hours:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         example: "Mon"
 *                       hours:
 *                         type: number
 *                         example: 2
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get(
    "/progress-dashboard",
    protect,
    getProgressDashboard
);

export default router;