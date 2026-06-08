import Contact            from "../../models/Contact.model.js";
import { sendContactEmail } from "../../utils/sendContactEmail.js";
import { create }         from "../../db/database.repository.js";
import { ApiError }       from "../../utils/ApiError.js";

export const submitContact = async (data) => {
  const { firstName, lastName, email, phone, message } = data;

  // 1) save في الـ DB
  const contact = await create({
    model: Contact,
    data:  { firstName, lastName, email, phone, message },
  });

  // 2) ابعت الـ email
  try {
    await sendContactEmail({ firstName, lastName, email, phone, message });
  } catch (err) {
    // لو الـ email فشل مش هنرجع error للـ user
    // بس هنلوج المشكلة
    console.error(err);
    console.error("❌ Failed to send contact email:", err.message);
  }

  return contact;
};