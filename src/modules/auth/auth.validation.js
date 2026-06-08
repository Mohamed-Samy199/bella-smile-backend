import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 50 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
  passwordConfirm: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Please confirm your password",
  }),
  role: Joi.string().valid("admin", "doctor").default("doctor"),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "New password must be at least 8 characters",
    "any.required": "New password is required",
  }),
  newPasswordConfirm: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Please confirm your new password",
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "any.required": "Email is required.",
      "string.email": "Please enter a valid email.",
    }),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      "any.required": "Password is required.",
      "string.min":   "Password must be at least 8 characters.",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only":     "Passwords do not match.",
      "any.required": "Please confirm your password.",
    }),
});

export const changeRoleSchema = Joi.object({
  role: Joi.string()
    .valid("admin", "doctor")
    .required()
    .messages({
      "any.required": "Role is required.",
      "any.only":     "Role must be admin or doctor.",
    }),
});