import { ApiError } from "../utils/ApiError.js";

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw ApiError.forbidden("Admin access required.");
  }
  next();
};

export const isAdminOrDoctor = (req, res, next) => {
  if (!["admin", "doctor"].includes(req.user?.role)) {
    throw ApiError.forbidden("Access denied.");
  }
  next();
};