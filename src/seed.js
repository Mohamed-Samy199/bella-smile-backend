import mongoose from "mongoose";
import { 
  ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, 
  MONGODB_URI, 
  DISTRIBUTOR_NAME, DISTRIBUTOR_EMAIL, 
  AREA_MANAGER_EMAIL, AREA_MANAGER_NAME, 
  DOCTOR_NAME, DOCTOR_EMAIL, DOCTOR_PASSWORD
 } from "./config/env.config.js";
import User from "./models/User.model.js";
import Doctor from "./models/Doctor.model.js";
import AreaManager from "./models/AreaManager.model.js";
import Distributor from "./models/Distributor.model.js";


import dns from "dns";
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ── Connect ───────────────────────────────────────────────────────────────────

const connect = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");
};

// ── Seed Admin ────────────────────────────────────────────────────────────────

const seedAdmin = async () => {
  const email = ADMIN_EMAIL;

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("⚠️  Admin already exists — skipping.");
    return exists;
  }

  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
    isActive: true,
  });

  console.log("✅ Admin created:");
  console.log("   Email   :", email);
  console.log("   Password: " + ADMIN_PASSWORD);
  console.log("   ⚠️  Change the password after first login!");

  return admin;
};

// ── Seed Sample Distributor ───────────────────────────────────────────────────

const seedDistributor = async () => {
  const exists = await Distributor.findOne({ companyName: DISTRIBUTOR_NAME });
  if (exists) {
    console.log("⚠️  Sample distributor already exists — skipping.");
    return exists;
  }

  const distributor = await Distributor.create({
    companyName: DISTRIBUTOR_NAME,
    address: "Via Roma, 1 - Milano",
    email: DISTRIBUTOR_EMAIL,
    phone: "02 12345678",
  });

  console.log("✅ Sample distributor created:", distributor.companyName);
  return distributor;
};

// ── Seed Sample AreaManager ───────────────────────────────────────────────────

const seedAreaManager = async () => {
  const exists = await AreaManager.findOne({ email: AREA_MANAGER_EMAIL });
  if (exists) {
    console.log("⚠️  Sample area manager already exists — skipping.");
    return exists;
  }

  const areaManager = await AreaManager.create({
    firstName: AREA_MANAGER_NAME,
    lastName: "Rossi",
    city: "Milano",
    email: AREA_MANAGER_EMAIL,
    phone: "333 1234567",
  });

  console.log("✅ Sample area manager created:", `${areaManager.firstName} ${areaManager.lastName}`);
  return areaManager;
};

// ── Seed Sample Doctor ────────────────────────────────────────────────────────

const seedDoctor = async (distributor, areaManager) => {
  const email = DOCTOR_EMAIL;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("⚠️  Sample doctor already exists — skipping.");
    return;
  }

  const user = await User.create({
    name: DOCTOR_NAME,
    email,
    password: DOCTOR_PASSWORD,
    role: "doctor",
    mustChangePassword: true,
    isActive: true,
  });

  await Doctor.create({
    user: user._id,
    firstName: DOCTOR_NAME,
    lastName: "One",
    address: "Via Dante, 5",
    city: "Roma",
    email,
    phone: "06 98765432",
    areaManager: areaManager._id,
    distributor: distributor._id,
    agency: "Smile"
  });

  console.log("✅ Sample doctor created:");
  console.log("   Email   :", email);
  console.log("   Password: " + DOCTOR_PASSWORD);
  console.log("   ⚠️  mustChangePassword = true");
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Run
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const run = async () => {
  try {
    await connect();

    const distributor = await seedDistributor();
    const areaManager = await seedAreaManager();
    const admin = await seedAdmin();
    await seedDoctor(distributor, areaManager);

    console.log("\n🎉 Seed completed successfully!");
    console.log("─────────────────────────────────");
    console.log(`Admin  → ${ADMIN_EMAIL}  / ${ADMIN_PASSWORD}`);
    console.log(`Doctor → ${DOCTOR_EMAIL}  / ${DOCTOR_PASSWORD}`);
    console.log("─────────────────────────────────");

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

run();