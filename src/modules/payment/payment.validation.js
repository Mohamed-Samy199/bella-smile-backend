import Joi from "joi";

export const createSessionSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required().messages({
    "any.required": "Patient ID is required.",
    "string.length": "Invalid patient ID.",
  }),
});