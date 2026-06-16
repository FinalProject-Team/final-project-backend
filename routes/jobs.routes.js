import express from "express";
import {
    getJobs,
    createJob,
    getJobById,
    applyToJob,
    getJobApplicants,
    updateApplicationStatus,
    getMyJobs,
    getMyApplications,
} from "../controllers/jobs.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/rbac.middleware.js";

const router = express.Router();


// =====================================================
// DASHBOARD ROUTES
// =====================================================

/**
 * @swagger
 * /api/jobs/my/jobs:
 *   get:
 *     summary: Get jobs created by current user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
// router.get(
//     "/my/jobs",
//     protect,
//     allowRoles("job_seeker", "admin"),
//     getMyJobs
// );
router.get(
    "/my/jobs",
    protect,
    allowRoles("employer", "admin"),
    getMyJobs
);

/**
 * @swagger
 * /api/jobs/my/applications:
 *   get:
 *     summary: Get applications of current user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get(
    "/my/applications",
    protect,
    allowRoles("student", "normal_user"),
    getMyApplications
);


// =====================================================
// JOBS ROUTES
// =====================================================

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all active jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", getJobs);


/**
 * @swagger
 * /api/jobs/{jobId}:
 *   get:
 *     summary: Get single job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/:jobId", getJobById);


/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               salary:
 *                 type: string
 *               description:
 *                 type: string
 *               job_type:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
// router.post(
//     "/",
//     protect,
//     allowRoles("job_seeker", "admin"),
//     createJob
// );

router.post(
    "/",
    protect,
    allowRoles("admin", "employer"),
    createJob
);


// =====================================================
// APPLICATIONS ROUTES
// =====================================================

/**
 * @swagger
 * /api/jobs/apply:
 *   post:
 *     summary: Apply to a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job_id:
 *                 type: string
 *               cover_letter:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post(
    "/apply",
    protect,
    allowRoles("student", "normal_user", "job_seeker"),
    applyToJob
);


/**
 * @swagger
 * /api/jobs/{jobId}/applicants:
 *   get:
 *     summary: Get applicants for a job (owner only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of applicants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get(
    "/:jobId/applicants",
    protect,
    allowRoles("job_seeker", "admin", "employer"),
    getJobApplicants
);


/**
 * @swagger
 * /api/jobs/applications/{applicationId}/status:
 *   patch:
 *     summary: Accept or reject application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.patch(
    "/applications/:applicationId/status",
    protect,
    allowRoles("job_seeker", "admin"),
    updateApplicationStatus
);

export default router;