/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs
 */

import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

import {
    getAdminDashboard,
    getAllUsers,
    updateUserRole,
    deleteUser
} from "../controllers/admin.controller.js";

const router = express.Router();



/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Admin dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 */
router.get(
    "/dashboard",
    protect,
    authorize("admin"),
    getAdminDashboard
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
    "/users",
    protect,
    authorize("admin"),
    getAllUsers
);

/**
 * @swagger
 * /api/admin/user/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Admin]
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
 *               role: "instructor"
 *     responses:
 *       200:
 *         description: Updated
 */
router.put(
    "/user/:id/role",
    protect,
    authorize("admin"),
    updateUserRole
);

/**
 * @swagger
 * /api/admin/user/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
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
 */
router.delete(
    "/user/:id",
    protect,
    authorize("admin"),
    deleteUser
);


export default router