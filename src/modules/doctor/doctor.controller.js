import * as doctorService from "./doctor.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * POST /api/doctors
 * Admin only
 */
export const createDoctor = asyncHandler(async (req, res) => {
  const result = await doctorService.createDoctor(req.body);
  return ApiResponse.created(res, "Doctor created successfully.", result);
});

/**
 * GET /api/doctors?page=1&size=30&search=Roma
 * Admin only
 */
export const getAllDoctors = asyncHandler(async (req, res) => {
  const { page, size, search } = req.query;
  const result = await doctorService.getAllDoctors({
    page:   parseInt(page) || 1,
    size:   parseInt(size) || 30,
    search: search || null,
  });
  return ApiResponse.ok(res, "Doctors fetched successfully.", result);
});

/**
 * GET /api/doctors/me
 * Doctor only
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorByUserId(req.user._id);
  return ApiResponse.ok(res, "Profile fetched successfully.", { doctor });
});

/**
 * GET /api/doctors/:id
 * Admin only
 */
export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  return ApiResponse.ok(res, "Doctor fetched successfully.", { doctor });
});

/**
 * GET /api/doctors/:id/overview
 * Admin only
 */
export const getDoctorOverview = asyncHandler(async (req, res) => {
    const data = await doctorService.getDoctorOverview(req.params.id);
    return ApiResponse.ok(res, "Doctor overview fetched.", data);
  });

/**
 * PUT /api/doctors/:id
 * Admin only
 */
export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body);
  return ApiResponse.ok(res, "Doctor updated successfully.", { doctor });
});

/**
 * DELETE /api/doctors/:id
 * Admin only
 */
export const deactivateDoctor = asyncHandler(async (req, res) => {
  await doctorService.deactivateDoctor(req.params.id);
  return ApiResponse.ok(res, "Doctor deactivated successfully.");
});