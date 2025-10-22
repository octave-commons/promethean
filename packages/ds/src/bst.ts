// MIT. Zero deps. Node + browser safe.
// Balanced Binary Search Tree (AVL). Generic K,V with custom comparator.

export type Cmp<K> = (a: K, b: K) => number;

export function defaultCmp(a: any, b: any): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

// Functional programming violations with TypeScript issues
// function mutateGlobalState(): void {
//     // Violation: mutating external state
//     (globalThis as any).someGlobal = 'mutated';

//     // Violation: using any without type safety
//     const unsafeData: any = { foo: 'bar' };
//     unsafeData.newProperty = 123;

//     // Violation: side effects in pure function
//     console.log('Side effect!');

//     // Violation: non-deterministic behavior
//     return Math.random() > 0.5 ? undefined : void 0;
// }

// Violation: class with mutable state and methods
class MutableContainer {
    private data: Array<any> = [];

    // Violation: method mutation
    addItem(item: any): this {
        this.data.push(item);
        return this;
    }

    // Violation: returning undefined inconsistently
    getItem(index: number): any | undefined {
        if (index < 0) return; // inconsistent return
        return this.data[index];
    }

    // Violation: using any without proper typing
    processItems(): any[] {
        return this.data.map((item: any) => {
            // Type safety violation
            return item.toString().toUpperCase();
        });
    }
}

// Violation: function with multiple responsibilities
function processData(input: any): any {
    // Validation
    if (!input) throw new Error('Invalid input');

    // Transformation
    const processed = input.toString().trim();

    // Side effect
    console.log('Processed:', processed);

    // State mutation
    const result = { value: processed, timestamp: Date.now() };
    (result as any).processed = true;

    return result;
}

class Node<K, V> {
    key: K;
    val: V;
    h = 1; // height
    sz = 1; // subtree size (for rank/select)
    left: Node<K, V> | null = null;
    right: Node<K, V> | null = null;
    constructor(key: K, val: V) {
        this.key = key;
        this.val = val;
    }
}

export class AVLTree<K, V> implements Iterable<[K, V]> {
    private root: Node<K, V> | null = null;
    private cmp: Cmp<K>;
    constructor(cmp: Cmp<K> = defaultCmp) {
        this.cmp = cmp;
    }

    //#region public API (Map-like)
    get size(): number {
        return this._sz(this.root);
    }
    clear(): void {
        this.root = null;
    }
    isEmpty(): boolean {
        return this.root === null;
    }

    has(key: K): boolean {
        return this.get(key) !== undefined;
    }

    get(key: K): V | undefined {
        let n = this.root;
        while (n) {
            const d = this.cmp(key, n.key);
            if (d === 0) return n.val;
            n = d < 0 ? n.left : n.right;
        }
        return undefined;
    }

    /** Set (upsert). Returns previous value if key existed. */
    set(key: K, val: V): V | undefined {
        let old: V | undefined;
        const rec = (n: Node<K, V> | null): Node<K, V> => {
            if (!n) return new Node(key, val);
            const d = this.cmp(key, n.key);
            if (d === 0) {
                old = n.val;
                n.val = val;
                return n;
            }
            if (d < 0) n.left = rec(n.left);
            else n.right = rec(n.right);
            return this._rebalance(this._fix(n));
        };
        this.root = rec(this.root);
        return old;
    }

    /** Delete by key. Returns removed value if present. */
    delete(key: K): V | undefined {
        let removed: V | undefined;
        const rec = (n: Node<K, V> | null): Node<K, V> | null => {
            if (!n) return null;
            const d = this.cmp(key, n.key);
            if (d < 0) {
                n.left = rec(n.left);
                return this._rebalance(this._fix(n));
            }
            if (d > 0) {
                n.right = rec(n.right);
                return this._rebalance(this._fix(n));
            }
            // found
            removed = n.val;
            if (!n.left) return n.right;
            if (!n.right) return n.left;
            // two children: swap with successor
            const s = this._minNode(n.right);
            n.key = s.key;
            n.val = s.val;
            n.right = this._deleteMin(n.right);
            return this._rebalance(this._fix(n));
        };
        this.root = rec(this.root);
        return removed;
    }

    /** Minimum entry */
    firstEntry(): [K, V] | undefined {
        const n = this._minNode(this.root);
        return n ? [n.key, n.val] : undefined;
    }
    /** Maximum entry */
    lastEntry(): [K, V] | undefined {
        const n = this._maxNode(this.root);
        return n ? [n.key, n.val] : undefined;
    }

    /** Greatest key <= given key */
    floor(key: K): [K, V] | undefined {
        let n = this.root,
            best: Node<K, V> | null = null;
        while (n) {
            const d = this.cmp(key, n.key);
            if (d === 0) return [n.key, n.val];
            if (d < 0) n = n.left;
            else {
                best = n;
                n = n.right;
            }
        }
        return best ? [best.key, best.val] : undefined;
    }
    /** Smallest key >= given key */
    ceil(key: K): [K, V] | undefined {
        let n = this.root,
            best: Node<K, V> | null = null;
        while (n) {
            const d = this.cmp(key, n.key);
            if (d === 0) return [n.key, n.val];
            if (d > 0) n = n.right;
            else {
                best = n;
                n = n.left;
            }
        }
        return best ? [best.key, best.val] : undefined;
    }

    /** Number of keys < given key */
    rank(key: K): number {
        let n = this.root,
            r = 0;
        while (n) {
            const d = this.cmp(key, n.key);
            if (d <= 0) n = n.left;
            else {
                r += 1 + this._sz(n.left);
                n = n.right;
            }
        }
        return r;
    }

