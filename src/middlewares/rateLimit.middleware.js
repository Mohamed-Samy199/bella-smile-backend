// src/middlewares/rateLimit.middleware.js
import rateLimit from "express-rate-limit";

// ── General API ───────────────────────────────────────────────
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, message: "Too many requests." },
  standardHeaders: true,
  legacyHeaders:   false,
});


// ── Auth endpoints ────────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: "Too many login attempts." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Forgot Password ───────────────────────────────────────────
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      5,
  message:  { success: false, message: "Too many reset requests." },
  standardHeaders: true,
  legacyHeaders:   false,
});


// ── Payment ───────────────────────────────────────────────────
// لازم نستخدم ipKeyGenerator لو fallback للـ IP
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: "Too many payment attempts." },
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => {
    // لو الـ user logged in → استخدم الـ userId
    if (req.user?._id) return req.user._id.toString();
    // لو لا → استخدم ipKeyGenerator عشان يتعامل مع IPv6
    return ipKeyGenerator(req);
  },
});

// ── Upload ────────────────────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      20,
  message:  { success: false, message: "Too many uploads." },
  standardHeaders: true,
  legacyHeaders:   false,
});