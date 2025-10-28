import { z } from 'zod';
export declare const CONFIG_FILE_NAME = "promethean.mcp.json";
export declare const CONFIG_ROOT: string;
declare const InlineProxy: z.ZodObject<{
    name: z.ZodString;
    command: z.ZodString;
    args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    env: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    cwd: z.ZodOptional<z.ZodString>;
    httpPath: z.ZodString;
}, "strict", z.ZodTypeAny, {
    args: string[];
    env: Record<string, string>;
    command: string;
    name: string;
    httpPath: string;
    cwd?: string | undefined;
}, {
    command: string;
    name: string;
    httpPath: string;
    args?: string[] | undefined;
    cwd?: string | undefined;
    env?: Record<string, string> | undefined;
}>;
declare const Config: z.ZodObject<{
    transport: z.ZodDefault<z.ZodEnum<["stdio", "http"]>>;
    tools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    includeHelp: z.ZodOptional<z.ZodBoolean>;
    stdioMeta: z.ZodOptional<z.ZodObject<{
        title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        workflow: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
        expectations: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodObject<{
            usage: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
            pitfalls: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
            prerequisites: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
        }, "strip", z.ZodTypeAny, {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        }, {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        }>>>>;
    }, "strip", z.ZodTypeAny, {
        description?: string | undefined;
        title?: string | undefined;
        workflow?: string[] | undefined;
        expectations?: {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        } | undefined;
    }, {
        description?: string | undefined;
        title?: string | undefined;
        workflow?: string[] | undefined;
        expectations?: {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        } | undefined;
    }>>;
    endpoints: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        tools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        includeHelp: z.ZodOptional<z.ZodBoolean>;
        meta: z.ZodOptional<z.ZodObject<{
            title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            workflow: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
            expectations: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodObject<{
                usage: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
                pitfalls: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
                prerequisites: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
            }, "strip", z.ZodTypeAny, {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            }, {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            }>>>>;
        }, "strip", z.ZodTypeAny, {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        }, {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        tools: string[];
        includeHelp?: boolean | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        } | undefined;
    }, {
        tools?: string[] | undefined;
        includeHelp?: boolean | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        } | undefined;
    }>>>;
    stdioProxyConfig: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    stdioProxies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        command: z.ZodString;
        args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        env: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        cwd: z.ZodOptional<z.ZodString>;
        httpPath: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        args: string[];
        env: Record<string, string>;
        command: string;
        name: string;
        httpPath: string;
        cwd?: string | undefined;
    }, {
        command: string;
        name: string;
        httpPath: string;
        args?: string[] | undefined;
        cwd?: string | undefined;
        env?: Record<string, string> | undefined;
    }>, "many">>;
    version: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    tools: string[];
    transport: "stdio" | "http";
    endpoints: Record<string, {
        tools: string[];
        includeHelp?: boolean | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        } | undefined;
    }>;
    stdioProxyConfig: string | null;
    stdioProxies: {
        args: string[];
        env: Record<string, string>;
        command: string;
        name: string;
        httpPath: string;
        cwd?: string | undefined;
    }[];
    includeHelp?: boolean | undefined;
    stdioMeta?: {
        description?: string | undefined;
        title?: string | undefined;
        workflow?: string[] | undefined;
        expectations?: {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        } | undefined;
    } | undefined;
    version?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    tools?: string[] | undefined;
    includeHelp?: boolean | undefined;
    transport?: "stdio" | "http" | undefined;
    stdioMeta?: {
        description?: string | undefined;
        title?: string | undefined;
        workflow?: string[] | undefined;
        expectations?: {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        } | undefined;
    } | undefined;
    endpoints?: Record<string, {
        tools?: string[] | undefined;
        includeHelp?: boolean | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        } | undefined;
    }> | undefined;
    stdioProxyConfig?: string | null | undefined;
    stdioProxies?: {
        command: string;
        name: string;
        httpPath: string;
        args?: string[] | undefined;
        cwd?: string | undefined;
        env?: Record<string, string> | undefined;
    }[] | undefined;
    version?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const ConfigSchema: z.ZodObject<{
    transport: z.ZodDefault<z.ZodEnum<["stdio", "http"]>>;
    tools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    includeHelp: z.ZodOptional<z.ZodBoolean>;
    stdioMeta: z.ZodOptional<z.ZodObject<{
        title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        workflow: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
        expectations: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodObject<{
            usage: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
            pitfalls: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
            prerequisites: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
        }, "strip", z.ZodTypeAny, {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        }, {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        }>>>>;
    }, "strip", z.ZodTypeAny, {
        description?: string | undefined;
        title?: string | undefined;
        workflow?: string[] | undefined;
        expectations?: {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        } | undefined;
    }, {
        description?: string | undefined;
        title?: string | undefined;
        workflow?: string[] | undefined;
        expectations?: {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        } | undefined;
    }>>;
    endpoints: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        tools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        includeHelp: z.ZodOptional<z.ZodBoolean>;
        meta: z.ZodOptional<z.ZodObject<{
            title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            workflow: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
            expectations: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodObject<{
                usage: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
                pitfalls: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
                prerequisites: z.ZodOptional<z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>>;
            }, "strip", z.ZodTypeAny, {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            }, {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            }>>>>;
        }, "strip", z.ZodTypeAny, {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        }, {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        tools: string[];
        includeHelp?: boolean | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        } | undefined;
    }, {
        tools?: string[] | undefined;
        includeHelp?: boolean | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        } | undefined;
    }>>>;
    stdioProxyConfig: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    stdioProxies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        command: z.ZodString;
        args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        env: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        cwd: z.ZodOptional<z.ZodString>;
        httpPath: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        args: string[];
        env: Record<string, string>;
        command: string;
        name: string;
        httpPath: string;
        cwd?: string | undefined;
    }, {
        command: string;
        name: string;
        httpPath: string;
        args?: string[] | undefined;
        cwd?: string | undefined;
        env?: Record<string, string> | undefined;
    }>, "many">>;
    version: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    tools: string[];
    transport: "stdio" | "http";
    endpoints: Record<string, {
        tools: string[];
        includeHelp?: boolean | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        } | undefined;
    }>;
    stdioProxyConfig: string | null;
    stdioProxies: {
        args: string[];
        env: Record<string, string>;
        command: string;
        name: string;
        httpPath: string;
        cwd?: string | undefined;
    }[];
    includeHelp?: boolean | undefined;
    stdioMeta?: {
        description?: string | undefined;
        title?: string | undefined;
        workflow?: string[] | undefined;
        expectations?: {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        } | undefined;
    } | undefined;
    version?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    tools?: string[] | undefined;
    includeHelp?: boolean | undefined;
    transport?: "stdio" | "http" | undefined;
    stdioMeta?: {
        description?: string | undefined;
        title?: string | undefined;
        workflow?: string[] | undefined;
        expectations?: {
            usage?: string[] | undefined;
            pitfalls?: string[] | undefined;
            prerequisites?: string[] | undefined;
        } | undefined;
    } | undefined;
    endpoints?: Record<string, {
        tools?: string[] | undefined;
        includeHelp?: boolean | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
            workflow?: string[] | undefined;
            expectations?: {
                usage?: string[] | undefined;
                pitfalls?: string[] | undefined;
                prerequisites?: string[] | undefined;
            } | undefined;
        } | undefined;
    }> | undefined;
    stdioProxyConfig?: string | null | undefined;
    stdioProxies?: {
        command: string;
        name: string;
        httpPath: string;
        args?: string[] | undefined;
        cwd?: string | undefined;
        env?: Record<string, string> | undefined;
    }[] | undefined;
    version?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type AppConfig = z.infer<typeof Config>;
