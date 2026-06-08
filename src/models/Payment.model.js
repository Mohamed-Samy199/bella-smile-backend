import mongoose from "mongoose";
import { statusEnum } from "../utils/common/status.enum.js";

const paymentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // ── Stripe ────────────────────────────────────────────────
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeEventId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // ── Amount ────────────────────────────────────────────────
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "eur",
    },
    numAligners: {
      type: Number,
      required: true,
    },
    pricePerAligner: {
      type: Number,
      required: true,
    },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(statusEnum),
      default: statusEnum.PENDING,
    },
    phaseUnlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
paymentSchema.index({ patient: 1, status: 1 });
paymentSchema.index({ doctor: 1, createdAt: -1 });

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;