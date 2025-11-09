import type { GraphNode, GraphEdge, QueryOptions, GraphQueryResult } from '../types/index.js'
import type { Database } from './database.js'
import { Logger } from '../utils/logger.js'

export class GraphRepository {
  private readonly logger = Logger.getInstance()

  constructor(private readonly db: Database) {}

  createNode(node: GraphNode): void {
    try {
      // Validate input
      if (!node || !node.id || !node.type) {
        throw new Error('Invalid node: missing required fields')
      }

      const stmt = this.db.getDatabase().prepare(`
        INSERT OR REPLACE INTO nodes (id, type, data, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      stmt.run(
        node.id,
        node.type,
        JSON.stringify(node.data),
        JSON.stringify(node.metadata),
        node.metadata.createdAt.toISOString(),
        node.metadata.updatedAt.toISOString()
      )

      this.logger.debug('GraphRepository', 'Node created successfully', { nodeId: node.id, nodeType: node.type })
    } catch (error) {
      this.logger.error('GraphRepository', 'Failed to create node', { nodeId: node?.id, nodeType: node?.type }, error as Error)
      throw error
    }
  }

  createEdge(edge: GraphEdge): void {
    try {
      // Validate input
      if (!edge || !edge.id || !edge.source || !edge.target || !edge.type) {
        throw new Error('Invalid edge: missing required fields')
      }

      const stmt = this.db.getDatabase().prepare(`
        INSERT OR REPLACE INTO edges (id, source_id, target_id, type, data, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      stmt.run(
        edge.id,
        edge.source,
        edge.target,
        edge.type,
        JSON.stringify(edge.data),
        new Date().toISOString()
      )

      this.logger.debug('GraphRepository', 'Edge created successfully', { 
        edgeId: edge.id, 
        sourceId: edge.source, 
        targetId: edge.target, 
        edgeType: edge.type 
      })
    } catch (error) {
      this.logger.error('GraphRepository', 'Failed to create edge', { 
        edgeId: edge?.id, 
        sourceId: edge?.source, 
        targetId: edge?.target, 
        edgeType: edge?.type 
      }, error as Error)
      throw error
    }
  }

  getNode(id: string): GraphNode | null {
    const stmt = this.db.getDatabase().prepare(`
      SELECT id, type, data, metadata, created_at, updated_at
      FROM nodes WHERE id = ?
    `)

    const row = stmt.get(id) as any
    if (!row) return null

    return this.mapRowToNode(row)
  }

  getEdge(id: string): GraphEdge | null {
    const stmt = this.db.getDatabase().prepare(`
      SELECT id, source_id, target_id, type, data, created_at
      FROM edges WHERE id = ?
    `)

    const row = stmt.get(id) as any
    if (!row) return null

    return this.mapRowToEdge(row)
  }

  findNodes(options: QueryOptions = {}): GraphQueryResult {
    let query = 'SELECT * FROM nodes'
    const params: unknown[] = []
    const conditions: string[] = []

    // SQL injection prevention - whitelist allowed columns
    const allowedOrderByColumns = ['created_at', 'updated_at', 'type', 'id']
    const allowedFilterColumns = ['type', 'id']

    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (!allowedFilterColumns.includes(key)) {
          throw new Error(`Invalid filter column: ${key}`)
        }
        conditions.push(`${key} = ?`)
        params.push(value)
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    if (options.orderBy) {
      if (!allowedOrderByColumns.includes(options.orderBy)) {
        throw new Error(`Invalid order by column: ${options.orderBy}`)
      }
      query += ` ORDER BY ${options.orderBy}`
    }

    if (options.limit) {
      if (typeof options.limit !== 'number' || options.limit < 0 || options.limit > 10000) {
        throw new Error('Invalid limit value')
      }
      query += ' LIMIT ?'
      params.push(options.limit)
    }

    if (options.offset) {
      if (typeof options.offset !== 'number' || options.offset < 0) {
        throw new Error('Invalid offset value')
      }
      query += ' OFFSET ?'
      params.push(options.offset)
    }

    const stmt = this.db.getDatabase().prepare(query)
    const rows = stmt.all(...params) as any[]

    const nodes = rows.map(row => this.mapRowToNode(row))

    return {
      nodes,
      edges: [],
      totalCount: nodes.length,
      hasMore: false
    }
  }

  findEdges(options: QueryOptions = {}): GraphQueryResult {
    let query = 'SELECT * FROM edges'
    const params: unknown[] = []
    const conditions: string[] = []

    // SQL injection prevention - whitelist allowed columns
    const allowedOrderByColumns = ['created_at', 'type', 'id', 'source_id', 'target_id']
    const allowedFilterColumns = ['type', 'id', 'source_id', 'target_id']

    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (!allowedFilterColumns.includes(key)) {
          throw new Error(`Invalid filter column: ${key}`)
        }
        conditions.push(`${key} = ?`)
        params.push(value)
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    if (options.orderBy) {
      if (!allowedOrderByColumns.includes(options.orderBy)) {
        throw new Error(`Invalid order by column: ${options.orderBy}`)
      }
      query += ` ORDER BY ${options.orderBy}`
    }

    if (options.limit) {
      if (typeof options.limit !== 'number' || options.limit < 0 || options.limit > 10000) {
        throw new Error('Invalid limit value')
      }
      query += ' LIMIT ?'
      params.push(options.limit)
    }

    if (options.offset) {
      if (typeof options.offset !== 'number' || options.offset < 0) {
        throw new Error('Invalid offset value')
      }
      query += ' OFFSET ?'
      params.push(options.offset)
    }

    const stmt = this.db.getDatabase().prepare(query)
    const rows = stmt.all(...params) as any[]

    const edges = rows.map(row => this.mapRowToEdge(row))

    return {
      nodes: [],
      edges,
      totalCount: edges.length,
      hasMore: false
    }
  }

  getConnectedNodes(nodeId: string, depth = 1): GraphQueryResult {
    const stmt = this.db.getDatabase().prepare(`
      WITH RECURSIVE connected_nodes(id, depth) AS (
        SELECT ?, 0
        UNION ALL
        SELECT 
          CASE 
            WHEN edges.source_id = ? THEN edges.target_id
            ELSE edges.source_id
          END,
          connected_nodes.depth + 1
        FROM edges
        JOIN connected_nodes ON (
          edges.source_id = connected_nodes.id OR edges.target_id = connected_nodes.id
        )
        WHERE connected_nodes.depth < ?
      )
      SELECT DISTINCT nodes.* FROM nodes
      JOIN connected_nodes ON nodes.id = connected_nodes.id
      WHERE nodes.id != ?
    `)

    const rows = stmt.all(nodeId, nodeId, depth, nodeId) as any[]
    const nodes = rows.map(row => this.mapRowToNode(row))

    const edgeStmt = this.db.getDatabase().prepare(`
      SELECT edges.* FROM edges
      WHERE edges.source_id IN (SELECT id FROM connected_nodes)
      OR edges.target_id IN (SELECT id FROM connected_nodes)
    `)

    const edgeRows = edgeStmt.all() as any[]
    const edges = edgeRows.map(row => this.mapRowToEdge(row))

    return {
      nodes,
      edges,
      totalCount: nodes.length + edges.length,
      hasMore: false
    }
  }

  deleteNode(id: string): void {
    const deleteEdgesStmt = this.db.getDatabase().prepare(`
      DELETE FROM edges WHERE source_id = ? OR target_id = ?
    `)
    deleteEdgesStmt.run(id, id)

    const deleteNodeStmt = this.db.getDatabase().prepare(`
      DELETE FROM nodes WHERE id = ?
    `)
    deleteNodeStmt.run(id)
  }

  deleteEdge(id: string): void {
    const stmt = this.db.getDatabase().prepare(`
      DELETE FROM edges WHERE id = ?
    `)
    stmt.run(id)
  }

  private mapRowToNode(row: any): GraphNode {
    return {
      id: row.id,
      type: row.type,
      data: JSON.parse(row.data),
      metadata: {
        ...JSON.parse(row.metadata),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }
    }
  }

  private mapRowToEdge(row: any): GraphEdge {
    return {
      id: row.id,
      source: row.source_id,
      target: row.target_id,
      type: row.type,
      data: JSON.parse(row.data)
    }
  }
}