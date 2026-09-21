import mongoose from "mongoose";
import readline from "readline";
import { MONGODB_URI } from "./config/env.config.js";

// Collections that must NOT be wiped (config data)
const KEEP = ["pricings"];

const ask = (q) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => {
      rl.close();
      resolve(a.trim());
    });
  });

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    console.log("✅ Connected to DB:", db.databaseName);

    const all = await db.listCollections().toArray();
    const targets = all.map((c) => c.name).filter((n) => !KEEP.includes(n) && !n.startsWith("system."));

    console.log("\nWill be WIPED:");
    for (const name of targets) {
      console.log(`  - ${name}: ${await db.collection(name).countDocuments()}`);
    }
    console.log("\nWill be KEPT:", KEEP.join(", ") || "(none)");

    const answer = await ask(`\nType the DB name (${db.databaseName}) to confirm: `);
    if (answer !== db.databaseName) {
      console.log("❌ Cancelled. Nothing was deleted.");
      return;
    }

    for (const name of targets) {
      const res = await db.collection(name).deleteMany({});
      console.log(`🗑️  ${name}: deleted ${res.deletedCount}`);
    }
    console.log("\n✅ Wipe completed.");
  } catch (err) {
    console.error("❌ Wipe failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();