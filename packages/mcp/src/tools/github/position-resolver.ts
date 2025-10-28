import { z } from "zod";
import type { ReadonlyDeep } from "type-fest";

export type DiffSide = "LEFT" | "RIGHT";

export type DiffLine = Readonly<{
  readonly type: "context" | "add" | "del";
  readonly text: string;
  readonly position: number;
  readonly oldLine: number | null;
  readonly newLine: number | null;
}>;

export type Hunk = Readonly<{
  readonly oldStart: number;
  readonly oldLines: number;
  readonly newStart: number;
  readonly newLines: number;
  readonly lines: readonly DiffLine[];
}>;

type HunkHeader = Readonly<{
  readonly oldStart: number;
  readonly oldLines: number;
  readonly newStart: number;
  readonly newLines: number;
}>;

type HunkBuilder = Readonly<{
  readonly header: HunkHeader;
  readonly lines: readonly DiffLine[];
  readonly oldCursor: number;
  readonly newCursor: number;
}>;

type ParserState = Readonly<{
  readonly hunks: readonly Hunk[];
  readonly builder?: HunkBuilder;
  readonly position: number;
}>;

const HEADER_REGEX =
  /^@@ -(?<oldStart>\d+)(?:,(?<oldLines>\d+))? \+(?<newStart>\d+)(?:,(?<newLines>\d+))? @@/;

const sanitizeLine = (line: string): string => line.replace(/\r$/, "");

const toHeader = (line: string): HunkHeader | undefined => {
  const match = sanitizeLine(line).match(HEADER_REGEX);
  if (!match?.groups) {
    return undefined;
  }
  const { oldStart, oldLines, newStart, newLines } = match.groups;
  return {
    oldStart: Number(oldStart),
    oldLines: Number(oldLines ?? "1"),
    newStart: Number(newStart),
    newLines: Number(newLines ?? "1"),
  };
};

const startBuilder = (header: HunkHeader): HunkBuilder => ({
  header,
  lines: [] as readonly DiffLine[],
  oldCursor: header.oldStart,
  newCursor: header.newStart,
});

const finalizeBuilder = (builder: HunkBuilder): Hunk => ({
  oldStart: builder.header.oldStart,
  oldLines: builder.header.oldLines,
  newStart: builder.header.newStart,
  newLines: builder.header.newLines,
  lines: builder.lines,
});

const isDiffLine = (line: string): boolean =>
  line.startsWith(" ") || line.startsWith("+") || line.startsWith("-");

const applyContextLine = (
  builder: HunkBuilder,
  text: string,
  position: number,
): HunkBuilder => ({
  header: builder.header,
  lines: builder.lines.concat({
    type: "context",
    text,
    position,
    oldLine: builder.oldCursor,
    newLine: builder.newCursor,
  }),
  oldCursor: builder.oldCursor + 1,
  newCursor: builder.newCursor + 1,
});

const applyAdditionLine = (
  builder: HunkBuilder,
  text: string,
  position: number,
): HunkBuilder => ({
  header: builder.header,
  lines: builder.lines.concat({
    type: "add",
    text,
    position,
    oldLine: null,
    newLine: builder.newCursor,
  }),
  oldCursor: builder.oldCursor,
  newCursor: builder.newCursor + 1,
});

const applyDeletionLine = (
  builder: HunkBuilder,
  text: string,
  position: number,
): HunkBuilder => ({
  header: builder.header,
  lines: builder.lines.concat({
    type: "del",
    text,
    position,
    oldLine: builder.oldCursor,
    newLine: null,
  }),
  oldCursor: builder.oldCursor + 1,
  newCursor: builder.newCursor,
});

const transitionBuilder = (
  builder: HunkBuilder,
  line: string,
  position: number,
): HunkBuilder => {
  const marker = line[0];
  if (marker === " ") {
    return applyContextLine(builder, line, position);
  }
  if (marker === "+") {
    return applyAdditionLine(builder, line, position);
  }
  if (marker === "-") {
    return applyDeletionLine(builder, line, position);
  }
  return builder;
};

const completeHunks = (state: ParserState): readonly Hunk[] =>
  state.builder
    ? state.hunks.concat(finalizeBuilder(state.builder))
    : state.hunks;

