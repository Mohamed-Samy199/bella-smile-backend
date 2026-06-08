import Joi from "joi";
import {phasesEnum, treatmentEnum, eligibilityEnum, rowColorEnum } from "../../utils/common/index.js";

const PATIENT_PHASE_VALUES =
  Object.values(phasesEnum);

export const PATIENT_TREATMENT_VALUES =
  Object.values(treatmentEnum);

const PATIENT_ELIGIBILITY_VALUES =
  Object.values(eligibilityEnum);

export const PATIENT_ROW_COLOR_VALUES =
  Object.values(rowColorEnum);
  

// ── Create ────────────────────────────────────────────────────────────────────
export const createPatientSchema = Joi.object({
  doctor: Joi.string().hex().length(24).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  nationality: Joi.string().max(100).optional(),
  brux: Joi.boolean().optional(),
  sconto: Joi.boolean().optional(),
  priority: Joi.boolean().optional(),
  // amount: Joi.number().min(0).optional(),
});

// ── Update basic info ─────────────────────────────────────────────────────────
export const updatePatientSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  nationality: Joi.string().max(100).optional(),
  flagUrgent: Joi.boolean().optional(),
  flagQuestion: Joi.boolean().optional(),
  flagStar: Joi.boolean().optional(),
  brux: Joi.boolean().optional(),
  numAligners: Joi.number().min(0).optional(),
  treatment: Joi.string().valid(...PATIENT_TREATMENT_VALUES).allow(null).optional(),
  sconto: Joi.boolean().optional(),
  priority: Joi.boolean().optional(),
  // amount: Joi.number().min(0).optional(),
  rowColor: Joi.string().valid(...PATIENT_ROW_COLOR_VALUES).optional(),
  dataPronte: Joi.date().allow(null).optional(),
  dataAccettazione: Joi.date().allow(null).optional(),
  dataFaseDue: Joi.date().allow(null).optional(),
});

// ── Change Phase (manual - admin only) ───────────────────────────────────────
export const changePhaseSchema = Joi.object({
  phase: Joi.string().valid(...PATIENT_PHASE_VALUES).required(),
  notes: Joi.string().max(500).optional(),
});

export const suitabilityPickUpSchema = Joi.object({
  eligibility: Joi.string()
    .valid("Suitable", "Not Suitable")
    .required()
    .messages({
      "any.required": "Eligibility is required.",
      "any.only":     "Eligibility must be Suitable or Not Suitable.",
    }),
  treatment:   Joi.string().optional().allow("", null),
  numAligners: Joi.number().min(0).optional(),
  dataPronte:  Joi.date().optional().allow(null, ""),
  notes:       Joi.string().max(500).optional().allow(""),
});

// ── Preparazione ─────────────────────────────────────────────────────────────
export const preparazioneSchema = Joi.object({
  notes: Joi.string().max(500).optional(),
});

// ── Query filters ─────────────────────────────────────────────────────────────
export const getPatientQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  size: Joi.number().min(1).max(100).default(30),
  search: Joi.string().max(100).optional(),
  phase: Joi.string().valid(...PATIENT_PHASE_VALUES).optional(),
  nationality: Joi.string().optional(),
  dataPronte: Joi.date().optional(),
  dataAccettazione: Joi.date().optional(),
});


// ── Generic Workflow (notes only) ─────────────────────────────
export const workflowSchema = Joi.object({
  notes: Joi.string().max(500).optional().allow(""),
});

// ── Completa / Seconda Fase ───────────────────────────────────
export const completaSchema = Joi.object({
  secondaFase: Joi.boolean().optional(),
  notes: Joi.string().max(500).optional().allow(""),
});

export const uploadDocumentsSchema = Joi.object({
  category: Joi.string()
    .valid(
      "patient-photo",
      "xray",
      "stl",
      "care-plan",
      "attachment"
    )
    .required(),
});

// ── Management ────────────────────────────────────────────────
export const updateManagementSchema = Joi.object({
  trattamento:     Joi.string().optional().allow(""),
  mesi:            Joi.number().min(0).optional(),
  arcataSuperiore: Joi.number().min(0).optional(),
  arcataInferiore: Joi.number().min(0).optional(),
  bruxismo:        Joi.boolean().optional(),
  preview:         Joi.boolean().optional(),
  attachment:      Joi.boolean().optional(),
  stripping:       Joi.boolean().optional(),
  estrazioni:      Joi.boolean().optional(),
  noteValutazione: Joi.string().max(1000).optional().allow(""),
  noteIdoneita:    Joi.string().max(1000).optional().allow(""),
});

// ── Lavorazioni ───────────────────────────────────────────────
export const addLavorazioneSchema = Joi.object({
  number:   Joi.number().required(),
  jaw:      Joi.string().valid("superiore", "inferiore").required(),
  checked:  Joi.boolean().optional(),
  spessore: Joi.string().optional().allow(""),
  taglio:   Joi.string().optional().allow(""),
  val:      Joi.string().optional().allow(""),
  bottoni:  Joi.string().optional().allow(""),
  data:     Joi.date().optional().allow(null),
});

// ── Care Plan ─────────────────────────────────────────────────
export const updateCarePlanSchema = Joi.object({
  arcataSuperiore:   Joi.number().min(0).optional(),
  arcataInferiore:   Joi.number().min(0).optional(),
  trattamento:       Joi.string().optional().allow(""),
  mesi:              Joi.number().min(0).optional(),
  attachment:        Joi.boolean().optional(),
  estrazioni:        Joi.boolean().optional(),
  stripping:         Joi.boolean().optional(),
  attachmentTeeth:   Joi.array().items(Joi.number()).optional(),
  note:              Joi.string().max(1000).optional().allow(""),
});