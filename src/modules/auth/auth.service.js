import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/env.config.js";
import { ApiError } from "../../utils/ApiError.js";
import User from "../../models/User.model.js";
import Doctor from "../../models/Doctor.model.js";
import bcrypt from "bcryptjs";
import {
  findOne,
  findById,
  create,
  findOneAndUpdate,
} from "../../db/database.repository.js";
import { transporter } from "../../utils/mailer.js";
import { CLIENT_URL }  from "../../config/env.config.js";

// ── Token Generator ───────────────────────────────────────────────────────────

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN || "7d",
  });
};



export const registerDoctor = async (data) => {
  const { name, email, password, firstName, lastName,
          phone, city, agency } = data;
console.log("==============>",name, email, password, firstName, lastName,
          phone, city, agency );

  // تشيك إن الـ email مش موجود
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict("Email already in use.");
  }

  // انشئ الـ User
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password:         hashedPassword,
    role:             "doctor",
    mustChangePassword: false,
  });

  // انشئ الـ Doctor profile مرتبط بالـ User
  const doctor = await Doctor.create({
    user:      user._id,
    firstName,
    lastName,
    email,
    phone:     phone  || "",
    city:      city   || "",
    agency:    agency || "",
  });

  // جيب الـ token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return {
    token,
    user: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  };
};

// ── Service Methods ───────────────────────────────────────────────────────────

export const register = async ({ name, email, password, role }) => {
  // 1) check email not taken
  const existing = await findOne({
    model: User,
    filter: { email },
  });
  if (existing) throw ApiError.conflict("An account with this email already exists.");

  // 2) create user — pre-save hook handles hashing
  const user = await create({
    model: User,
    data: { name, email, password, role },
  });

  // 3) generate token
  const token = generateToken(user._id);

  return { user: user.toSafeObject(), token };
};

export const login = async ({ email, password }) => {
  // 1) find user + password field (select: false بيمنعه يرجع تلقائياً)
  const user = await findOne({
    model: User,
    filter: { email },
    select: "+password",
    options: { lean: false }, // محتاج instance عشان comparePassword
  });
  
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password.");
  }
  
  // 2) verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password.");

  // 3) update lastLoginAt
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // 4) generate token
  const token = generateToken(user._id);

  return { user: user.toSafeObject(), token };
};

export const getMe = async (userId) => {
  const user = await findById({
    model: User,
    id: userId,
  });
  if (!user) throw ApiError.notFound("User not found.");
  return user;
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  // 1) fetch user with password
  const user = await findById({
    model: User,
    id: userId,
    select: "+password",
    options: { lean: false }, // محتاج instance عشان comparePassword و save
  });
  if (!user) throw ApiError.notFound("User not found.");

  // 2) verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.unauthorized("Current password is incorrect.");

  // 3) set new password — pre-save hook هيعمل hash
  user.password = newPassword;
  await user.save();

  // 4) fresh token
  const token = generateToken(user._id);

  return { token };
};import crypto        from "crypto";
import { log } from "console";


// ── Forgot Password ───────────────────────────────────────────
export const forgotPassword = async (email) => {
  const user = await findOne({
    model:   User,
    filter:  { email, isActive: true },
    options: { lean: false },
  });

  // مش بنقول للـ user إن الـ email مش موجود (security)
  if (!user) return;

  // Generate token
  const resetToken  = crypto.randomBytes(32).toString("hex");
  const tokenHashed = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken   = tokenHashed;
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة
  await user.save({ validateBeforeSave: false });

  // Send Email
  const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

  await transporter.sendMail({
    from:    `"Bella Smile" <${process.env.EMAIL_USER}>`,
    to:      user.email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#003366">Reset Your Password</h2>
        <p>You requested a password reset. Click the button below:</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#003366;color:white;
                  padding:12px 24px;border-radius:8px;text-decoration:none;
                  font-weight:bold;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px">
          This link expires in 15 minutes.<br/>
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
};

// ── Reset Password ────────────────────────────────────────────
export const resetPassword = async (token, newPassword) => {
  // Hash الـ token عشان نقارنه بالمخزون
  const tokenHashed = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await findOne({
    model:  User,
    filter: {
      passwordResetToken:   tokenHashed,
      passwordResetExpires: { $gt: new Date() },
      isActive:             true,
    },
    select:  "+passwordResetToken +passwordResetExpires",
    options: { lean: false },
  });

  if (!user) throw ApiError.badRequest("Invalid or expired reset token.");

  user.password             = newPassword;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { message: "Password reset successfully." };
};

// ── Change Role (Admin only) ──────────────────────────────────
export const changeUserRole = async (targetUserId, newRole, adminId) => {
  if (!["admin", "doctor"].includes(newRole)) {
    throw ApiError.badRequest("Role must be admin or doctor.");
  }

  // مش بنسمح للـ admin يغير role نفسه
  if (targetUserId.toString() === adminId.toString()) {
    throw ApiError.badRequest("You cannot change your own role.");
  }

  const user = await findById({
    model:   User,
    id:      targetUserId,
    options: { lean: false },
  });
  if (!user) throw ApiError.notFound("User not found.");

  // لو مفيش تغيير
  if (user.role === newRole) {
    throw ApiError.badRequest(`User already has role: ${newRole}`);
  }

  const oldRole  = user.role;
  user.role      = newRole;
  await user.save();

  return { user: user.toSafeObject(), oldRole, newRole };
};

