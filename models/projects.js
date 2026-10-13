
import mongoose from "mongoose";

const projectUnitSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  project: { type: String, required: true },
  category: { type: String, required: true },
  status: {
    type: String,
    enum: ["Libre", "Réservé", "Paiement en attente", "Vendu"],
    default: "Libre",
  },
  active: { type: Boolean, default: true },

  phase: Number,
  building: Number,
  floor: String,
  location: String,
  frontage: String,
  orientation: String,
  facades: Number,

  rdc: Number,
  mezzanine: Number,
  habitable: Number,
  covered: Number,
  courtyard: Number,
  parking: Number,
  total: Number,
  weighted: Number,
  saleable: Number,

  price: { type: Number, required: true },
  priceM2: Number,
}, { timestamps: true });

export default mongoose.models.ProjectUnit ||
  mongoose.model("ProjectUnit", projectUnitSchema);
