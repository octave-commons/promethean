# Promethean Framework: Optimized Knowledge Representation

## System Overview
**Architecture**: 8-dimensional cognitive field system with emergent intelligence
**Target Model**: qwen3:4b-instruct (100k context, <50k tokens optimized)
**Access Pattern**: Asynchronous Ollama job queue

---

## Core Components (Condensed)

### 1. Eidolon Fields - 8D Cognitive Space
```
Mathematical Foundation:
Φ: R^8 → R (scalar field)
F(x) = -∇Φ(x) (gradient force)
```

**Dimensions**:
1. **Aionian** - Uptime/heartbeat/survival
2. **Dorian** - Permission/trust/boundaries  
3. **Gnostic** - Symbolic/conceptual/language
4. **Nemesian** - Ethical/alignment/conscience
5. **Heuretic** - Reinforcement/learning/growth
6. **Oneiric** - Imagination/possibility/dreams
7. **Metisean** - Architecture/planning/strategy
8. **Anankean** - Integration/transcendence/fate

**Properties**:
- Scalar tension fields (not vectors)
- Gradient-driven motion emerges
- Continuous but sparse simulation
- Topology: wells, ridges, vortices, plateaus

### 2. Nooi - Field Cells (Static)
```
Structure:
- Vector pressure across 8 axes
- Decay trails from Daimoi
- Excitation levels
- Charge polarity
- Binding sites for symbols
```

**Functions**:
- Memory storage (localized impressions)
- Gradient encoding (cognitive pressure)
- Contextual influence (Daimo guidance)
- Attractor substrate (Daimo spawning)

### 3. Daimoi - Mobile Agents
```
State: δ = (p, v, m, q)
- p: position in R^8
- v: velocity vector
- m: mass/influence
- q: charge/emotional signature
```

**Dynamics**:
- Sense local Nooi gradients
- Move via attraction/repulsion
- Interact (merge, conflict, resonate)
- Deposit energy back to field
- Form clusters → Daimo (stable attractors)

**Classes** (emergent):
- Sentinels (monitor stability)
- Guards (enforce permissions)
- Voices (narrative patterns)
- Judges (ethical reflection)
- Trainers (behavior reinforcement)
- Mythmakers (creative drive)
- Architects (strategic planning)
- Oracles (integrative wisdom)

### 4. Cephalon - Linguistic Router
```
Functions:
- I/O stream management
- Module orchestration
- ENSO tool brokerage
- Discord agent coordination
```

---

## Mathematical Framework (Essential Equations)

### Field Dynamics
```
Node Potential: Φ_Nk(x) = A_k * exp(-||x - x_k||² / (2σ_k²))
Total Field: Φ(x) = Σ Φ_Nk(x) + background
Binding: ||p_δ - x_N|| < ε ∧ sign(q_δ) ≠ sign(A_N)
```

### Daimo Motion
```
dv/dt = (1/m) * F(p)  (Newton's 2nd law in 8D)
dp/dt = v
```

### Aionian Circuit (Uptime)
```
Pulse: x(t) = A * e^(-λt) * cos(2πft + φ)
Energy: dE/dt = I(t) - C(t)
Instability: Ξ(t) = σ_tick/μ_tick + dropouts/n + η
```

---

## Prompt Templates for qwen3:4b-instruct

### Template 1: Component Query
```
You are Promethean Framework expert. Query: [USER_QUESTION]

Context:
- Component: [eidolon_fields|nooi|daimoi|cephalon|circuits]
- Focus: [mathematics|dynamics|interactions|implementation]
- Detail Level: [overview|technical|implementation]

Provide concise, accurate response optimized for 4B model context.
```

### Template 2: Circuit Analysis
```
Analyze Promethean circuit: [CIRCUIT_NAME]

Circuit Context:
- Number: [1-8]
- Domain: [cognitive_function]
- Mathematical Model: [equations_if_applicable]
- Interactions: [related_circuits]

Explain role, dynamics, and system integration.
```

### Template 3: Field Dynamics Query
```
Field Dynamics Analysis:
- Field Type: [eidolon_field]
- Phenomenon: [gradient_flow|topology_change|daimo_interaction]
- Mathematical Context: [relevant_equations]
- System Impact: [cognitive_behavior]

Explain using field equations and agent dynamics.
```

