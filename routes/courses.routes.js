import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { isCourseOwner } from "../middlewares/courseOwner.middleware.js";
import { checkEnrollment } from "../middlewares/checkEnrollment.js";

import { getCourseLessons } from "../controllers/lessons.controller.js";

import {
    getCourses,
    getSingleCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getInstructorCourses
} from "../controllers/courses.controller.js";

const router = express.Router();


// =========================
// TAGS
// =========================

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Courses API
 */


// =========================
// GET ALL COURSES (PUBLIC)
// =========================

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all published courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", getCourses);


// =========================
// GET SINGLE COURSE
// =========================

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get single course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id", getSingleCourse);


// =========================
// GET COURSE LESSONS (STUDENT ONLY)
// =========================

/**
 * @swagger
 * /api/courses/{id}/lessons:
 *   get:
 *     summary: Get course lessons (only enrolled students)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/:id/lessons",
    protect,
    checkEnrollment,
    getCourseLessons
);


// =========================
// INSTRUCTOR COURSES
// =========================

/**
 * @swagger
 * /api/courses/instructor/my-courses:
 *   get:
 *     summary: Get instructor courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/instructor/my-courses",
    protect,
    authorize("instructor"),
    getInstructorCourses
);


// =========================
// CREATE COURSE
// =========================

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create course (Admin / Instructor)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               title: "React Course"
 *               price: 1000
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
    "/",
    protect,
    authorize("admin", "instructor"),
    createCourse
);


// =========================
// UPDATE COURSE
// =========================

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update course (Admin full / Instructor own only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 */
router.put(
    "/:id",
    protect,
    authorize("admin", "instructor"),
    (req, res, next) => {
        if (req.profile.role === "instructor") {
            return isCourseOwner(req, res, next);
        }
        next();
    },
    updateCourse
);


// =========================
// DELETE COURSE
// =========================

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete course (Admin full / Instructor own only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete(
    "/:id",
    protect,
    authorize("admin", "instructor"),
    (req, res, next) => {
        if (req.profile.role === "instructor") {
            return isCourseOwner(req, res, next);
        }
        next();
    },
    deleteCourse
);

export default router;