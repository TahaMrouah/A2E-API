import express from "express";

import {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
} from "../controllers/controllerProperty.js";

import { requireAdmin } from "../middleware/authMiddelware.js";

const router = express.Router();


// ========================================
// PUBLIC ROUTES
// ========================================

// GET all properties
// Public: Dashboard, Properties page, Offers, etc.
router.get("/", getProperties);


// GET one property
// Public: Property Details page
router.get("/:id", getProperty);


// ========================================
// ADMIN ONLY ROUTES
// ========================================

// CREATE property
router.post(
    "/",
    requireAdmin,
    createProperty
);


// UPDATE property
router.put(
    "/:id",
    requireAdmin,
    updateProperty
);


// DELETE property
router.delete(
    "/:id",
    requireAdmin,
    deleteProperty
);


export default router;