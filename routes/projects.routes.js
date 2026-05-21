import express from "express";

import {
    getProjects,
    createProject,
    getMyProjects,
    getSingleProject,
    updateProject,
    deleteProject,
} from "../controllers/projects.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Projects APIs
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of all projects
 */
router.get("/", getProjects);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: E-Learning Platform
 *               description:
 *                 type: string
 *                 example: Full stack learning platform project
 *     responses:
 *       201:
 *         description: Project created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/",
    protect,
    createProject
);

/**
 * @swagger
 * /api/projects/my-projects:
 *   get:
 *     summary: Get current user projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User projects retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/my-projects",
    protect,
    getMyProjects
);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get single project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *     responses:
 *       200:
 *         description: Single project retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get("/:id", getSingleProject);


/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               github_link:
 *                 type: string
 *               live_demo:
 *                 type: string
 *               status:
 *                 type: string
 *               completion_percentage:
 *                 type: number
 *               image_url:
 *                 type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               stars:
 *                 type: number
 *
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
router.put("/:id", protect, updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */

router.delete("/:id", protect, deleteProject);
export default router;