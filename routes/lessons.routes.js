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

const router = express.Router();

// ========================
//  Get lessons of course
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
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/course/:id",
    protect,
    checkEnrollment,
    getCourseLessons
);


// ========================
//  Get single lesson
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
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/:id",
    protect,
    checkEnrollment,
    getSingleLesson
);


// ========================
//  Create lesson
// ========================
/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Create a lesson
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
 *               video_url: "https://..."
 *               lesson_order: 1
 *     responses:
 *       201:
 *         description: Created
 *       403:
 *         description: Forbidden
 */
router.post(
    "/",
    protect,
    authorize("admin", "instructor"),
    createLesson
);

// ========================
//  Update lesson
// ========================
/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Update a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               title: "Updated Lesson"
 *               video_url: "https://..."
 *     responses:
 *       200:
 *         description: Updated
 *       403:
 *         description: Forbidden
 */
router.put(
    "/:id",
    protect,
    authorize("admin", "instructor"),
    updateLesson
);


// ========================
//  Delete lesson
// ========================
/**
 * @swagger
 * /api/lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
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
 *         description: Deleted
 *       403:
 *         description: Forbidden
 */
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteLesson
);

router.get("/test", (req, res) => {
    res.json({ ok: true });
});



export default router;