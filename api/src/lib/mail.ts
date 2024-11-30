import nodemailer from "nodemailer";

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "Gmail", // Your email service (Gmail, Outlook, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your app-specific password
  },
});

export default transporter;
