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
                // ديناميكي: هيقرأ رابط الـ Replit لما ترفعه، وهيقرأ اللوكال وأنت شغال بجهازك
                url: "/",
                description: "Current Host Server"
            },
            {
                url: "https://9126c98e-e2e1-4608-8843-5de80d6148b8-00-12rx1cwtt852y.spock.replit.dev",
                description: "Replit Production"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    // التعديل هنا: يقرأ أي ملف .js مباشرة أو داخل فولدرات فرعية جوة routes
    apis: ["./routes/*.js", "./routes/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};