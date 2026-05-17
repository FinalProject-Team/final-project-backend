import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Courses API",
            version: "1.0.0",
            description: "API Documentation for Courses Project",
        },
        servers: [
            {
                url: "https://final-project-backend-production-5fe7.up.railway.app",
            },
        ],
    },
    apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};