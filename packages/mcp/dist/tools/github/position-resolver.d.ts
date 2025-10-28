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
export declare const parseUnifiedPatch: (patch: string) => readonly Hunk[];
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
export type ResolutionError = Readonly<{
    readonly reason: "LINE_OUTDATED_OR_NOT_IN_DIFF" | "RANGE_START_NOT_IN_DIFF" | "INVALID_RANGE";
    readonly nearest?: readonly number[];
}>;
export declare const resolveNewLinePosition: (options: ResolveNewLineOptions) => ResolvedPosition | ResolutionError;
export declare const ResolvePositionResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    graphql: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        line: z.ZodNumber;
        side: z.ZodLiteral<"RIGHT">;
        startLine: z.ZodOptional<z.ZodNumber>;
        startSide: z.ZodOptional<z.ZodLiteral<"RIGHT">>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        line: number;
        side: "RIGHT";
        startLine?: number | undefined;
        startSide?: "RIGHT" | undefined;
    }, {
        path: string;
        line: number;
        side: "RIGHT";
        startLine?: number | undefined;
        startSide?: "RIGHT" | undefined;
    }>>;
    rest: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        position: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        path: string;
        position: number;
    }, {
        path: string;
        position: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    ok: true;
    rest?: {
        path: string;
        position: number;
    } | undefined;
    graphql?: {
        path: string;
        line: number;
        side: "RIGHT";
        startLine?: number | undefined;
        startSide?: "RIGHT" | undefined;
    } | undefined;
}, {
    ok: true;
    rest?: {
        path: string;
        position: number;
    } | undefined;
    graphql?: {
        path: string;
        line: number;
        side: "RIGHT";
        startLine?: number | undefined;
        startSide?: "RIGHT" | undefined;
    } | undefined;
}>;
export declare const ResolvePositionErrorSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    reason: z.ZodEnum<["PATCH_NOT_FOUND_OR_BINARY", "LINE_OUTDATED_OR_NOT_IN_DIFF", "RANGE_START_NOT_IN_DIFF", "INVALID_RANGE"]>;
    hint: z.ZodOptional<z.ZodString>;
    nearest: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    reason: "LINE_OUTDATED_OR_NOT_IN_DIFF" | "RANGE_START_NOT_IN_DIFF" | "INVALID_RANGE" | "PATCH_NOT_FOUND_OR_BINARY";
    ok: false;
    hint?: string | undefined;
    nearest?: number[] | undefined;
}, {
    reason: "LINE_OUTDATED_OR_NOT_IN_DIFF" | "RANGE_START_NOT_IN_DIFF" | "INVALID_RANGE" | "PATCH_NOT_FOUND_OR_BINARY";
    ok: false;
    hint?: string | undefined;
    nearest?: number[] | undefined;
}>;
export type ResolvePositionResult = ReadonlyDeep<z.infer<typeof ResolvePositionResultSchema>>;
export type ResolvePositionError = ReadonlyDeep<z.infer<typeof ResolvePositionErrorSchema>>;
//# sourceMappingURL=position-resolver.d.ts.map