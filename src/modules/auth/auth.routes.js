import { Router } from "express";
import * as authController from "./auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/role.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { authLimiter, forgotPasswordLimiter } from "../../middlewares/rateLimit.middleware.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changeRoleSchema,
} from "./auth.validation.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), authController.resetPassword);

// ── Protected ─────────────────────────────────────────────────────────────────
router.get("/me", protect, authController.getMe);
router.patch("/change-password", protect, validate(changePasswordSchema), authController.changePassword);

// ── Admin Only ────────────────────────────────────────────────────────────────
// router.post("/register", protect, isAdmin, validate(registerSchema), authController.register);
router.post("/register", validate(registerSchema), authController.register);
router.patch("/users/:userId/role", protect, isAdmin, validate(changeRoleSchema), authController.changeUserRole);

export default router;