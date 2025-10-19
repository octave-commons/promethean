#!/bin/bash

# Simple ClojureScript build using JVM with proper flags
cd /home/err/devel/promethean/packages/opencode-unified

echo "Building ClojureScript with optimized JVM settings..."

# Use more conservative settings
JAVA_OPTS="-Xms512m -Xmx2g -Xss1m -XX:+UseG1GC -XX:ParallelGCThreads=2 -XX:ConcGCThreads=1"

# Try compilation with reduced parallelism
export JAVA_OPTS
echo "Using JAVA_OPTS: $JAVA_OPTS"

# Clean first
rm -rf .shadow-cljs dist

# Try compile with single thread
npx shadow-cljs --config-merge '{:compiler-options {:parallel-builds 1}}' compile app