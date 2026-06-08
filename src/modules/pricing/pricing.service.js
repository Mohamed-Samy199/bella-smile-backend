import Pricing        from "../../models/Pricing.model.js";
import { ApiError }   from "../../utils/ApiError.js";

// ── Default Price لو مفيش في الـ DB ──────────────────────────
const DEFAULT_PRICE = 50;

// ── Get Current Price ────────────────────────────────────────
export const getCurrentPricing = async () => {
  const pricing = await Pricing.findOne({ isActive: true })
    .sort({ createdAt: -1 })
    .populate("updatedBy", "name")
    .lean();

  // لو مفيش في الـ DB → رجّع الـ default
  if (!pricing) {
    return {
      pricePerAligner: DEFAULT_PRICE,
      currency:        "eur",
      updatedBy:       null,
      updatedAt:       null,
      isDefault:       true,
    };
  }

  return { ...pricing, isDefault: false };
};

// ── Update Price (Admin only) ────────────────────────────────
export const updatePricing = async (data, adminId) => {
  const { pricePerAligner, currency, note } = data;

  // 1) deactivate الـ pricing القديم
  await Pricing.updateMany({}, { $set: { isActive: false } });

  // 2) انشئ record جديد
  const pricing = await Pricing.create({
    pricePerAligner,
    currency: currency || "eur",
    note,
    updatedBy: adminId,
    isActive:  true,
  });

  return pricing.populate("updatedBy", "name");
};

// ── Get Price History ────────────────────────────────────────
export const getPricingHistory = async () => {
  return await Pricing.find()
    .sort({ createdAt: -1 })
    .populate("updatedBy", "name")
    .lean();
};