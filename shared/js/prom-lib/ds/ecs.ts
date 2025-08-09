export interface ComponentType<T = any> {
  id: number;
}

export interface World {
  makeQuery(spec: any): any;
  iter(query: any): Iterable<[number]>;
  get(eid: number, type: ComponentType<any>): any;
  set(eid: number, type: ComponentType<any>, value: any): void;
  isAlive(eid: number): boolean;
}
