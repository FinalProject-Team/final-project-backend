import express from "express";
import { getMyRank, getRanking } from "../controllers/ranking.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ranking
 *   description: Ranking APIs
 */

/**
 * @swagger
 * /api/ranking:
 *   get:
 *     summary: Get leaderboard ranking
 *     tags: [Ranking]
 *     responses:
 *       200:
 *         description: Ranking retrieved successfully
 */

router.get("/", getRanking);
/**
 * @swagger
 * /api/ranking/me:
 *   get:
 *     summary: Get current user rank
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user rank fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/me",
    protect,
    getMyRank
);

export default router;