import { Router } from "express";
import * as doctorController from "./doctor.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { isAdmin, isAdminOrDoctor } from "../../middlewares/role.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { createDoctorSchema, updateDoctorSchema } from "./doctor.validation.js";

const router = Router();

router.use(protect);

// ── Doctor — own profile ──────────────────────────────────────────────────────
router.get("/me", isAdminOrDoctor, doctorController.getMyProfile);

// ── Admin only ────────────────────────────────────────────────────────────────
router.post("/",      isAdmin, validate(createDoctorSchema), doctorController.createDoctor);
router.get("/",       isAdmin, doctorController.getAllDoctors);
router.get("/:id",    isAdmin, doctorController.getDoctorById);
router.put("/:id",    isAdmin, validate(updateDoctorSchema), doctorController.updateDoctor);
router.delete("/:id", isAdmin, doctorController.deactivateDoctor);

export default router;