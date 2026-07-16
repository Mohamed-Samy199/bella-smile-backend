import { ApiError } from "../../utils/ApiError.js";
import Distributor from "../../models/Distributor.model.js";
import {
  findById,
  findOne,
  create,
  findByIdAndUpdate,
  paginate,
} from "../../db/database.repository.js";
import Doctor from "../../models/Doctor.model.js";
import Patient from "../../models/Patient.model.js";
import AreaManager from "../../models/AreaManager.model.js";
import Payment from "../../models/Payment.model.js";

// ── Create ────────────────────────────────────────────────────────────────────

export const createDistributor = async (data) => {
  if (data.email) {
    const existing = await findOne({
      model: Distributor,
      filter: { email: data.email },
    });
    if (existing) throw ApiError.conflict("A distributor with this email already exists.");
  }

  return await create({ model: Distributor, data });
};

// ── Get All ───────────────────────────────────────────────────────────────────

export const getAllDistributors = async ({ page, size, search }) => {
  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { companyName: { $regex: search, $options: "i" } },
      { address:     { $regex: search, $options: "i" } },
      { email:       { $regex: search, $options: "i" } },
    ];
  }

  return await paginate({
    model: Distributor,
    filter,
    page,
    size,
    options: {
      lean: true,
      sort: { createdAt: -1 },
    },
  });
};

// ── Get By Id ─────────────────────────────────────────────────────────────────

export const getDistributorById = async (id) => {
  const distributor = await findById({
    model: Distributor,
    id,
    options: { lean: true },
  });
  if (!distributor) throw ApiError.notFound("Distributor not found.");
  return distributor;
};

// ── Update ────────────────────────────────────────────────────────────────────

export const updateDistributor = async (id, data) => {
  if (data.email) {
    const existing = await findOne({
      model: Distributor,
      filter: { email: data.email },
    });
    if (existing && existing._id.toString() !== id) {
      throw ApiError.conflict("This email is already in use.");
    }
  }

  const updated = await findByIdAndUpdate({
    model: Distributor,
    id,
    update: { $set: data },
    options: { returnDocument: "after" },
  });
  if (!updated) throw ApiError.notFound("Distributor not found.");
  return updated;
};

// ── Deactivate ────────────────────────────────────────────────────────────────

export const deactivateDistributor = async (id) => {
  const distributor = await findByIdAndUpdate({
    model: Distributor,
    id,
    update: { $set: { isActive: false } },
    options: { returnDocument: "after" },
  });
  if (!distributor) throw ApiError.notFound("Distributor not found.");
  return distributor;
};




// GET /api/distributors/:id/dashboard


export const getDistributorDashboard = async (distributorId) => {

  const distributor = await Distributor.findById(distributorId).lean();
  if (!distributor) throw ApiError.notFound("Distributor not found.");

  const doctors = await Doctor.find({ distributor: distributorId })
    .lean();

  const doctorIds = doctors.map((d) => d._id);

  const patients = await Patient.find({
    doctor:   { $in: doctorIds },
    isActive: true,
  })
    .populate("doctor", "firstName lastName")
    .lean();

  const activePatients = patients.filter(
    (p) => p.currentPhase !== "Completed" &&
           p.currentPhase !== "Not Suitable"
  );

  const areaManagers = await AreaManager.find({ isActive: true }).lean();

  const repStats = areaManagers.map((am) => {
    const amDoctors = doctors.filter(
      (d) => d.areaManager?.toString() === am._id.toString()
    );
    const amDocIds  = new Set(amDoctors.map((d) => d._id.toString()));
    const amCases   = activePatients.filter((p) =>
      amDocIds.has(p.doctor?._id?.toString())
    );

    const name = am.firstName && am.lastName
      ? `${am.firstName} ${am.lastName}`
      : am.email || "—";

    return {
      _id:             am._id,
      name,
      doctorsCount:    amDoctors.length,
      casesInProgress: amCases.length,
    };
  });

  // ── جيب كل المدفوعات الناجحة (مش بس هذا الشهر) للـ Recent Billing ──
  const allPayments = await Payment.find({
    doctor: { $in: doctorIds },
    status: "succeeded",
  })
    .sort({ createdAt: -1 })
    .lean();

  const now        = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const billedThisMonth = allPayments
    .filter((p) => p.createdAt >= startMonth)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // ── تجميع المدفوعات بالشهر عشان recentBilling ──
  const billingByPeriod = {};
  for (const p of allPayments) {
    const d      = new Date(p.createdAt);
    const period = d.toLocaleString("en-US", { month: "long", year: "numeric" }); // مثال: "July 2026"
    if (!billingByPeriod[period]) {
      billingByPeriod[period] = { period, amount: 0, status: "Paid" };
    }
    billingByPeriod[period].amount += p.amount || 0;
  }

  const recentBilling = Object.values(billingByPeriod)
    .sort((a, b) => new Date(b.period) - new Date(a.period))
    .slice(0, 6); // آخر 6 شهور مثلاً

  const distributorName =
    distributor.companyName ||
    (distributor.firstName && distributor.lastName
      ? `${distributor.firstName} ${distributor.lastName}`
      : distributor.email || "Distributor");

  return {
    distributor: { name: distributorName },
    stats: {
      representatives: areaManagers.length,
      activeDoctors:   doctors.length,
      casesInProgress: activePatients.length,
      billedThisMonth,
    },
    representatives: repStats,
    recentBilling,   // ← دلوقتي بيانات حقيقية بدل []
    patients: activePatients.map((p) => ({
      _id:          p._id,
      firstName:    p.firstName,
      lastName:     p.lastName,
      currentPhase: p.currentPhase,
      doctor:       p.doctor,
    })),
  };
};
