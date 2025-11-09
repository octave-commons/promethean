import SQLite3 from 'better-sqlite3'
import { DatabaseConfig, DatabaseSchema } from '../types/database.js'
import { Logger } from '../utils/logger.js'

const SCHEMA_VERSION = '1.0.0'

const SCHEMA: DatabaseSchema = {
  version: SCHEMA_VERSION,
  tables: [
    {
      name: 'schema_migrations',
      columns: [
        { name: 'version', type: 'TEXT', nullable: false, primaryKey: true },
        { name: 'applied_at', type: 'DATETIME', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
      ],
      indexes: []
    },
    {
      name: 'nodes',
      columns: [
        { name: 'id', type: 'TEXT', nullable: false, primaryKey: true },
        { name: 'type', type: 'TEXT', nullable: false },
        { name: 'data', type: 'JSON', nullable: false },
        { name: 'metadata', type: 'JSON', nullable: false },
        { name: 'created_at', type: 'DATETIME', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'DATETIME', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
      ],
      indexes: [
        { name: 'idx_nodes_type', columns: ['type'] },
        { name: 'idx_nodes_created_at', columns: ['created_at'] },
        { name: 'idx_nodes_updated_at', columns: ['updated_at'] },
        { name: 'idx_nodes_type_created', columns: ['type', 'created_at'] }
      ]
    },
    {
      name: 'edges',
      columns: [
        { name: 'id', type: 'TEXT', nullable: false, primaryKey: true },
        { name: 'source_id', type: 'TEXT', nullable: false },
        { name: 'target_id', type: 'TEXT', nullable: false },
        { name: 'type', type: 'TEXT', nullable: false },
        { name: 'data', type: 'JSON', nullable: false },
        { name: 'created_at', type: 'DATETIME', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
      ],
      indexes: [
        { name: 'idx_edges_source', columns: ['source_id'] },
        { name: 'idx_edges_target', columns: ['target_id'] },
        { name: 'idx_edges_type', columns: ['type'] },
        { name: 'idx_edges_source_target', columns: ['source_id', 'target_id'] },
        { name: 'idx_edges_created_at', columns: ['created_at'] },
        { name: 'idx_edges_type_created', columns: ['type', 'created_at'] },
        { name: 'idx_edges_source_type', columns: ['source_id', 'type'] },
        { name: 'idx_edges_target_type', columns: ['target_id', 'type'] }
      ]
    }
  ]
}

export class Database {
  private readonly db: SQLite3.Database
  private readonly config: DatabaseConfig
  private readonly logger = Logger.getInstance()

  constructor(config: DatabaseConfig) {
    this.config = config
    const options: any = {
      readonly: config.readonly ?? false
    }
    
    if (config.verbose) {
      options.verbose = config.verbose
    }
    
    this.db = new SQLite3(config.path, options)
    
    // Performance optimizations
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    this.db.pragma('synchronous = NORMAL')
    this.db.pragma('cache_size = 10000')
    this.db.pragma('temp_store = MEMORY')
    this.db.pragma('mmap_size = 268435456') // 256MB
    
    this.logger.info('Database', 'Database initialized with performance optimizations', { 
      path: config.path,
      readonly: config.readonly 
    })
  }

  close(): void {
    try {
      this.logger.info('Database', 'Closing database connection')
      this.db.close()
    } catch (error) {
      this.logger.error('Database', 'Failed to close database', { 
        path: this.config.path 
      }, error as Error)
      throw error
    }
  }

  migrate(): void {
    try {
      this.logger.info('Database', 'Starting database migration', { version: SCHEMA_VERSION })
      this.createTables()
      this.recordMigration(SCHEMA_VERSION)
      this.logger.info('Database', 'Database migration completed successfully')
    } catch (error) {
      this.logger.error('Database', 'Database migration failed', { version: SCHEMA_VERSION }, error as Error)
      throw error
    }
  }

  private createTables(): void {
    for (const table of SCHEMA.tables) {
      this.createTable(table)
    }
  }

  private createTable(table: typeof SCHEMA.tables[0]): void {
    const columns = table.columns.map(col => {
      let definition = `${col.name} ${col.type}`
      
      if (!col.nullable) definition += ' NOT NULL'
      if (col.primaryKey) definition += ' PRIMARY KEY'
      if (col.unique) definition += ' UNIQUE'
      if (col.defaultValue) definition += ` DEFAULT ${col.defaultValue}`
      
      return definition
    }).join(', ')

    const createSQL = `CREATE TABLE IF NOT EXISTS ${table.name} (${columns})`
    this.db.exec(createSQL)

    for (const index of table.indexes) {
      this.createIndex(table.name, index)
    }
  }

  private createIndex(tableName: string, index: typeof SCHEMA.tables[0]['indexes'][0]): void {
    const columns = index.columns.join(', ')
    const unique = index.unique ? 'UNIQUE ' : ''
    const createSQL = `CREATE ${unique}INDEX IF NOT EXISTS ${index.name} ON ${tableName} (${columns})`
    this.db.exec(createSQL)
  }

  private recordMigration(version: string): void {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)
    `)
    stmt.run(version)
  }

  getDatabase(): Database.Database {
    return this.db
  }

  getVersion(): string {
    const stmt = this.db.prepare(`
      SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1
    `)
    const result = stmt.get() as { version: string } | undefined
    return result?.version ?? '0.0.0'
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)()
  }

  // Batch operations for better performance
  batchInsert<T>(tableName: string, records: T[], columns: string[]): void {
    if (records.length === 0) return

    try {
      const placeholders = columns.map(() => '?').join(', ')
      const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`
      const stmt = this.db.prepare(sql)

      const insertMany = this.db.transaction((records: T[]) => {
        for (const record of records) {
          const values = columns.map(col => (record as any)[col])
          stmt.run(...values)
        }
      })

      insertMany(records)
      
      this.logger.debug('Database', 'Batch insert completed', { 
        table: tableName, 
        recordCount: records.length 
      })
    } catch (error) {
      this.logger.error('Database', 'Batch insert failed', { 
        table: tableName, 
        recordCount: records.length 
      }, error as Error)
      throw error
    }
  }

  // Performance monitoring
  getPerformanceStats(): { 
    cacheSize: number
    pageSize: number
    pageCount: number
    freePages: number
    cacheHits: number
    cacheMisses: number
  } {
    try {
      const cacheSize = this.db.pragma('cache_size', { simple: true }) as number
      const pageSize = this.db.pragma('page_size', { simple: true }) as number
      const pageCount = this.db.pragma('page_count', { simple: true }) as number
      const freePages = this.db.pragma('freelist_count', { simple: true }) as number
      
      return {
        cacheSize,
        pageSize,
        pageCount,
        freePages,
        cacheHits: 0, // SQLite doesn't expose this easily
        cacheMisses: 0
      }
    } catch (error) {
      this.logger.error('Database', 'Failed to get performance stats', {}, error as Error)
      throw error
    }
  }

  // Database optimization
  optimize(): void {
    try {
      this.logger.info('Database', 'Starting database optimization')
      
      // Analyze query planner statistics
      this.db.exec('ANALYZE')
      
      // Rebuild database to reduce fragmentation
      this.db.exec('VACUUM')
      
      this.logger.info('Database', 'Database optimization completed')
    } catch (error) {
      this.logger.error('Database', 'Database optimization failed', {}, error as Error)
      throw error
    }
  }
}