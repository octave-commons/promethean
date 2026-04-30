#!/bin/bash
set -e

# For Atlas Local, we don't need replica set initialization
# Just ensure the app user and indexes exist

MONGODB_URI="mongodb://${MONGODB_ROOT_USERNAME}:${MONGODB_ROOT_PASSWORD}@mongodb:27017/?authSource=admin"

# Wait for MongoDB to be ready
for i in {1..30}; do
  if mongosh "$MONGODB_URI" --eval 'db.adminCommand("ping")' >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Try to create indexes, but don't fail if it doesn't work
mongosh "$MONGODB_URI" --eval '
db = db.getSiblingDB("admin");
try {
  db.auth(process.env.MONGODB_ROOT_USERNAME, process.env.MONGODB_ROOT_PASSWORD);
} catch (e) {}

var appDb = db.getSiblingDB(process.env.MONGODB_DB || "openplanner");

// Create collections if needed
try {
  ["events", "event_chunks", "graph_edges", "graph_semantic_edges", "graph_layout_overrides", "graph_node_embeddings", "gardens"].forEach(function(c) {
    try {
      if (!appDb.getCollectionNames().includes(c)) {
        appDb.createCollection(c);
      }
    } catch (e) {}
  });
} catch (e) {}

// Create indexes
try {
  if (!appDb.graph_layout_overrides.getIndexes().some(function(i) { return i.name === "node_id_1"; })) {
    appDb.graph_layout_overrides.createIndex({node_id: 1}, {unique: true});
  }
  appDb.graph_layout_overrides.createIndex({project: 1, updated_at: -1});
  appDb.graph_layout_overrides.createIndex({updated_at: -1});
  appDb.graph_layout_overrides.createIndex({layout_source: 1, updated_at: -1});
} catch (e) {}

print("Atlas Local initialization complete");
' || true

exit 0
