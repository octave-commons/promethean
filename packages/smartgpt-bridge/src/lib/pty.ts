// Lazy/optional node-pty wrapper so tests and unsupported runtimes don't explode.
// If NODE_PTY_DISABLED=1, this returns null or throws a typed error via helpers.

let _pty: Promise<any | null> | undefined; // undefined: not loaded

export async function getPty(): Promise<any | null> {
  if (process.env.NODE_PTY_DISABLED === "1") return null;
  if (_pty) return _pty;
  _pty = import("node-pty").then((mod) => mod.default ?? mod).catch(() => null);
  return _pty;
}

export class PtyUnavailableError extends Error {
  constructor() {
    super("PTY_UNAVAILABLE");
    this.name = "PTY_UNAVAILABLE";
  }
}

export async function spawnPty(
  file: string,
  args: string[],
  opts: Record<string, unknown> = {},
) {
  const pty = await getPty();
  if (!pty) throw new PtyUnavailableError();
  return pty.spawn(file, args, opts);
}
