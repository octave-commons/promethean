#!/usr/bin/env bun
import { GraphRepository, KnowledgeGraphBuilder } from './index.js'
import { Database } from './database/memory-database.js'
import { join } from 'path'
import { cwd } from 'process'

const args = process.argv.slice(2)
const command = args[0]
const repositoryPath = args[1] || cwd()

async function main() {
  const dbPath = join(cwd(), 'knowledge-graph.db')
  const db = new Database({ path: dbPath, verbose: undefined })
  
  try {
    db.migrate()
    console.log('📊 Database initialized')
  } catch (error) {
    console.log('📊 Database already exists')
  }

  const repository = new GraphRepository(db)
  const builder = new KnowledgeGraphBuilder(repository)

  switch (command) {
    case 'build':
      console.log(`🏗️  Building knowledge graph for: ${repositoryPath}`)
      await builder.buildRepositoryGraph(repositoryPath)
      console.log('✅ Knowledge graph built successfully')
      break

    case 'file':
      const filePath = args[2]
      if (!filePath) {
        console.error('❌ Please provide a file path')
        process.exit(1)
      }
      console.log(`📄 Processing file: ${filePath}`)
      await builder.processFile(filePath, repositoryPath)
      console.log('✅ File processed successfully')
      break

    default:
      console.log(`
🧠 Knowledge Graph CLI

Usage:
  bun run cli.ts build [repository-path]  # Build knowledge graph for repository
  bun run cli.ts file <file-path>       # Process single file

Examples:
  bun run cli.ts build .
  bun run cli.ts file ./README.md
      `)
  }

  db.close()
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})