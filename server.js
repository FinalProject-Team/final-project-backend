import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import coursesRoutes from "./routes/courses.routes.js";
import { setupSwagger } from "./config/swagger.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
    res.send("API is working");
});

app.use("/api/courses", coursesRoutes);

// swagger
setupSwagger(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});