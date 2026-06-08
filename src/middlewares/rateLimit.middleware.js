// src/middlewares/rateLimit.middleware.js
import rateLimit from "express-rate-limit";

// ── General API ───────────────────────────────────────────────
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 دقيقة
  max:      100,
  message:  { success: false, message: "Too many requests." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Auth endpoints ────────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,               // 10 محاولات login بس
  message:  { success: false, message: "Too many login attempts." },
  keyGenerator: (req) => req.ip,
});

// ── Forgot Password ───────────────────────────────────────────
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // ساعة
  max:      5,                // 5 طلبات بس في الساعة
  message:  { success: false, message: "Too many reset requests." },
});

// ── Payment ───────────────────────────────────────────────────
export const paymentLimiter = rateLimit({
  windowMs:     15 * 60 * 1000,
  max:          10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message:      { success: false, message: "Too many payment attempts." },
});

// ── Upload ────────────────────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,       // دقيقة
  max:      20,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message:  { success: false, message: "Too many uploads." },
});