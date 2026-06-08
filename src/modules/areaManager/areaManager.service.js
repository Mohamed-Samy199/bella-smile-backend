import { ApiError } from "../../utils/ApiError.js";
import AreaManager from "../../models/AreaManager.model.js";
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
    options: { new: true },
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
    options: { new: true },
  });
  if (!areaManager) throw ApiError.notFound("Area manager not found.");
  return areaManager;
};