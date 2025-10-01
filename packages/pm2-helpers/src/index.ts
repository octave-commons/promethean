import path from "node:path";

export type DefineAppOptions = {
  readonly cwd?: string;
  readonly watch?: string | readonly string[];
  readonly env_file?: string;
  readonly env?: Readonly<Record<string, unknown>>;
  readonly instances?: number;
  readonly exec_mode?: string;
};

export type AppDefinition = {
  readonly name: string;
  readonly script: string;
  readonly args?: readonly string[];
  readonly exec_mode?: string;
  readonly cwd?: string;
  readonly watch?: string | readonly string[];
  readonly ignore_watch?: readonly string[];
  readonly env_file?: string;
  readonly out_file?: string;
  readonly error_file?: string;
  readonly merge_logs?: boolean;
  readonly instances?: number;
  readonly autorestart?: boolean;
  readonly restart_delay?: number;
  readonly kill_timeout?: number;
  readonly env?: Readonly<Record<string, string>>;
};

type DefineAppFn = (
  name: string,
  script: string,
  args?: readonly string[],
  opts?: DefineAppOptions,
) => AppDefinition;

const HEARTBEAT_PORT = 5005;
const PYTHONPATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);

const defineAppInternal: DefineAppFn = (name, script, args = [], opts = {}) => {
  const {
    cwd,
    watch,
    env_file,
    env = {},
    instances = 1,
    exec_mode = "fork",
  } = opts;

  const normalizedEnv = Object.fromEntries(
    Object.entries(env).map(([k, v]) => [k, String(v)]),
  );

  const base: AppDefinition = {
    name,
    script,
    args,
    exec_mode,
    out_file: `./logs/${name}-out.log`,
    error_file: `./logs/${name}-err.log`,
    merge_logs: true,
    instances,
    autorestart: true,
    restart_delay: 10_000,
    kill_timeout: 10_000,
    env: {
      ...normalizedEnv,
      PM2_PROCESS_NAME: name,
      HEARTBEAT_PORT: String(HEARTBEAT_PORT),
      PYTHONUNBUFFERED: "1",
      PYTHONPATH,
      CHECK_INTERVAL: String(1000 * 60 * 5),
      HEARTBEAT_TIMEOUT: String(1000 * 60 * 10),
    },
  };

  return {
    ...base,
    ...(cwd ? { cwd } : {}),
    ...(watch ? { watch } : {}),
    ignore_watch: ["node_modules", "logs", "tmp", ".git"],
    ...(env_file ? { env_file } : {}),
  } satisfies AppDefinition;
};

type DefineAppWithConstants = DefineAppFn & {
  readonly HEARTBEAT_PORT: number;
  readonly PYTHONPATH: string;
};

export const defineApp: DefineAppWithConstants = Object.freeze(
  Object.assign(
    ((
      name: string,
      script: string,
      args: readonly string[] = [],
      opts: DefineAppOptions = {},
    ) => defineAppInternal(name, script, args, opts)) as DefineAppFn,
    {
      HEARTBEAT_PORT,
      PYTHONPATH,
    } as const,
  ),
);

export function definePythonService(
  name: string,
  serviceDir: string,
  opts: DefineAppOptions = {},
): AppDefinition {
  return defineApp(name, "pipenv", ["run", "python", "-m", "main"], {
    cwd: serviceDir,
    ...opts,
  });
}

export function defineNodeService(
  name: string,
  serviceDir: string,
  opts: DefineAppOptions = {},
): AppDefinition {
  return defineApp(name, ".", [], {
    cwd: serviceDir,
    ...opts,
  });
}

export type AgentAdditionalOptions = Readonly<Record<string, unknown>>;

export type AgentDefinition = Readonly<{
  readonly name: string;
  readonly apps: readonly AppDefinition[];
}> &
  AgentAdditionalOptions;

export function defineAgent(
  name: string,
  appDefs: readonly AppDefinition[],
  opts: AgentAdditionalOptions = Object.freeze({}) as AgentAdditionalOptions,
): AgentDefinition {
  const apps = Object.freeze(
    appDefs.map(
      (app): AppDefinition => ({
        ...app,
        name: `${name}_${app.name}`,
        env: {
          ...(app.env ?? {}),
          AGENT_NAME: name,
        },
      }),
    ),
  );

  return {
    name,
    apps,
    ...opts,
  } as AgentDefinition;
}
