import * as dashboardService from "./dashboard.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * GET /api/dashboard/stats
 * Admin → كل المرضى
 * Doctor → مرضاه بس
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats(req.user);
  return ApiResponse.ok(res, "Dashboard stats fetched successfully.", stats);
});
