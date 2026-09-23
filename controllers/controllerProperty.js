
import Property from "../models/property.js";

// ========================================
// GET ALL PROPERTIES
// ========================================

export const getProperties = async (req, res) => {
    try {
        const properties = await Property.find().sort({
            createdAt: -1,
        });

        res.status(200).json(properties);
    } catch (error) {
        console.error(
            "Error getting properties:",
            error
        );

        res.status(500).json({
            message: "Failed to get properties",
            error: error.message,
        });
    }
};

// ========================================
// GET ONE PROPERTY
// ========================================

export const getProperty = async (req, res) => {
    try {
        const property = await Property.findById(
            req.params.id
        );

        if (!property) {
            return res.status(404).json({
                message: "Property not found",
            });
        }

        res.status(200).json(property);
    } catch (error) {
        console.error(
            "Error getting property:",
            error
        );

        res.status(500).json({
            message: "Failed to get property",
            error: error.message,
        });
    }
};

// ========================================
// CREATE PROPERTY
// ========================================

export const createProperty = async (req, res) => {
    try {
        const property = await Property.create(
            req.body
        );

        res.status(201).json(property);
    } catch (error) {
        console.error(
            "Error creating property:",
            error
        );

        res.status(400).json({
            message: "Failed to create property",
            error: error.message,
        });
    }
};

// ========================================
// UPDATE PROPERTY
// ========================================

export const updateProperty = async (req, res) => {
    try {
        const property =
            await Property.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!property) {
            return res.status(404).json({
                message: "Property not found",
            });
        }

        res.status(200).json(property);
    } catch (error) {
        console.error(
            "Error updating property:",
            error
        );

        res.status(400).json({
            message: "Failed to update property",
            error: error.message,
        });
    }
};

// ========================================
// DELETE PROPERTY
// ========================================

export const deleteProperty = async (req, res) => {
    try {
        const property =
            await Property.findByIdAndDelete(
                req.params.id
            );

        if (!property) {
            return res.status(404).json({
                message: "Property not found",
            });
        }

        res.status(200).json({
            message:
                "Property deleted successfully",
            property,
        });
    } catch (error) {
        console.error(
            "Error deleting property:",
            error
        );

        res.status(500).json({
            message: "Failed to delete property",
            error: error.message,
        });
    }
};

