import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";


import {
    getInstructorDashboard,
    getInstructorCourses,
    getInstructorCoursesSummary,
    getInstructorActivity,
    getInstructorLiveSessions
} from "../controllers/instructor.controller.js";


const router = express.Router();

// ======================
// TAGS
// ======================
/**
 * @swagger
 * tags:
 *   name: Instructor
 *   description: Instructor Dashboard APIs
 */


// ======================
// DASHBOARD
// ======================
/**
 * @swagger
 * /api/instructor/dashboard:
 *   get:
 *     summary: Get instructor dashboard stats
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 totalCourses: 3
 *                 totalLessons: 12
 *                 totalStudents: 50
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    "/dashboard",
    protect,
    authorize("instructor"),
    getInstructorDashboard
);


// ======================
// INSTRUCTOR COURSES
// ======================
/**
 * @swagger
 * /api/instructor/courses:
 *   get:
 *     summary: Get instructor courses
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               example:
 *                 - id: "uuid"
 *                   title: "React Course"
 *                   price: 500
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get(
    "/courses",
    protect,
    authorize("instructor"),
    getInstructorCourses
);


// ======================
// COURSES SUMMARY
// ======================
/**
 * @swagger
 * /api/instructor/courses/summary:
 *   get:
 *     summary: Get courses with lessons count
 *     tags: [Instructor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               example:
 *                 - id: "uuid"
 *                   title: "React Course"
 *                   totalLessons: 10
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
    "/courses/summary",
    protect,
    authorize("instructor"),
    getInstructorCoursesSummary
);


/**
 * @swagger
 * /api/instructor/activity:
 *   get:
 *     summary: Get instructor recent activity
 *     tags: [Instructor Dashboard APIs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/activity", protect, getInstructorActivity);


/**
 * @swagger
 * /api/live-sessions/instructor:
 *   get:
 *     summary: Get instructor live sessions
 *     description: Retrieve all live sessions created by the logged-in instructor
 *     tags:
 *       - Live Sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor live sessions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Instructor live sessions fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Missing instructor profile
 *       500:
 *         description: Server error
 */
router.get(
    "/live-sessions/instructor",
    protect,
    authorize("instructor"),
    getInstructorLiveSessions
);

export default router;