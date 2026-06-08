import Joi from "joi";

export const contactSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    "any.required": "First name is required.",
    "string.empty": "First name is required.",
    "string.min":   "First name must be at least 2 characters.",
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    "any.required": "Last name is required.",
    "string.empty": "Last name is required.",
  }),
  email: Joi.string().email().lowercase().required().messages({
    "any.required": "Email is required.",
    "string.email": "Please enter a valid email.",
  }),
  phone: Joi.string().min(7).max(20).required().messages({
    "any.required": "Phone number is required.",
    "string.empty": "Phone number is required.",
  }),
  message: Joi.string().min(10).max(2000).required().messages({
    "any.required": "Message is required.",
    "string.min":   "Message must be at least 10 characters.",
  }),
});