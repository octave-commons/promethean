export function parseArgs<T extends Record<string, string | boolean>>(
  defaults: Readonly<T>,
  argv: ReadonlyArray<string> = process.argv.slice(2),
): { [K in keyof T]: T[K] extends boolean ? boolean : string } {
  const out: Record<string, string | boolean> = { ...defaults };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]!;
    if (!k.startsWith("--")) continue;
    const next = argv[i + 1];
    const hasValue = typeof next === "string" && !next.startsWith("--");
    const def = defaults[k];
    let v: string | boolean;
    if (typeof def === "boolean") {
      if (hasValue) {
        v = next === "true" || next === "1";
        i++;
      } else {
        v = true;
      }
    } else {
      v = hasValue ? next! : "true";
      if (hasValue) i++;
    }
    out[k] = v;
  }
  return out as { [K in keyof T]: T[K] extends boolean ? boolean : string };
}