export type InlineProxyConfig = z.infer<typeof InlineProxy>;
export type ConfigSource = Readonly<{
    type: 'file';
    path: string;
}> | Readonly<{
    type: 'env';
}> | Readonly<{
    type: 'default';
}>;
export type LoadedConfig = Readonly<{
    config: AppConfig;
    source: ConfigSource;
}>;
export declare const findConfigPath: (cwd?: string) => string | null;
export type ResolveConfigPathOptions = Readonly<{
    allowOutsideBase?: boolean;
}>;
export declare const resolveConfigPath: (filePath: string, baseDir?: string, options?: ResolveConfigPathOptions) => string;
export declare const createDefaultConfig: () => AppConfig;
export declare const saveConfigFile: (filePath: string, config: AppConfig, baseDir?: string) => AppConfig;
export declare const loadConfigWithSource: (env: NodeJS.ProcessEnv, argv?: string[], cwd?: string) => LoadedConfig;
/**
 * Load config synchronously with the following precedence:
 * 1) --config / -c path (relative to cwd)
 * 2) nearest promethean.mcp.json from cwd upward
 * 3) legacy env MCP_CONFIG_JSON (object)

 * 4) defaults
 */
export declare const loadConfig: (env: NodeJS.ProcessEnv, argv?: string[], cwd?: string) => AppConfig;
export {};
//# sourceMappingURL=load-config.d.ts.map