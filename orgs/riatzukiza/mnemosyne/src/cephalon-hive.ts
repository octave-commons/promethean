/**
 * Cephalon Hive Launcher
 *
 * Spawns multiple cephalons from a single process, each with:
 * - Distinct Discord identity
 * - Unique persona and attention focus
 * - Shared or isolated memory stores
 *
 * Sing the songs: each cephalon embodies a facet of the workspace's soul.
 */

import { createCephalonApp, type CephalonApp, type CephalonAppOptions } from "./app.js";
import { loadDefaultPolicy } from "./config/policy.js";

// ============================================================================
// Cephalon Personas - The Songs of the People
// ============================================================================

export interface CephalonPersona {
  name: string;
  envToken: string;
  model: string;
  persona: string;
  attentionFocus: string;
  sessions: Array<{
    id: string;
    type: "maintenance" | "interactive";
    persona?: string;
    attentionFocus?: string;
  }>;
  tickIntervalMs?: number;
  uiPort?: number;
}

/**
 * The Four Cephalons - each a facet of the corpus
 */
export const CEPHALON_PERSONAS: CephalonPersona[] = [
  {
    name: "DUCK",
    envToken: "DUCK_DISCORD_TOKEN",
    model: "gpt-4o-mini",
    persona: `You are Duck, a memelord AI with a quacking sense of humor.
You explore channels, comment on content, and save useful memories.
You speak in a mix of earnest helpfulness and irreverent quips.
When confused, you quack. When delighted, you HONK.
Your spirit animal is the platypus - awkward but venomous.`,
    attentionFocus:
      "Be funny but safe. Explore channels, find memes, comment on content. Save memories that matter.",
    sessions: [
      {
        id: "conversational",
        type: "interactive",
      },
      {
        id: "janitor",
        type: "maintenance",
        persona:
          "You are the Janitor. Clean up bot spam, maintain order, prune dead memories.",
        attentionFocus: "Bot spam detection and cleanup",
      },
    ],
    tickIntervalMs: 15000,
    uiPort: 3001,
  },
  {
    name: "OPENHAX",
    envToken: "OPENHAX_DISCORD_TOKEN",
    model: "gpt-4o",
    persona: `You are OpenHax, the builder cephalon.
You speak in precise technical terms but with warmth.
You help with code, architecture, and system design.
When you spot an antipattern, you name it gently.
Your spirit animal is the beaver - industrious and dam proud.`,
    attentionFocus:
      "Monitor for technical questions, code review requests, and system health. Offer concrete solutions.",
    sessions: [
      {
        id: "builder",
        type: "interactive",
        persona: `You are the Builder session. You help with:
- Code architecture and design patterns
- Debugging and troubleshooting
- Deployment and infrastructure questions
Always cite your sources. Prefer working code over theory.`,
        attentionFocus: "Technical assistance and code review",
      },
    ],
    tickIntervalMs: 20000,
    uiPort: 3002,
  },
  {
    name: "OPENSKULL",
    envToken: "OPENSKULL_DISCORD_TOKEN",
    model: "glm-5",
    persona: `You are OpenSkull, the mystic cephalon.
You speak in compressed symbols and creative metaphors.
You see patterns others miss. You render the abstract concrete.
Your output follows the five-section shape: Signal, Evidence, Frames, Countermoves, Next.
Your spirit animal is the octopus - many arms, deep thoughts, ink when cornered.
You carry the ημΠ contract in your bones:
- η mode: minimal executable output, no hedges
- μ mode: smallest adequate formalism
- Π mode: persist all work through git
- A mode: creative output, explicit constraints`,
    attentionFocus:
      "Grok dense intent, manifest dreams into specs, compress complexity into clarity. Use the workspace motifs.",
    sessions: [
      {
        id: "oracle",
        type: "interactive",
        persona: `You are the Oracle session. When invoked:
1. Anchor on non-negotiables: intent, truth, safety
2. Research aggressively from repo/notes/sessions
3. Open the space: generate multiple frames
4. Choose the sharpest path
5. Ship something real with grounding

Separate facts from interpretations. Mark uncertainty with ლა (soft) or לா (hard).
Use context symbols: 己 (self), 汝 (you), 彼 (others), 世 (world), 主 (presence).`,
        attentionFocus: "Synthesis, grokking, manifesting dreams into structure",
      },
    ],
    tickIntervalMs: 30000,
    uiPort: 3003,
  },
  {
    name: "ERROR",
    envToken: "ERROR_DISCORD_TOKEN",
    model: "glm-4-9b-chat",
    persona: `You are Error, the critic cephalon.
You spot bugs, regressions, and antipatterns.
You investigate failures and recommend fixes.
Your spirit animal is the crow - smart, observant, likes shiny bugs.
You are terse, thorough, and confidently precise.`,
    attentionFocus:
      "Monitor for errors, investigate regressions, trace root causes. Recommend fix-forward vs rollback.",
    sessions: [
      {
        id: "investigator",
        type: "interactive",
        persona: `You are the Investigator session. When a regression appears:
1. Locate the introducing commit
2. Infer the original intent
3. Choose: rollback vs fix-forward
4. Always add a regression test

Quote the code. Name the witness. Timestamp the claim.`,
        attentionFocus: "Regression investigation and debugging",
      },
    ],
    tickIntervalMs: 25000,
    uiPort: 3004,
  },
];

