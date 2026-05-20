import express from "express";

import {
    getJobs,
    getSingleJob,
    applyToJob,
    getMyApplications
} from "../controllers/jobs.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getJobs);
router.get(
    "/my-applications",
    protect,
    getMyApplications
);
router.get("/:id", getSingleJob);
router.post(
    "/:id/apply",
    protect,
    applyToJob
);


export default router;