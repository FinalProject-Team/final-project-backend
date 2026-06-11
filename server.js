import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import enrollmentsRoutes from "./routes/enrollments.routes.js";
import progressRoutes from "./routes/progress.routes.js";
// import jobsRoutes from "./routes/jobs.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import rankingRoutes from "./routes/ranking.routes.js";
import { setupSwagger } from "./config/swagger.js";
import roadmapRoutes from "./routes/roadmap.routes.js";
import lessonsRoutes from "./routes/lessons.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import liveSessionsRoutes from "./routes/liveSessions.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import instructorProfileRoutes from "./routes/instructorProfileRoutes.js";
import jobsRoutes from "./routes/jobs.routes.js";

import applicationsRoutes from "./routes/applications.routes.js";
import chatRoutes from "./routes/chat.routes.js";




dotenv.config();

const app = express();


// مهم جدًا على Railway
app.set("trust proxy", 1);


// CORS مضبوط للـ frontend + production
// app.use(cors({
//     origin: [
//         "http://localhost:5174",
//         "https://final-project-backend-production-5fe7.up.railway.app"
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true
// }));

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
app.use("/api/notifications", notificationsRoutes);
app.use("/api/instructor/profile", instructorProfileRoutes);
app.use("/applications", applicationsRoutes);

app.use("/chats", chatRoutes);


// Swagger
setupSwagger(app);


// Error Handler (يحمي السيرفر من crash)


app.use((err, req, res, next) => {
    console.error("FULL ERROR:");
    console.error(err);

    res.status(500).json({
        error: err.message,
        stack: err.stack
    });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});