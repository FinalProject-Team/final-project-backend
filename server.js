import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import enrollmentsRoutes from "./routes/enrollments.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import rankingRoutes from "./routes/ranking.routes.js";
import { setupSwagger } from "./config/swagger.js";
import roadmapRoutes from "./routes/roadmap.routes.js";
import lessonsRoutes from "./routes/lessons.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import liveSessionsRoutes from "./routes/liveSessions.routes.js";



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.send("API is working");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/live-sessions", liveSessionsRoutes);

// Swagger
setupSwagger(app);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: "Something went wrong",
    });
});


// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});