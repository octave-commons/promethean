---
uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
created_at: 2025.08.08.21.08.99.md
filename: balanced-bst
description: >-
  A generic AVL tree implementation with Map-like API, supporting floor/ceil,
  rank/select, and range iteration in O(log n) time.
tags:
  - avl
  - balanced
  - bst
  - tree
  - map
  - iterable
  - rank
  - select
  - floor
  - ceil
related_to_title:
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - Board Automation Improvements
related_to_uuid:
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
references: []
---
Yup—here’s a tight, generic **balanced BST** (AVL) you can drop in as `shared/js/prom-lib/ds/bst.ts`. It behaves like a `Map` with extras: `floor/ceil`, `rank/select`, range iterators, and O(log n) ops.

```ts
// shared/js/prom-lib/ds/bst.ts
// MIT. Zero deps. Node + browser safe.
// Balanced Binary Search Tree (AVL). Generic K,V with custom comparator.

export type Cmp<K> = (a: K, b: K) => number;

export function defaultCmp(a: any, b: any): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

class Node<K, V> {
  key: K;
  val: V;
  h = 1;     // height
  sz = 1;    // subtree size (for rank/select)
  left: Node<K, V> | null = null;
  right: Node<K, V> | null = null;
  constructor(key: K, val: V) { this.key = key; this.val = val; }
}

export class AVLTree<K, V> implements Iterable<[K, V]> {
  private root: Node<K, V> | null = null;
  private cmp: Cmp<K>;
  constructor(cmp: Cmp<K> = defaultCmp) { this.cmp = cmp; }

  //#region public API (Map-like)
  get size(): number { return this._sz(this.root); }
  clear(): void { this.root = null; }
  isEmpty(): boolean { return this.root === null; }

  has(key: K): boolean { return this.get(key) !== undefined; }

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
    const rec = (n: Node<K,V> | null): Node<K,V> => {
      if (!n) return new Node(key, val);
      const d = this.cmp(key, n.key);
      if (d === 0) { old = n.val; n.val = val; return n; }
      if (d < 0) n.left = rec(n.left); else n.right = rec(n.right);
      return this._rebalance(this._fix(n));
    };
    this.root = rec(this.root);
    return old;
  }

  /** Delete by key. Returns removed value if present. */
  delete(key: K): V | undefined {
    let removed: V | undefined;
    const rec = (n: Node<K,V> | null): Node<K,V> | null => {
      if (!n) return null;
      const d = this.cmp(key, n.key);
      if (d < 0) { n.left = rec(n.left); return this._rebalance(this._fix(n)); }
      if (d > 0) { n.right = rec(n.right); return this._rebalance(this._fix(n)); }
      // found
      removed = n.val;
      if (!n.left) return n.right;
      if (!n.right) return n.left;
      // two children: swap with successor
      const s = this._minNode(n.right);
      n.key = s.key; n.val = s.val;
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
    let n = this.root, best: Node<K,V> | null = null;
    while (n) {
      const d = this.cmp(key, n.key);
      if (d === 0) return [n.key, n.val];
      if (d < 0) n = n.left; else { best = n; n = n.right; }
    }
    return best ? [best.key, best.val] : undefined;
  }
  /** Smallest key >= given key */
  ceil(key: K): [K, V] | undefined {
    let n = this.root, best: Node<K,V> | null = null;
    while (n) {
      const d = this.cmp(key, n.key);
      if (d === 0) return [n.key, n.val];
      if (d > 0) n = n.right; else { best = n; n = n.left; }
    }
    return best ? [best.key, best.val] : undefined;
  }

  /** Number of keys < given key */
  rank(key: K): number {
    let n = this.root, r = 0;
    while (n) {
      const d = this.cmp(key, n.key);
      if (d <= 0) n = n.left;
      else { r += 1 + this._sz(n.left); n = n.right; }
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
      else if (k > ls) { k -= ls + 1; n = n.right; }
      else return [n.key, n.val];
    }
    return undefined;
  }

  /** In-order traversal (ascending) */
  forEach(fn: (val: V, key: K) => void): void { this._inOrder(this.root, fn); }

  keys(): IterableIterator<K> {
    const it = this[Symbol.iterator]();
    return (function*() { for (const [k] of it) yield k; })();
  }
  values(): IterableIterator<V> {
    const it = this[Symbol.iterator]();
    return (function*() { for (const [,v] of it) yield v; })();
  }

  /** Range iterator: lo <= key <= hi (inclusive by default) */
  *range(lo: K, hi: K, opts: { inclusiveLo?: boolean; inclusiveHi?: boolean } = {}): IterableIterator<[K,V]> {
    const inclL = opts.inclusiveLo ?? true, inclH = opts.inclusiveHi ?? true;
    function cmpIn(cmp: Cmp<K>, k: K, lo: K, hi: K) {
      const dl = cmp(k, lo), dh = cmp(k, hi);
      return (inclL ? dl >= 0 : dl > 0) && (inclH ? dh <= 0 : dh < 0);
    }
    const stack: Node<K,V>[] = [];
    let n = this.root;
    while (n) { stack.push(n); n = this.cmp(lo, n.key) <= 0 ? n.left : n.right; }
    while (stack.length) {
      const cur = stack.pop()!;
      if (this.cmp(cur.key, lo) >= 0 && cur.left) {
        let t = cur.left;
        while (t) { stack.push(t); t = t.right; }
      }
      if (cmpIn(this.cmp, cur.key, lo, hi)) yield [cur.key, cur.val];
      if (this.cmp(cur.key, hi) < 0 && cur.right) {
        let t = cur.right;
        while (t) { stack.push(t); t = t.left; }
      }
    }
  }

  /** In-order iterator (ascending) */
  *[Symbol.iterator](): IterableIterator<[K, V]> {
    const st: Node<K,V>[] = [];
    let n = this.root;
    while (n) { st.push(n); n = n.left; }
    while (st.length) {
      const x = st.pop()!;
      yield [x.key, x.val];
      let r = x.right;
      while (r) { st.push(r); r = r.left; }
    }
  }

  /** Height (0 for empty, else node.h) */
  height(): number { return this.root ? this.root.h : 0; }

  /** Sanity checks (throws on violation) */
  validate(): void {
    const dfs = (n: Node<K,V> | null, min?: K, max?: K): [number, number] => {
      if (!n) return [0, 0];
      if (min !== undefined && this.cmp(n.key, min) <= 0) throw new Error("BST invariant (min) broken");
      if (max !== undefined && this.cmp(n.key, max) >= 0) throw new Error("BST invariant (max) broken");
      const [hl, sl] = dfs(n.left, min, n.key);
      const [hr, sr] = dfs(n.right, n.key, max);
      const h = Math.max(hl, hr) + 1;
      const sz = sl + sr + 1;
      const bf = hr - hl;
      if (Math.abs(bf) > 1) throw new Error("AVL balance broken");
      if (n.h !== h || n.sz !== sz) throw new Error("metadata out-of-sync");
      return [h, sz];
    };
    dfs(this.root);
  }
  //#endregion

  //#region internals
  private _h(n: Node<K,V> | null): number { return n ? n.h : 0; }
  private _sz(n: Node<K,V> | null): number { return n ? n.sz : 0; }
  private _fix(n: Node<K,V>): Node<K,V> { n.h = Math.max(this._h(n.left), this._h(n.right)) + 1; n.sz = this._sz(n.left) + this._sz(n.right) + 1; return n; }
  private _bf(n: Node<K,V>): number { return this._h(n.right) - this._h(n.left); }

  private _rotL(a: Node<K,V>): Node<K,V> {
    const b = a.right!; a.right = b.left; b.left = this._fix(a); return this._fix(b);
  }
  private _rotR(a: Node<K,V>): Node<K,V> {
    const b = a.left!; a.left = b.right; b.right = this._fix(a); return this._fix(b);
  }
  private _rebalance(n: Node<K,V>): Node<K,V> {
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

  private _minNode(n: Node<K,V> | null): Node<K,V> {
    if (!n) throw new Error("empty");
    while (n.left) n = n.left;
    return n;
  }
  private _maxNode(n: Node<K,V> | null): Node<K,V> {
    if (!n) throw new Error("empty");
    while (n.right) n = n.right;
    return n;
  }
  private _deleteMin(n: Node<K,V> | null): Node<K,V> | null {
    if (!n) return null;
    if (!n.left) return n.right;
    n.left = this._deleteMin(n.left);
    return this._rebalance(this._fix(n));
  }
  //#endregion

  //#region builders / utils
  static fromPairs<K, V>(pairs: Iterable<[K, V]>, cmp: Cmp<K> = defaultCmp): AVLTree<K, V> {
    const t = new AVLTree<K,V>(cmp);
    for (const [k, v] of pairs) t.set(k, v);
    return t;
  }
  toArray(): [K, V][] { return Array.from(this); }
  //#endregion
}

// Convenience alias if you prefer the generic name
export const BST = AVLTree;
```

