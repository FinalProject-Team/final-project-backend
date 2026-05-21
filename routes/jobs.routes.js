import express from "express";

import {
    getJobs,
    getSingleJob,
    applyToJob,
    getMyApplications,
} from "../controllers/jobs.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Jobs APIs
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of all jobs
 */
router.get("/", getJobs);

/**
 * @swagger
 * /api/jobs/my-applications:
 *   get:
 *     summary: Get current user applications
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User applications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/my-applications",
    protect,
    getMyApplications
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get single job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 123
 *     responses:
 *       200:
 *         description: Single job retrieved successfully
 *       404:
 *         description: Job not found
 */
router.get("/:id", getSingleJob);

/**
 * @swagger
 * /api/jobs/{id}/apply:
 *   post:
 *     summary: Apply to a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 123
 *     responses:
 *       200:
 *         description: Applied successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.post(
    "/:id/apply",
    protect,
    applyToJob
);

export default router;