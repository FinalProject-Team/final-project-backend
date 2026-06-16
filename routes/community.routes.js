import express from "express";
import {
    fetchPosts,
    createPost,
    likePost,
    savePost,
    postComment,
    castPollVote,
    removePost,
    fetchTrending,
    fetchLeaderboard,
    fetchEvents,
    fetchSuggestedMembers,
    followUser
} from "../controllers/community.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();


// =====================================================
// 📝 POSTS
// =====================================================

/**
 * @swagger
 * /api/community/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Community Posts]
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "post_1"
 *                   user_id:
 *                     type: string
 *                     example: "user_123"
 *                   content:
 *                     type: string
 *                     example: "Hello community 👋"
 *                   image:
 *                     type: string
 *                     example: ""
 *                   likes_count:
 *                     type: number
 *                     example: 12
 *                   created_at:
 *                     type: string
 *                     example: "2026-06-16T10:00:00Z"
 */
router.get("/posts", fetchPosts);


/**
 * @swagger
 * /api/community/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Community Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Hello community 👋"
 *               image:
 *                 type: string
 *                 example: ""
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "post_1"
 *                 user_id:
 *                   type: string
 *                   example: "user_123"
 *                 content:
 *                   type: string
 *                   example: "Hello community 👋"
 *                 created_at:
 *                   type: string
 */
router.post("/posts", protect, createPost);


/**
 * @swagger
 * /api/community/posts/{id}/likes:
 *   patch:
 *     summary: Like a post
 *     tags: [Community Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "post_1"
 *     responses:
 *       200:
 *         description: Post liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "liked"
 */
router.patch("/posts/:id/likes", protect, likePost);


/**
 * @swagger
 * /api/community/posts/{id}/save:
 *   patch:
 *     summary: Save a post
 *     tags: [Community Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "post_1"
 *     responses:
 *       200:
 *         description: Post saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "saved"
 */
router.patch("/posts/:id/save", protect, savePost);


/**
 * @swagger
 * /api/community/posts/{id}/comments:
 *   post:
 *     summary: Add comment to post
 *     tags: [Community Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "post_1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Nice post 🔥"
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post("/posts/:id/comments", protect, postComment);


/**
 * @swagger
 * /api/community/posts/{id}/poll/vote:
 *   post:
 *     summary: Vote on poll
 *     tags: [Community Posts]
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
 *             properties:
 *               option:
 *                 type: string
 *                 example: "option1"
 *     responses:
 *       200:
 *         description: Vote recorded
 */
router.post("/posts/:id/poll/vote", protect, castPollVote);


/**
 * @swagger
 * /api/community/posts/{id}:
 *   delete:
 *     summary: Delete post
 *     tags: [Community Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "deleted"
 */
router.delete("/posts/:id", protect, removePost);


// =====================================================
// 🌍 COMMUNITY FEATURES
// =====================================================

/**
 * @swagger
 * /api/community/trending:
 *   get:
 *     summary: Get trending posts
 *     tags: [Community]
 *     responses:
 *       200:
 *         description: Trending posts list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/trending", fetchTrending);


/**
 * @swagger
 * /api/community/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Community]
 *     responses:
 *       200:
 *         description: Users leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   reputation:
 *                     type: number
 */
router.get("/leaderboard", fetchLeaderboard);


/**
 * @swagger
 * /api/community/events:
 *   get:
 *     summary: Get community events
 *     tags: [Community]
 *     responses:
 *       200:
 *         description: Events list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   scheduled_at:
 *                     type: string
 */
router.get("/events", fetchEvents);


/**
 * @swagger
 * /api/community/members/suggested:
 *   get:
 *     summary: Suggested members
 *     tags: [Community]
 *     responses:
 *       200:
 *         description: Suggested users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/members/suggested", fetchSuggestedMembers);


/**
 * @swagger
 * /api/community/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Community]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "user_123"
 *     responses:
 *       200:
 *         description: Followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "followed"
 */
router.post("/follow/:userId", protect, followUser);


export default router;