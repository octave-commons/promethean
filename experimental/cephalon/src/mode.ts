export type CephalonMode = "classic" | "ecs";

const DEFAULT_MODE: CephalonMode = "ecs";
const WARNED_VALUES = new Set<string>();

function normalizeMode(value: string | undefined): CephalonMode {
  if (!value) return DEFAULT_MODE;
  const normalized = value.trim().toLowerCase();
  if (normalized === "classic" || normalized === "ecs") {
    return normalized;
  }
  if (!WARNED_VALUES.has(normalized)) {
    console.warn(
      `Unknown CEPHALON_MODE "${value}". Falling back to "${DEFAULT_MODE}" mode.`,
    );
    WARNED_VALUES.add(normalized);
  }
  return DEFAULT_MODE;
}

export function getCephalonMode(): CephalonMode {
  return normalizeMode(process.env.CEPHALON_MODE);
}

export function isClassicMode(): boolean {
  return getCephalonMode() === "classic";
}

export function isEcsMode(): boolean {
  return getCephalonMode() === "ecs";
}
