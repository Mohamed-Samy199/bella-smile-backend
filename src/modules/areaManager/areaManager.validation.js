import Joi from "joi";

export const createAreaManagerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    "any.required": "First name is required",
    "string.min": "First name must be at least 2 characters",
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    "any.required": "Last name is required",
    "string.min": "Last name must be at least 2 characters",
  }),
  address: Joi.string().max(200).optional(),
  city:    Joi.string().max(100).optional(),
  email:   Joi.string().email().lowercase().optional().messages({
    "string.email": "Please provide a valid email address",
  }),
  phone:   Joi.string().max(20).optional(),
});

export const updateAreaManagerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName:  Joi.string().min(2).max(50).optional(),
  address:   Joi.string().max(200).optional(),
  city:      Joi.string().max(100).optional(),
  email:     Joi.string().email().lowercase().optional(),
  phone:     Joi.string().max(20).optional(),
  isActive:  Joi.boolean().optional(),
});