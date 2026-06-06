import express from "express";
import {
    createSession,
    getSessions,
    getSessionById,
    getMyLiveSessions
} from "../controllers/liveSessions.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Live Sessions
 *   description: Live classes / meetings system
 */

/**
 * @swagger
 * /api/live-sessions:
 *   post:
 *     summary: Create a live session
 *     tags: [Live Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - title
 *               - meeting_link
 *               - scheduled_at
 *               - session_type
 *             properties:
 *               course_id:
 *                 type: string
 *                 example: "uuid-course-id"
 *               title:
 *                 type: string
 *                 example: "React Live Workshop"
 *               description:
 *                 type: string
 *                 example: "Intro to React Hooks"
 *               meeting_link:
 *                 type: string
 *                 example: "https://zoom.us/j/123456"
 *               scheduled_at:
 *                 type: string
 *                 example: "2026-05-30T18:00:00Z"
 *               session_type:
 *                 type: string
 *                 enum:
 *                   - workshop
 *                   - mentoring
 *                   - q&a
 *                   - live_coding
 *                   - project_review
 *                 example: "workshop"
 *     responses:
 *       201:
 *         description: Live session created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    "/",
    protect,
    authorize("admin", "instructor"),
    createSession
);

/**
 * @swagger
 * /api/live-sessions/my:
 *   get:
 *     summary: Get logged-in student live sessions
 *     tags: [Live Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student live sessions fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my", protect, getMyLiveSessions);

/**
 * @swagger
 * /api/live-sessions:
 *   get:
 *     summary: Get all live sessions
 *     tags: [Live Sessions]
 *     responses:
 *       200:
 *         description: List of live sessions
 */
router.get("/", getSessions);

/**
 * @swagger
 * /api/live-sessions/{id}:
 *   get:
 *     summary: Get single live session
 *     tags: [Live Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Live session data
 *       404:
 *         description: Not found
 */
router.get("/:id", getSessionById);

export default router;