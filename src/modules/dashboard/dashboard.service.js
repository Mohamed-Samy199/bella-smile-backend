import Patient from "../../models/Patient.model.js";
import Doctor  from "../../models/Doctor.model.js";
import { findOne } from "../../db/database.repository.js";
import { phasesEnum } from "../../utils/common/index.js";
// import { phasesEnum } from "../../utils/constants/patient-phases.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Dashboard Stats
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PATIENT_PHASES = Object.values(phasesEnum);
export const getStats = async (currentUser) => {
  // لو Doctor → يشوف مرضاه بس
  let matchFilter = { isActive: true };

  if (currentUser.role === "doctor") {
    const doctor = await findOne({
      model: Doctor,
      filter: { user: currentUser._id },
      options: { lean: true },
    });
    if (!doctor) return buildEmptyStats();
    matchFilter.doctor = doctor._id;
  }

  // aggregate واحدة بتجيب عدد كل phase دفعة واحدة
  const result = await Patient.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$currentPhase",
        count: { $sum: 1 },
      },
    },
  ]);

  // حول الـ result لـ object منظم
  const countMap = {};
  result.forEach(({ _id, count }) => {
    countMap[_id] = count;
  });

  // ابني الـ response بكل الـ phases حتى لو count = 0
  const phases = PATIENT_PHASES.map((phase) => ({
    phase,
    count: countMap[phase] || 0,
  }));

  // total المرضى النشطين
  const total = phases.reduce((sum, p) => sum + p.count, 0);

  return { total, phases };
};

// ── لو الدكتور مش عنده مرضى ─────────────────────────────────────────────────
const buildEmptyStats = () => ({
  total: 0,
  phases: PATIENT_PHASES.map((phase) => ({ phase, count: 0 })),
});