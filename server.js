import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

import coursesRoutes from "./routes/courses.routes.js";
import { setupSwagger } from "./config/swagger.js";
import enrollmentsRoutes from "./routes/enrollments.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";
import projectsRoutes from "./routes/projects.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
    res.send("API is working");
});

app.use("/api/courses", coursesRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/projects", projectsRoutes);
// swagger
setupSwagger(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});