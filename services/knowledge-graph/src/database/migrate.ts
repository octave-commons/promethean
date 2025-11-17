#!/usr/bin/env bun
import { Database } from './database.js'
import { join } from 'path'
import { cwd } from 'process'

const dbPath = join(cwd(), 'knowledge-graph.db')
console.log('Database path:', dbPath)
const db = new Database({ path: dbPath, verbose: console.log })

console.log('🔄 Running database migration...')
console.log(`📁 Database path: ${dbPath}`)

try {
  const currentVersion = db.getVersion()
  console.log(`📊 Current version: ${currentVersion}`)
  
  db.migrate()
  
  const newVersion = db.getVersion()
  console.log(`✅ Migration complete. New version: ${newVersion}`)
} catch (error) {
  console.error('❌ Migration failed:', error)
  process.exit(1)
} finally {
  db.close()
}