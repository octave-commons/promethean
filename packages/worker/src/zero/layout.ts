export type Scalar = 'f32' | 'f64' | 'i32' | 'u32' | 'i16' | 'u16' | 'i8' | 'u8';
export type FieldSpec = { [fieldName: string]: Scalar };
export type CompLayout = { cid: number; fields: FieldSpec };

const T = {
    f32: Float32Array,
    f64: Float64Array,
    i32: Int32Array,
    u32: Uint32Array,
    i16: Int16Array,
    u16: Uint16Array,
    i8: Int8Array,
    u8: Uint8Array,
} as const;

export type Columns = Record<
    string,
    Float32Array | Float64Array | Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array
>;
export type CompColumns = { fields: Columns; changed: Uint8Array };

export type Snap = {
    shared: boolean;
    rows: number;
    eids: Int32Array;
    comps: Record<number, CompColumns>;
};

export function canUseSAB(): boolean {
    // Node always has SAB; browsers require crossOriginIsolated
    if (typeof process !== 'undefined' && (process as any).versions?.node) {
        return typeof SharedArrayBuffer !== 'undefined';
    }
    return typeof SharedArrayBuffer !== 'undefined' && (globalThis as any).crossOriginIsolated === true;
}

export function allocColumns(rows: number, layout: CompLayout, shared: boolean): CompColumns {
    const fields: Columns = {};
    for (const [k, ty] of Object.entries(layout.fields)) {
        const Ctor = T[ty];
        const buf = shared
            ? new SharedArrayBuffer(Ctor.BYTES_PER_ELEMENT * rows)
            : new ArrayBuffer(Ctor.BYTES_PER_ELEMENT * rows);
        fields[k] = new Ctor(buf);
    }
    const chBuf = shared ? new SharedArrayBuffer(Math.ceil(rows / 8)) : new ArrayBuffer(Math.ceil(rows / 8));
    const changed = new Uint8Array(chBuf);
    return { fields, changed };
}

export function markChanged(bitset: Uint8Array, i: number) {
    const byteIndex = i >> 3;
    if (byteIndex >= bitset.length) {
        return;
    }
    const currentValue = bitset[byteIndex];
    if (currentValue !== undefined) {
        bitset[byteIndex] = currentValue | (1 << (i & 7));
    }
}

export function isChanged(bitset: Uint8Array, i: number) {
    const byteIndex = i >> 3;
    if (byteIndex >= bitset.length) {
        return false;
    }
    const currentValue = bitset[byteIndex];
    if (currentValue === undefined) {
        return false;
    }
    return (currentValue & (1 << (i & 7))) !== 0;
}
