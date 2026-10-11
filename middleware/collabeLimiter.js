// middlewares/collaborationLimiter.js
import rateLimit from "express-rate-limit";

export const collaborationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,                   // max 3 requests per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Trop de demandes envoyées. Veuillez réessayer plus tard.",
  },
});