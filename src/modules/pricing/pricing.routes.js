import { Router }           from "express";
import * as pricingController from "./pricing.controller.js";
import { protect }          from "../../middlewares/auth.middleware.js";
import { isAdmin, isAdminOrDoctor } from "../../middlewares/role.middleware.js";
import validate             from "../../middlewares/validate.middleware.js";
import { updatePricingSchema } from "./pricing.validation.js";

const router = Router();

router.use(protect);

router.get("/",         isAdminOrDoctor, pricingController.getCurrentPricing);
router.put("/",         isAdmin, validate(updatePricingSchema), pricingController.updatePricing);
router.get("/history",  isAdmin, pricingController.getPricingHistory);

export default router;