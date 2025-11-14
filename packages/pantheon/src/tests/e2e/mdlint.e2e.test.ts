import test from 'ava'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { BenchmarkRunner } from '@promethean-os/benchmark'
import { ProviderConfig } from '@promethean-os/benchmark'

const ensureEnvDefaults = () => {
  if (!process.env.OPENAI_BASE_URL) process.env.OPENAI_BASE_URL = 'http://localhost:11434/v1'
  if (!process.env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = 'ollama'
}

test('AgentsProvider + mdlint agent end-to-end smoke with local Ollama qwen3:4b', async t => {
  ensureEnvDefaults()

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pantheon-mdlint-e2e-'))
  const orig = process.cwd()
  try {
    process.chdir(dir)
    await fs.writeFile('.markdownlint.jsonc', '{"MD013": false}', 'utf8')
    await fs.writeFile('README.md', '# Title\npara\n- a\n- b\n\n```\nno lang\n```\n', 'utf8')

    const runner = new BenchmarkRunner(false)
    const provider: ProviderConfig = {
      name: 'agents-mdlint',
      type: 'agents',
      endpoint: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.MODEL || 'qwen3:4b',
    }

    await runner.addProvider(provider)

    const report = await runner.runBenchmarkSuite({
      name: 'mdlint-e2e',
      iterations: 1,
      warmupIterations: 0,
      providers: [provider],
      requests: [
        { prompt: 'fix markdown lint', metadata: { agent: 'mdlint', batch: 20, maxIter: 2, globs: ['README.md'] } },
      ],
    })

    t.true(report.results.length >= 1)
    t.true(report.results[0].success)
    t.is(report.suite.name, 'mdlint-e2e')
  } finally {
    process.chdir(orig)
    try { await fs.rm(dir, { recursive: true, force: true }) } catch {}
  }
})
