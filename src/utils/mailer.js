import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/env.config.js";
import dns        from "dns";

dns.setDefaultResultOrder("ipv4first");
// export const transporter = nodemailer.createTransport({
//   // service: "gmail",
//   host:   "smtp.gmail.com",
//   port:   587,        // ✅ بدل 465
//   secure: true,
//   auth: {
//     user: EMAIL_USER,
//     pass: EMAIL_PASS,     // App Password مش الباسورد العادي
//   },
//    family: 4,
// });


export const transporter = nodemailer.createTransport({
  host:   "smtp.gmail.com",
  port:   587,        // ✅ بدل 465
  secure: false,      // ✅ false مع 587
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4,
});

// تتشيك الاتصال عند الـ startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ Mailer connection failed:", error.message);
  } else {
    console.log("✅ Mailer ready");
  }
});