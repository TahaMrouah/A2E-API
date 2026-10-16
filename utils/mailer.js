
import "dotenv/config";
import nodemailer from "nodemailer";

const {
  MAIL_HOST = "smtp.gmail.com",
  MAIL_PORT = "465",
  MAIL_SECURE = "true",
  MAIL_USER,
  MAIL_PASS,
} = process.env;

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: Number(MAIL_PORT),
  secure: MAIL_SECURE.toLowerCase() === "true",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  if (!MAIL_USER?.trim() || !MAIL_PASS?.trim()) {
    throw new Error(
      "Email configuration missing: MAIL_USER or MAIL_PASS is empty. Check the backend .env file."
    );
  }

  if (!to?.trim()) {
    throw new Error("Cannot send email: recipient address is missing.");
  }

  return transporter.sendMail({
    from: `"A2E Immobilier" <${MAIL_USER}>`,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
};

export const verifyMailer = async () => {
  if (!MAIL_USER?.trim() || !MAIL_PASS?.trim()) {
    throw new Error("MAIL_USER or MAIL_PASS is missing.");
  }

  await transporter.verify();
  return true;
};
