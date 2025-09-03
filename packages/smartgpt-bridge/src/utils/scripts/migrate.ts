// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
// migrations/20250822_seed_rbac.js
import { Policy } from "../src/models/policy.js";
import { User } from "../src/models/user.js";

export async function up(db) {
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
  await db.collection("users").createIndex({ apiKey: 1 }, { unique: true });
  await db
    .collection("policies")
    .createIndex({ role: 1, action: 1, resource: 1 }, { unique: true });

  const pol = db.collection("policies");
  function upsert(role, action, resource, effect = "allow") {
    return pol.updateOne(
      { role, action, resource },
      { $set: { effect } },
      { upsert: true },
    );
  }

  await Promise.all([
    upsert("admin", "*", "*"),
    upsert("reader", "read", "files"),
    upsert("reader", "read", "search"),
    upsert("reader", "read", "code"),
    upsert("reader", "read", "symbols"),
    upsert("reader", "read", "sinks:*"),
    upsert("operator", "read", "indexer"),
    upsert("operator", "write", "indexer"),
    upsert("operator", "read", "agents"),
    upsert("operator", "write", "agents"),
    upsert("operator", "write", "exec"),
  ]);

  const admin = await db.collection("users").findOne({ username: "admin" });
  if (!admin) throw new Error("Create admin user before running migration");
  await db
    .collection("users")
    .updateOne({ _id: admin._id }, { $addToSet: { roles: "admin" } });
}
