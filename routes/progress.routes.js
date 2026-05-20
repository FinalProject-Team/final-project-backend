import express from "express";
import { supabaseAdmin } from "../config/supabase.js";


import { protect } from "../middlewares/auth.middleware.js";

import {
    completeLesson,
    getMyProgress,
    getDashboardStats,
    getContinueLearning,
    getRecentActivity,
    getDashboardSummary
} from "../controllers/progress.controller.js";

const router = express.Router();

router.post(
    "/lessons/:id/complete",
    protect,
    completeLesson
);

router.get(
    "/my-progress",
    protect,
    getMyProgress
);

router.get(
    "/dashboard-stats",
    protect,
    getDashboardStats
);

router.get("/debug/enrollments", async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from("enrollments")
        .select("*");

    res.json({ data, error });
});

router.get(
    "/continue-learning",
    protect,
    getContinueLearning
);

router.get(
    "/recent-activity",
    protect,
    getRecentActivity
);

router.get(
    "/dashboard-summary",
    protect,
    getDashboardSummary
);
export default router;