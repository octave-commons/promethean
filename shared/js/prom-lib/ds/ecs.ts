export interface ComponentType<T = any> {
  id: number;
  name: string;
  defaults?: () => T;
}

export class World {
  comps: ComponentType[] = [];
  private store = new Map<number, Map<number, any>>();
  private nextEid = 1;

  defineComponent<T>(spec: {
    name: string;
    defaults?: () => T;
  }): ComponentType<T> {
    const comp: ComponentType<T> = {
      id: this.comps.length,
      name: spec.name,
      defaults: spec.defaults,
    };
    this.comps.push(comp);
    return comp;
  }

  createEntity(): number {
    const eid = this.nextEid++;
    this.store.set(eid, new Map());
    return eid;
  }

  destroyEntity(eid: number) {
    this.store.delete(eid);
  }

  addComponent<T>(eid: number, comp: ComponentType<T>, value?: T) {
    const e = this.store.get(eid);
    if (!e) return;
    e.set(comp.id, value ?? comp.defaults?.());
  }

  removeComponent<T>(eid: number, comp: ComponentType<T>) {
    const e = this.store.get(eid);
    if (!e) return;
    e.delete(comp.id);
  }

  set<T>(eid: number, comp: ComponentType<T>, value: T) {
    const e = this.store.get(eid);
    if (!e) return;
    e.set(comp.id, value);
  }

  get<T>(eid: number, comp: ComponentType<T>): T | undefined {
    const e = this.store.get(eid);
    return e?.get(comp.id);
  }

  makeQuery(spec: { all: ComponentType<any>[] }) {
    return spec.all.map((c) => c.id);
  }

  *iter(query: number[]) {
    for (const [eid, comps] of this.store.entries()) {
      if (query.every((cid) => comps.has(cid))) yield [eid];
    }
  }

  beginTick() {
    return { flush() {} };
  }

  endTick() {}
}
