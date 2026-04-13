// Lightweight Fastify server to serve API endpoints and React UI build
import Fastify from 'fastify'
import path from 'path'
import { fileURLToPath } from 'url'
import fastifyStatic from '@fastify/static'
import fastifyCors from '@fastify/cors'
import { getBotConfig, getBotIdFromEnv } from './config/bots.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = Fastify({ logger: true })

// Enable CORS for development
// @ts-expect-error - fastify plugin type mismatch between @fastify/cors@9 and fastify@4.29
app.register(fastifyCors, { origin: true })

// API stubs (to be replaced with real logic later)
app.get('/api/memories/count', async () => ({ count: 0 }))
app.get('/api/memories/context', async () => ({ pinned: [], recent: [] }))
app.get('/api/memories/list', async () => ({ memories: [] }))
app.get('/api/memories/table', async () => ({ rows: [] }))
app.get('/api/memories/:id', async (req: any) => ({ id: req.params.id }))
app.get('/api/memories/search', async () => ({ memories: [] }))
app.post('/api/memories/:id/pin', async () => ({ ok: true }))
app.post('/api/memories/:id/unpin', async () => ({ ok: true }))

// ========================================
// PEER API - Inter-Cephalon Communication
// ========================================

import { randomUUID } from 'node:crypto'

// In-memory state for peer operations
const pendingRestartRequests: Map<string, { requester: string; reason: string; timestamp: number; target: string }> = new Map()
const restartApprovals: Map<string, Set<string>> = new Map()
const peerLogBuffer: Map<string, string[]> = new Map()
const MAX_LOG_LINES = 1000

// Helper to get self name
function getSelfName(): string {
  return getBotConfig(getBotIdFromEnv()).id
}

// Helper to log and buffer
function logAndBuffer(message: string) {
  const selfName = getSelfName()
  if (!peerLogBuffer.has(selfName)) {
    peerLogBuffer.set(selfName, [])
  }
  const buffer = peerLogBuffer.get(selfName)!
  buffer.push(`[${new Date().toISOString()}] ${message}`)
  if (buffer.length > MAX_LOG_LINES) {
    buffer.shift()
  }
  console.log(message)
}

// Read a peer's file
app.get('/peer/:peerName/files/*', async (req: any, reply: any) => {
  const peerName = req.params.peerName
  const filePath = req.params['*'] // wildcard
  const selfName = getSelfName()

  if (peerName.toLowerCase() === selfName) {
    return reply.status(403).send({ error: 'Cannot read own code' })
  }

  logAndBuffer(`[PEER] ${peerName} requested file: ${filePath}`)

  // Read from local filesystem
  try {
    const fs = await import('fs/promises')
    const fullPath = path.join(process.cwd(), 'src', filePath)
    const content = await fs.readFile(fullPath, 'utf-8')
    return { peer: selfName, path: filePath, content }
  } catch (error) {
    return reply.status(404).send({ error: `File not found: ${filePath}` })
  }
})

// Write a peer's file
app.put('/peer/:peerName/files/*', async (req: any, reply: any) => {
  const peerName = req.params.peerName
  const filePath = req.params['*']
  const { content } = req.body
  const selfName = getSelfName()

  if (peerName.toLowerCase() === selfName) {
    return reply.status(403).send({ error: 'Cannot write own code' })
  }

  logAndBuffer(`[PEER] ${peerName} wrote file: ${filePath}`)

  try {
    const fs = await import('fs/promises')
    const fullPath = path.join(process.cwd(), 'src', filePath)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, content, 'utf-8')
    return { peer: selfName, path: filePath, written: true }
  } catch (error) {
    return reply.status(500).send({ error: `Failed to write file: ${error}` })
  }
})

// Get peer logs
app.get('/peer/:peerName/logs', async (req: any, reply: any) => {
  const peerName = req.params.peerName
  const lines = parseInt(req.query.lines) || 50
  const selfName = getSelfName()

  if (peerName.toLowerCase() === selfName) {
    return reply.status(403).send({ error: 'Cannot view own logs' })
  }

  logAndBuffer(`[PEER] ${peerName} requested logs`)

  const selfLogs = peerLogBuffer.get(selfName) || []
  return { peer: selfName, logs: selfLogs.slice(-lines) }
})

// Request restart
app.post('/peer/:peerName/restart-request', async (req: any, reply: any) => {
  const peerName = req.params.peerName
  const { reason } = req.body
  const selfName = getSelfName()

  if (peerName.toLowerCase() === selfName) {
    return reply.status(403).send({ error: 'Cannot request restart for self' })
  }

  const requestId = randomUUID()
  pendingRestartRequests.set(requestId, {
    requester: peerName,
    reason: reason || 'No reason provided',
    timestamp: Date.now(),
    target: selfName,
  })

  logAndBuffer(`[PEER] ${peerName} requested restart: ${reason} (id: ${requestId})`)

  return { requestId, peer: selfName, status: 'pending' }
})

// Approve restart
app.post('/peer/restart-approve/:requestId', async (req: any, reply: any) => {
  const { requestId } = req.params
  const selfName = getSelfName()

  const request = pendingRestartRequests.get(requestId)
  if (!request) {
    return reply.status(404).send({ error: 'Request not found' })
  }

  if (!restartApprovals.has(requestId)) {
    restartApprovals.set(requestId, new Set())
  }

  const approvals = restartApprovals.get(requestId)!
  approvals.add(selfName)

  // Check if both approved
  const hasRequester = approvals.has(request.requester.toLowerCase())
  const hasTarget = approvals.has(request.target.toLowerCase())

  if (hasRequester && hasTarget) {
    logAndBuffer(`[PEER] Restart approved by both parties, executing restart...`)
    pendingRestartRequests.delete(requestId)
    restartApprovals.delete(requestId)

    // Execute restart after short delay
    setTimeout(() => {
      process.exit(0) // PM2 will restart
    }, 1000)

    return { requestId, approved: true, approvers: [request.requester, request.target], restarting: true }
  }

  return { requestId, approved: false, approvers: Array.from(approvals) }
})

// Check restart status
app.get('/peer/restart-status/:requestId', async (req: any, reply: any) => {
  const { requestId } = req.params
  const request = pendingRestartRequests.get(requestId)

  if (!request) {
    return reply.status(404).send({ error: 'Request not found' })
  }

  const approvals = restartApprovals.get(requestId) || new Set()
  return { requestId, approvers: Array.from(approvals), approved: approvals.size >= 2 }
})

// List pending restart requests
app.get('/peer/restart-requests', async () => {
  const selfName = getSelfName()
  const requests: Array<{ id: string; requester: string; reason: string; timestamp: number }> = []

  for (const [id, req] of pendingRestartRequests) {
    if (req.target.toLowerCase() === selfName) {
      requests.push({ id, requester: req.requester, reason: req.reason, timestamp: req.timestamp })
    }
  }

  return { requests }
})

// UI build serving (static)
const uiDist = path.join(__dirname, 'ui', 'dist')
// @ts-expect-error - fastify plugin type mismatch between @fastify/static@7 and fastify@4.29
app.register(fastifyStatic, {
  root: uiDist,
  prefix: '/ui/',
})

app.get('/', async (req, reply) => {
  reply.redirect('/ui/index.html')
})

export async function start() {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
  try {
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`server listening on http://0.0.0.0:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

export default app
export { logAndBuffer }
