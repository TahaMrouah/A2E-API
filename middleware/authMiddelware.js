// middleware/authMiddleware.js

import jwt from "jsonwebtoken";

export const requireAdmin = (req, res, next) => {
    try {
        const token = req.cookies.adminToken;

        if (!token) {
            return res.status(401).json({
                message: "Non authentifié.",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Accès interdit.",
            });
        }

        req.admin = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Session invalide ou expirée.",
        });
    }
};