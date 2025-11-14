import { BaseProvider } from './base.js'
import { ProviderConfig, BenchmarkRequest, BenchmarkResponse } from '../types/index.js'
import { performance } from 'perf_hooks'

// Import pantheon agents
import { runMdlintAgent } from '@promethean-os/pantheon/agents'

export class AgentsProvider extends BaseProvider {
  async connect(): Promise<void> {
    // No-op: uses HTTP to LLM; connectivity verified in execute
  }

  async disconnect(): Promise<void> {
    // No-op
  }

  async isHealthy(): Promise<boolean> {
    // Best-effort: consider healthy; actual failures bubble up in execute
    return true
  }

  async execute(request: BenchmarkRequest): Promise<BenchmarkResponse> {
    const t0 = performance.now()
    const endpoint = this.getConfig().endpoint || process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1'
    const model = this.getConfig().model
    const apiKey = this.getConfig().options?.apiKey || process.env.OPENAI_API_KEY || 'ollama'

    const agent = request.metadata?.agent || 'mdlint'

    if (agent === 'mdlint') {
      const batch = Number(request.metadata?.batch || 25)
      const maxIter = Number(request.metadata?.maxIter || 3)
      const globs = Array.isArray(request.metadata?.globs) ? request.metadata?.globs : ['README.md']

      const res = await runMdlintAgent({ baseURL: endpoint, apiKey, model, batch, maxIter, globs })
      const time = Math.round(performance.now() - t0)

      return {
        content: `mdlint remaining=${res.remaining}`,
        tokens: 0,
        time,
        metadata: { remaining: res.remaining },
      }
    }

    throw new Error(`Unsupported agents action: ${agent}`)
  }
}
