import express from "express";
import {
    getCourseLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    getSingleLesson
} from "../controllers/lessons.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { checkEnrollment } from "../middlewares/checkEnrollment.js";
import { lessonOwner } from "../middlewares/lessonOwner.middleware.js";

const router = express.Router();


// ========================
// TAGS
// ========================
/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Lessons API
 */


// ========================
// GET COURSE LESSONS
// ========================
/**
 * @swagger
 * /api/lessons/course/{id}:
 *   get:
 *     summary: Get all lessons for a course
 *     tags: [Lessons]
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
 */
router.get(
    "/course/:id",
    protect,
    checkEnrollment,
    getCourseLessons
);


// ========================
// GET SINGLE LESSON
// ========================
/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Get single lesson
 *     tags: [Lessons]
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
 */
router.get(
    "/:id",
    protect,
    checkEnrollment,
    getSingleLesson
);


// ========================
// CREATE LESSON
// ========================
/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Create lesson (Instructor + Admin)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               course_id: "uuid"
 *               title: "Intro to React"
 *               video_url: "https://video.com"
 *               lesson_order: 1
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
    "/",
    protect,
    authorize("admin", "instructor"),
    createLesson
);


// ========================
// UPDATE LESSON
// ========================
/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Update lesson
 *     tags: [Lessons]
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
 *         description: Updated
 */
router.put(
    "/:id",
    protect,
    authorize("admin", "instructor"),
    lessonOwner,
    updateLesson
);


// ========================
// DELETE LESSON
// ========================
/**
 * @swagger
 * /api/lessons/{id}:
 *   delete:
 *     summary: Delete lesson
 *     tags: [Lessons]
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
    lessonOwner,
    deleteLesson
);


// ========================
// TEST ROUTE
// ========================
router.get("/test", (req, res) => {
    res.json({ ok: true });
});

export default router;