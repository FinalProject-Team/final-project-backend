import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

import {
    enrollCourse,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Course enrollment APIs
 */

/**
 * @swagger
 * /api/enrollments/{courseId}:
 *   post:
 *     summary: Enroll student in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         example: 123
 *     responses:
 *       200:
 *         description: Enrolled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Course not found
 */
router.post(
    "/:courseId",
    protect,
    authorize("student"),
    enrollCourse
);

export default router;