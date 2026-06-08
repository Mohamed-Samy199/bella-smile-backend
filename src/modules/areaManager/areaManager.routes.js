import { Router } from "express";
import * as areaManagerController from "./areaManager.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/role.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  createAreaManagerSchema,
  updateAreaManagerSchema,
} from "./areaManager.validation.js";

const router = Router();

// كل الـ routes تحتاج login + admin
router.use(protect, isAdmin);

router.post("/",     validate(createAreaManagerSchema), areaManagerController.createAreaManager);
router.get("/",      areaManagerController.getAllAreaManagers);
router.get("/:id",   areaManagerController.getAreaManagerById);
router.put("/:id",   validate(updateAreaManagerSchema), areaManagerController.updateAreaManager);
router.delete("/:id",areaManagerController.deactivateAreaManager);

export default router;