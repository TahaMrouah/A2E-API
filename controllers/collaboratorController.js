
import Collaboration from "../models/collaboration.js";
import { sendMail } from "../utils/mailer.js";

// ========================================
// EMAIL HELPERS
// ========================================

const getAdminEmail = () =>
    process.env.ADMIN_NOTIFICATION_EMAIL || process.env.MAIL_USER || "";

const getFullName = (collaboration) =>
    `${collaboration.firstName || ""} ${collaboration.lastName || ""}`.trim();

const getPropertyDescription = (collaboration) =>
     collaboration.propertyType ||
     collaboration.propertyTitle ||
    "Non précisé";

const runEmailJobs = async (jobs) => {
    const emailStatus = {
        admin: false,
        collaborator: false,
    };

    const results = await Promise.allSettled(
        jobs.map((job) => job.promise)
    );

    results.forEach((result, index) => {
        const type = jobs[index].type;

        emailStatus[type] = result.status === "fulfilled";

        if (result.status === "rejected") {
            console.error(
                `Collaboration ${type} email failed:`,
                result.reason?.message || result.reason
            );
        }
    });

    return {
        emailStatus,
        emailSent:
            emailStatus.admin && emailStatus.collaborator,
    };
};

// ========================================
// CREATE COLLABORATION
// POST /api/collaboration
// ========================================

export const createCollaboration = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            consent,
        } = req.body;

        // Validate required fields
        if (
            !firstName?.trim() ||
            !lastName?.trim() ||
            !email?.trim() ||
            !phone?.trim()
        ) {
            return res.status(400).json({
                message:
                    "Veuillez remplir tous les champs obligatoires.",
            });
        }

        if (consent !== true && consent !== "true") {
            return res.status(400).json({
                message:
                    "Vous devez accepter les conditions pour continuer.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPhone = phone.trim();

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                message:
                    "Veuillez saisir une adresse email valide.",
            });
        }

        // Prevent duplicate requests within the last 24 hours
        const twentyFourHoursAgo = new Date(
            Date.now() - 24 * 60 * 60 * 1000
        );

        const existingCollaboration =
            await Collaboration.findOne({
                createdAt: { $gte: twentyFourHoursAgo },
                $or: [
                    { email: normalizedEmail },
                    { phone: normalizedPhone },
                ],
            });

        if (existingCollaboration) {
            return res.status(409).json({
                message:
                    "Votre demande est déjà enregistrée ou en cours de traitement. Veuillez patienter, nous vous contacterons prochainement.",
                duplicate: true,
            });
        }

        // Save the request first, independently of email delivery
        const collaboration = await Collaboration.create({
            ...req.body,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            consent: true,
            status: "pending",
        });

        const fullName = getFullName(collaboration);
        const adminEmail = getAdminEmail();

        const jobs = [];

        // Notify A2E about the new request
        if (adminEmail) {
            jobs.push({
                type: "admin",
                promise: sendMail({
                    to: adminEmail,
                    subject:
                        "A2E Immobilier — Nouvelle demande de collaboration",
                    text: `Une nouvelle demande de collaboration a été reçue.

Nom : ${fullName}
Email : ${collaboration.email}
Téléphone : ${collaboration.phone}
Ville : ${collaboration.city || "Non précisée"}
Bien : ${getPropertyDescription(collaboration)}

Connectez-vous au tableau de bord A2E Immobilier pour consulter cette demande.`,
                }),
            });
        } else {
            console.error(
                "Collaboration admin email failed: ADMIN_NOTIFICATION_EMAIL and MAIL_USER are missing."
            );
        }

        // Send confirmation to the collaborator
        if (collaboration.email) {
            jobs.push({
                type: "collaborator",
                promise: sendMail({
                    to: collaboration.email,
                    subject:
                        "Confirmation de votre demande — A2E Immobilier",
                    text: `Bonjour ${fullName},

Nous avons bien reçu votre demande de collaboration avec A2E Immobilier.

Notre équipe va étudier votre demande et vous contactera prochainement.

Cordialement,
L'équipe A2E Immobilier`,
                }),
            });
        }

        const { emailStatus, emailSent } =
            await runEmailJobs(jobs);

        return res.status(201).json({
            message:
                "Votre demande de collaboration a bien été enregistrée.",
            collaboration,
            id: collaboration._id,
            emailSent,
            emailStatus,
        });
    } catch (error) {
        console.error(
            "Create collaboration failed:",
            error.message
        );

        return res.status(500).json({
            message:
                "Une erreur est survenue lors de l'enregistrement de votre demande.",
        });
    }
};

