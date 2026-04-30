import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

export interface LithSnapshot {
  record: string
  generated_at: string
  repo_root: string
  index: Record<string, unknown>
  logical_graph: Record<string, unknown>
  nexus_graph: Record<string, unknown>
}

const DEFAULT_SIMULATION_HOST = "127.0.0.1"
const DEFAULT_SIMULATION_PORT = 8787

export class LithNexusBackend {
  private cachedSummary: LithSnapshot | undefined
  private cachedFull: LithSnapshot | undefined
  private readonly simulationUrl: string
  private readonly useRuntime: boolean

  constructor(
    readonly repoRoot: string,
    readonly pythonWorkdir: string,
  ) {
    const host = process.env.WORLD_WEB_HOST || DEFAULT_SIMULATION_HOST
    const port = parseInt(process.env.WORLD_WEB_PORT || String(DEFAULT_SIMULATION_PORT), 10)
    this.simulationUrl = `http://${host}:${port}`
    this.useRuntime = process.env.LITH_NEXUS_OFFLINE !== "1"
  }

  invalidate(): void {
    this.cachedSummary = undefined
    this.cachedFull = undefined
  }

  async getSnapshot(includeText = false): Promise<LithSnapshot> {
    const cached = includeText ? this.cachedFull : this.cachedSummary
    if (cached) return cached

    let payload: LithSnapshot

    if (this.useRuntime) {
      payload = await this.fetchFromRuntime(includeText)
    } else {
      payload = await this.buildOffline(includeText)
    }

    if (includeText) this.cachedFull = payload
    else this.cachedSummary = payload
    return payload
  }

  private async fetchFromRuntime(includeText: boolean): Promise<LithSnapshot> {
    // Use /api/catalog which now includes the unified nexus_graph
    const catalogUrl = `${this.simulationUrl}/api/catalog`

    try {
      const response = await global.fetch(catalogUrl, {
        method: "GET",
        headers: { "Accept": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`catalog fetch failed: ${response.status} ${response.statusText}`)
      }

      const catalog = await response.json() as Record<string, unknown>

      const index = (catalog.lith_nexus as Record<string, unknown>) || {}
      const logicalGraph = (catalog.logical_graph as Record<string, unknown>) || {}
      const nexusGraph = (catalog.nexus_graph as Record<string, unknown>) || {}

      const snapshot: LithSnapshot = {
        record: "eta-mu.lith-nexus.snapshot.v1",
        generated_at: String(catalog.generated_at || new Date().toISOString()),
        repo_root: this.repoRoot,
        index,
        logical_graph: logicalGraph,
        nexus_graph: nexusGraph,
      }

      if (includeText && catalog.file_graph) {
        (snapshot.index as Record<string, unknown>).file_graph = catalog.file_graph
      }

      return snapshot
    } catch (err) {
      console.error(`Failed to fetch from runtime at ${catalogUrl}: ${err}`)
      throw err
    }
  }

  private async buildOffline(includeText: boolean): Promise<LithSnapshot> {
    const args = [
      "-m",
      "code.world_web.lith_nexus_cli",
      "snapshot",
      "--repo-root",
      this.repoRoot,
    ]
    if (includeText) args.push("--include-text")

    const { stdout, stderr } = await execFileAsync("python", args, {
      cwd: this.pythonWorkdir,
      maxBuffer: 20 * 1024 * 1024,
    })
    if (stderr?.trim()) {
      throw new Error(stderr.trim())
    }

    const payload = JSON.parse(stdout) as LithSnapshot
    return payload
  }
}