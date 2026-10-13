
import express from "express";
import ProjectUnit from "../models/projects.js";
import {
  getProjectUnits,
  updateProjectUnitStatus,
  deleteProjectUnit,
} from "../controllers/projectController.js";

const router = express.Router();

// GET /api/project-units
// Read the project inventory from MongoDB.
router.get("/", getProjectUnits);
router.patch("/:id/status", updateProjectUnitStatus);
router.delete("/:id", deleteProjectUnit);

export default router;
