import express from "express";

import {
    getCourses,
    getSingleCourse
} from "../controllers/courses.controller.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", getSingleCourse);

export default router;