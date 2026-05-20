import express from "express";

import {
    getProjects,
    createProject,
    getMyProjects,
    getSingleProject
} from "../controllers/projects.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getProjects);

router.post(
    "/",
    protect,
    createProject
);

router.get(
    "/my-projects",
    protect,
    getMyProjects
);

router.get("/:id", getSingleProject);

export default router;