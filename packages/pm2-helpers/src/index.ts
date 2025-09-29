import path from "node:path";

export type DefineAppOptions = {
  readonly cwd?: string;
  readonly watch?: string | string[];
  readonly env_file?: string;
  readonly env?: Record<string, unknown>;
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
  readonly ignore_watch?: string | readonly string[];
  readonly env_file?: string;
  readonly out_file?: string;
  readonly error_file?: string;
  readonly merge_logs?: boolean;
  readonly instances?: number;
  readonly autorestart?: boolean;
  readonly restart_delay?: number;
  readonly kill_timeout?: number;
  readonly env?: Record<string, unknown>;
};

export function defineApp(
  name: string,
  script: string,
  args: readonly string[] = [],
  opts: DefineAppOptions = {},
): AppDefinition {
  const {
    cwd,
    watch,
    env_file,
    env = {},
    instances = 1,
    exec_mode = "fork",
  } = opts;
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
      ...Object.fromEntries(
        Object.entries(env).map(([k, v]) => [k, String(v)]),
      ),
      PM2_PROCESS_NAME: name,
      HEARTBEAT_PORT: String(defineApp.HEARTBEAT_PORT),
      PYTHONUNBUFFERED: "1",
      PYTHONPATH: defineApp.PYTHONPATH,
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
  };
}

defineApp.HEARTBEAT_PORT = 5005;
defineApp.PYTHONPATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
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

export function defineAgent(
  name: string,
  appDefs: readonly AppDefinition[],
  opts: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    name,
    apps: appDefs.map((app) => ({
      ...app,
      name: `${name}_${app.name}`,
      env: {
        ...(app.env || {}),
        AGENT_NAME: name,
      },
    })),
    ...opts,
  };
}