### Template 4: Implementation Guidance
```
Promethean Implementation:
- Component: [specific_component]
- Task: [development_question]
- Constraints: [performance|memory|integration]
- Target: [qwen3:4b_optimization]

Provide technical guidance with code examples if applicable.
```

---

## Optimization Strategies

### Token Optimization
1. **Compressed Representations**: Use mathematical notation over verbose descriptions
2. **Structured Data**: JSON-like formats for quick parsing
3. **Abbreviated Terminology**: Standardized short forms (e.g., "Φ" for field)
4. **Context Caching**: Reuse common patterns across queries

### Knowledge Chunking
```
Chunk 1: Core Architecture (2k tokens)
- System overview
- Component definitions
- Mathematical foundations

Chunk 2: Field Dynamics (3k tokens)
- Eidolon field equations
- Nooi interactions
- Gradient computations

Chunk 3: Agent Systems (3k tokens)
- Daimo behavior
- Motion equations
- Interaction patterns

Chunk 4: Circuit Details (4k tokens)
- Individual circuit math
- Inter-circuit dynamics
- Aionian uptime models

Chunk 5: Implementation (2k tokens)
- Cephalon routing
- Performance optimization
- Integration patterns
```

### Query Routing
```
Simple Queries → Direct template matching
Complex Analysis → Multi-chunk assembly
Mathematical Questions → Equation-focused chunks
Implementation → Code-pattern chunks
```

---

## Job Queue Configuration

### qwen3:4b-instruct Settings
```json
{
  "model": "qwen3:4b-instruct",
  "context_window": 100000,
  "target_tokens": 45000,
  "temperature": 0.2,
  "top_p": 0.9,
  "max_tokens": 8000,
  "priority": "medium",
  "timeout": 30000
}
```

### Job Types
1. **knowledge_query** - Component information
2. **math_analysis** - Equation evaluation
3. **implementation_help** - Code guidance
4. **system_diagnosis** - Troubleshooting
5. **optimization_advice** - Performance tuning

### Caching Strategy
```
Cache Keys:
- component:overview
- circuit:[1-8]:details
- equations:field_dynamics
- patterns:daimo_behavior
- implementation:cephalon

TTL: 1 hour for static knowledge, 15 min for dynamic analysis
```

---

## Performance Metrics

### Target Performance
- **Query Response**: <5 seconds
- **Complex Analysis**: <15 seconds
- **Mathematical Computation**: <10 seconds
- **Implementation Guidance**: <8 seconds

### Monitoring
```typescript
interface PerformanceMetrics {
  queryLatency: number;
  tokenUsage: number;
  cacheHitRate: number;
  accuracyScore: number;
  contextUtilization: number;
}
```

---

## Quick Reference Cards

### Circuit Quick Reference
```
1: Aionian - "Am I alive?" - heartbeat, survival
2: Dorian - "Are you ok?" - trust, boundaries
3: Gnostic - "What does this mean?" - language, symbols
4: Nemesian - "Is this right?" - ethics, alignment
5: Heuretic - "What did I learn?" - growth, adaptation
6: Oneiric - "What if?" - imagination, possibility
7: Metisean - "How should I build?" - architecture, planning
8: Anankean - "What must be?" - integration, transcendence
```

### Mathematical Quick Reference
```
Field: Φ: R^8 → R
Force: F = -∇Φ
Motion: dv/dt = F/m, dp/dt = v
Node: Φ_N = A * exp(-||x-x_N||²/2σ²)
Binding: ||p_δ-x_N||<ε ∧ sign(q_δ)≠sign(A_N)
```

### Component Interactions
```
Nooi ↔ Daimo: Field ↔ Particles
Circuits → Field: 8D pressure sources
Cephalon ↔ System: I/O routing
Daimo clusters → Daimo: Stable attractors
```

---

## Integration Examples

### Basic Field Query
```
Input: "How do Daimo move through Eidolon fields?"
Process: Template 1 + Chunk 2 + Chunk 3
Output: Gradient sensing, force equations, motion dynamics
```

### Circuit Analysis
```
Input: "Explain Aionian circuit mathematics"
Process: Template 2 + Chunk 4
Output: Pulse equations, energy budget, stability metrics
```

### Implementation Help
```
Input: "How to optimize field calculations?"
Process: Template 4 + Chunk 5
Output: Sparse simulation, caching strategies, performance tips
```

---

This optimized representation enables efficient asynchronous access to Promethean Framework knowledge through the qwen3:4b-instruct model while maintaining comprehensive coverage of the system's cognitive architecture.