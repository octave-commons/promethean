import { execa, ExecaChildProcess } from "execa";
import getPort from "get-port";
import process from "node:process";
import { Repo } from "./types.js";
import { HubConfig } from "./types.js";

type Proc = ExecaChildProcess;

export class OpencodeManager {
  private procs = new Map<string, Proc>();

  constructor(private cfg: HubConfig) {}

  async ensureRunning(repo: Repo): Promise<Repo> {
    if (this.procs.has(repo.id)) {
      repo.status = "running";
      return repo;
    }
    const port = repo.port ?? await getPort({ port: getPort.makeRange(this.cfg.opencodeBasePort, this.cfg.opencodeBasePort + 5000) });
    const args = [...this.cfg.opencodeArgs, String(port), "--root", repo.path];
    repo.port = port;
    repo.status = "starting";
    // NOTE: customize OPENCODE_ARGS if your CLI differs; graceful handling below
    const child = execa(this.cfg.opencodeBin, args, {
      stdio: "pipe",
      env: { ...process.env, REPO_SLUG: repo.repoSlug ?? "" }
    });
    this.procs.set(repo.id, child);
    child.stdout?.on("data", (d) => {
      const s = String(d);
      if (/listening|ready|http server/i.test(s)) repo.status = "running";
    });
    child.on("exit", (code) => {
      repo.status = "stopped";
      this.procs.delete(repo.id);
    });
    child.on("error", (err) => {
      repo.status = "error";
      this.procs.delete(repo.id);
      console.error("[opencode]", repo.name, err);
    });
    return repo;
  }

  stop(repoId: string) {
    const p = this.procs.get(repoId);
    if (p) p.kill("SIGTERM", { forceKillAfterTimeout: 3000 });
    this.procs.delete(repoId);
  }

  info(repoId: string) {
    return this.procs.get(repoId);
  }
}