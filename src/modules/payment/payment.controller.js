import * as paymentService from "./payment.service.js";
import { ApiResponse }     from "../../utils/ApiResponse.js";
import asyncHandler        from "../../utils/asyncHandler.js";

/**
 * POST /api/payments/create-session
 * Doctor only
 */
export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { patientId } = req.body;
  const result = await paymentService.createCheckoutSession(patientId, req.user);
  return ApiResponse.ok(res, "Checkout session created.", result);
});

/**
 * POST /api/payments/webhook
 * Stripe — raw body
 */
export const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const result    = await paymentService.handleStripeWebhook(req.body, signature);
  return res.json(result);
});

/**
 * GET /api/payments/session-status/:sessionId
 * Doctor — بيتشيك لو الدفع نجح
 */
export const checkSessionStatus = asyncHandler(async (req, res) => {
  const result = await paymentService.checkSessionStatus(
    req.params.sessionId,
    req.user
  );
  return ApiResponse.ok(res, "Session status fetched.", result);
});

/**
 * GET /api/payments/my-payments
 * Doctor
 */
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getMyPayments(req.user);
  return ApiResponse.ok(res, "Payments fetched.", { payments });
});

/**
 * PATCH /api/payments/exempt/:doctorId
 * Admin only
 */
export const togglePaymentExempt = asyncHandler(async (req, res) => {
  const { exempt } = req.body;
  const doctor = await paymentService.togglePaymentExempt(
    req.params.doctorId,
    exempt,
    req.user._id
  );
  return ApiResponse.ok(
    res,
    `Payment exemption ${exempt ? "enabled" : "disabled"}.`,
    { doctor }
  );
});