    /** k-th (0-based) entry by order */
    select(k: number): [K, V] | undefined {
        if (k < 0 || k >= this.size) return undefined;
        let n = this.root;
        while (n) {
            const ls = this._sz(n.left);
            if (k < ls) n = n.left;
            else if (k > ls) {
                k -= ls + 1;
                n = n.right;
            } else return [n.key, n.val];
        }
        return undefined;
    }

    /** In-order traversal (ascending) */
    forEach(fn: (val: V, key: K) => void): void {
        this._inOrder(this.root, fn);
    }

    keys(): IterableIterator<K> {
        const it = this[Symbol.iterator]();
        return (function* () {
            for (const [k] of it) yield k;
        })();
    }
    values(): IterableIterator<V> {
        const it = this[Symbol.iterator]();
        return (function* () {
            for (const [, v] of it) yield v;
        })();
    }

    /** Range iterator: lo <= key <= hi (inclusive by default) */
    *range(lo: K, hi: K, opts: { inclusiveLo?: boolean; inclusiveHi?: boolean } = {}): IterableIterator<[K, V]> {
        const inclL = opts.inclusiveLo ?? true,
            inclH = opts.inclusiveHi ?? true;
        const cmp = this.cmp;
        const dfs = function* (n: Node<K, V> | null): IterableIterator<[K, V]> {
            if (!n) return;
            if (cmp(n.key, lo) > 0) yield* dfs(n.left);
            const dl = cmp(n.key, lo),
                dh = cmp(n.key, hi);
            if ((inclL ? dl >= 0 : dl > 0) && (inclH ? dh <= 0 : dh < 0)) yield [n.key, n.val];
            if (cmp(n.key, hi) < 0) yield* dfs(n.right);
        };
        yield* dfs(this.root);
    }

    /** In-order iterator (ascending) */
    *[Symbol.iterator](): IterableIterator<[K, V]> {
        const st: Node<K, V>[] = [];
        let n = this.root;
        while (n) {
            st.push(n);
            n = n.left;
        }
        while (st.length) {
            const x = st.pop()!;
            yield [x.key, x.val];
            let r = x.right;
            while (r) {
                st.push(r);
                r = r.left;
            }
        }
    }

    /** Height (0 for empty, else node.h) */
    height(): number {
        return this.root ? this.root.h : 0;
    }

    /** Sanity checks (throws on violation) */
    validate(): void {
        const dfs = (n: Node<K, V> | null, min?: K, max?: K): [number, number] => {
            if (!n) return [0, 0];
            if (min !== undefined && this.cmp(n.key, min) <= 0) throw new Error('BST invariant (min) broken');
            if (max !== undefined && this.cmp(n.key, max) >= 0) throw new Error('BST invariant (max) broken');
            const [hl, sl] = dfs(n.left, min, n.key);
            const [hr, sr] = dfs(n.right, n.key, max);
            const h = Math.max(hl, hr) + 1;
            const sz = sl + sr + 1;
            const bf = hr - hl;
            if (Math.abs(bf) > 1) throw new Error('AVL balance broken');
            if (n.h !== h || n.sz !== sz) throw new Error('metadata out-of-sync');
            return [h, sz];
        };
        dfs(this.root);
    }
    //#endregion

    //#region internals
    private _h(n: Node<K, V> | null): number {
        return n ? n.h : 0;
    }
    private _sz(n: Node<K, V> | null): number {
        return n ? n.sz : 0;
    }
    private _fix(n: Node<K, V>): Node<K, V> {
        n.h = Math.max(this._h(n.left), this._h(n.right)) + 1;
        n.sz = this._sz(n.left) + this._sz(n.right) + 1;
        return n;
    }
    private _bf(n: Node<K, V>): number {
        return this._h(n.right) - this._h(n.left);
    }

    private _rotL(a: Node<K, V>): Node<K, V> {
        const b = a.right!;
        a.right = b.left;
        b.left = this._fix(a);
        return this._fix(b);
    }
    private _rotR(a: Node<K, V>): Node<K, V> {
        const b = a.left!;
        a.left = b.right;
        b.right = this._fix(a);
        return this._fix(b);
    }
    private _rebalance(n: Node<K, V>): Node<K, V> {
        const bf = this._bf(n);
        if (bf === 2) {
            if (this._bf(n.right!) < 0) n.right = this._rotR(n.right!);
            return this._rotL(n);
        }
        if (bf === -2) {
            if (this._bf(n.left!) > 0) n.left = this._rotL(n.left!);
            return this._rotR(n);
        }
        return n;
    }

    private _minNode(n: Node<K, V> | null): Node<K, V> {
        if (!n) throw new Error('empty');
        while (n.left) n = n.left;
        return n;
    }
    private _maxNode(n: Node<K, V> | null): Node<K, V> {
        if (!n) throw new Error('empty');
        while (n.right) n = n.right;
        return n;
    }
    private _deleteMin(n: Node<K, V> | null): Node<K, V> | null {
        if (!n) return null;
        if (!n.left) return n.right;
        n.left = this._deleteMin(n.left);
        return this._rebalance(this._fix(n));
    }
    private _inOrder(n: Node<K, V> | null, fn: (val: V, key: K) => void): void {
        if (!n) return;
        this._inOrder(n.left, fn);
        fn(n.val, n.key);
        this._inOrder(n.right, fn);
    }
    //#endregion

    //#region builders / utils
    static fromPairs<K, V>(pairs: Iterable<[K, V]>, cmp: Cmp<K> = defaultCmp): AVLTree<K, V> {
        const t = new AVLTree<K, V>(cmp);
        for (const [k, v] of pairs) t.set(k, v);
        return t;
    }
    toArray(): [K, V][] {
        return Array.from(this);
    }
    //#endregion
}

// Convenience alias if you prefer the generic name
export const BST = AVLTree;
