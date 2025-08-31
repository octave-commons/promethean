export type Span = { start: number; end: number; line: number; col: number };
export type Sym = { t: 'sym'; name: string; gensym?: string; span?: Span };
export type Num = { t: 'num'; v: number; span?: Span };
export type Str = { t: 'str'; v: string; span?: Span };
export type Bool = { t: 'bool'; v: boolean; span?: Span };
export type Nil = { t: 'nil'; span?: Span };
export type List = { t: 'list'; xs: S[]; span?: Span };

export type S = Sym | Num | Str | Bool | Nil | List;

export const nil: Nil = { t: 'nil' };
export const sym = (name: string, span?: Span): Sym => ({
    t: 'sym',
    name,
    span,
});
export const list = (xs: S[], span?: Span): List => ({ t: 'list', xs, span });
export const num = (v: number, span?: Span): Num => ({ t: 'num', v, span });
export const str = (v: string, span?: Span): Str => ({ t: 'str', v, span });
export const bool = (v: boolean, span?: Span): Bool => ({ t: 'bool', v, span });

let _gid = 0;
export function gensym(prefix = 'g'): Sym {
    return { t: 'sym', name: `${prefix}`, gensym: `${prefix}$${_gid++}` };
}
export function symName(x: Sym): string {
    return x.gensym ?? x.name;
}
export const isSym = (x: S, n?: string) => x.t === 'sym' && (n ? (x as Sym).name === n : true);
export const isList = (x: S, n?: string) =>
    x.t === 'list' && (n ? (x as List).xs[0]?.t === 'sym' && ((x as List).xs[0] as Sym).name === n : true);
