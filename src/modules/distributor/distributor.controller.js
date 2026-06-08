import * as distributorService from "./distributor.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * POST /api/distributors
 * Admin only
 */
export const createDistributor = asyncHandler(async (req, res) => {
  const distributor = await distributorService.createDistributor(req.body);
  return ApiResponse.created(res, "Distributor created successfully.", { distributor });
});

/**
 * GET /api/distributors?page=1&size=30&search=Milano
 * Admin only
 */
export const getAllDistributors = asyncHandler(async (req, res) => {
  const { page, size, search } = req.query;
  const result = await distributorService.getAllDistributors({
    page:   parseInt(page) || 1,
    size:   parseInt(size) || 30,
    search: search || null,
  });
  return ApiResponse.ok(res, "Distributors fetched successfully.", result);
});

/**
 * GET /api/distributors/:id
 * Admin only
 */
export const getDistributorById = asyncHandler(async (req, res) => {
  const distributor = await distributorService.getDistributorById(req.params.id);
  return ApiResponse.ok(res, "Distributor fetched successfully.", { distributor });
});

/**
 * PUT /api/distributors/:id
 * Admin only
 */
export const updateDistributor = asyncHandler(async (req, res) => {
  const distributor = await distributorService.updateDistributor(req.params.id, req.body);
  return ApiResponse.ok(res, "Distributor updated successfully.", { distributor });
});

/**
 * DELETE /api/distributors/:id
 * Admin only
 */
export const deactivateDistributor = asyncHandler(async (req, res) => {
  await distributorService.deactivateDistributor(req.params.id);
  return ApiResponse.ok(res, "Distributor deactivated successfully.");
});