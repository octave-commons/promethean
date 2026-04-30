#!/usr/bin/env node

/**
 * Cephalon Hive CLI
 *
 * Launch the full cephalon collective:
 *
 *   pnpm hive
 *
 * Or select specific cephalons:
 *
 *   CEPHALONS=DUCK,OPENSKULL pnpm hive
 *
 * Each cephalon connects to Discord with its own identity
 * and embodies a distinct facet of the workspace's soul.
 */

import { createCephalonHive, CEPHALON_PERSONAS, type CephalonPersona } from "./cephalon-hive.js";

function parseCephalonSelection(): CephalonPersona[] {
  const selection = process.env.CEPHALONS;
  if (!selection) {
    return CEPHALON_PERSONAS;
  }

  const names = selection.split(",").map((s) => s.trim().toUpperCase());
  return CEPHALON_PERSONAS.filter((p) => names.includes(p.name));
}

async function run(): Promise<void> {
  const selected = parseCephalonSelection();

  if (selected.length === 0) {
    console.error("[Error] No cephalons selected. Set CEPHALONS env or ensure tokens are available.");
    process.exit(1);
  }

  console.log(`[Hive] Selected cephalons: ${selected.map((p) => p.name).join(", ")}`);

  const hive = await createCephalonHive(selected);
  await hive.start();

  const graceful = async (signal: string) => {
    try {
      await hive.stop(signal);
      process.exit(0);
    } catch (err) {
      console.error("[Shutdown] Error:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => graceful("SIGINT"));
  process.on("SIGTERM", () => graceful("SIGTERM"));
}

run().catch((err) => {
  console.error("[Fatal]", err);
  process.exit(1);
});
