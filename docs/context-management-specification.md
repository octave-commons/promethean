# Context Management Specification

## Overview

This specification defines the standardized approach to context management across all Promethean agent-based systems. The core principle combines **recency-based retrieval** with **semantic vector search** using a dual-store architecture (MongoDB + ChromaDB), ensuring no loss of contextual information while providing intelligent context compilation.

## Problems with Current AI Context Management

Most AI tools handle context poorly:
- **Linear accumulation**: Simply adding to conversation history without intelligent filtering
- **Lossy compression**: Automatic compaction that permanently loses important context
- **No semantic retrieval**: Unable to find relevant information from past interactions
- **Fixed context windows**: Limited to recent messages regardless of relevance

## Promethean Solution: Dual Store + Active/Passive Management

### Core Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Context       │    │   DualStore      │    │   ChromaDB      │
│   Store         │◄──►│   Manager        │◄──►│   Vector Store  │
│                 │    │                  │    │                 │
│ - compileContext│    │ - MongoDB Store  │    │ - Semantic      │
│ - Collections   │    │ - Exact Retrieval│    │   Search        │
│ - Recency +     │    │ - Metadata       │    │ - Embeddings    │
│   Semantic      │    │ - Timestamps     │    │ - Similarity    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Components

#### 1. ContextStore Class
- **Collections**: Manages multiple context collections per agent
- **compileContext()**: Intelligent context compilation combining recency + semantic search
- **Retrieval strategies**: Recent documents, semantic relevance, hybrid approaches

#### 2. DualStoreManager  
- **MongoDB**: Exact document storage with full metadata preservation
- **ChromaDB**: Vector embeddings for semantic similarity search
- **Dual writes**: Synchronized storage across both systems
- **Fallback**: Graceful degradation when one store is unavailable

#### 3. Context Compilation Algorithm
```typescript
async compileContext(options: {
  texts: string[]           // Current queries/conversation
  recentLimit: number       // Most recent N items
  queryLimit: number        // Items for semantic query
  limit: number            // Final context limit
}): Promise<Message[]>
```

**Process:**
1. Get recent N documents (recency-based)
2. Use recent + current queries for semantic search
3. Combine results, deduplicate, sort by timestamp
4. Return formatted messages with proper role attribution

## Active Context Management

### Real-time Operations
- **Automatic context compilation** before LLM calls
- **Conversation persistence** with proper metadata
- **Multi-collection support** (transcripts, agent_messages, etc.)
- **Cross-session continuity** through persistent storage

### Active Tooling
```typescript
// Real-time context retrieval
const context = await contextStore.compileContext({
  texts: [currentQuery],
  recentLimit: 10,
  queryLimit: 5,
  limit: 20
});

// Store new interaction
await contextStore.getCollection('agent_messages').insert({
  text: agentResponse,
  metadata: { userName: 'Agent', isThought: false }
});
```

## Passive Context Management

### Background Processes
- **Embedding pipeline**: Automatic vector generation for new content
- **Cleanup and maintenance**: Orphaned document removal
- **Index optimization**: Periodic reindexing for performance
- **Health monitoring**: Store synchronization verification

### Passive Features
- **Automatic metadata enrichment** (timestamps, user attribution)
- **Semantic clustering**: Grouping similar content
- **Context aging**: Gradual relevance decay
- **Storage optimization**: Compression and archiving

## Agent Integration Patterns

### Standard Agent Context Flow
```typescript
class StandardAgent {
  private contextStore: ContextStore;
  
  async initialize() {
    this.contextStore = new ContextStore();
    await this.contextStore.createCollection('interactions', 'text', 'timestamp');
    await this.contextStore.createCollection('transcripts', 'text', 'createdAt');
  }
  
  async process(input: string): Promise<string> {
    // 1. Compile relevant context
    const context = await this.contextStore.compileContext({
      texts: [input],
      recentLimit: 15,
      queryLimit: 7,
      limit: 25
    });
    
    // 2. Generate response using context
    const response = await this.llm.generate(input, context);
    
    // 3. Store interaction for future retrieval
    await this.contextStore.getCollection('interactions').insert({
      text: response,
      metadata: { 
        userName: this.agentName,
        isThought: false,
        inResponseTo: input
      }
    });
    
    return response;
  }
}
```

