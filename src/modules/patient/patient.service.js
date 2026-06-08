import { ApiError } from "../../utils/ApiError.js";
import Patient from "../../models/Patient.model.js";
import Doctor from "../../models/Doctor.model.js";
import {
  findById, findOne, create, findByIdAndUpdate, paginate,
} from "../../db/database.repository.js";
import { phasesEnum, eligibilityEnum } from "../../utils/common/index.js";
import Payment from "../../models/Payment.model.js";
import cloudinary from "../../config/cloudinary.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const addPhaseHistory = (patient, phase, userId, notes = null) => {
  patient.phaseHistory.push({
    phase,
    changedBy: userId,
    notes,
    changedAt: new Date(),
  });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASE TRANSITION — القلب اللي كل الـ actions بتشتغل بيه
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @param {string}   id          - patient id
 * @param {object}   options
 * @param {string|string[]} options.fromPhase  - الفيز المسموح بيها (string أو array)
 * @param {string}   options.toPhase           - الفيز الجديدة
 * @param {string}   [options.notes]           - ملاحظات
 * @param {object}   [options.extraFields]     - أي fields زيادة تتحط على الـ patient
 * @param {object}   currentUser
 */
const transitionPhase = async (id, options, currentUser) => {
  const { fromPhase, toPhase, notes, extraFields = {} } = options;

  // 1) جيب المريض
  const patient = await findById({
    model: Patient,
    id,
    options: { lean: false },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");

  // 2) تشيك الـ phase الحالية
  const allowedFrom = Array.isArray(fromPhase) ? fromPhase : [fromPhase];
  if (!allowedFrom.includes(patient.currentPhase)) {
    throw ApiError.badRequest(
      `Expected phase: "${allowedFrom.join(" or ")}" — current: "${patient.currentPhase}"`
    );
  }

  // 3) apply extra fields (dataPronte, eligibility, ...)
  Object.assign(patient, extraFields);

  // 4) غير الـ phase
  patient.currentPhase = toPhase;

  // 5) سجل في الـ history
  addPhaseHistory(patient, toPhase, currentUser._id, notes);

  // 6) save
  await patient.save();
  return patient;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CRUD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createPatient = async (data, currentUser) => {
  let doctorId = data.doctor;

  if (currentUser.role === "doctor") {
    const doctor = await findOne({
      model: Doctor,
      filter: { user: currentUser._id },
      options: { lean: true },
    });
    if (!doctor) throw ApiError.notFound("Doctor profile not found.");
    doctorId = doctor._id;
  }

  const doctorExists = await findById({
    model: Doctor,
    id: doctorId,
    options: { lean: true },
  });
  if (!doctorExists) throw ApiError.notFound("Doctor not found.");

  return await create({
    model: Patient,
    data: {
      ...data,
      doctor: doctorId,
      currentPhase: phasesEnum.VALUTAZIONE_FOTOGRAFICA,
      phaseHistory: [{
        phase: phasesEnum.VALUTAZIONE_FOTOGRAFICA,
        changedBy: currentUser._id,
        changedAt: new Date(),
      }],
    },
  });
};

export const getAllPatients = async (query, currentUser) => {
  const { page, size, search, phase, nationality, dataPronte, dataAccettazione } = query;
  const filter = { isActive: true };

  if (currentUser.role === "doctor") {
    const doctor = await findOne({
      model: Doctor,
      filter: { user: currentUser._id },
      options: { lean: true },
    });
    if (!doctor) throw ApiError.notFound("Doctor profile not found.");
    filter.doctor = doctor._id;
  }

  if (phase) filter.currentPhase = phase;
  if (nationality) filter.nationality = { $regex: nationality, $options: "i" };
  if (dataPronte) filter.dataPronte = { $gte: new Date(dataPronte) };
  if (dataAccettazione) filter.dataAccettazione = { $gte: new Date(dataAccettazione) };
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
  }

  return await paginate({
    model: Patient,
    filter,
    page,
    size,
    options: {
      populate: { path: "doctor", select: "firstName lastName email phone city paymentExempt distributor" },
      lean: true,
      sort: { updatedAt: -1 },
    },
  });
};

export const getPatientById = async (id, currentUser) => {
  const patient = await findById({
    model: Patient,
    id,
    options: {
      populate: [
        {
          path: "doctor",
          select: "firstName lastName email phone city paymentExempt distributor",
        },
        {
          path: "phaseHistory.changedBy",
          select: "name role",
        },
      ],
      lean: true,
    },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");

  if (currentUser.role === "doctor") {
    const doctor = await findOne({
      model: Doctor,
      filter: { user: currentUser._id },
      options: { lean: true },
    });
    if (patient.doctor._id.toString() !== doctor._id.toString()) {
      throw ApiError.forbidden("Access denied.");
    }
  }

  return patient;
};

export const updatePatient = async (id, data, currentUser) => {
  const patient = await getPatientById(id, currentUser);
  return await findByIdAndUpdate({
    model: Patient,
    id: patient._id,
    update: { $set: data },
    options: { returnDocument: "after" },
  });
};

export const deletePatient = async (id) => {
  const patient = await findByIdAndUpdate({
    model: Patient,
    id,
    update: { $set: { isActive: false } },
    options: { returnDocument: "after" },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");
  return patient;
};

// ── Manual Phase Override (Admin) ─────────────────────────────────────────────
export const changePhase = async (id, { phase, notes }, currentUser) => {
  const patient = await findById({
    model: Patient,
    id,
    options: { lean: false },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");

  const previousPhase = patient.currentPhase;
  patient.currentPhase = phase;
  addPhaseHistory(patient, phase, currentUser._id, notes);
  await patient.save();

  // ── لو الـ Admin رجّع المريض لقبل Pick Up → reset الـ payment ──
  const PHASES_ORDER = [
    phasesEnum.VALUTAZIONE_FOTOGRAFICA,
    phasesEnum.VERIFICA_VALUTAZIONE_FOTOGRAFICA,
    phasesEnum.IDONEITA_FOTOGRAFICA,
    phasesEnum.RITIRO,
    phasesEnum.PREPARAZIONE,
    phasesEnum.VERIFICA_PIANO_CURA,
    phasesEnum.ATTESA_ACCETTAZIONE,
    phasesEnum.COMPLETATO,
  ];

  const previousIndex = PHASES_ORDER.indexOf(previousPhase);
  const newIndex = PHASES_ORDER.indexOf(phase);

  // لو رجع لمرحلة قبل Pick Up → امسح الـ payments
  const pickUpIndex = PHASES_ORDER.indexOf(phasesEnum.RITIRO);
  if (newIndex < pickUpIndex && previousIndex >= pickUpIndex) {
    await Payment.updateMany(
      { patient: id, status: { $in: ["pending", "succeeded"] } },
      { $set: { status: "refunded", phaseUnlocked: false } }
    );
    console.log(`🔄 Payment reset for patient ${id} — moved back before Pick Up`);
  }

  return patient;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WORKFLOW ACTIONS — كلها بتستخدم transitionPhase
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const photographicEvaluation = (id, body, user) =>
  transitionPhase(id, {
    fromPhase: phasesEnum.VALUTAZIONE_FOTOGRAFICA,
    toPhase: phasesEnum.VERIFICA_VALUTAZIONE_FOTOGRAFICA,
    notes: body.notes,
  }, user);

export const suitabilityAndPickUp = (id, body, user) => {
  const { eligibility, notes, treatment, numAligners, dataPronte } = body;

  // لو Non Idoneo → روح لـ NON_IDONEO
  if (eligibility === eligibilityEnum.NON_IDONEO) {
    return transitionPhase(id, {
      fromPhase: phasesEnum.VERIFICA_VALUTAZIONE_FOTOGRAFICA,
      toPhase: phasesEnum.NON_IDONEO,
      notes,
      extraFields: { eligibility },
    }, user);
  }

  // لو Idoneo → روح مباشرة لـ Pick Up
  return transitionPhase(id, {
    fromPhase: phasesEnum.VERIFICA_VALUTAZIONE_FOTOGRAFICA,
    toPhase: phasesEnum.RITIRO,
    notes,
    extraFields: {
      eligibility,
      ...(treatment && { treatment }),
      ...(numAligners && { numAligners }),
      dataPronte: dataPronte || new Date(),
    },
  }, user);
};


export const preparation = async (id, body, currentUser) => {

  // لو Admin → مش محتاج دفع
  if (currentUser.role === "admin") {
    return transitionPhase(id, {
      fromPhase: phasesEnum.RITIRO,
      toPhase: phasesEnum.PREPARAZIONE,
      notes: body.notes,
    }, currentUser);
  }

  // لو Doctor → تشيك الدفع
  const doctor = await findOne({
    model: Doctor,
    filter: { user: currentUser._id },
    options: { lean: true },
  });

  // لو عنده استثناء → يعدي عادي
  if (doctor?.paymentExempt) {
    return transitionPhase(id, {
      fromPhase: phasesEnum.RITIRO,
      toPhase: phasesEnum.PREPARAZIONE,
      notes: body.notes,
    }, currentUser);
  }

  // console.log(id , status , phaseUnlocked);

  // تشيك إن فيه payment succeeded للمريض ده
  const payment = await Payment.findOne({
    patient: id,
    status: "succeeded",
    phaseUnlocked: true,
  });

  if (!payment) {
    throw ApiError.forbidden(
      "Payment required to proceed to Preparation. Please complete the payment first."
    );
  }

  return transitionPhase(id, {
    fromPhase: phasesEnum.RITIRO,
    toPhase: phasesEnum.PREPARAZIONE,
    notes: body.notes || `Paid — ${payment.numAligners} aligners`,
  }, currentUser);
};


export const verificaPianoCura = (id, body, user) =>
  transitionPhase(id, {
    fromPhase: phasesEnum.PREPARAZIONE,
    toPhase: phasesEnum.VERIFICA_PIANO_CURA,
    notes: body.notes,
  }, user);

// ── استثنائي: بتسجل dataAccettazione ─────────────────────────────────────────
export const attesaAccettazione = (id, body, user) =>
  transitionPhase(id, {
    fromPhase: phasesEnum.VERIFICA_PIANO_CURA,
    toPhase: phasesEnum.ATTESA_ACCETTAZIONE,
    notes: body.notes,
    extraFields: { dataAccettazione: new Date() },
  }, user);

export const completaOSecondaFase = (id, body, user) =>
  transitionPhase(id, {
    fromPhase: phasesEnum.ATTESA_ACCETTAZIONE, //["Verifica Preparazione", "Ristampe"],
    toPhase: phasesEnum.COMPLETATO,
    notes: body.notes,
    extraFields: {
      acceptanceDecision: "manufacturing",
    },
  }, user);

export const setAcceptanceDecision = async (
  patientId,
  decision,
  currentUser
) => {
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }

  if (
    patient.currentPhase !== phasesEnum.ATTESA_ACCETTAZIONE
  ) {
    throw ApiError.badRequest(
      "Patient must be in Waiting for Acceptance"
    );
  }

  const allowed = ["pending", "stl", "manufacturing"];

  if (!allowed.includes(decision)) {
    throw ApiError.badRequest("Invalid decision");
  }

  patient.acceptanceDecision = decision;

  patient.acceptanceDecisionAt =
    decision === "pending"
      ? null
      : new Date();

  await patient.save();

  await logActivity(
    patientId,
    `Acceptance decision changed to: ${decision}`,
    currentUser
  );

  return patient;
};

// ── Helper: Log Activity ──────────────────────────────────────
export const logActivity = async (patientId, action, user) => {
  await Patient.findByIdAndUpdate(patientId, {
    $push: {
      activityLog: {
        action,
        user: user._id,
        userName: user.name,
        createdAt: new Date(),
      },
    },
  });
};

// ── Documents ─────────────────────────────────────────────────

export const uploadDocuments = async (
  patientId,
  files,
  body,
  currentUser
) => {

  const patient = await findById({
    model: Patient,
    id: patientId,
    options: {
      lean: false,
    },
  });

  if (!patient) {
    throw ApiError.notFound("Patient not found.");
  }

  const uploadedDocuments = [];

  for (const file of files) {
    const result = await uploadToCloudinary(
      file.buffer,
      `bella-smile/patients/${patient._id}`
    );

    uploadedDocuments.push({
      fileName: file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      mimeType: file.mimetype,
      size: file.size,
      category: body.category || "attachment",
      uploadedBy: currentUser._id,
      uploadedAt: new Date(),
    });
  }

  // ✅ خد الـ index قبل الـ push عشان تعرف الـ docs الجديدة
  const prevLength = patient.documents.length;

  patient.documents.push(...uploadedDocuments);

  await patient.save();

  // ✅ رجّع الـ docs من الـ patient بعد الـ save — دي اللي فيها _id حقيقي
  const savedDocs = patient.documents.slice(prevLength);

  await logActivity(
    patientId,
    `Uploaded ${savedDocs.length} file(s)`,
    currentUser
  );

  return savedDocs;
};


export const deleteDocument = async (
  patientId,
  documentId,
  currentUser
) => {

  const patient = await findById({
    model: Patient,
    id: patientId,
    options: {
      lean: false,
    },
  });

  if (!patient) {
    throw ApiError.notFound(
      "Patient not found."
    );
  }

  const document =
    patient.documents.id(
      documentId
    );

  if (!document) {
    throw ApiError.notFound(
      "Document not found."
    );
  }

  await cloudinary.uploader.destroy(
    document.publicId,
    {
      resource_type:
        document.resourceType,
    }
  );

  const fileName =
    document.fileName;

  document.deleteOne();

  await patient.save();

  await logActivity(
    patientId,
    `Deleted file: ${fileName}`,
    currentUser
  );
};



// ── Management ────────────────────────────────────────────────
export const updateManagement = async (patientId, data, currentUser) => {
  const {
    arcataSuperiore,
    arcataInferiore,
    ...managementFields
  } = data;

  // حساب الـ total
  const sup = Number(arcataSuperiore ?? 0);
  const inf = Number(arcataInferiore ?? 0);
  const total = sup + inf;

  const patient = await findByIdAndUpdate({
    model: Patient,
    id: patientId,
    update: {
      $set: {
        // حدث الـ management
        "management.arcataSuperiore": sup,
        "management.arcataInferiore": inf,
        ...Object.fromEntries(
          Object.entries(managementFields).map(([k, v]) => [
            `management.${k}`,
            v,
          ])
        ),
        // حدث numAligners في الـ root مباشرة
        numAligners: total,
      },
    },
    options: { returnDocument: "after" },
  });

  if (!patient) throw ApiError.notFound("Patient not found.");

  await logActivity(
    patientId,
    `Updated management — aligners: ${sup} upper + ${inf} lower = ${total}`,
    currentUser
  );

  return {
    management: patient.management,
    numAligners: patient.numAligners,
  };
};

// ── Lavorazioni ───────────────────────────────────────────────
export const addLavorazione = async (patientId, data, currentUser) => {
  const patient = await findById({
    model: Patient, id: patientId, options: { lean: false },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");

  patient.lavorazioni.push({ ...data, createdBy: currentUser._id });
  await patient.save();

  await logActivity(patientId, `Added processing row #${data.number}`, currentUser);
  return patient.lavorazioni;
};

export const updateLavorazione = async (patientId, lavorazioneId, data, currentUser) => {
  const patient = await findById({
    model: Patient, id: patientId, options: { lean: false },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");

  const item = patient.lavorazioni.id(lavorazioneId);
  if (!item) throw ApiError.notFound("Lavorazione not found.");

  Object.assign(item, data);
  await patient.save();

  await logActivity(patientId, `Updated processing row`, currentUser);
  return patient.lavorazioni;
};

export const deleteLavorazione = async (patientId, lavorazioneId, currentUser) => {
  await Patient.findByIdAndUpdate(patientId, {
    $pull: { lavorazioni: { _id: lavorazioneId } },
  });
  await logActivity(patientId, "Deleted processing row", currentUser);
};

// ── Care Plan ─────────────────────────────────────────────────
export const updateCarePlan = async (patientId, data, currentUser) => {
  const sup = Number(data.arcataSuperiore ?? 0);
  const inf = Number(data.arcataInferiore ?? 0);
  const total = sup + inf;

  const patient = await findByIdAndUpdate({
    model: Patient,
    id: patientId,
    update: {
      $set: {
        carePlan: {
          ...data,
          totaleAllineatori: total,
          submittedBy: currentUser._id,
          submittedAt: new Date(),
        },
        // حدث numAligners في الـ root
        numAligners: total,
      },
    },
    options: { returnDocument: "after" },
  });

  if (!patient) throw ApiError.notFound("Patient not found.");

  await logActivity(
    patientId,
    `Updated care plan — aligners: ${total}`,
    currentUser
  );

  return patient.carePlan;
};

// patient.service.js
export const getActivityLog = async (patientId, query = {}) => {
  const patient = await findById({
    model: Patient, id: patientId, options: { lean: true },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");

  const log = patient.activityLog || [];

  // ✅ عكس الترتيب — الأحدث أولاً
  const sorted = [...log].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // ✅ Pagination
  const page = Math.max(1, parseInt(query.page) || 1);
  const size = Math.max(1, parseInt(query.size) || 10);
  const total = sorted.length;
  const pages = Math.ceil(total / size);
  const start = (page - 1) * size;

  return {
    result: sorted.slice(start, start + size),
    docsCount: total,
    pages,
    currentPage: page,
    limit: size,
  };
};


// في patient.service.js

export const addNote = async (patientId, message, currentUser) => {
  const patient = await findById({
    model: Patient, id: patientId, options: { lean: false },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");

  patient.notes.push({
    message,
    sentBy: currentUser._id,
    sentByName: currentUser.name,
    sentByRole: currentUser.role,
    createdAt: new Date(),
  });

  await patient.save();

  await logActivity(patientId, `Added a note`, currentUser);

  // رجّع الـ note الأخيرة
  return patient.notes[patient.notes.length - 1];
};

export const getNotes = async (patientId) => {
  const patient = await findById({
    model: Patient, id: patientId, options: { lean: true },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");

  return [...(patient.notes || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};
