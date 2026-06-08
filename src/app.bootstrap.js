import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import xss           from "xss";

import errorMiddleware from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import areaManagerRoutes from "./modules/areaManager/areaManager.routes.js";
import distributorRoutes from "./modules/distributor/distributor.routes.js";
import doctorRoutes from "./modules/doctor/doctor.routes.js";
import patientRoutes from "./modules/patient/patient.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import pricingRoutes from "./modules/pricing/pricing.routes.js";

import { ApiError } from "./utils/ApiError.js";
import { generalLimiter } from "./middlewares/rateLimit.middleware.js";

const app = express();

// ── Stripe Webhook — raw body لازم يكون قبل json() ──────
  app.use(
    "/api/payments/webhook",
    express.raw({ type: "application/json" })
);
  
// ── Security & Parsing Middlewares ────────────────────────────────────────────

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'"],
    styleSrc:   ["'self'", "'unsafe-inline'"],
    imgSrc:     ["'self'", "data:", "res.cloudinary.com"],
    connectSrc: ["'self'"],
  },
}));


// ── XSS Prevention — sanitize body strings ───────────────────
app.use((req, _res, next) => {
  if (req.body) sanitizeObject(req.body);
  next();
});

const sanitizeObject = (obj) => {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
};


const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
].filter(Boolean);


app.use(cors({
  origin: (origin, callback) => {
    if (!origin && process.env.NODE_ENV === process.env.DEVELOPMENT) {
      return callback(null, true);
    }
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── NoSQL Injection Prevention ────────────────────────────────
app.use(mongoSanitize());

// Compression
// app.use(compression());

app.use("/api", generalLimiter); // Apply general rate limiter to all API routes

if (process.env.NODE_ENV === process.env.DEVELOPMENT) {
  app.use(morgan("dev"));
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/api/auth",      authRoutes);
app.use("/api/area-managers", areaManagerRoutes);
app.use("/api/distributors",  distributorRoutes);
app.use("/api/doctors",  doctorRoutes);
app.use("/api/patients",  patientRoutes);
app.use("/api/patients",  patientRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/pricing", pricingRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "PostFlow API is running." });
});

// catch-all for unknown routes
app.all("*", (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found.`));
});

// ── Global Error Handler (must be last) ───────────────────────────────────────

app.use(errorMiddleware);

export default app;