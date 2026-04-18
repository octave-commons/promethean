#!/usr/bin/env node
/**
 * Sintel Bluesky Analyzer
 * 
 * Connects to the AT Protocol firehose and analyzes Bluesky signals.
 * Demonstrates the perception layer feeding signals for analysis.
 */

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

import {
  BskyDiscovery,
  SignalAggregator,
  ExclusionPolicy,
  InMemoryExclusionStore,
  scoreDomain,
  type BskySignal,
} from '../index.js';

const args = process.argv.slice(2);
const command = args[0] || 'help';

// ============================================================================
// Commands
// ============================================================================

async function analyzeHandle(handle: string): Promise<void> {
  console.log(`\n🔍 Analyzing Bluesky handle: ${handle}`);
  console.log('─'.repeat(50));
  
  const discovery = new BskyDiscovery(1000);
  
  try {
    console.log('📡 Connecting to Bluesky firehose...');
    await discovery.start({ relay: 'wss://bsky.network' });
    
    // Wait for some signals
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const signals = discovery.getSignals(100);
    console.log(`\n📊 Collected ${signals.length} signals`);
    
    // Filter for handle
    const handleSignals = signals.filter(s => 
      s.author?.handle?.includes(handle.replace('@', '')) ||
      s.post?.text?.toLowerCase().includes(handle.replace('@', '').toLowerCase()) ||
      s.tags.some(t => t.includes(handle.replace('@', '')))
    );
    
    if (handleSignals.length > 0) {
      console.log(`\n🎯 Found ${handleSignals.length} signals for ${handle}:`);
      
      for (const signal of handleSignals.slice(0, 10)) {
        console.log(`\n  [${signal.type.toUpperCase()}] ${signal.author?.handle || 'unknown'}`);
        console.log(`  Strength: ${(signal.strength * 100).toFixed(0)}%`);
        console.log(`  Tags: ${signal.tags.join(', ')}`);
        if (signal.post?.text) {
          console.log(`  Text: ${signal.post.text.slice(0, 100)}...`);
        }
      }
    } else {
      console.log(`\n⚠️  No signals found for ${handle} in current buffer`);
      console.log('   Try a longer collection period or different handle.');
    }
    
    // Topic tracking
    console.log('\n📈 Topics tracked:');
    const topics = ['security', 'privacy', 'ai', 'code', 'development'];
    topics.forEach(t => discovery.trackTopic(t));
    console.log(`   ${topics.join(', ')}`);
    
  } finally {
    discovery.stop();
  }
}

