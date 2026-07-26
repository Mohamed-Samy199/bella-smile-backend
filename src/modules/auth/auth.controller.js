import * as authService from "./auth.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

/**
 * POST /api/auth/register
 * Admin only
 */
// export const register = asyncHandler(async (req, res) => {
//   const { name, email, password, role } = req.body;
//   const { user, token } = await authService.register({ name, email, password, role });
//   return ApiResponse.created(res, "Account created successfully.", { user, token });
// });
export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerDoctor(req.body);
  return ApiResponse.created(res, "Account created successfully.", result);
})

/**
 * POST /api/auth/login
 * Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });
  return ApiResponse.ok(res, "Logged in successfully.", { user, token });
});

/**
 * GET /api/auth/me
 * Protected
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return ApiResponse.ok(res, "Profile fetched successfully.", { user });
});

/**
 * PATCH /api/auth/change-password
 * Protected
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { token } = await authService.changePassword(req.user.id, {
    currentPassword,
    newPassword,
  });
  return ApiResponse.ok(res, "Password changed successfully.", { token });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  // دايماً نرجع نفس الـ message (security)
  return ApiResponse.ok(
    res,
    "If this email exists, a reset link has been sent."
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(
    req.params.token,
    req.body.password
  );
  return ApiResponse.ok(res, result.message);
});

export const changeUserRole = asyncHandler(async (req, res) => {
  const result = await authService.changeUserRole(
    req.params.userId,
    req.body.role,
    req.user._id
  );
  return ApiResponse.ok(
    res,
    `Role changed from ${result.oldRole} to ${result.newRole}.`,
    { user: result.user }
  );
});