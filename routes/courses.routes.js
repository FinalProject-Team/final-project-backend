import express from "express";

import {
    getCourses,
    getSingleCourse,
    createCourse,
    updateCourse,
    deleteCourse
} from "../controllers/courses.controller.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", getSingleCourse);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
export default router;