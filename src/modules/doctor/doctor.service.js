import { ApiError } from "../../utils/ApiError.js";
import Doctor from "../../models/Doctor.model.js";
import User from "../../models/User.model.js";
import AreaManager from "../../models/AreaManager.model.js";
import Distributor from "../../models/Distributor.model.js";
import {
  findById,
  findOne,
  create,
  findByIdAndUpdate,
  paginate,
} from "../../db/database.repository.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

// تتشك إن الـ areaManager موجود فعلاً
const validateAreaManager = async (areaManagerId) => {
  if (!areaManagerId) return;
  const exists = await findById({
    model: AreaManager,
    id: areaManagerId,
    options: { lean: true },
  });
  if (!exists) throw ApiError.notFound("Area manager not found.");
};

// تتشك إن الـ distributor موجود فعلاً
const validateDistributor = async (distributorId) => {
  if (!distributorId) return;
  const exists = await findById({
    model: Distributor,
    id: distributorId,
    options: { lean: true },
  });
  if (!exists) throw ApiError.notFound("Distributor not found.");
};

// ── Create ────────────────────────────────────────────────────────────────────

export const createDoctor = async (data) => {
  const {
    email, password,
    firstName, lastName,
    address, city, phone,
    areaManager, distributor, agency,
  } = data;

  // 1) email مش متكرر
  const existingUser = await findOne({ model: User, filter: { email } });
  if (existingUser) throw ApiError.conflict("An account with this email already exists.");

  // 2) تتشك الـ refs موجودين
  await validateAreaManager(areaManager);
  await validateDistributor(distributor);

  // 3) create User
  const user = await create({
    model: User,
    data: {
      name: `${firstName} ${lastName}`,
      email,
      password,
      role: "doctor",
      mustChangePassword: false,
    },
  });

  // 4) create Doctor
  const doctor = await create({
    model: Doctor,
    data: {
      user: user._id,
      firstName,
      lastName,
      address,
      city,
      email,
      phone,
      areaManager: areaManager || null,
      distributor: distributor || null,
      agency:      agency      || null
    },
  });

  return { user: user.toSafeObject(), doctor };
};

// ── Get All ───────────────────────────────────────────────────────────────────

export const getAllDoctors = async ({ page, size, search }) => {
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
    model: Doctor,
    filter,
    page,
    size,
    options: {
      populate: [
        { path: "user", select: "_id name email role" },
        { path: "user",        select: "_id name email role createdAt" },
        { path: "areaManager", select: "firstName lastName" },
        { path: "distributor", select: "companyName" },
      ],
      lean: true,
      sort: { createdAt: -1 },
    },
  });
};

// ── Get By Id ─────────────────────────────────────────────────────────────────

export const getDoctorById = async (id) => {
  const doctor = await findById({
    model: Doctor,
    id,
    options: {
      populate: [
        { path: "user",        select: "_id name email role lastLoginAt createdAt" },
        { path: "areaManager", select: "firstName lastName email phone" },
        { path: "distributor", select: "companyName email phone" },
      ],
      lean: true,
    },
  });
  if (!doctor) throw ApiError.notFound("Doctor not found.");
  return doctor;
};

// ── Get By UserId ─────────────────────────────────────────────────────────────

export const getDoctorByUserId = async (userId) => {
  const doctor = await findOne({
    model: Doctor,
    filter: { user: userId },
    options: {
      populate: [
        { path: "user",        select: "_id name email role lastLoginAt createdAt" },
        { path: "areaManager", select: "firstName lastName" },
        { path: "distributor", select: "companyName" },
      ],
      lean: true,
    },
  });
  if (!doctor) throw ApiError.notFound("Doctor profile not found.");
  return doctor;
};

// ── Update ────────────────────────────────────────────────────────────────────

export const updateDoctor = async (id, data) => {
  const { firstName, lastName, email, areaManager, distributor, ...doctorFields } = data;

  // تتشك الـ refs لو اتبعتوا
  await validateAreaManager(areaManager);
  await validateDistributor(distributor);

  // جيب الـ doctor الحالي
  const currentDoctor = await findById({
    model: Doctor,
    id,
    options: { lean: true },
  });
  if (!currentDoctor) throw ApiError.notFound("Doctor not found.");

  // لو فيه firstName أو lastName → update User.name
  if (firstName || lastName) {
    const newFirst = firstName || currentDoctor.firstName;
    const newLast  = lastName  || currentDoctor.lastName;
    await findByIdAndUpdate({
      model: User,
      id: currentDoctor.user,
      update: { $set: { name: `${newFirst} ${newLast}` } },
    });
    if (firstName) doctorFields.firstName = firstName;
    if (lastName)  doctorFields.lastName  = lastName;
  }

  // لو فيه email → update User.email كمان
  if (email) {
    await findByIdAndUpdate({
      model: User,
      id: currentDoctor.user,
      update: { $set: { email } },
    });
    doctorFields.email = email;
  }

  if (areaManager !== undefined) doctorFields.areaManager = areaManager || null;
  if (distributor !== undefined) doctorFields.distributor = distributor || null;

  const updated = await findByIdAndUpdate({
    model: Doctor,
    id,
    update: { $set: doctorFields },
    options: { returnDocument: "after" },
  });

  return updated;
};

// ── Deactivate ────────────────────────────────────────────────────────────────

export const deactivateDoctor = async (id) => {
  const doctor = await findByIdAndUpdate({
    model: Doctor,
    id,
    update: { $set: { isActive: false } },
    options: { returnDocument: "after" },
  });
  if (!doctor) throw ApiError.notFound("Doctor not found.");

  // deactivate User كمان
  await findByIdAndUpdate({
    model: User,
    id: doctor.user,
    update: { $set: { isActive: false } },
  });

  return doctor;
};