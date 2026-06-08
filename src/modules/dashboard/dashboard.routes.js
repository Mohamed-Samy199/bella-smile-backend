import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { isAdminOrDoctor } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(protect, isAdminOrDoctor);

router.get("/stats", dashboardController.getStats);

export default router;