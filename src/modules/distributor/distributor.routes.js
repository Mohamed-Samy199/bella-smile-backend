import { Router } from "express";
import * as distributorController from "./distributor.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/role.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  createDistributorSchema,
  updateDistributorSchema,
} from "./distributor.validation.js";

const router = Router();

router.use(protect, isAdmin);

router.post("/",      validate(createDistributorSchema), distributorController.createDistributor);
router.get("/",       distributorController.getAllDistributors);
router.get("/:id",    distributorController.getDistributorById);
router.put("/:id",    validate(updateDistributorSchema), distributorController.updateDistributor);
router.delete("/:id", distributorController.deactivateDistributor);

export default router;