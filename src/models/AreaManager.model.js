import mongoose from "mongoose";

const areaManagerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual: fullName
areaManagerSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const AreaManager = mongoose.models.AreaManager || mongoose.model("AreaManager", areaManagerSchema);
export default AreaManager;