import type { PiperStep } from "../types.js";

export function topoSort(steps: PiperStep[]): PiperStep[] {
  const byId = new Map(steps.map((s) => [s.id, s]));
  const visited = new Set<string>(),
    order: PiperStep[] = [];
  function visit(id: string, stack: string[]) {
    if (visited.has(id)) return;
    const s = byId.get(id);
    if (!s) throw new Error(`unknown step ${id}`);
    stack.push(id);
    for (const d of s.deps) {
      if (stack.includes(d))
        throw new Error(`cycle: ${stack.join(" -> ")} -> ${d}`);
      visit(d, stack.slice());
    }
    visited.add(id);
    order.push(s);
  }
  for (const s of steps) visit(s.id, []);
  return order;
}
