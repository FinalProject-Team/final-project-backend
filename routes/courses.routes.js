/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Courses API
 */
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { getCourseLessons } from "../controllers/lessons.controller.js";
import { checkEnrollment } from "../middlewares/checkEnrollment.js";

import {
    getCourses,
    getSingleCourse,
    createCourse,
    updateCourse,
    deleteCourse
} from "../controllers/courses.controller.js";

const router = express.Router();
/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by course title
 *
 *     responses:
 *       200:
 *         description: Success
 */

router.get("/", getCourses);

// router.get("/:id/lessons", getCourseLessons);
router.get(
    "/:id/lessons",
    protect,
    checkEnrollment,
    getCourseLessons
);

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
 *       404:
 *         description: Not found
 */

router.get("/:id", getSingleCourse);


/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               title: "React Basics"
 *               price: 100
 *     responses:
 *       201:
 *         description: Created
 */
// router.post("/", createCourse);

router.post(
    "/",
    protect,
    authorize("admin", "instructor"),
    createCourse
);
/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update course
 *     tags: [Courses]
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
 *               title: "Updated Course"
 *               price: 200
 *     responses:
 *       200:
 *         description: Updated
 */
// router.put("/:id", updateCourse);
router.put(
    "/:id",
    protect,
    authorize("admin", "instructor"),
    updateCourse
);
/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
// router.delete("/:id", deleteCourse);
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteCourse
);
export default router;