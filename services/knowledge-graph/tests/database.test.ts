import { test, describe, expect } from 'bun:test'
import { Database } from '../src/database/database.js'
import { GraphRepository } from '../src/database/repository.js'
import { GraphNode, GraphEdge } from '../src/types/index.js'
import { join } from 'path'
import { mkdtempSync, rmSync } from 'fs'

describe('Database', () => {
  let db: Database
  let repo: GraphRepository
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync('kg-test-')
    const dbPath = join(tempDir, 'test.db')
    db = new Database({ path: dbPath })
    db.migrate()
    repo = new GraphRepository(db)
  })

  afterEach(() => {
    db.close()
    rmSync(tempDir, { recursive: true, force: true })
  })

  test('should create and retrieve nodes', () => {
    const node: GraphNode = {
      id: 'test-node-1',
      type: 'documentation',
      data: { title: 'Test Document', content: '# Test' },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'test'
      }
    }

    repo.createNode(node)
    const retrieved = repo.getNode('test-node-1')

    expect(retrieved).not.toBeNull()
    expect(retrieved?.id).toBe('test-node-1')
    expect(retrieved?.type).toBe('documentation')
    expect(retrieved?.data.title).toBe('Test Document')
  })

  test('should create and retrieve edges', () => {
    const edge: GraphEdge = {
      id: 'test-edge-1',
      source: 'node-1',
      target: 'node-2',
      type: 'links_to',
      data: { strength: 0.8 }
    }

    repo.createEdge(edge)
    const retrieved = repo.getEdge('test-edge-1')

    expect(retrieved).not.toBeNull()
    expect(retrieved?.id).toBe('test-edge-1')
    expect(retrieved?.source).toBe('node-1')
    expect(retrieved?.target).toBe('node-2')
    expect(retrieved?.type).toBe('links_to')
  })

  test('should find connected nodes', () => {
    const node1: GraphNode = {
      id: 'node-1',
      type: 'documentation',
      data: { title: 'Node 1' },
      metadata: { createdAt: new Date(), updatedAt: new Date(), source: 'test' }
    }

    const node2: GraphNode = {
      id: 'node-2',
      type: 'code',
      data: { title: 'Node 2' },
      metadata: { createdAt: new Date(), updatedAt: new Date(), source: 'test' }
    }

    const edge: GraphEdge = {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      type: 'links_to',
      data: {}
    }

    repo.createNode(node1)
    repo.createNode(node2)
    repo.createEdge(edge)

    const connected = repo.getConnectedNodes('node-1', 1)

    expect(connected.nodes).toHaveLength(2)
    expect(connected.edges).toHaveLength(1)
  })
})