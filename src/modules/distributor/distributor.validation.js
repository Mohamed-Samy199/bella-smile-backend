import Joi from "joi";

export const createDistributorSchema = Joi.object({
  companyName: Joi.string().min(2).max(100).required().messages({
    "any.required": "Company name is required",
    "string.min":   "Company name must be at least 2 characters",
  }),
  address: Joi.string().max(200).optional(),
  email:   Joi.string().email().lowercase().optional().messages({
    "string.email": "Please provide a valid email address",
  }),
  phone:   Joi.string().max(20).optional(),
});

export const updateDistributorSchema = Joi.object({
  companyName: Joi.string().min(2).max(100).optional(),
  address:     Joi.string().max(200).optional(),
  email:       Joi.string().email().lowercase().optional(),
  phone:       Joi.string().max(20).optional(),
  isActive:    Joi.boolean().optional(),
});