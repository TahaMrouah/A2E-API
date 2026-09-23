
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Admin from "../models/admin.js";

const router = express.Router();


// ========================================
// LOGIN
// ========================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password,
        } = req.body;


        // Check fields

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Adresse e-mail et mot de passe requis.",
            });

        }


        // Find admin

        const admin = await Admin.findOne({

            email: email
                .toLowerCase()
                .trim(),

        });


        if (!admin) {

            return res.status(401).json({

                message:
                    "Adresse e-mail ou mot de passe incorrect.",

            });

        }


        // Check password

        const passwordCorrect =
            await bcrypt.compare(
                password,
                admin.passwordHash
            );


        if (!passwordCorrect) {

            return res.status(401).json({

                message:
                    "Adresse e-mail ou mot de passe incorrect.",

            });

        }


        // ========================================
        // CREATE JWT
        // ========================================

        const token = jwt.sign(

            {
                id: admin._id.toString(),

                email: admin.email,

                role: admin.role,
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "24h",
            }

        );


        // ========================================
        // CREATE AUTH COOKIE
        // ========================================

        res.cookie(
            "adminToken",
            token,
            {

                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite: "lax",

                maxAge:
                    24 *
                    60 *
                    60 *
                    1000,

            }
        );


        // ========================================
        // SUCCESS RESPONSE
        // ========================================

        return res.json({

            message:
                "Connexion réussie.",

            authenticated: true,

            admin: {

                id: admin._id,

                email: admin.email,

                role: admin.role,

            },

        });

    }


    catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            message:
                "Erreur serveur.",

        });

    }

});


// ========================================
// CHECK AUTHENTICATION
// ========================================

router.get(
    "/me",
    async (req, res) => {

        try {

            const token =
                req.cookies.adminToken;


            // No cookie

            if (!token) {

                return res.status(401).json({

                    authenticated: false,

                });

            }


            // Verify token

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );


            // Admin only

            if (
                decoded.role !==
                "admin"
            ) {

                return res.status(403).json({

                    authenticated: false,

                });

            }


            // Check admin still exists

            const admin =
                await Admin.findById(
                    decoded.id
                ).select(
                    "-passwordHash"
                );


            if (!admin) {

                return res.status(401).json({

                    authenticated: false,

                });

            }


            return res.json({

                authenticated: true,

                admin: {

                    id: admin._id,

                    email: admin.email,

                    role: admin.role,

                },

            });

        }


        catch (error) {

            return res.status(401).json({

                authenticated: false,

            });

        }

    }
);


// ========================================
// LOGOUT
// ========================================

router.post(
    "/logout",
    (req, res) => {

        res.clearCookie(
            "adminToken",
            {

                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite: "lax",

            }
        );


        return res.json({

            message:
                "Déconnexion réussie.",

            authenticated: false,

        });

    }
);


export default router;

