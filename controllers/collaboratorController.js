
import Collaboration from "../models/collaboration.js";

import { sendMail } from "../utils/mailer.js";

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
const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h

const existing = await Collaboration.findOne({
  $or: [{ email: req.body.email }, { phone: req.body.phone }],
  createdAt: { $gte: since },
});

if (existing) {
  return res.status(429).json({
    message: "Vous avez déjà envoyé une demande récemment. Notre équipe vous contactera bientôt.",
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

export const acceptCollaboration = async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        message: "Demande de collaboration introuvable.",
      });
    }

    const wasAlreadyAccepted = collaboration.status === "accepted";

    // Save the acceptance before trying to send emails.
    collaboration.status = "accepted";
    await collaboration.save();

    if (wasAlreadyAccepted) {
      return res.status(200).json({
        message: "Cette demande est déjà acceptée.",
        collaboration,
        emailSent: null,
      });
    }

    const fullName =
      `${collaboration.firstName || ""} ${collaboration.lastName || ""}`.trim();

    const emailJobs = [
      sendMail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.MAIL_USER,
        subject: "A2E Immobilier — Demande de collaboration acceptée",
        text: `La demande de ${fullName} a été acceptée.

Email : ${collaboration.email || "Non renseigné"}
Téléphone : ${collaboration.phone || "Non renseigné"}
Bien : ${collaboration.propertyTitle || collaboration.propertyType || "Non précisé"}
Ville : ${collaboration.city || "Non précisée"}

Connectez-vous au tableau de bord A2E Immobilier pour consulter la demande.`,
      }),
    ];

    // Notify the collaborator as well, if an email address exists.
    if (collaboration.email) {
      emailJobs.push(
        sendMail({
          to: collaboration.email,
          subject: "Votre demande de collaboration — A2E Immobilier",
          text: `Bonjour ${fullName || ""},

Nous vous confirmons que votre demande de collaboration avec A2E Immobilier a été acceptée.

Notre équipe vous contactera prochainement pour la suite.

Cordialement,
A2E Immobilier`,
        })
      );
    }

    const results = await Promise.allSettled(emailJobs);
    const emailSent = results.every((result) => result.status === "fulfilled");

    if (!emailSent) {
      console.error(
        "One or more collaboration emails failed:",
        results
          .filter((result) => result.status === "rejected")
          .map((result) => result.reason?.message)
      );
    }

    return res.status(200).json({
      message: emailSent
        ? "Demande acceptée. Les notifications email ont été envoyées."
        : "Demande acceptée, mais au moins une notification email a échoué.",
      collaboration,
      emailSent,
    });
  } catch (error) {
    console.error("Accept collaboration error:", error);
    return res.status(500).json({
      message: "Impossible d'accepter cette demande.",
    });
  }
};

export const deleteCollaboration = async (req, res) => {
  try {
    const collaboration = await Collaboration.findByIdAndDelete(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        message: "Demande de collaboration introuvable.",
      });
    }

    return res.status(200).json({
      message: "Demande de collaboration supprimée.",
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error("Delete collaboration error:", error);
    return res.status(500).json({
      message: "Impossible de supprimer cette demande.",
    });
  }
};
