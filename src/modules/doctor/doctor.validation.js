import Joi from "joi";

export const createDoctorSchema = Joi.object({
  // User fields
  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),

  // Doctor fields
  firstName: Joi.string().min(2).max(50).required().messages({
    "any.required": "First name is required",
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    "any.required": "Last name is required",
  }),
  address:     Joi.string().max(200).optional(),
  city:        Joi.string().max(100).optional(),
  phone:       Joi.string().max(20).optional(),
  areaManager: Joi.string().hex().length(24).optional().messages({
    "string.length": "Invalid area manager ID",
  }),
  distributor: Joi.string().hex().length(24).optional().messages({
    "string.length": "Invalid distributor ID",
  }),
  agency:        Joi.string().max(200).optional(),
});

export const updateDoctorSchema = Joi.object({
  firstName:   Joi.string().min(2).max(50).optional(),
  lastName:    Joi.string().min(2).max(50).optional(),
  address:     Joi.string().max(200).optional(),
  city:        Joi.string().max(100).optional(),
  email:       Joi.string().email().lowercase().optional(),
  phone:       Joi.string().max(20).optional(),
  areaManager: Joi.string().hex().length(24).allow(null).optional(),
  distributor: Joi.string().hex().length(24).allow(null).optional(),
  agency:     Joi.string().max(200).optional(),
  isActive:    Joi.boolean().optional(),
});