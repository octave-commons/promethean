import { z } from 'zod';
import type { ToolFactory } from '../../core/types.js';
export declare const inputSchema: z.ZodObject<{
    readonly owner: z.ZodString;
    readonly repo: z.ZodString;
    readonly branch: z.ZodString;
    readonly message: z.ZodString;
    readonly diff: z.ZodString;
    readonly expectedHeadOid: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    diff: string;
    owner: string;
    repo: string;
    branch: string;
    expectedHeadOid?: string | undefined;
}, {
    message: string;
    diff: string;
    owner: string;
    repo: string;
    branch: string;
    expectedHeadOid?: string | undefined;
}>;
export declare const githubApplyPatchTool: ToolFactory;
//# sourceMappingURL=apply-patch.d.ts.map