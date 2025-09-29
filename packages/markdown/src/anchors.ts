import * as path from 'node:path';

export type AnchorTarget = {
    readonly line: number;
    readonly id: string;
};

const FENCE_RE = /^(\s*)(`{3,}|~{3,})(.*)$/;

type FenceState = {
    readonly inside: boolean[];
    readonly inFence: boolean;
    readonly fenceChar: '`' | '~' | null;
    readonly fenceLen: number;
};

const initialFenceState: FenceState = {
    inside: [],
    inFence: false,
    fenceChar: null,
    fenceLen: 0,
};

const fenceStateReducer = (state: FenceState, line: string): FenceState => {
    const rawLine = line ?? '';
    const match = rawLine.match(FENCE_RE);
    if (!state.inFence) {
        if (!match) {
            return {
                ...state,
                inside: state.inside.concat(false),
            };
        }
        const marker = match[2] ?? '';
        const char = (marker[0] as '`' | '~') ?? '`';
        return {
            inside: state.inside.concat(true),
            inFence: true,
            fenceChar: char,
            fenceLen: marker.length,
        };
    }

    const marker = match?.[2] ?? '';
    const closing =
        !!match &&
        !!state.fenceChar &&
        (marker[0] as '`' | '~' | undefined) === state.fenceChar &&
        marker.length >= state.fenceLen;

    return {
        inside: state.inside.concat(true),
        inFence: closing ? false : state.inFence,
        fenceChar: closing ? null : state.fenceChar,
        fenceLen: closing ? 0 : state.fenceLen,
    };
};

export const anchorId = (docUuid: string, line: number, col: number): string =>
    `ref-${(docUuid ?? 'nouuid').slice(0, 8)}-${line}-${col}`;

export const relMdLink = (fromFileAbs: string, toFileAbs: string, anchor?: string): string => {
    const relative = path.relative(path.dirname(fromFileAbs), toFileAbs).replace(/\\/g, '/');
    return anchor ? `${relative}#${anchor}` : relative;
};

export const computeFenceMap = (lines: readonly string[]): boolean[] =>
    lines.reduce(fenceStateReducer, initialFenceState).inside;

export const injectAnchors = (content: string, want: ReadonlyArray<AnchorTarget>): string => {
    if (!want.length) return content;
    const lines = [...content.split('\n')];
    const inside = computeFenceMap(lines);
    const uniq = want.reduce((acc, anchor) => {
        acc.set(`${anchor.line}:${anchor.id}`, anchor);
        return acc;
    }, new Map<string, AnchorTarget>());
    // Process from bottom to top to avoid index drift while inserting
    const anchors = Array.from(uniq.values()).sort((a, b) => b.line - a.line);

    const hasIdOnOrNext = (idx: number, id: string) => {
        const cur = lines[idx] ?? '';
        const next = (lines[idx + 1] ?? '').trim();
        // exact next-line marker or end-of-line inline marker
        return cur.trim() === `^${id}` || cur.trimEnd().endsWith(` ^${id}`) || next === `^${id}`;
    };

    const nextOutsideIdx = (idx: number) => {
        let i = Math.min(idx, Math.max(lines.length - 1, 0));
        while (i < lines.length && inside[i]) i++;
        return i;
    };

    const anchorExistsOutside = (id: string): boolean =>
        lines.some((line, idx) => {
            if (inside[idx]) return false;
            const trimmed = line.trim();
            if (trimmed === `^${id}`) return true;
            return trimmed.endsWith(` ^${id}`);
        });

    for (const { line, id } of anchors) {
        if (anchorExistsOutside(id)) continue;
        const idx = Math.max(1, Math.min(line, lines.length)) - 1;
        if (hasIdOnOrNext(idx, id)) continue;
        if (inside[idx]) {
            const j = nextOutsideIdx(idx + 1);
            if (j >= lines.length) {
                lines.push(`^${id}`);
            } else if (!hasIdOnOrNext(j, id)) {
                lines.splice(j, 0, `^${id}`);
            }
        } else {
            lines[idx] = (lines[idx] ?? '').replace(/\s*$/, ` ^${id}`);
        }
    }

    return lines.join('\n');
};
