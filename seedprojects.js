
import mongoose from "mongoose";
import dotenv from "dotenv";
import ProjectUnit from "./models/projects.js";
import { greenLotus, centralHills } from "./data/projectsData.js";

dotenv.config();

function prepareUnit(unit, project, projectKey, category) {
  const { id, ...details } = unit;

  return {
    ...details,
    reference: id,
    project,
    projectKey,
    category,
  };
}

const inventory = [
  ...greenLotus.map((unit) =>
    prepareUnit(unit, "Green Lotus", "green", "office")
  ),

  ...centralHills.map((unit) =>
    prepareUnit(unit, "Central Hills", "central", "store")
  ),
];

async function seedProjects() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your .env file.");
    }

    // Check for duplicate references before writing.
    const references = inventory.map((unit) => unit.reference);

    if (new Set(references).size !== references.length) {
      throw new Error("Duplicate references found in the inventory.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    console.log("Green Lotus offices:", greenLotus.length);
    console.log("Central Hills commercial lots:", centralHills.length);
    console.log("Total units to import:", inventory.length);

    // Update matching references; insert missing references.
    // Existing statuses are preserved.
    const operations = inventory.map((unit) => {
      const { reference, ...details } = unit;

      return {
        updateOne: {
          filter: { reference },
          update: {
            $set: details,
            $setOnInsert: {
              reference,
              status: "Libre",
              active: true,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await ProjectUnit.bulkWrite(operations);

    console.log("Import completed successfully.");
    console.log("Inserted:", result.upsertedCount);
    console.log("Updated:", result.modifiedCount);
    console.log("Matched:", result.matchedCount);
  } catch (error) {
    console.error("Project import failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProjects();
