import mongoose from "mongoose";
import { currencyEnum } from "../utils/common/index.js";

const pricingSchema = new mongoose.Schema(
  {
    pricePerAligner: {
      type:     Number,
      required: [true, "Price per aligner is required"],
      min:      [1, "Price must be at least 1"],
    },
    currency: {
      type:    String,
      default: currencyEnum.EUR,
      enum:    Object.values(currencyEnum),
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
    note: {
      type:  String,
      trim:  true,
      maxlength: 200,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Pricing = mongoose.models.Pricing || mongoose.model("Pricing", pricingSchema);
export default Pricing;