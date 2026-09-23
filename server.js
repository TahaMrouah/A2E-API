import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import propertyRoutes from "./routes/propertyRoutes.js";
import authRoutes from "./routes/auth.js";

// ========================================
// FILE PATH
// ========================================

const __filename = fileURLToPath(
    import.meta.url
);

const __dirname = path.dirname(__filename);

// ========================================
// LOAD ENV
// ========================================

dotenv.config({
    path: path.join(__dirname, ".env"),
});

console.log(
    "MONGO_URI loaded:",
    !!process.env.MONGO_URI
);

console.log(
    "JWT_SECRET loaded:",
    !!process.env.JWT_SECRET
);

// ========================================
// EXPRESS
// ========================================

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(
    express.json({
        limit: "15mb",
    })
);

app.use(cookieParser());

// ========================================
// BASIC ROUTE
// ========================================

app.get("/", (req, res) => {
    res.json({
        message:
            "A2E Immobilier API is running successfully",
    });
});

// ========================================
// AUTH ROUTES
// ========================================

app.use(
    "/api/auth",
    authRoutes
);

// ========================================
// PROPERTY ROUTES
// ========================================

app.use(
    "/api/properties",
    propertyRoutes
);

// ========================================
// MONGODB
// ========================================

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error(
                "MONGO_URI is missing. Check server/.env"
            );
        }

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "================================="
        );

        console.log(
            "MongoDB connected successfully"
        );

        console.log(
            "================================="
        );
    } catch (error) {
        console.error(
            "MongoDB connection failed:"
        );

        console.error(error.message);

        process.exit(1);
    }
};

// ========================================
// START
// ========================================

const PORT =
    process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(
            "================================="
        );

        console.log(
            `A2E API running on port ${PORT}`
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log(
            "================================="
        );
    });
};

startServer();