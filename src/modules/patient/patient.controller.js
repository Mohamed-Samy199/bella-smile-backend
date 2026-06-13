import * as patientService from "./patient.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// helper — بيلف أي service function في asyncHandler
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const workflowHandler = (serviceFn, message) =>
  asyncHandler(async (req, res) => {
    const patient = await serviceFn(req.params.id, req.body, req.user);
    return ApiResponse.ok(res, message, { patient });
  });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CRUD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createPatient = asyncHandler(async (req, res) => {
  const patient = await patientService.createPatient(
    req.body,
    req.files || [],   // ← أضيف الـ files
    req.user
  );
  return ApiResponse.created(res, "Patient created successfully.", { patient });
});

export const getAllPatients = asyncHandler(async (req, res) => {
  const result = await patientService.getAllPatients(req.query, req.user);
  return ApiResponse.ok(res, "Patients fetched successfully.", result);
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id, req.user);
  return ApiResponse.ok(res, "Patient fetched successfully.", { patient });
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.updatePatient(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, "Patient updated successfully.", { patient });
});

export const deletePatient = asyncHandler(async (req, res) => {
  await patientService.deletePatient(req.params.id);
  return ApiResponse.ok(res, "Patient deleted successfully.");
});

export const changePhase = asyncHandler(async (req, res) => {
  const patient = await patientService.changePhase(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, "Phase changed successfully.", { patient });
});

export const setAcceptanceDecision = asyncHandler(async (req, res) => {
  const patient = await patientService.setAcceptanceDecision(
    req.params.id,
    req.body.decision,
    req.user
  );

  return ApiResponse.ok(res, "Decision updated", { patient })
});

export const setCasePrice = asyncHandler(async (req, res) => {
  const result = await patientService.setCasePrice(
    req.params.id,
    req.body,
    req.user
  );
  return ApiResponse.ok(res, "Case price set successfully.", { casePrice: result });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WORKFLOW — كلها سطر واحد بس
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const photographicEvaluation = workflowHandler(patientService.photographicEvaluation, "Verifica valutazione done.");
export const suitabilityAndPickUp = workflowHandler(patientService.suitabilityAndPickUp, "Moved to Pick Up successfully.");
export const preparation = workflowHandler(patientService.preparation, "Preparazione done.");
export const verificaPianoCura = workflowHandler(patientService.verificaPianoCura, "Verifica piano cura done.");
export const attesaAccettazione = workflowHandler(patientService.attesaAccettazione, "Attesa accettazione done.");
export const completaFromStl = workflowHandler(patientService.completaFromStl, "Completed from STL.");
export const completaFromManufacturing = workflowHandler(patientService.completaFromManufacturing, "Completed from Manufacturing.");
export const completaOSecondaFase = workflowHandler(patientService.completaOSecondaFase, "Phase completed.");


// ── Documents ─────────────────────────────────────────────────

export const uploadDocuments = asyncHandler(async (req, res) => {
  const documents = await patientService.uploadDocuments(
    req.params.id,
    req.files,
    req.body,
    req.user
  );

  return ApiResponse.ok(
    res,
    "Documents uploaded successfully.",
    { documents }
  );
});

export const deleteDocument = asyncHandler(async (req, res) => {
  await patientService.deleteDocument(
    req.params.id,
    req.params.documentId,
    req.user
  );

  return ApiResponse.ok(
    res,
    "Document deleted successfully."
  );
});

export const updatePreviewLink = asyncHandler(async (req, res) => {
  const result = await patientService.updatePreviewLink(
    req.params.id,
    req.body.previewLink,
    req.user
  );
  return ApiResponse.ok(res, "Preview link updated.", result);
});

// ── Management ────────────────────────────────────────────────
export const updateManagement = asyncHandler(async (req, res) => {
  const result = await patientService.updateManagement(
    req.params.id, req.body, req.user
  );
  return ApiResponse.ok(res, "Management updated.", { management: result });
});

// ── Lavorazioni ───────────────────────────────────────────────
export const addLavorazione = asyncHandler(async (req, res) => {
  const result = await patientService.addLavorazione(
    req.params.id, req.body, req.user
  );
  return ApiResponse.ok(res, "Lavorazione added.", { lavorazioni: result });
});

export const updateLavorazione = asyncHandler(async (req, res) => {
  const result = await patientService.updateLavorazione(
    req.params.id, req.params.lavId, req.body, req.user
  );
  return ApiResponse.ok(res, "Lavorazione updated.", { lavorazioni: result });
});

export const deleteLavorazione = asyncHandler(async (req, res) => {
  await patientService.deleteLavorazione(
    req.params.id, req.params.lavId, req.user
  );
  return ApiResponse.ok(res, "Lavorazione deleted.");
});

// ── Care Plan ─────────────────────────────────────────────────
export const updateCarePlan = asyncHandler(async (req, res) => {
  const result = await patientService.updateCarePlan(
    req.params.id, req.body, req.user
  );
  return ApiResponse.ok(res, "Care plan updated.", { carePlan: result });
});

export const getActivityLog = asyncHandler(async (req, res) => {
  const log = await patientService.getActivityLog(
    req.params.id,
    req.query
  );
  return ApiResponse.ok(res, "Activity log fetched.", log);
});

export const addNote = asyncHandler(async (req, res) => {
  const note = await patientService.addNote(
    req.params.id,
    req.body.message,
    req.body.isInternal || false,   // ← أضيف
    req.user
  );
  return ApiResponse.ok(res, "Note added.", { note });
});

export const getNotes = asyncHandler(async (req, res) => {
  const notes = await patientService.getNotes(req.params.id,req.user);
  return ApiResponse.ok(res, "Notes fetched.", { notes });
});

// ── Care Request Retreatment ─────────────────────────────────────────────────
export const requestRetreatment = asyncHandler(async (req, res) => {
  const patient = await patientService.requestRetreatment(req.params.id, req.body.note, req.user);
  return ApiResponse.ok(res, "Re-treatment requested.", { patient });
});

export const reviewRetreatment = asyncHandler(async (req, res) => {
  const { action, rejectReason } = req.body;
  const patient = await patientService.reviewRetreatment(req.params.id, action, rejectReason, req.user);
  return ApiResponse.ok(res, `Re-treatment ${action === "approve" ? "approved" : "rejected"}.`, { patient });
});

export const getPendingRetreatments = asyncHandler(async (req, res) => {
  const requests = await patientService.getPendingRetreatments();
  return ApiResponse.ok(res, "Pending re-treatments fetched.", { requests });
});