import * as pricingService from "./pricing.service.js";
import { ApiResponse }     from "../../utils/ApiResponse.js";
import asyncHandler        from "../../utils/asyncHandler.js";

/**
 * GET /api/pricing
 * Admin + Doctor — يشوفوا السعر الحالي
 */
export const getCurrentPricing = asyncHandler(async (req, res) => {
  const pricing = await pricingService.getCurrentPricing();
  return ApiResponse.ok(res, "Pricing fetched.", { pricing });
});

/**
 * PUT /api/pricing
 * Admin only — يحدث السعر
 */
export const updatePricing = asyncHandler(async (req, res) => {
  const pricing = await pricingService.updatePricing(req.body, req.user._id);
  return ApiResponse.ok(res, "Pricing updated successfully.", { pricing });
});

/**
 * GET /api/pricing/history
 * Admin only — سجل تغييرات السعر
 */
export const getPricingHistory = asyncHandler(async (req, res) => {
  const history = await pricingService.getPricingHistory();
  return ApiResponse.ok(res, "Pricing history fetched.", { history });
});