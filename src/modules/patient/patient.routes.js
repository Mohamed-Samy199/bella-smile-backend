import { Router } from "express";
import * as pc from "./patient.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { isAdmin, isAdminOrDoctor } from "../../middlewares/role.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createPatientSchema,
  updatePatientSchema,
  changePhaseSchema,
  workflowSchema,
  completaSchema,
  updateManagementSchema,
  addLavorazioneSchema,
  updateCarePlanSchema,
  suitabilityPickUpSchema,
  setCasePriceSchema,
  addPreviewLinkSchema,
  requestRetreamentSchema,
  reviewRetreamentSchema
} from "./patient.validation.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.use(protect);

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.post("/", isAdminOrDoctor, upload.array("files", 20), validate(createPatientSchema), pc.createPatient);
router.get("/", isAdminOrDoctor, pc.getAllPatients);
router.get("/:id", isAdminOrDoctor, pc.getPatientById);
router.put("/:id", isAdminOrDoctor, validate(updatePatientSchema), pc.updatePatient);
router.delete("/:id", isAdmin, pc.deletePatient);

// ── Manual override ───────────────────────────────────────────────────────────
router.patch("/:id/phase", isAdmin, validate(changePhaseSchema), pc.changePhase);
router.patch("/:id/acceptance-decision", isAdminOrDoctor, pc.setAcceptanceDecision);


router.patch("/:id/case-price", isAdmin, validate(setCasePriceSchema), pc.setCasePrice);

// ── Workflow ──────────────────────────────────────────────────
router.post("/:id/verifica-valutazione", isAdminOrDoctor, validate(workflowSchema), pc.photographicEvaluation);
router.post("/:id/suitability-pickup", isAdminOrDoctor, validate(suitabilityPickUpSchema), pc.suitabilityAndPickUp);
router.post("/:id/Preparation", isAdminOrDoctor, validate(workflowSchema), pc.preparation);
router.post("/:id/check-care-plan", isAdminOrDoctor, validate(workflowSchema), pc.verificaPianoCura);
router.post("/:id/waiting-for-acceptance", isAdminOrDoctor, validate(workflowSchema), pc.attesaAccettazione);
router.post("/:id/complete-stl", isAdmin, validate(workflowSchema), pc.completaFromStl);
router.post("/:id/complete-manufacturing", isAdmin, validate(workflowSchema), pc.completaFromManufacturing);
router.post("/:id/completed", isAdminOrDoctor, validate(completaSchema), pc.completaOSecondaFase);


// ── Documents ─────────────────────────────────────────────────
router.post("/:id/data/documents", isAdminOrDoctor, upload.array("files", 20), pc.uploadDocuments);
router.delete("/:id/documents/:documentId", isAdminOrDoctor, pc.deleteDocument);
router.patch("/:id/preview-link", isAdminOrDoctor, validate(addPreviewLinkSchema), pc.updatePreviewLink);

// ── Management ────────────────────────────────────────────────
router.put("/:id/management", isAdminOrDoctor, validate(updateManagementSchema), pc.updateManagement);

// ── Lavorazioni (Admin only) ──────────────────────────────────
router.post("/:id/lavorazioni", isAdmin, validate(addLavorazioneSchema), pc.addLavorazione);
router.put("/:id/lavorazioni/:lavId", isAdmin, pc.updateLavorazione);
router.delete("/:id/lavorazioni/:lavId", isAdmin, pc.deleteLavorazione);

// ── Care Plan ─────────────────────────────────────────────────
router.put("/:id/care-plan", isAdmin, validate(updateCarePlanSchema), pc.updateCarePlan);

// ── Activity Log ──────────────────────────────────────────────
router.get("/:id/activity-log", isAdminOrDoctor, pc.getActivityLog);


// ── Notes ─────────────────────────────────────────────────────

router.post("/:id/notes", isAdminOrDoctor, pc.addNote);
router.get("/:id/notes", isAdminOrDoctor, pc.getNotes);

// ── Request Retreatment ─────────────────────────────────────────────────────

router.post("/:id/retreatment/request", isAdminOrDoctor, validate(requestRetreamentSchema), pc.requestRetreatment);
router.patch("/:id/retreatment/review", isAdmin, validate(reviewRetreamentSchema), pc.reviewRetreatment);
router.get("/retreatments/pending", isAdmin, pc.getPendingRetreatments);

export default router;