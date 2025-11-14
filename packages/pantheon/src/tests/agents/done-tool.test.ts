import test from 'ava'
import { createDoneTool } from '../../agents/shared.js'

test('createDoneTool returns ok with reason', async t => {
  const tool = createDoneTool('done', 'finish')
  const out = await tool.function.execute({ reason: 'complete' })
  const res = JSON.parse(String(out))
  t.deepEqual(res, { ok: true, reason: 'complete' })
})
