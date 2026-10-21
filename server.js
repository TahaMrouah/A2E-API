
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";

import collaborationRoutes from "./routes/collaboratorRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import authRoutes from "./routes/auth.js";
import projectUnitRoutes from "./routes/projectsRoutes.js";
import { verifyMailer } from "./utils/mailer.js";

// ========================================
// FILE PATH
// ========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// LOAD ENVIRONMENT VARIABLES
// ========================================

dotenv.config({
    path: path.join(__dirname, ".env"),
});

console.log("MONGO_URI loaded:", Boolean(process.env.MONGO_URI));
console.log("JWT_SECRET loaded:", Boolean(process.env.JWT_SECRET));

// ========================================
// EXPRESS APPLICATION
// ========================================

const app = express();

app.disable("x-powered-by");

// Enable this if Hostinger runs the app behind one trusted proxy.
app.set("trust proxy", 1);

// ========================================
// CORS
// ========================================

const allowedOrigins = [
    "https://a2eimmo.ma",
    "https://www.a2eimmo.ma",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Requests without an Origin header, such as server-to-server
            // requests or direct browser navigation, are allowed.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());
app.use(helmet());

// ========================================
// HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "A2E Immobilier API is running successfully",
    });
});

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/collaboration", collaborationRoutes);
app.use("/api/projects", projectUnitRoutes);

// ========================================
// MONGODB CONNECTION
// ========================================

let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing from environment variables");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);

        isConnected = true;
        console.log("MongoDB connected successfully");
    } catch (error) {
        isConnected = false;
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

// ========================================
// ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
    console.error("API error:", err.message);

    if (res.headersSent) {
        return next(err);
    }

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Origin not allowed",
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

// ========================================
// START SERVER — HOSTINGER
// ========================================

// IMPORTANT:
// Change 5000 only if Hostinger specifies a different internal port.
// This is NOT your public URL or the /api route prefix.

const PORT = 5000;

const startServer = async () => {
    try {
        await connectDB();

        try {
            await verifyMailer();
            console.log("SMTP connection verified successfully");
        } catch (error) {
            // SMTP failure should not prevent the API from starting.
            console.error("SMTP verification failed:", error.message);
        }

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`A2E Immobilier API listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("API startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
