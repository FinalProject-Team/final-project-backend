import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

import {
    enrollCourse
} from "../controllers/enrollment.controller.js";

const router = express.Router();

// enroll in course
router.post(
    "/:courseId",
    protect,
    authorize("student"),
    enrollCourse
);

export default router;