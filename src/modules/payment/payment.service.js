import stripe from "../../config/stripe.js";
import Payment from "../../models/Payment.model.js";
import Patient from "../../models/Patient.model.js";
import Doctor from "../../models/Doctor.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { phasesEnum } from "../../utils/common/index.js";
import { findById, findOne, create } from "../../db/database.repository.js";
import { PAYMENT_CANCEL_PATH, PAYMENT_SUCCESS_PATH } from "../../config/env.config.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Create Checkout Session
// ━━━━━━━━━━━━━━━━━━━━━━━━━━═════════════════════════════════

export const createCheckoutSession = async (patientId, currentUser) => {
  const doctor = await findOne({
    model: Doctor,
    filter: { user: currentUser._id },
    options: { lean: true },
  });
  if (!doctor) throw ApiError.notFound("Doctor profile not found.");

  const patient = await findById({
    model: Patient,
    id: patientId,
    options: { lean: true },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");

  if (patient.doctor.toString() !== doctor._id.toString()) {
    throw ApiError.forbidden("You can only pay for your own patients.");
  }

  if (patient.currentPhase !== phasesEnum.RITIRO) {
    throw ApiError.badRequest("Patient must be in Pick Up phase.");
  }

  // ── Exemption check ───────────────────────────────────────
  if (doctor.paymentExempt) {
    const updatedPatient = await Patient.findById(patientId);
    if (!updatedPatient) throw ApiError.notFound("Patient not found.");

    updatedPatient.currentPhase = phasesEnum.PREPARAZIONE;
    updatedPatient.phaseHistory.push({
      phase: phasesEnum.PREPARAZIONE,
      changedBy: doctor._id,
      notes: "Payment exemption — no charge required.",
      changedAt: new Date(),
    });
    await updatedPatient.save();

    return {
      exempted: true,
      sessionUrl: null,
      message: "Proceeded to Preparation (payment exemption).",
    };
  }

  // ── تشيك الـ casePrice ────────────────────────────────────
  if (!patient.casePrice?.amount || patient.casePrice.amount <= 0) {
    throw ApiError.badRequest(
      "Case price has not been set by admin yet. Please contact your administrator."
    );
  }

  // ── Payment checks ────────────────────────────────────────
  // بندور بس على الـ active payments (pending أو succeeded + phaseUnlocked)
  // الـ refunded مش بنتعامل معاهم — دول history بس
  const existing = await Payment.findOne({
    patient: patientId,
    status: { $in: ["pending", "succeeded"] },
    phaseUnlocked: { $ne: false }, // مش الـ succeeded اللي اتعمله refund
  });

  // لو succeeded و phaseUnlocked = true → الدفع اتكمل فعلاً ومش محتاج تاني
  if (existing?.status === "succeeded" && existing?.phaseUnlocked === true) {
    throw ApiError.conflict("Payment already completed for this patient.");
  }

  // لو pending → expire الـ session القديم وامسحه
  if (existing?.status === "pending" && existing?.stripeSessionId) {
    try {
      await stripe.checkout.sessions.expire(existing.stripeSessionId);
    } catch { /* Stripe session ممكن تكون expired بالفعل */ }
    await Payment.deleteOne({ _id: existing._id });
  }

  // ── Build Stripe session ──────────────────────────────────
  const totalAmount = patient.casePrice.amount;
  const currency = patient.casePrice.currency || "eur";
  const amountInCents = Math.round(totalAmount * 100);

  if (amountInCents < 50) {
    throw ApiError.badRequest("Payment amount too low.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amountInCents,
          product_data: {
            name: "Dental Treatment",
            description: `Case payment for ${patient.firstName} ${patient.lastName}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: PAYMENT_SUCCESS_PATH,
    cancel_url: PAYMENT_CANCEL_PATH,
    metadata: {
      patientId: patientId.toString(),
      doctorId: doctor._id.toString(),
    },
    payment_intent_data: {
      metadata: {
        patientId: patientId.toString(),
        doctorId: doctor._id.toString(),
      },
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  // ── حفظ الـ Payment record الجديد ────────────────────────
  // كل دفعة جديدة بتتحفظ كـ record منفصل → history محفوظ دايماً
  await create({
    model: Payment,
    data: {
      doctor: doctor._id,
      patient: patientId,
      stripeSessionId: session.id,
      amount: totalAmount,   // ✅ القيمة الحقيقية مش الـ cents
      currency,
      numAligners: (patient.management?.arcataSuperiore + patient.management?.arcataInferiore) || 1,
      pricePerAligner: totalAmount,
      status: "pending",
      phaseUnlocked: false,
    },
  });

  return {
    exempted: false,
    sessionUrl: session.url,
    sessionId: session.id,
    amount: totalAmount,
    currency,
  };
};

export const handleStripeWebhook = async (rawBody, signature) => {

  // ── 1) Verify Signature ───────────────────────────────────
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    throw ApiError.badRequest("Invalid webhook signature.");
  }

  // ── 2) Idempotency Check ──────────────────────────────────
  const alreadyProcessed = await Payment.findOne({
    stripeEventId: event.id,
  });
  if (alreadyProcessed) {
    // console.log(`Event ${event.id} already processed — skipping.`);
    return { received: true };
  }

  // ── 3) Handle Events ──────────────────────────────────────
  switch (event.type) {

    case "checkout.session.completed": {
      const session = event.data.object;
      // بس نعالجه لو الدفع اتكمل فعلاً
      if (session.payment_status === "paid") {
        await handleSessionCompleted(session, event.id);
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      await Payment.findOneAndUpdate(
        { stripeSessionId: session.id },
        { $set: { status: "failed" } }
      );
      break;
    }

    default:
      break;
  }

  return { received: true };
};

// ── Session Completed → انقل المريض للـ Preparation ──────────
const handleSessionCompleted = async (session, eventId) => {

  // جيب الـ Payment record
  const payment = await Payment.findOne({
    stripeSessionId: session.id,
  });

  if (!payment) {
    console.error(`Payment not found for session: ${session.id}`);
    return;
  }

  // Idempotency — مش نعمله مرتين
  if (payment.status === "succeeded") return;

  // Update Payment
  payment.status = "succeeded";
  payment.phaseUnlocked = true;
  payment.stripeEventId = eventId;
  await payment.save();

  // تأكد إن المريض لسه في Pick Up
  const patient = await Patient.findById(payment.patient);
  if (!patient) return;

  if (patient.currentPhase !== phasesEnum.RITIRO) {
    console.warn(`Patient ${patient._id} not in Pick Up. Skipping.`);
    return;
  }

  // انقل للـ Preparation
  patient.currentPhase = phasesEnum.PREPARAZIONE;
  patient.phaseHistory.push({
    phase: phasesEnum.PREPARAZIONE,
    changedBy: payment.doctor,
    notes: `Payment confirmed — ${payment.numAligners} aligners — ${payment.currency.toUpperCase()} ${payment.amount}`,
    changedAt: new Date(),
  });

  await patient.save();
  console.log(`✅ Patient ${patient._id} → Preparation`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Check Payment Status (Frontend polling)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const checkSessionStatus = async (sessionId, currentUser) => {
  // تشيك من Stripe مباشرة
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // تشيك إن الـ session بتاع الدكتور ده
  if (session.metadata?.doctorId !== currentUser._id.toString()) {
    throw ApiError.forbidden("Access denied.");
  }

  const payment = await Payment.findOne({ stripeSessionId: sessionId })
    .populate("patient", "firstName lastName currentPhase")
    .lean();

  return {
    sessionStatus: session.status,
    paymentStatus: session.payment_status,
    paymentRecord: payment,
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const togglePaymentExempt = async (doctorId, exempt, adminId) => {
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId,
    {
      $set: {
        paymentExempt: exempt,
        paymentExemptGrantedBy: adminId,
        paymentExemptGrantedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  if (!doctor) throw ApiError.notFound("Doctor not found.");
  return doctor;
};

export const getMyPayments = async (currentUser) => {
  const doctor = await findOne({
    model: Doctor,
    filter: { user: currentUser._id },
    options: { lean: true },
  });
  if (!doctor) throw ApiError.notFound("Doctor not found.");

  return await Payment.find({ doctor: doctor._id })
    .populate("patient", "firstName lastName numAligners")
    .sort({ createdAt: -1 })
    .select("-stripeSessionId -stripeEventId")
    .lean();
};