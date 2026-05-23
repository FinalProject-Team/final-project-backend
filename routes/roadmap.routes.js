import express from "express";

import { protect } from "../middlewares/auth.middleware.js";

import {
    getRoadmap
} from "../controllers/roadmap.controller.js";

const router = express.Router();

router.get(
    "/",
    protect,
    getRoadmap
);

export default router;