import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { getInstructorDashboard } from "../controllers/instructor.controller.js";

const router = express.Router();


// ======================
// Instructor Dashboard
// ======================
router.get(
    "/dashboard",
    protect,
    authorize("instructor"),
    getInstructorDashboard
);

export default router;