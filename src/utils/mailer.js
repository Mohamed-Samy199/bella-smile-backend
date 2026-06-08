import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/env.config.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,     // App Password مش الباسورد العادي
  },
});

// تتشيك الاتصال عند الـ startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ Mailer connection failed:", error.message);
  } 
});