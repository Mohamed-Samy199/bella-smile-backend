import { ApiError } from "../../utils/ApiError.js";
import Distributor from "../../models/Distributor.model.js";
import {
  findById,
  findOne,
  create,
  findByIdAndUpdate,
  paginate,
} from "../../db/database.repository.js";

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