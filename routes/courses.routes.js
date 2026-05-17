import express from "express";

import {
    getCourses,
    getSingleCourse,
    createCourse
} from "../controllers/courses.controller.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", getSingleCourse);
router.post("/", createCourse);
export default router;