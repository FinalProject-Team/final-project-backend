import express from "express";
import {
    createSession,
    getSessions,
    getSessionById
} from "../controllers/liveSessions.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

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
 *             properties:
 *               course_id:
 *                 type: string
 *                 example: "uuid-course-id"
 *               title:
 *                 type: string
 *                 example: "React Live Class"
 *               description:
 *                 type: string
 *                 example: "Intro to React Hooks"
 *               meeting_link:
 *                 type: string
 *                 example: "https://zoom.us/j/123456"
 *               scheduled_at:
 *                 type: string
 *                 example: "2026-05-30T18:00:00Z"
 *     responses:
 *       201:
 *         description: Live session created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, createSession);

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