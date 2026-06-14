import express from "express";
import {
   getMyNotifications,
   markAsRead,
   markAllAsRead,
   getUnreadCount
} from "../controllers/notifications.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================================
   GET MY NOTIFICATIONS
========================================= */
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", protect, getMyNotifications);

/* =========================================
   GET UNREAD COUNT
========================================= */
/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notifications count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             example:
 *               unread: 3
 */
router.get("/unread-count", protect, getUnreadCount);

/* =========================================
   MARK SINGLE AS READ
========================================= */
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 */
router.put("/:id/read", protect, markAsRead);

/* =========================================
   MARK ALL AS READ
========================================= */
/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put("/read-all", protect, markAllAsRead);

export default router;