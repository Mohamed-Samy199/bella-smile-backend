import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.model.js";

/**
 * protect — verifies the JWT and attaches the user to req.user.
 * Must be used before any route that requires authentication.
 */
// export const protect = asyncHandler(async (req, res, next) => {
//   // 1) extract token from Authorization header
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     throw ApiError.unauthorized("No token provided. Please log in.");
//   }

//   const token = authHeader.split(" ")[1];

//   // 2) verify token
//   let decoded;
//   try {
//     decoded = jwt.verify(token, process.env.JWT_SECRET);
//   } catch (err) {
//     if (err.name === "TokenExpiredError") {
//       throw ApiError.unauthorized("Token has expired. Please log in again.");
//     }
//     throw ApiError.unauthorized("Invalid token. Please log in.");
//   }

//   // 3) check user still exists and is active
//   const user = await User.findById(decoded.id).select("-password");
//   if (!user || !user.isActive) {
//     throw ApiError.unauthorized("User no longer exists or is deactivated.");
//   }

//   // 4) attach user to request for downstream use
//   req.user = user;
//   next();
// });


export const protect = asyncHandler(async (req, _res, next) => {
  // 1) جيب الـ token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Not authenticated.");
  }

  const token = authHeader.split(" ")[1];
  if (!token) throw ApiError.unauthorized("Not authenticated.");

  // 2) Verify
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // فرق بين expired و invalid
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Session expired. Please login again.");
    }
    throw ApiError.unauthorized("Invalid token.");
  }

  // 3) تأكد إن الـ user لسه موجود وفعّال
  const user = await User.findById(decoded.id).select("+role");
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Account not found or deactivated.");
  }

  req.user = user;
  next();
});


/**
 * restrictTo — role-based access control.
 * Usage: router.delete("/users/:id", protect, restrictTo("admin"), ...)
 */
export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden("You do not have permission to perform this action.");
  }
  next();
};