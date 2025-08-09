export type Patch =
  | { kind: "set"; eid: number; cid: number; value: any }
  | { kind: "destroy"; eid: number }
  | { kind: "add"; eid: number; cid: number; value?: any }
  | { kind: "remove"; eid: number; cid: number };

export function applyPatches(world: any, patches: Patch[]) {
  for (const p of patches) {
    if (p.kind === "set") world.set(p.eid, world["comps"][p.cid]!, p.value);
    else if (p.kind === "destroy") world.destroyEntity(p.eid);
    else if (p.kind === "add")
      world.addComponent(p.eid, world["comps"][p.cid]!, p.value);
    else if (p.kind === "remove")
      world.removeComponent(p.eid, world["comps"][p.cid]!);
  }
}
