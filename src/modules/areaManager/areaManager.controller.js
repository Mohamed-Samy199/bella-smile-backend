import * as areaManagerService from "./areaManager.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * POST /api/area-managers
 * Admin only
 */
export const createAreaManager = asyncHandler(async (req, res) => {
  const areaManager = await areaManagerService.createAreaManager(req.body);
  return ApiResponse.created(res, "Area manager created successfully.", { areaManager });
});

/**
 * GET /api/area-managers?page=1&size=30&search=Roma
 * Admin only
 */
export const getAllAreaManagers = asyncHandler(async (req, res) => {
  const { page, size, search } = req.query;
  const result = await areaManagerService.getAllAreaManagers({
    page:   parseInt(page) || 1,
    size:   parseInt(size) || 30,
    search: search || null,
  });
  return ApiResponse.ok(res, "Area managers fetched successfully.", result);
});

/**
 * GET /api/area-managers/:id
 * Admin only
 */
export const getAreaManagerById = asyncHandler(async (req, res) => {
  const areaManager = await areaManagerService.getAreaManagerById(req.params.id);
  return ApiResponse.ok(res, "Area manager fetched successfully.", { areaManager });
});

/**
 * GET /api/area-managers/:id/dashboard
 * Admin only
 */
export const getAreaManagerDashboard = asyncHandler(async (req, res) => {
  const data = await areaManagerService.getAreaManagerDashboard(req.params.id);
  return ApiResponse.ok(res, "Dashboard fetched.", data);
});

/**
 * PUT /api/area-managers/:id
 * Admin only
 */
export const updateAreaManager = asyncHandler(async (req, res) => {
  const areaManager = await areaManagerService.updateAreaManager(req.params.id, req.body);
  return ApiResponse.ok(res, "Area manager updated successfully.", { areaManager });
});

/**
 * DELETE /api/area-managers/:id
 * Admin only — soft delete
 */
export const deactivateAreaManager = asyncHandler(async (req, res) => {
  await areaManagerService.deactivateAreaManager(req.params.id);
  return ApiResponse.ok(res, "Area manager deactivated successfully.");
});