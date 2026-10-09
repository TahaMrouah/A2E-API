
import Collaboration from "../models/collaboration.js";

// Save a new collaboration request in MongoDB
export const createCollaboration = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      preferredContact,
      propertyType,
      propertyTitle,
      propertyLocation,
      propertySurface,
      builtSurface,
      bedrooms,
      bathrooms,
      condition,
      ownership,
      estimatedPrice,
      sellingReason,
      availability,
      description,
      consent,
    } = req.body;

    // Required-field validation
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !consent
    ) {
      return res.status(400).json({
        message: "Please complete all required fields and accept consent.",
      });
    }

    const collaboration = await Collaboration.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      city,
      preferredContact,
      propertyType,
      propertyTitle,
      propertyLocation,
      propertySurface,
      builtSurface,
      bedrooms,
      bathrooms,
      condition,
      ownership,
      estimatedPrice,
      sellingReason,
      availability,
      description,
      consent,
    });

    return res.status(201).json({
      message: "Your collaboration request was submitted successfully.",
      collaboration: {
        id: collaboration._id,
      },
    });
  } catch (error) {
    console.error("Create collaboration error:", error);

    return res.status(500).json({
      message: "Unable to submit your request. Please try again later.",
    });
  }
};

// Retrieve collaboration requests for the admin dashboard
export const getCollaborations = async (req, res) => {
  try {
    const collaborations = await Collaboration.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ collaborations });
  } catch (error) {
    console.error("Get collaborations error:", error);

    return res.status(500).json({
      message: "Unable to retrieve collaboration requests.",
    });
  }
};