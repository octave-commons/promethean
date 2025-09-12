export const designTokens = {
  colorPrimary: "#4A90E2",
  colorSecondary: "#50E3C2",
  spacingSmall: "4px",
  spacingMedium: "8px",
  spacingLarge: "16px",
} as const;

function toKebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

export function applyDesignTokens(
  root: HTMLElement | Document = document,
): void {
  const el = (root as Document).documentElement
    ? (root as Document).documentElement
    : root;
  if (!el || !(el as HTMLElement).style) return;
  Object.entries(designTokens).forEach(([k, v]) => {
    (el as HTMLElement).style.setProperty(`--${toKebab(k)}`, String(v));
  });
}
