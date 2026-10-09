
import mongoose from "mongoose";

const collaborationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: { type: String, trim: true },
    preferredContact: { type: String, trim: true },

    propertyType: { type: String, trim: true },
    propertyTitle: { type: String, trim: true },
    propertyLocation: { type: String, trim: true },
    propertySurface: { type: Number },
    builtSurface: { type: Number },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    condition: { type: String, trim: true },
    ownership: { type: String, trim: true },

    estimatedPrice: { type: Number },
    sellingReason: { type: String, trim: true },
    availability: { type: String, trim: true },
    description: { type: String, trim: true },

    consent: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: "Consent must be accepted.",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Collaboration = mongoose.model(
  "Collaboration",
  collaborationSchema
);

export default Collaboration;