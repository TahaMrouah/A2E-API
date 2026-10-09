
import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

import Admin from "../models/admin.js";
import {
  createCollaboration,
  getCollaborations,
} from "../controllers/collaboratorController.js";

const router = express.Router();

const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Limite atteinte. Réessayez plus tard.",
  },
});

// Public endpoint: submit a collaboration request
router.post("/", submissionLimiter, createCollaboration);

// Verify the existing admin cookie
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({
        message: "Authentification requise.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Accès réservé à l'administrateur.",
      });
    }

    const admin = await Admin.findById(decoded.id).select("_id role");

    if (!admin || admin.role !== "admin") {
      return res.status(401).json({
        message: "Session administrateur invalide.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Session invalide ou expirée.",
    });
  }
};

// Protected endpoint: retrieve all collaboration requests
router.get("/", requireAdmin, getCollaborations);

export default router;