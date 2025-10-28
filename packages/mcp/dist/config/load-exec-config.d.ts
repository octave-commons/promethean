import { z } from "zod";
declare const ExecCommand: z.ZodReadonly<z.ZodObject<{
    id: z.ZodString;
    command: z.ZodString;
    args: z.ZodReadonly<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    description: z.ZodOptional<z.ZodString>;
    cwd: z.ZodOptional<z.ZodString>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    allowExtraArgs: z.ZodDefault<z.ZodBoolean>;
    timeoutMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    args: readonly string[];
    command: string;
    id: string;
    allowExtraArgs: boolean;
    cwd?: string | undefined;
    env?: Record<string, string> | undefined;
    description?: string | undefined;
    timeoutMs?: number | undefined;
}, {
    command: string;
    id: string;
    args?: readonly string[] | undefined;
    cwd?: string | undefined;
    env?: Record<string, string> | undefined;
    description?: string | undefined;
    timeoutMs?: number | undefined;
    allowExtraArgs?: boolean | undefined;
}>>;
declare const ExecConfig: z.ZodReadonly<z.ZodObject<{
    commands: z.ZodReadonly<z.ZodDefault<z.ZodArray<z.ZodReadonly<z.ZodObject<{
        id: z.ZodString;
        command: z.ZodString;
        args: z.ZodReadonly<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
        description: z.ZodOptional<z.ZodString>;
        cwd: z.ZodOptional<z.ZodString>;
        env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        allowExtraArgs: z.ZodDefault<z.ZodBoolean>;
        timeoutMs: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        args: readonly string[];
        command: string;
        id: string;
        allowExtraArgs: boolean;
        cwd?: string | undefined;
        env?: Record<string, string> | undefined;
        description?: string | undefined;
        timeoutMs?: number | undefined;
    }, {
        command: string;
        id: string;
        args?: readonly string[] | undefined;
        cwd?: string | undefined;
        env?: Record<string, string> | undefined;
        description?: string | undefined;
        timeoutMs?: number | undefined;
        allowExtraArgs?: boolean | undefined;
    }>>, "many">>>;
    defaultCwd: z.ZodOptional<z.ZodString>;
    defaultTimeoutMs: z.ZodOptional<z.ZodNumber>;
    forceKillDelayMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    commands: readonly Readonly<{
        args: readonly string[];
        command: string;
        id: string;
        allowExtraArgs: boolean;
        cwd?: string | undefined;
        env?: Record<string, string> | undefined;
        description?: string | undefined;
        timeoutMs?: number | undefined;
    }>[];
    defaultCwd?: string | undefined;
    defaultTimeoutMs?: number | undefined;
    forceKillDelayMs?: number | undefined;
}, {
    commands?: readonly Readonly<{
        command: string;
        id: string;
        args?: readonly string[] | undefined;
        cwd?: string | undefined;
        env?: Record<string, string> | undefined;
        description?: string | undefined;
        timeoutMs?: number | undefined;
        allowExtraArgs?: boolean | undefined;
    }>[] | undefined;
    defaultCwd?: string | undefined;
    defaultTimeoutMs?: number | undefined;
    forceKillDelayMs?: number | undefined;
}>>;
export type ApprovedExecCommand = z.infer<typeof ExecCommand>;
export type ApprovedExecConfig = z.infer<typeof ExecConfig>;
export declare const loadApprovedExecConfig: (env: Readonly<NodeJS.ProcessEnv>, cwd?: string) => ApprovedExecConfig;
export {};
//# sourceMappingURL=load-exec-config.d.ts.map