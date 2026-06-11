import express from "express";
import {
    acceptApplication,
    rejectApplication,
    getApplications
} from "../controllers/applications.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:id/accept", protect, acceptApplication);
router.post("/:id/reject", protect, rejectApplication);
router.get("/", protect, getApplications);

export default router;