### Collection Types by Agent
- **Cephalon**: `agent_messages`, `transcripts`, `thoughts`
- **SmartGPT Bridge**: `queries`, `responses`, `tool_calls`
- **Discord**: `messages`, `embeddings`, `interactions`
- **Generic Agents**: `interactions`, `context`, `metadata`

## Configuration and Environment

### Required Environment Variables
```bash
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017

# ChromaDB Configuration  
CHROMA_URL=http://localhost:8000
EMBEDDING_DRIVER=ollama
EMBEDDING_FUNCTION=nomic-embed-text

# Dual Store Configuration
DUAL_WRITE_ENABLED=true
AGENT_NAME=<agent_identifier>
```

### Collection Aliases
```typescript
interface CollectionAlias {
  _id: string;           // agent_collection_name
  target: string;        // actual Chroma collection
  embed: {
    driver: string;      // ollama, openai, etc.
    fn: string;          // embedding model
  };
}
```

## Performance and Scaling

### Optimization Strategies
- **Lazy loading**: Initialize collections on first use
- **Batch operations**: Bulk inserts and queries
- **Caching**: In-memory caching of recent context
- **Connection pooling**: Reuse database connections
- **Query optimization**: Efficient indexing strategies

### Monitoring Metrics
- **Context compilation latency**
- **Store synchronization health**
- **Embedding generation throughput**
- **Query performance (recency vs semantic)**
- **Storage utilization**

## Migration Strategy

### For Existing Agents
1. **Audit current context handling**
2. **Create ContextStore instance**
3. **Migrate existing data to dual store**
4. **Replace naive context with compileContext()**
5. **Add automated tests for context retrieval**

### Backward Compatibility
- **Legacy API support**: Maintain existing interfaces during transition
- **Gradual migration**: Support both old and new context methods
- **Data migration tools**: Scripts to move from file-based to dual-store
- **Rollback procedures**: Ability to revert if issues arise

## Testing and Validation

### Unit Tests
- **Context compilation accuracy**
- **Store synchronization** 
- **Metadata preservation**
- **Query result relevance**

### Integration Tests
- **Multi-agent context sharing**
- **Cross-store consistency**
- **Performance under load**
- **Error handling and recovery**

### Quality Metrics
- **Context relevance scores**
- **Information retention rate**
- **Query latency percentiles**
- **Storage efficiency**

## Future Enhancements

### Advanced Features
- **Hierarchical context**: Nested context structures
- **Context summarization**: AI-powered context compression
- **Cross-agent context**: Shared knowledge between agents
- **Temporal context**: Time-aware context retrieval
- **Multimodal context**: Image, audio, and video support

### Research Directions
- **Dynamic context windows**: Adaptive sizing based on content
- **Context importance scoring**: ML-based relevance ranking
- **Distributed context**: Multi-node context synchronization
- **Real-time collaboration**: Concurrent context updates

## Implementation Checklist

### Required Components
- [ ] ContextStore integration in all agents
- [ ] DualStore collection setup
- [ ] Embedding pipeline configuration
- [ ] Context compilation in LLM calls
- [ ] Metadata enrichment for all entries

### Optional Enhancements
- [ ] Background embedding jobs
- [ ] Context health monitoring
- [ ] Performance optimization
- [ ] Advanced query strategies
- [ ] Cross-agent context sharing

---

This specification provides the foundation for implementing "Chromega Agents" - AI systems with sophisticated context management that never loses valuable information while maintaining intelligent, semantically-aware context retrieval across all Promethean agent-based systems.