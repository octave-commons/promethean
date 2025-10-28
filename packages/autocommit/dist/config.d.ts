import { z } from 'zod';
export declare const ConfigSchema: z.ZodObject<{
    path: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string | undefined>;
    recursive: z.ZodDefault<z.ZodEffects<z.ZodAny, boolean, any>>;
    debounceMs: z.ZodDefault<z.ZodNumber>;
    baseUrl: z.ZodDefault<z.ZodEffects<z.ZodString, string, string>>;
    apiKey: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    model: z.ZodDefault<z.ZodString>;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxDiffBytes: z.ZodDefault<z.ZodNumber>;
    exclude: z.ZodDefault<z.ZodString>;
    handleSubrepos: z.ZodDefault<z.ZodEffects<z.ZodAny, boolean, any>>;
    subrepoStrategy: z.ZodDefault<z.ZodEnum<["separate", "integrated"]>>;
    signoff: z.ZodDefault<z.ZodEffects<z.ZodAny, boolean, any>>;
    dryRun: z.ZodDefault<z.ZodEffects<z.ZodAny, boolean, any>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    recursive: boolean;
    debounceMs: number;
    baseUrl: string;
    model: string;
    temperature: number;
    maxDiffBytes: number;
    exclude: string;
    handleSubrepos: boolean;
    subrepoStrategy: "separate" | "integrated";
    signoff: boolean;
    dryRun: boolean;
    apiKey?: string | undefined;
}, {
    path?: string | undefined;
    recursive?: any;
    debounceMs?: number | undefined;
    baseUrl?: string | undefined;
    apiKey?: string | undefined;
    model?: string | undefined;
    temperature?: number | undefined;
    maxDiffBytes?: number | undefined;
    exclude?: string | undefined;
    handleSubrepos?: any;
    subrepoStrategy?: "separate" | "integrated" | undefined;
    signoff?: any;
    dryRun?: any;
}>;
export type Config = z.infer<typeof ConfigSchema>;
//# sourceMappingURL=config.d.ts.map