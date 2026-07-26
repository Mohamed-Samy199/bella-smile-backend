import { ApiError } from "../utils/ApiError.js";

/**
 * Global error handler — must be registered LAST in app.js.
 * Catches every error forwarded via next(err).
 */
const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // ── Handle known Mongoose errors ──────────────────────

  // duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = ApiError.conflict(`${field} already exists.`);
  }

  // invalid MongoDB ObjectId
  if (err.name === "CastError") {
    error = ApiError.badRequest(`Invalid value for field: ${err.path}`);
  }

  // Mongoose validation errors (schema-level)
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest("Validation failed333", errors);
  }

  // ── Fallback for unexpected errors ────────────────────

  const statusCode = error.statusCode || 500;
  const message = error.isOperational
    ? error.message
    : "Something went wrong. Please try again.";

  if (statusCode === 500) {
    console.error("[ SERVER ERROR ]", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === process.env.DEVELOPMENT && { stack: err.stack }),
  });
};

export default errorMiddleware;