import mongoose from "mongoose";
import ProjectUnit from "../models/projects.js";

const ALLOWED_STATUSES = [
  "Libre",
  "Réservé",
  "Paiement en attente",
  "Vendu",
];

// GET /api/project-units
// Retrieve all active project units
export const getProjectUnits = async (req, res) => {
  try {
    const units = await ProjectUnit.find({ active: true })
      .sort({ project: 1, reference: 1 })
      .lean();

    const formattedUnits = units.map((unit) => {
      const projectName = String(unit.project || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      const category = String(unit.category || "").toLowerCase();

      let projectKey = "central";

      if (
        projectName.includes("greenlotus") ||
        category.includes("commercial")
      ) {
        projectKey = "green";
      } else if (projectName.includes("centralhills")) {
        projectKey = "central";
      }

      return {
        ...unit,
        id: unit.reference,
        projectKey,
      };
    });

    return res.status(200).json(formattedUnits);
  } catch (error) {
    console.error("Error fetching project units:", error);

    return res.status(500).json({
      message: "Failed to retrieve project units.",
    });
  }
};

// PATCH /api/project-units/:id/status
// Update a unit's status
export const updateProjectUnitStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project unit ID.",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid status.",
        allowedStatuses: ALLOWED_STATUSES,
      });
    }

    const unit = await ProjectUnit.findByIdAndUpdate(
      id,
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!unit) {
      return res.status(404).json({
        message: "Project unit not found.",
      });
    }

    return res.status(200).json({
      message: "Project unit status updated successfully.",
      unit,
    });
  } catch (error) {
    console.error("Error updating project unit status:", error);

    return res.status(500).json({
      message: "Failed to update project unit status.",
    });
  }
};

// DELETE /api/project-units/:id
// Permanently delete a unit
export const deleteProjectUnit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project unit ID.",
      });
    }

    const unit = await ProjectUnit.findByIdAndDelete(id);

    if (!unit) {
      return res.status(404).json({
        message: "Project unit not found.",
      });
    }

    return res.status(200).json({
      message: "Project unit deleted successfully.",
      id: unit._id,
      reference: unit.reference,
    });
  } catch (error) {
    console.error("Error deleting project unit:", error);

    return res.status(500).json({
      message: "Failed to delete project unit.",
    });
  }
};