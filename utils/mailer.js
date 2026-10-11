import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT || 465),
  secure: process.env.MAIL_SECURE !== "false",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("Email settings are missing from the backend environment.");
  }

  return transporter.sendMail({
    from: `"A2E Immobilier" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};