// ========================================
// GET ALL COLLABORATIONS
// GET /api/collaboration
// ========================================

export const getCollaborations = async (req, res) => {
    try {
        const collaborations =
            await Collaboration.find().sort({
                createdAt: -1,
            });

        return res.status(200).json({
            collaborations,
        });
    } catch (error) {
        console.error(
            "Get collaborations failed:",
            error.message
        );

        return res.status(500).json({
            message:
                "Impossible de récupérer les demandes de collaboration.",
        });
    }
};

// ========================================
// ACCEPT COLLABORATION
// PATCH /api/collaboration/:id/accept
// ========================================

export const acceptCollaboration = async (req, res) => {
    try {
        const { id } = req.params;

        const collaboration =
            await Collaboration.findById(id);

        if (!collaboration) {
            return res.status(404).json({
                message:
                    "Demande de collaboration introuvable.",
            });
        }

        // Do not send acceptance emails repeatedly
        if (collaboration.status === "accepted") {
            return res.status(200).json({
                message:
                    "Cette demande a déjà été acceptée.",
                collaboration,
                emailSent: false,
                alreadyAccepted: true,
            });
        }

        // Save acceptance before attempting emails
        collaboration.status = "accepted";
        await collaboration.save();

        const fullName = getFullName(collaboration);
        const adminEmail = getAdminEmail();

        const jobs = [];

        // Notify A2E that the request was accepted
        if (adminEmail) {
            jobs.push({
                type: "admin",
                promise: sendMail({
                    to: adminEmail,
                    subject:
                        "A2E Immobilier — Demande de collaboration acceptée",
                    text: `La demande de ${fullName} a été acceptée.

Email : ${collaboration.email || "Non renseigné"}
Téléphone : ${collaboration.phone || "Non renseigné"}
Bien : ${getPropertyDescription(collaboration)}
Ville : ${collaboration.city || "Non précisée"}

Connectez-vous au tableau de bord A2E Immobilier pour consulter la demande.`,
                }),
            });
        } else {
            console.error(
                "Collaboration admin email failed: ADMIN_NOTIFICATION_EMAIL and MAIL_USER are missing."
            );
        }

        // Notify the collaborator of acceptance
        if (collaboration.email) {
            jobs.push({
                type: "collaborator",
                promise: sendMail({
                    to: collaboration.email,
                    subject:
                        "Votre demande de collaboration a été acceptée — A2E Immobilier",
                    text: `Bonjour ${fullName},

Nous avons le plaisir de vous confirmer que votre demande de collaboration avec A2E Immobilier a été acceptée.

Notre équipe vous contactera prochainement pour la suite.

Merci pour votre confiance.

Cordialement,
L'équipe A2E Immobilier`,
                }),
            });
        }

        const { emailStatus, emailSent } =
            await runEmailJobs(jobs);

        return res.status(200).json({
            message: emailSent
                ? "Demande acceptée. Les notifications email ont été envoyées."
                : "Demande acceptée, mais une ou plusieurs notifications email ont échoué. Consultez les logs du serveur.",
            collaboration,
            emailSent,
            emailStatus,
        });
    } catch (error) {
        console.error(
            "Accept collaboration failed:",
            error.message
        );

        return res.status(500).json({
            message:
                "Une erreur est survenue lors de l'acceptation de la demande.",
        });
    }
};

// ========================================
// DELETE COLLABORATION
// DELETE /api/collaboration/:id
// ========================================

export const deleteCollaboration = async (req, res) => {
    try {
        const { id } = req.params;

        const collaboration =
            await Collaboration.findByIdAndDelete(id);

        if (!collaboration) {
            return res.status(404).json({
                message:
                    "Demande de collaboration introuvable.",
            });
        }

        return res.status(200).json({
            message:
                "La demande de collaboration a été supprimée.",
            id,
        });
    } catch (error) {
        console.error(
            "Delete collaboration failed:",
            error.message
        );

        return res.status(500).json({
            message:
                "Impossible de supprimer cette demande de collaboration.",
        });
    }
};
