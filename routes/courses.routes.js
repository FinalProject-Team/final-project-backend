import express from "express";

import {
    getCourses,
    getSingleCourse,
    createCourse,
    updateCourse
} from "../controllers/courses.controller.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", getSingleCourse);
router.post("/", createCourse);
router.put("/:id", updateCourse);
export default router;