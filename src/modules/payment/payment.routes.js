import { Router }    from "express";
import express       from "express";
import rateLimit     from "express-rate-limit";
import * as pc       from "./payment.controller.js";
import { protect }   from "../../middlewares/auth.middleware.js";
import { isAdmin, isAdminOrDoctor } from "../../middlewares/role.middleware.js";
import validate      from "../../middlewares/validate.middleware.js";
import { createSessionSchema } from "./payment.validation.js";
import { paymentLimiter } from "../../middlewares/rateLimit.middleware.js";

// ── Rate Limiter ──────────────────────────────────────────────
const sessionLimiter = rateLimit({
  windowMs:     15 * 60 * 1000,
  max:          10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: {
    success: false,
    message: "Too many payment attempts. Try again later.",
  },
});

const router = Router();

// ── Webhook — قبل أي middleware ──────────────────────────────
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  pc.stripeWebhook
);

// ── Protected ─────────────────────────────────────────────────
router.use(protect);

router.post(
  "/create-session",
  isAdminOrDoctor,
  paymentLimiter,
  sessionLimiter,
  validate(createSessionSchema),
  pc.createCheckoutSession
);

router.get(
  "/session-status/:sessionId",
  isAdminOrDoctor,
  pc.checkSessionStatus
);

router.get("/my-payments", isAdminOrDoctor, pc.getMyPayments);

router.patch("/exempt/:doctorId", isAdmin, pc.togglePaymentExempt);

export default router;