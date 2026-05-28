import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { getInstructorDashboard } from "../controllers/instructor.controller.js";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Instructor
 *   description: Instructor Dashboard APIs
 */


/**
 * @swagger
 * /api/instructor/dashboard:
 *   get:
 *     summary: Get instructor dashboard statistics
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 totalCourses: 5
 *                 totalLessons: 20
 *                 totalStudents: 100
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 */


// ======================
// Instructor Dashboard
// ======================
router.get(
    "/dashboard",
    protect,
    authorize("instructor"),
    getInstructorDashboard
);

export default router;