async function firehose(duration: number = 30): Promise<void> {
  console.log(`\n🌊 Bluesky Firehose Monitor (${duration}s)`);
  console.log('─'.repeat(50));
  
  const discovery = new BskyDiscovery(5000);
  const stats = {
    posts: 0,
    reposts: 0,
    likes: 0,
    follows: 0,
    mentions: 0,
  };
  
  try {
    console.log('📡 Connecting to wss://bsky.network...');
    await discovery.start({
      relay: 'wss://bsky.network',
      onReconnect: () => console.log('🔄 Reconnecting...'),
    });
    
    console.log('✅ Connected! Listening for events...\n');
    
    // Collect for duration
    const startTime = Date.now();
    const durationMs = duration * 1000;
    
    while (Date.now() - startTime < durationMs) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const signals = discovery.getSignals(100);
      
      for (const signal of signals) {
        switch (signal.type) {
          case 'post':
            stats.posts++;
            if (signal.post?.text?.includes('@')) stats.mentions++;
            break;
          case 'repost':
            stats.reposts++;
            break;
          case 'like':
            stats.likes++;
            break;
          case 'follow':
            stats.follows++;
            break;
        }
      }
      
      // Progress
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      process.stdout.write(`\r⏱️  ${elapsed}s | Posts: ${stats.posts} | Reposts: ${stats.reposts} | Likes: ${stats.likes} | Follows: ${stats.follows}   `);
    }
    
    console.log('\n\n📊 Final Statistics:');
    console.log(`   Total Posts: ${stats.posts}`);
    console.log(`   Total Reposts: ${stats.reposts}`);
    console.log(`   Total Likes: ${stats.likes}`);
    console.log(`   Total Follows: ${stats.follows}`);
    console.log(`   Mentions: ${stats.mentions}`);
    
    // Signal analysis
    const allSignals = discovery.getSignals(500);
    console.log(`\n🔍 Signal Buffer Analysis (${allSignals.length} signals):`);
    
    // Top tags
    const tagCounts: Record<string, number> = {};
    for (const s of allSignals) {
      for (const tag of s.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    if (topTags.length > 0) {
      console.log('\n   Top Tags:');
      topTags.forEach(([tag, count]) => {
        console.log(`     #${tag}: ${count}`);
      });
    }
    
    // Strength distribution
    const strengths = allSignals.map(s => s.strength);
    const avgStrength = strengths.reduce((a, b) => a + b, 0) / strengths.length;
    const maxStrength = Math.max(...strengths);
    const minStrength = Math.min(...strengths);
    
    console.log(`\n   Signal Strength:`);
    console.log(`     Average: ${(avgStrength * 100).toFixed(1)}%`);
    console.log(`     Range: ${(minStrength * 100).toFixed(1)}% - ${(maxStrength * 100).toFixed(1)}%`);
    
  } finally {
    discovery.stop();
    console.log('\n👋 Disconnected from firehose');
  }
}

async function topics(topicList: string[]): Promise<void> {
  console.log(`\n🎯 Bluesky Topic Tracker`);
  console.log('─'.repeat(50));
  console.log(`Topics: ${topicList.join(', ')}`);
  console.log('');
  
  const discovery = new BskyDiscovery(2000);
  
  try {
    console.log('📡 Connecting to wss://bsky.network...');
    await discovery.start({ relay: 'wss://bsky.network' });
    console.log('✅ Connected!\n');
    
    // Track topics
    for (const topic of topicList) {
      discovery.trackTopic(topic);
    }
    
    // Monitor for 60 seconds
    console.log('👀 Monitoring for 60 seconds...\n');
    
    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      process.stdout.write(`\r⏱️  ${i + 1}s `);
      
      // Check each topic
      for (const topic of topicList) {
        const tracker = discovery.getTopicSignals(topic);
        if (tracker && tracker.signals.length > 0) {
          const recent = tracker.signals.filter(s => 
            Date.now() - new Date(s.observedAt).getTime() < 5000
          ).length;
          
          if (recent > 0) {
            process.stdout.write(`| ${topic}: ${recent} `);
          }
        }
      }
    }
    
    console.log('\n\n📈 Topic Summary:');
    
    for (const topic of topicList) {
      const tracker = discovery.getTopicSignals(topic);
      if (tracker) {
        console.log(`\n   ${topic}:`);
        console.log(`     Signals: ${tracker.signals.length}`);
        console.log(`     Strength: ${(tracker.combinedStrength * 100).toFixed(1)}%`);
        console.log(`     Unique Authors: ${tracker.uniqueAuthors}`);
      }
    }
    
  } finally {
    discovery.stop();
    console.log('\n👋 Done');
  }
}

function help(): void {
  console.log(`
Sintel Bluesky Analyzer - AT Protocol Signal Intelligence

Usage: sintel-bsky <command> [options]

Commands:
  handle <handle>      Analyze a specific Bluesky handle
  firehose [seconds]  Monitor the firehose for N seconds (default: 30)
  topics <topic...>   Track specific topics for 60 seconds
  help                Show this help

Examples:
  sintel-bsky handle @user.bsky.social
  sintel-bsky firehose 60
  sintel-bsky topics security privacy ai

The firehose command connects to the AT Protocol relay and collects
real-time social signals including posts, reposts, likes, and follows.

The topics command tracks specific hashtags or keywords and shows
signal strength over time.
`);
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  switch (command) {
    case 'handle':
      if (!args[1]) {
        console.error('Error: Please provide a handle');
        console.log('Usage: sintel-bsky handle @user.bsky.social');
        process.exit(1);
      }
      await analyzeHandle(args[1]);
      break;
    
    case 'firehose':
      await firehose(args[1] ? parseInt(args[1]) : 30);
      break;
    
    case 'topics':
      if (args.length < 2) {
        console.error('Error: Please provide at least one topic');
        console.log('Usage: sintel-bsky topics security privacy ai');
        process.exit(1);
      }
      await topics(args.slice(1));
      break;
    
    case 'help':
    default:
      help();
      break;
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});