import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

// ─────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────

const storage = multer.memoryStorage();

// ─────────────────────────────────────────────
// Allowed Types
// ─────────────────────────────────────────────

const allowedExtensions = [
  //   ".stl",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
];

const allowedMimeTypes = [
  // STL
  //   "model/stl",
  //   "application/sla",
  //   "application/vnd.ms-pki.stl",
  //   "application/octet-stream",

  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// ─────────────────────────────────────────────
// File Filter
// ─────────────────────────────────────────────

const fileFilter = (req, file, cb) => {
  const ext = file.originalname
    .substring(file.originalname.lastIndexOf("."))
    .toLowerCase();

  const extensionValid = allowedExtensions.includes(ext);
  const mimeValid = allowedMimeTypes.includes(file.mimetype);

  if (extensionValid && mimeValid) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPG, JPEG, PNG, WEBP and PDF files are allowed."
    ),
    false
  );
};

// ─────────────────────────────────────────────
// Upload Middleware
// ─────────────────────────────────────────────

export const uploadFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB per file
    files: 20, // max files
  },
}).array("files", 20);

// ─────────────────────────────────────────────
// Promise Wrapper
// ─────────────────────────────────────────────

export const handleUpload = (req, res) =>
  new Promise((resolve, reject) => {
    uploadFiles(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return reject(
          ApiError.badRequest(`Upload error: ${err.message}`)
        );
      }

      if (err) {
        return reject(
          ApiError.badRequest(err.message)
        );
      }

      resolve();
    });
  });