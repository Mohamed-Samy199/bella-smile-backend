import { ApiError } from "../../utils/ApiError.js";
import AreaManager from "../../models/AreaManager.model.js";
import Doctor from "../../models/Doctor.model.js";
import Patient from "../../models/Patient.model.js";
import {
  find,
  findById,
  findOne,
  create,
  findByIdAndUpdate,
  deleteOne,
  paginate,
} from "../../db/database.repository.js";


// ── Create ────────────────────────────────────────────────────────────────────

export const createAreaManager = async (data) => {
  // لو فيه email تشيك إنه مش متكرر
  if (data.email) {
    const existing = await findOne({
      model: AreaManager,
      filter: { email: data.email },
    });
    if (existing) throw ApiError.conflict("An area manager with this email already exists.");
  }

  return await create({ model: AreaManager, data });
};

// ── Get All (paginated + search) ──────────────────────────────────────────────

export const getAllAreaManagers = async ({ page, size, search }) => {
  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName:  { $regex: search, $options: "i" } },
      { city:      { $regex: search, $options: "i" } },
      { email:     { $regex: search, $options: "i" } },
    ];
  }

  return await paginate({
    model: AreaManager,
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

export const getAreaManagerById = async (id) => {
  const areaManager = await findById({
    model: AreaManager,
    id,
    options: { lean: true },
  });
  if (!areaManager) throw ApiError.notFound("Area manager not found.");
  return areaManager;
};

// ── Get Area Manager Dashboard ───────────────────────────────────────────────
export const getAreaManagerDashboard = async (areaManagerId) => {

  // جيب كل الدكاترة تحت الـ area manager
  const doctors = await Doctor.find({ areaManager: areaManagerId }).lean();
  const doctorIds = doctors.map((d) => d._id);

  // جيب كل patients بتوعهم
  const patients = await Patient.find({
    doctor:   { $in: doctorIds },
    isActive: true,
  })
    .populate("doctor", "firstName lastName city")
    .lean();

  const activePatients = patients.filter(
    (p) => p.currentPhase !== "Completed" &&
           p.currentPhase !== "Not Suitable"
  );

  // Cases محتاجة action من الدكتور
  const awaitingAction = activePatients.filter((p) =>
    p.currentPhase === "Waiting for Acceptance" &&
    p.acceptanceDecision === "pending"
  ).length;

  // Stats لكل دكتور
  const doctorStats = doctors.map((doc) => {
    const docPatients = activePatients.filter(
      (p) => p.doctor?._id?.toString() === doc._id.toString()
    );

    // أحدث مريض active للـ latest file progress
    const latestPatient = docPatients.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    )[0] || null;

    return {
      _id:             doc._id,
      name:            `${doc.firstName} ${doc.lastName}`,
      clinic:          doc.city || "—",
      casesInProgress: docPatients.length,
      latestPhase:     latestPatient?.currentPhase || null,
    };
  });

  return {
    stats: {
      doctorsFollowed: doctors.length,
      casesInProgress: activePatients.length,
      awaitingAction,
    },
    doctors: doctorStats,
  };
};

// ── Update ────────────────────────────────────────────────────────────────────

export const updateAreaManager = async (id, data) => {
  // لو بيغير الإيميل تشيك إنه مش متكرر
  if (data.email) {
    const existing = await findOne({
      model: AreaManager,
      filter: { email: data.email },
    });
    if (existing && existing._id.toString() !== id) {
      throw ApiError.conflict("This email is already in use.");
    }
  }

  const updated = await findByIdAndUpdate({
    model: AreaManager,
    id,
    update: { $set: data },
    options: { returnDocument: "after" },
  });
  if (!updated) throw ApiError.notFound("Area manager not found.");
  return updated;
};

// ── Deactivate (Soft Delete) ──────────────────────────────────────────────────

export const deactivateAreaManager = async (id) => {
  const areaManager = await findByIdAndUpdate({
    model: AreaManager,
    id,
    update: { $set: { isActive: false } },
    options: { returnDocument: "after" },
  });
  if (!areaManager) throw ApiError.notFound("Area manager not found.");
  return areaManager;
};