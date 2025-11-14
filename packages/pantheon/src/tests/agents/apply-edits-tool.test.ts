import test from 'ava'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createApplyEditsTool } from '../../agents/shared.js'

const withTempFile = async (content: string, fn: (file: string) => Promise<void>) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pantheon-applytool-'))
  const file = path.join(dir, 'sample.md')
  await fs.writeFile(file, content, 'utf8')
  try {
    await fn(file)
  } finally {
    try { await fs.rm(dir, { recursive: true, force: true }) } catch {}
  }
}

test('createApplyEditsTool.apply_edits executes file replacement', async t => {
  const tool = createApplyEditsTool('apply_edits', 'test tool')
  const initial = ['A', 'B', 'C', 'D'].join('\n')
  await withTempFile(initial, async file => {
    const resJson = await tool.function.execute({
      edits: [
        { path: file, startLine: 2, endLine: 3, replacement: 'B2\nC2' },
      ],
    })
    const res = JSON.parse(String(resJson))
    t.is(res.changed, 1)
    const final = await fs.readFile(file, 'utf8')
    t.is(final, ['A', 'B2', 'C2', 'D'].join('\n'))
  })
})
