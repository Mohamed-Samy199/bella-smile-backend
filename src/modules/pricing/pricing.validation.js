import Joi from "joi";

export const updatePricingSchema = Joi.object({
  pricePerAligner: Joi.number().min(1).required().messages({
    "any.required": "Price per aligner is required.",
    "number.min":   "Price must be at least €1.",
    "number.base":  "Price must be a number.",
  }),
  currency: Joi.string().valid("eur", "usd", "gbp").optional(),
  note:     Joi.string().max(200).optional().allow(""),
});