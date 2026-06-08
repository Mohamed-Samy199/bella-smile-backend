import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    // ── Auth Link ─────────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Personal Info ─────────────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,                               // Nome
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,                               // Cognome
    },

    // ── Location ──────────────────────────────────────────────────────────────
    address: {
      type: String,
      trim: true,                               // Indirizzo
    },
    city: {
      type: String,
      trim: true,                               // Città
    },

    // ── Contact ───────────────────────────────────────────────────────────────
    email: {
      type: String,
      lowercase: true,
      trim: true,                               // Email
    },
    phone: {
      type: String,
      trim: true,                               // Telefono
    },

    // ── Business Relations ────────────────────────────────────────────────────
    areaManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AreaManager",                       // Manager column
      default: null,
    },
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",                       // "Smilepharm Milano"
      default: null,
    },

    // ── Business Info ─────────────────────────────────────────────────────────
    deposit: {
      type: Number,
      default: 0,                               // Deposito
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Permissions & Payment ─────────────────────────────────────────────────
    paymentExempt: {
      type: Boolean,
      default: false,   // Admin يقدر يخليه true → الدكتور مش محتاج يدفع
    },
    paymentExemptGrantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentExemptGrantedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ── Virtual ───────────────────────────────────────────────────────────────────
doctorSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
export default Doctor;