
import mongoose from "mongoose";

const characteristicSchema = new mongoose.Schema(
    {
        id: {
            type: String,
        },

        icon: {
            type: String,
            default: "FaBuilding",
        },

        name: {
            type: String,
            default: "",
        },

        value: {
            type: String,
            default: "",
        },
    },
    {
        _id: false,
    }
);

const propertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        subheader: {
            type: String,
            default: "",
        },

        location: {
            type: String,
            default: "",
        },

        type: {
            type: String,
            default: "Villa",
        },

        status: {
            type: String,
            default: "À VENDRE",
        },

        price: {
            type: Number,
            default: 0,
        },

        surface: {
            type: String,
            default: "",
        },

        landArea: {
            type: String,
            default: "",
        },

        bedrooms: {
            type: Number,
            default: 0,
        },

        bathrooms: {
            type: Number,
            default: 0,
        },

        description: {
            type: String,
            default: "",
        },

        intro: {
            type: String,
            default: "",
        },

        features: {
            type: [String],
            default: [],
        },

        images: {
            type: [String],
            default: [],
        },

        characteristics: {
            type: [characteristicSchema],
            default: [],
        },
    },

    {
        timestamps: true,
    }
);

const Property = mongoose.model(
    "Property",
    propertySchema
);

export default Property;

