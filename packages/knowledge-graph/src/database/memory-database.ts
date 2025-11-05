import type { DatabaseConfig, DatabaseSchema } from '../types/database.js'
import type { GraphNode, GraphEdge } from '../types/graph.js'

export class Database {
  private nodes = new Map<string, GraphNode>()
  private edges = new Map<string, GraphEdge>()
  private readonly config: DatabaseConfig

  constructor(config: DatabaseConfig) {
    this.config = config
    console.log('📊 Using in-memory database for testing')
  }

  close(): void {
    this.nodes.clear()
    this.edges.clear()
  }

  migrate(): void {
    console.log('✅ In-memory database ready')
  }

  getDatabase(): any {
    return {
      prepare: (sql: string) => ({
        run: (...args: any[]) => {
          if (sql.includes('INSERT OR REPLACE INTO nodes')) {
            const [id, type, data, metadata] = args
            this.nodes.set(id, {
              id,
              type,
              data: JSON.parse(data),
              metadata: {
                ...JSON.parse(metadata),
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
          } else if (sql.includes('INSERT OR REPLACE INTO edges')) {
            const [id, source, target, type, data] = args
            this.edges.set(id, {
              id,
              source,
              target,
              type,
              data: JSON.parse(data)
            })
          }
        },
        get: (...args: any[]) => {
          if (sql.includes('SELECT * FROM nodes WHERE id = ?')) {
            return this.nodes.get(args[0]) || null
          } else if (sql.includes('SELECT * FROM edges WHERE id = ?')) {
            return this.edges.get(args[0]) || null
          }
          return null
        },
        all: (...args: any[]) => {
          if (sql.includes('SELECT * FROM nodes')) {
            return Array.from(this.nodes.values())
          } else if (sql.includes('SELECT * FROM edges')) {
            return Array.from(this.edges.values())
          }
          return []
        }
      }),
      exec: (sql: string) => {
        console.log('📝 Executing SQL:', sql)
      },
      pragma: (pragma: string) => {
        console.log('⚙️  Setting pragma:', pragma)
      }
    }
  }

  getVersion(): string {
    return '1.0.0'
  }

  transaction<T>(fn: () => T): T {
    return fn()
  }
}