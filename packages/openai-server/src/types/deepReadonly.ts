type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends (...args: readonly unknown[]) => unknown
    ? T
    : T extends Promise<infer U>
      ? Promise<DeepReadonly<U>>
      : T extends readonly (infer V)[]
        ? ReadonlyArray<DeepReadonly<V>>
        : T extends object
          ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
          : T;
