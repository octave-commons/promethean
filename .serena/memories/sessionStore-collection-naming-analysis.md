# SessionStore Collection Naming Analysis

## Issue Summary
The sessionStore.getMostRecent(1) returns 1 item even after clearing the `test_agent_sessionStore` collection because the sessionStore is actually reading from a different collection than expected.

## Root Cause: Collection Alias System

### Collection Naming Logic
1. **Base naming**: `${AGENT_NAME}_${storeName}` (e.g., `test_agent_sessionStore`)
2. **MongoDB collection**: Always uses the base name (`family`) - line 62 in dualStore.ts
3. **ChromaDB collection**: Uses `alias?.target || family` - line 58 in dualStore.ts

### The Problem
If there's an alias entry in the `collection_aliases` collection for `_id: "test_agent_sessionStore"`, then:
- MongoDB reads from: `test_agent_sessionStore` 
- ChromaDB reads from: `alias.target` (different collection)

But the `getMostRecent()` method in DualStoreManager queries MongoDB (line 148-149 in dualStore.ts), so it should be using the correct collection.

### Actual Issue: Environment Variable Timing
Looking at the test file and stores.ts, the real issue is likely:

1. **stores.ts line 26**: "Create stores lazily to ensure AGENT_NAME is set when tests run"
2. **sessionStore proxy**: Creates the store on first access via `createStoreProxy()`
3. **initializeStores()**: Called in test.before() to create collections
4. **Environment timing**: AGENT_NAME might not be set when the DualStoreManager.create() is called

### Collection Creation Flow
1. `initializeStores()` → `contextStore.getOrCreateCollection('sessionStore')`
2. → `DualStoreManager.create('sessionStore', 'text', 'timestamp')`
3. → `family = '${AGENT_NAME}_sessionStore'`
4. If AGENT_NAME is not set correctly, this becomes `'duck_sessionStore'`

### Verification Steps
1. Check AGENT_NAME value when DualStoreManager.create() is called
2. Check if there are aliases in collection_aliases for the sessionStore
3. Verify the actual collection name used by the sessionStore instance

### Solution
Ensure AGENT_NAME environment variable is set before any store initialization occurs in tests.