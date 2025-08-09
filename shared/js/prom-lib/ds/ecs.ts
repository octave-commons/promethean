export type ComponentType<T = any> = {
  id: number;
  name?: string;
  defaults?: () => T;
};

export class World {
  comps: ComponentType<any>[] = [];
  private nextEntityId = 1;
  private entities = new Map<number, Record<number, any>>();

  defineComponent<T>(spec: {
    name?: string;
    defaults?: () => T;
  }): ComponentType<T> {
    const id = this.comps.length;
    const comp: ComponentType<T> = { id, ...spec };
    this.comps.push(comp);
    return comp;
  }

  addEntity(): number {
    const id = this.nextEntityId++;
    this.entities.set(id, {});
    return id;
  }

  set<T>(eid: number, comp: ComponentType<T>, value: T) {
    const e = this.entities.get(eid);
    if (e) e[comp.id] = value;
  }

  addComponent<T>(eid: number, comp: ComponentType<T>, value?: T) {
    const e = this.entities.get(eid);
    if (e) e[comp.id] = value ?? comp.defaults?.();
  }

  removeComponent(eid: number, comp: ComponentType<any>) {
    const e = this.entities.get(eid);
    if (e) delete e[comp.id];
  }

  destroyEntity(eid: number) {
    this.entities.delete(eid);
  }

  get<T>(eid: number, comp: ComponentType<T>): T | undefined {
    return this.entities.get(eid)?.[comp.id];
  }

  makeQuery(spec: any) {
    return spec;
  }

  *iter(q: any, ...comps: ComponentType<any>[]): IterableIterator<any[]> {
    for (const [eid, data] of this.entities) {
      let ok = true;
      for (const c of q?.all ?? []) {
        if (!(c.id in data)) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      const row: any[] = [eid];
      for (const c of comps) row.push(data[c.id]);
      yield row;
    }
  }

  beginTick() {
    return { flush() {} };
  }

  endTick() {}
}