const reduceLine = (state: ParserState, rawLine: string): ParserState => {
  const header = toHeader(rawLine);
  if (header) {
    const nextHunks = state.builder
      ? state.hunks.concat(finalizeBuilder(state.builder))
      : state.hunks;
    return {
      hunks: nextHunks,
      builder: startBuilder(header),
      position: state.position,
    };
  }
  if (!state.builder) {
    return state;
  }
  const normalized = sanitizeLine(rawLine);
  if (!isDiffLine(normalized)) {
    return state;
  }
  const nextPosition = state.position + 1;
  return {
    hunks: state.hunks,
    builder: transitionBuilder(state.builder, normalized, nextPosition),
    position: nextPosition,
  };
};

export const parseUnifiedPatch = (patch: string): readonly Hunk[] => {
  if (!patch.trim()) {
    return [] as readonly Hunk[];
  }
  const normalized = patch.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const initialState: ParserState = {
    hunks: [] as readonly Hunk[],
    position: 0,
  };
  const state = lines.reduce(reduceLine, initialState);
  return completeHunks(state);
};

export type ResolveNewLineOptions = Readonly<{
  readonly hunks: readonly Hunk[];
  readonly targetLine: number;
  readonly rangeStart?: number;
}>;

export type ResolvedPosition = Readonly<{
  readonly line: number;
  readonly side: DiffSide;
  readonly position: number;
  readonly startLine?: number;
  readonly startSide?: DiffSide;
}>;

const collectCandidateLines = (hunks: readonly Hunk[]): readonly DiffLine[] =>
  hunks.flatMap((hunk) =>
    hunk.lines.filter((line) => line.newLine !== null && line.type !== "del"),
  );

const nearestLines = (
  candidates: readonly DiffLine[],
  target: number,
): readonly number[] =>
  candidates
    .map((line) => line.newLine ?? target)
    .filter((line) => Math.abs(line - target) <= 5)
    .sort((a, b) => a - b);

export type ResolutionError = Readonly<{
  readonly reason:
    | "LINE_OUTDATED_OR_NOT_IN_DIFF"
    | "RANGE_START_NOT_IN_DIFF"
    | "INVALID_RANGE";
  readonly nearest?: readonly number[];
}>;

export const resolveNewLinePosition = (
  options: ResolveNewLineOptions,
): ResolvedPosition | ResolutionError => {
  const { hunks, targetLine, rangeStart } = options;
  if (rangeStart !== undefined && rangeStart > targetLine) {
    return { reason: "INVALID_RANGE" };
  }
  const candidates = collectCandidateLines(hunks);
  const match = candidates.find((line) => line.newLine === targetLine);
  if (!match) {
    return {
      reason: "LINE_OUTDATED_OR_NOT_IN_DIFF",
      nearest: nearestLines(candidates, targetLine),
    };
  }
  if (rangeStart === undefined) {
    return {
      line: match.newLine ?? targetLine,
      side: "RIGHT",
      position: match.position,
    };
  }
  const start = candidates.find((line) => line.newLine === rangeStart);
  if (!start) {
    return { reason: "RANGE_START_NOT_IN_DIFF" };
  }
  return {
    line: match.newLine ?? targetLine,
    side: "RIGHT",
    position: match.position,
    startLine: start.newLine ?? rangeStart,
    startSide: "RIGHT",
  };
};

export const ResolvePositionResultSchema = z.object({
  ok: z.literal(true),
  graphql: z
    .object({
      path: z.string(),
      line: z.number().int().positive(),
      side: z.literal("RIGHT"),
      startLine: z.number().int().positive().optional(),
      startSide: z.literal("RIGHT").optional(),
    })
    .optional(),
  rest: z
    .object({
      path: z.string(),
      position: z.number().int().positive(),
    })
    .optional(),
});

export const ResolvePositionErrorSchema = z.object({
  ok: z.literal(false),
  reason: z.enum([
    "PATCH_NOT_FOUND_OR_BINARY",
    "LINE_OUTDATED_OR_NOT_IN_DIFF",
    "RANGE_START_NOT_IN_DIFF",
    "INVALID_RANGE",
  ]),
  hint: z.string().optional(),
  nearest: z.array(z.number().int()).optional(),
});

export type ResolvePositionResult = ReadonlyDeep<
  z.infer<typeof ResolvePositionResultSchema>
>;
export type ResolvePositionError = ReadonlyDeep<
  z.infer<typeof ResolvePositionErrorSchema>
>;
