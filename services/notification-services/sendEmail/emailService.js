import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config();
export const sendEmail = async ({ email, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  });

  console.log("Email sent to:", email);
};