## Quick usage

```ts
import { AVLTree } from "./bst";

const t = new AVLTree<number, string>();
t.set(5, "e"); t.set(2, "b"); t.set(8, "h"); t.set(3, "c"); t.set(7, "g");

console.log(t.get(3));                 // "c"
console.log(t.firstEntry());           // [2,"b"]
console.log(t.lastEntry());            // [8,"h"]
console.log(t.floor(6));               // [5,"e"]
console.log(t.ceil(6));                // [7,"g"]
console.log(t.rank(7));                // 3 (there are 3 keys < 7)
console.log(t.select(2));              // [5,"e"]
console.log([...t.range(3,7)]);        // [[3,"c"],[5,"e"],[7,"g"]]
console.log([...t]);                   // in-order entries
t.validate();                          // throws if invariants broken
```

## Notes

* All operations are **O(log n)** (AVL-balanced).
* `rank/select` ride on subtree sizes; great for order-statistics queries.
* Keys must be comparable; pass your own `cmp` for strings, dates, custom IDs, etc.
* If you want **multimap** semantics (duplicate keys), easiest path is to store an array value or make the value a small list.

Want a **persistent/immutable** variant (functional tree), or a **Treap** / **Red-Black** flavor? I can drop those too.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Board Automation Improvements](board-automation-improvements.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
