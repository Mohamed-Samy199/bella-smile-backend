import { transporter }        from "./mailer.js";
import { contactEmailTemplate } from "./contactTemplate.js";
import { EMAIL_USER, EMAIL_RECEIVER } from "../config/env.config.js";

export const sendContactEmail = async ({ firstName, lastName, email, phone, message }) => {
  const html = contactEmailTemplate(firstName, lastName, email, phone, message);

  await transporter.sendMail({
    from:    `"Bella Smile Website" <${EMAIL_USER}>`,
    to:      EMAIL_RECEIVER,
    replyTo: email,                    // لما الـ admin يرد يرجع للـ user
    subject: `📩 New Message from ${firstName} ${lastName}`,
    html,
  });
};