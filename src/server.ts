import "dotenv/config";
import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { connectDB } from "./config/database";
import productRouter from "./router/product.router";
import cartRouter from "./router/cart.router";
import orderRouter from "./router/order.router";
import authRouter from "./router/auth.router";
import cors from "cors";
connectDB();

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

app.use(express.json());

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ecommerce API",
            version: "1.0.0",
        },
        servers: [{ url: process.env.API_BASE_URL || `http://localhost:${port}` }],
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
    apis: ["./src/router/*.ts"],
});

app.use(["/docs", "/api-docs"], swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
    res.send("Ecommerce API");
});

app.use("/api/auth", authRouter);
app.use("/api", productRouter);
app.use("/api", cartRouter);
app.use("/api", orderRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger docs at http://localhost:${port}/docs`);
    console.log(`Swagger docs at http://localhost:${port}/api-docs`);
});
