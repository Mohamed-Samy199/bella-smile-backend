import mongoose from "mongoose";
import { phasesEnum, treatmentEnum, eligibilityEnum, rowColorEnum, acceptanceDecisionEnum, resourceTypeEnum, categoryEnum, ProcessingEnum, roleEnum } from "../utils/common/index.js";

// ── Phase History (Embedded) ──────────────────────────────────────────────────
const phaseHistorySchema = new mongoose.Schema(
  {
    phase: { type: String, required: true },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: { type: String, trim: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── Patient ───────────────────────────────────────────────────────────────────
const patientSchema = new mongoose.Schema(
  {
    // ── Relations ─────────────────────────────────────────────────────────────
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // ── Personal Info ─────────────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,                           // Nazionalita filter
    },
    phone: {
      type: String,
      trim: true,
    },

    // ── Flags (!, ?, *) ───────────────────────────────────────────────────────
    flagUrgent: { type: Boolean, default: false },     // !
    flagQuestion: { type: Boolean, default: false },   // ?
    flagStar: { type: Boolean, default: false },       // *

    // ── Treatment Info ────────────────────────────────────────────────────────
    brux: { type: Boolean, default: false },           // BRUX
    numAligners: { type: Number, default: 0 },         // Num All.
    treatment: {
      type: String,
      enum: Object.values(treatmentEnum),
      default: treatmentEnum.null,                                   // Tratt.
    },
    sconto: { type: Boolean, default: false },         // Sconto
    priority: { type: Boolean, default: false },       // Pr.
    // amount: { type: Number, default: 0 },              // $

    // ── Phase / Status ────────────────────────────────────────────────────────
    currentPhase: {
      type: String,
      enum: Object.values(phasesEnum),
      default: phasesEnum.VALUTAZIONE_FOTOGRAFICA,
    },

    // ── Eligibility ───────────────────────────────────────────────────────────
    eligibility: {
      type: String,
      enum: Object.values(eligibilityEnum),
      default: eligibilityEnum.null,
    },

    // ── Dates ─────────────────────────────────────────────────────────────────
    dataPronte: { type: Date, default: null },         // Data Pronto تاريخ جاهزية
    dataAccettazione: { type: Date, default: null },   // Data Accettazione تاريخ القبول
    dataFaseDue: { type: Date, default: null },        // Data Fase Due تاريخ المرحلة الثانية

    // ── Phase History (embedded) ──────────────────────────────────────────────
    phaseHistory: [phaseHistorySchema],

    // ── Display ───────────────────────────────────────────────────────────────
    rowColor: {
      type: String,
      enum: Object.values(rowColorEnum),
      default: rowColorEnum.WHITE,
    },

    isActive: { type: Boolean, default: true },

    // ── STL / Manufacturing Decision ───────────────────────────────────────────────────────────────
    acceptanceDecision: {
      type: String,
      enum: Object.values(acceptanceDecisionEnum),
      default: acceptanceDecisionEnum.PENDING,
    },

    acceptanceDecisionAt: {
      type: Date,
      default: null,
    },

    // ── Documents (صور الحالة) ────────────────────────────────────
    documents: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },

        fileName: {
          type: String,
          required: true,
          trim: true,
        },

        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          required: true,
        },

        resourceType: {
          type: String,
          enum: Object.values(resourceTypeEnum),
          default: resourceTypeEnum.IMAGE,
        },

        mimeType: {
          type: String,
        },

        size: {
          type: Number,
        },

        category: {
          type: String,
          enum: Object.values(categoryEnum),
          default: categoryEnum.ATTACHMENT,
        },

        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ── Management Tab ────────────────────────────────────────────
    management: {
      trattamento: { type: String },
      mesi: { type: Number },
      arcataSuperiore: { type: Number, default: 0 },
      arcataInferiore: { type: Number, default: 0 },
      bruxismo: { type: Boolean, default: false },
      preview: { type: Boolean, default: false },
      attachment: { type: Boolean, default: false },
      stripping: { type: Boolean, default: false },
      estrazioni: { type: Boolean, default: false },
      noteValutazione: { type: String, trim: true },
      noteIdoneita: { type: String, trim: true },
      pianoCura: { type: String, trim: true },
      attachmentTeeth: [{ type: Number }],
    },

    // ── Processing / Lavorazioni (Admin only) ─────────────────────
    lavorazioni: [
      {
        number: { type: Number },
        checked: { type: Boolean, default: false },
        spessore: { type: String },
        taglio: { type: String },
        val: { type: String },
        jaw: { type: String, enum: Object.values(ProcessingEnum) },
        bottoni: { type: String },
        data: { type: Date },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],


    // ── Activity History (Storico) ────────────────────────────────
    activityLog: [
      {
        action: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // في Patient.model.js — داخل patientSchema
    notes: [
      {
        message: { type: String, required: true, trim: true },
        sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        sentByName: { type: String },
        sentByRole: { type: String, enum: Object.values(roleEnum) },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
patientSchema.index({ currentPhase: 1 });
patientSchema.index({ doctor: 1 });
patientSchema.index({ doctor: 1, currentPhase: 1 });
patientSchema.index({ firstName: "text", lastName: "text" });

// ── Virtual ───────────────────────────────────────────────────────────────────
patientSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Patient = mongoose.models.Patient || mongoose.model("Patient", patientSchema);
export default Patient;