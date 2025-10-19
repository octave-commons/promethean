#!/usr/bin/env node

/**
 * Debug MongoDB Sessions Script
 *
 * This script checks what's actually in the MongoDB sessions collection
 */

import { MongoClient } from 'mongodb';

async function main() {
  console.log('🔍 Debugging MongoDB Sessions...\n');

  try {
    // Get MongoDB connection for direct access
    const mongoUri = process.env.MONGODB_URI || process.env.MCP_MONGO_URI;
    if (!mongoUri) {
      throw new Error('Neither MONGODB_URI nor MCP_MONGO_URI environment variables are set');
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const sessionsCollection = db.collection('sessions');

    console.log('📊 Total sessions count:');
    const totalCount = await sessionsCollection.countDocuments();
    console.log(`   ${totalCount}\n`);

    console.log('📋 Sample sessions (first 5):');
    const sessions = await sessionsCollection.find({}).limit(5).toArray();

    for (const session of sessions) {
      console.log(`\n📝 Session ID: ${session.id}`);
      console.log(`   _id: ${session._id}`);
      console.log(`   metadata:`, JSON.stringify(session.metadata, null, 2));
      if (session.text) {
        try {
          const parsed = JSON.parse(session.text);
          console.log(`   title: ${parsed.title}`);
          console.log(`   isAgentTask: ${parsed.isAgentTask}`);
        } catch (e) {
          console.log(`   text: (not parseable JSON)`);
        }
      }
    }

    console.log('\n🔍 Sessions with agent-related titles:');
    const agentSessions = await sessionsCollection
      .find({
        $or: [
          { text: { $regex: 'agent', $options: 'i' } },
          { text: { $regex: 'subagent', $options: 'i' } },
          { 'metadata.title': { $regex: 'agent', $options: 'i' } },
          { 'metadata.title': { $regex: 'subagent', $options: 'i' } },
        ],
      })
      .limit(3)
      .toArray();

    console.log(`   Found ${agentSessions.length} sessions with agent-related content\n`);

    for (const session of agentSessions) {
      console.log(`🤖 Agent Session: ${session.id}`);
      if (session.text) {
        try {
          const parsed = JSON.parse(session.text);
          console.log(`   title: ${parsed.title}`);
          console.log(`   isAgentTask: ${parsed.isAgentTask}`);
        } catch (e) {
          console.log(`   text preview: ${session.text.substring(0, 100)}...`);
        }
      }
      console.log(`   metadata.isAgentTask: ${session.metadata?.isAgentTask}`);
    }

    await client.close();
  } catch (error) {
    console.error('\n❌ Error during debug:', error);
    process.exit(1);
  }
}

main().catch(console.error);