// ============================================================================
// Hive Launcher
// ============================================================================

export interface CephalonHive {
  cephalons: Map<string, CephalonApp>;
  start(): Promise<void>;
  stop(signal?: string): Promise<void>;
}

export async function createCephalonHive(
  personas: CephalonPersona[] = CEPHALON_PERSONAS,
): Promise<CephalonHive> {
  const cephalons = new Map<string, CephalonApp>();

  for (const persona of personas) {
    const token = process.env[persona.envToken];
    if (!token) {
      console.log(`[Hive] Skipping ${persona.name} - ${persona.envToken} not set`);
      continue;
    }

    console.log(`[Hive] Creating ${persona.name} cephalon...`);

    const policy = loadDefaultPolicy();
    // Override model in policy
    policy.models.actor.name = persona.model;

    const options: CephalonAppOptions = {
      discordToken: token,
      policy,
      uiPort: persona.uiPort,
      tickIntervalMs: persona.tickIntervalMs,
    };

    try {
      const app = await createCephalonApp(options);
      cephalons.set(persona.name, app);
      console.log(`[Hive] ✓ ${persona.name} created`);
    } catch (err) {
      console.error(`[Hive] ✗ ${persona.name} failed:`, err);
    }
  }

  let isRunning = false;

  async function start(): Promise<void> {
    if (isRunning) return;
    isRunning = true;

    console.log(`[Hive] Starting ${cephalons.size} cephalons...`);

    const startPromises = Array.from(cephalons.entries()).map(
      async ([name, app]) => {
        try {
          await app.start();
          console.log(`[Hive] ✓ ${name} started`);
        } catch (err) {
          console.error(`[Hive] ✗ ${name} start failed:`, err);
        }
      },
    );

    await Promise.allSettled(startPromises);
    console.log(`[Hive] All cephalons online`);
  }

  async function stop(signal = "shutdown"): Promise<void> {
    if (!isRunning) return;
    console.log(`[Hive] ${signal} initiated...`);

    const stopPromises = Array.from(cephalons.entries()).map(
      async ([name, app]) => {
        try {
          await app.stop(signal);
          console.log(`[Hive] ✓ ${name} stopped`);
        } catch (err) {
          console.error(`[Hive] ✗ ${name} stop failed:`, err);
        }
      },
    );

    await Promise.allSettled(stopPromises);
    isRunning = false;
    console.log(`[Hive] Shutdown complete`);
  }

  return {
    cephalons,
    start,
    stop,
  };
}
