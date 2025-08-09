// Typed struct compiler for zero-copy binary layouts.
// Generated from notes in docs/notes/js/typed-struct-compiler.md

export type LittleEndian = boolean;

// Base schema type carrying compile-time information through `_type`.
interface BaseSchema<T> {
  _type?: T;
}

export interface ScalarSchema<T> extends BaseSchema<T> {
  kind: "scalar";
  name: string;
  size: number;
  align: number;
  read(view: DataView, offset: number, le: LittleEndian): T;
  write(view: DataView, offset: number, value: T, le: LittleEndian): void;
}

export interface ArraySchema<T> extends BaseSchema<T[]> {
  kind: "array";
  length: number;
  element: Schema<T>;
}

export interface StructSchema<T> extends BaseSchema<T> {
  kind: "struct";
  fields: { [K in keyof T]: Schema<T[K]> };
}

export type Schema<T> = ScalarSchema<T> | ArraySchema<any> | StructSchema<any>;

interface Compiled<T> {
  size: number;
  align: number;
  read(view: DataView, offset: number): T;
  write(view: DataView, offset: number, value: T): void;
  flatten(prefix: string[], offset: number, out: Column[]): void;
}

export interface Column {
  path: string;
  offset: number;
  type: string;
}

function alignTo(n: number, align: number): number {
  return (n + align - 1) & ~(align - 1);
}

function scalar<T>(
  name: string,
  size: number,
  align: number,
  reader: (view: DataView, offset: number, le: LittleEndian) => T,
  writer: (view: DataView, offset: number, value: T, le: LittleEndian) => void,
): ScalarSchema<T> {
  return { kind: "scalar", name, size, align, read: reader, write: writer };
}

export const S = {
  f32: () =>
    scalar(
      "f32",
      4,
      4,
      (v, o, le) => v.getFloat32(o, le),
      (v, o, val, le) => v.setFloat32(o, val, le),
    ),
  f64: () =>
    scalar(
      "f64",
      8,
      8,
      (v, o, le) => v.getFloat64(o, le),
      (v, o, val, le) => v.setFloat64(o, val, le),
    ),
  i8: () =>
    scalar(
      "i8",
      1,
      1,
      (v, o) => v.getInt8(o),
      (v, o, val) => v.setInt8(o, val),
    ),
  u8: () =>
    scalar(
      "u8",
      1,
      1,
      (v, o) => v.getUint8(o),
      (v, o, val) => v.setUint8(o, val),
    ),
  i16: () =>
    scalar(
      "i16",
      2,
      2,
      (v, o, le) => v.getInt16(o, le),
      (v, o, val, le) => v.setInt16(o, val, le),
    ),
  u16: () =>
    scalar(
      "u16",
      2,
      2,
      (v, o, le) => v.getUint16(o, le),
      (v, o, val, le) => v.setUint16(o, val, le),
    ),
  i32: () =>
    scalar(
      "i32",
      4,
      4,
      (v, o, le) => v.getInt32(o, le),
      (v, o, val, le) => v.setInt32(o, val, le),
    ),
  u32: () =>
    scalar(
      "u32",
      4,
      4,
      (v, o, le) => v.getUint32(o, le),
      (v, o, val, le) => v.setUint32(o, val, le),
    ),
  bool: () =>
    scalar(
      "bool",
      1,
      1,
      (v, o) => v.getUint8(o) !== 0,
      (v, o, val) => v.setUint8(o, val ? 1 : 0),
    ),
  array: <T>(length: number, element: Schema<T>): ArraySchema<T> => ({
    kind: "array",
    length,
    element,
  }),
  struct: <T>(fields: { [K in keyof T]: Schema<T[K]> }): StructSchema<T> => ({
    kind: "struct",
    fields,
  }),
};

export type Infer<S extends BaseSchema<any>> = S extends BaseSchema<infer T>
  ? T
  : never;

export function compileStruct<T>(
  schema: StructSchema<T>,
  littleEndian: LittleEndian = true,
) {
  const le = littleEndian;

  function compile<U>(s: Schema<U>): Compiled<U> {
    if (s.kind === "scalar") {
      return {
        size: s.size,
        align: s.align,
        read(view, offset) {
          return s.read(view, offset, le);
        },
        write(view, offset, value) {
          s.write(view, offset, value, le);
        },
        flatten(prefix, offset, out) {
          out.push({ path: prefix.join("."), offset, type: s.name });
        },
      };
    }
    if (s.kind === "array") {
      const compiledEl = compile(s.element);
      const step = alignTo(compiledEl.size, compiledEl.align);
      return {
        size: step * s.length,
        align: compiledEl.align,
        read(view, offset) {
          const arr = [] as U[];
          for (let i = 0; i < s.length; i++) {
            arr.push(compiledEl.read(view, offset + i * step));
          }
          return arr as U;
        },
        write(view, offset, value) {
          const arr = value as unknown as any[];
          for (let i = 0; i < s.length; i++) {
            compiledEl.write(view, offset + i * step, arr[i]);
          }
        },
        flatten(prefix, offset, out) {
          for (let i = 0; i < s.length; i++) {
            compiledEl.flatten(
              prefix.concat(String(i)),
              offset + i * step,
              out,
            );
          }
        },
      };
    }
    // struct
    const entries = Object.entries(s.fields) as [string, Schema<any>][];
    let off = 0;
    let maxAlign = 1;
    const compiledFields: { name: string; off: number; c: Compiled<any> }[] =
      [];
    for (const [name, sch] of entries) {
      const c = compile(sch);
      off = alignTo(off, c.align);
      compiledFields.push({ name, off, c });
      off += c.size;
      if (c.align > maxAlign) maxAlign = c.align;
    }
    const size = alignTo(off, maxAlign);
    return {
      size,
      align: maxAlign,
      read(view, offset) {
        const obj: any = {};
        for (const f of compiledFields) {
          obj[f.name] = f.c.read(view, offset + f.off);
        }
        return obj;
      },
      write(view, offset, value) {
        for (const f of compiledFields) {
          f.c.write(view, offset + f.off, (value as any)[f.name]);
        }
      },
      flatten(prefix, offset, out) {
        for (const f of compiledFields) {
          f.c.flatten(prefix.concat(f.name), offset + f.off, out);
        }
      },
    };
  }

  const root = compile(schema);
  return {
    size: root.size,
    read(view: DataView, offset = 0) {
      return root.read(view, offset);
    },
    write(view: DataView, value: T, offset = 0) {
      root.write(view, offset, value);
    },
    flattenColumns() {
      const out: Column[] = [];
      root.flatten([], 0, out);
      return out;
    },
  };
}
