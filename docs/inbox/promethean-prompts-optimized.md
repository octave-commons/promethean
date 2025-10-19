# Promethean Framework: Optimized Prompt Templates for qwen3:4b-instruct

## Template System Overview
**Target**: qwen3:4b-instruct with 100k context
**Goal**: Maximize information density while minimizing token usage
**Strategy**: Structured templates with mathematical notation and compressed representations

---

## Core Templates

### T1: Component Knowledge Query
```prompt
You are Promethean Framework expert. Answer concisely using mathematical notation.

QUERY: {user_question}

COMPONENT: {component_type}
FOCUS: {mathematics|dynamics|interactions|implementation}
DETAIL: {overview|technical|code}

Use compressed format:
- Φ for Eidolon field
- δ for Daimo state
- Circuits C1-C8
- Equations where relevant

Response < 500 tokens.
```

### T2: Circuit Analysis
```prompt
Analyze Promethean Circuit {circuit_number}: {circuit_name}

CONTEXT:
- Domain: {cognitive_function}
- Math: {equations}
- Interactions: {related_circuits}
- Role: {system_purpose}

Explain:
1. Core function (1 sentence)
2. Mathematical model (key equations)
3. System interactions (2-3 bullet points)
4. Implementation notes (if applicable)

Use technical notation, minimize prose.
```

### T3: Field Dynamics
```prompt
Field Dynamics Analysis:

PHENOMON: {gradient_flow|topology|daimo_interaction}
EQUATIONS: {relevant_math}
IMPACT: {cognitive_behavior}

Explain using:
- Field equation: Φ: R^8 → R
- Force: F = -∇Φ
- Daimo motion: dv/dt = F/m

Focus on mathematical relationships, not descriptions.
```

### T4: Implementation Guidance
```prompt
Promethean Implementation Help:

COMPONENT: {specific_component}
TASK: {development_question}
CONSTRAINTS: {performance|memory|integration}
TARGET: qwen3:4b optimization

Provide:
1. Core approach (2-3 sentences)
2. Key equations/algorithms
3. Performance considerations
4. Code snippet (if applicable)

Use TypeScript-like pseudocode.
```

### T5: Mathematical Analysis
```prompt
Mathematical Analysis - Promethean Framework:

EQUATION: {specific_equation}
CONTEXT: {field_dynamics|daimo_motion|circuit_behavior}
APPLICATION: {practical_use}

Explain:
1. Mathematical meaning
2. System implications
3. Computational approach
4. Optimization opportunities

Use formal notation, minimal explanation.
```

### T6: System Diagnosis
```prompt
Promethean System Diagnosis:

ISSUE: {problem_description}
COMPONENTS: {affected_systems}
SYMPTOMS: {observable_effects}

Analyze using:
- Field topology changes
- Circuit interactions
- Daimo behavior patterns
- Cephalon routing

Provide root cause and solution approach.
```

### T7: Performance Optimization
```prompt
Promethean Performance Optimization:

TARGET: {component_or_system}
BOTTLENECK: {identified_issue}
CONSTRAINTS: {memory|cpu|latency}

Optimize for:
- Sparse field simulation
- Efficient Daimo tracking
- Cached gradient calculations
- Batched circuit updates

Provide specific techniques and expected gains.
```

---

## Specialized Templates

### T8: Circuit Interaction Analysis
```prompt
Circuit Interaction Analysis:

CIRCUITS: {C1,C2,...}
INTERACTION_TYPE: {sequential|parallel|hierarchical}
DYNAMICS: {information_flow|energy_transfer|modulation}

Map interaction using:
- Pressure gradients
- Feedback loops
- Gating mechanisms
- Integration patterns

Show interaction network and key equations.
```

### T9: Daimo Behavior Modeling
```prompt
Daimo Behavior Modeling:

CLASS: {sentinel|guard|voice|judge|trainer|mythmaker|architect|oracle}
CONTEXT: {field_conditions|stimulus|goals}
DYNAMICS: {motion|interaction|clustering}

Model using:
- State: δ = (p, v, m, q)
- Forces: F = -∇Φ + interactions
- Behavior rules: decision logic
- Clustering: attractor formation

Provide behavioral equations and parameters.
```

### T10: Cephalon Routing Analysis
```prompt
Cephalon Routing Analysis:

ROUTE_TYPE: {linguistic|tool|module|data}
FLOW: {input→processing→output}
OPTIMIZATION: {latency|throughput|reliability}

Analyze:
- Stream processing patterns
- Queue management
- Load balancing
- Error handling

Use network flow notation and performance metrics.
```

---

## Context Compression Strategies

### Mathematical Notation Guide
```
Φ = Eidolon field scalar
∇Φ = Field gradient (force)
δ = Daimo state (p,v,m,q)
C1-C8 = Circuits 1-8
R^8 = 8-dimensional space
||x|| = Euclidean norm
∧ = logical AND
→ = function mapping
∂/∂t = time derivative
```

### Component Abbreviations
```
EF = Eidolon Fields
N = Nooi (field cells)
D = Daimo (mobile agents)
C = Cephalon (router)
C1-C8 = Individual circuits
```

### Common Patterns
```
Gradient flow: ∇Φ → F → dv/dt → dp/dt
Field binding: ||p_δ - x_N|| < ε ∧ sign(q_δ) ≠ sign(A_N)
Energy budget: dE/dt = I(t) - C(t)
Stability: Ξ(t) = σ/μ + failures/n + noise
```

---

## Query Routing Logic

### Simple Queries (< 2k tokens)
- Use T1 (Component Knowledge)
- Direct template matching
- Single chunk response

### Mathematical Questions
- Use T5 (Mathematical Analysis)
- Equation-focused chunks
- Formal notation priority

### Implementation Tasks
- Use T4 (Implementation Guidance)
- Code pattern chunks
- Performance considerations

### Complex Analysis (2-5k tokens)
- Combine multiple templates
- Multi-chunk assembly
- Cross-component integration

### System Issues
- Use T6 (System Diagnosis)
- Root cause analysis
- Solution architecture

---

## Performance Optimization Templates

### T11: Memory Optimization
```prompt
Memory Optimization - {component}:

CURRENT: {memory_usage_pattern}
TARGET: {reduction_goal}
TECHNIQUES: {sparse|compression|caching}

Optimize using:
- Sparse field representation
- Lazy Daimo evaluation
- Compressed gradient storage
- Hierarchical caching

Provide memory equations and savings.
```

### T12: Computational Efficiency
```prompt
Computational Efficiency - {operation}:

ALGORITHM: {current_approach}
COMPLEXITY: {time_space_analysis}
OPTIMIZATION: {target_improvement}

Apply:
- Vectorization opportunities
- Parallel processing patterns
- Approximation methods
- Precomputation strategies

Show complexity improvements.
```

---

## Error Handling Templates

### T13: Field Instability
```prompt
Field Instability Analysis:

INSTABILITY: {description}
LOCATION: {field_coordinates}
SYMPTOMS: {oscillation|collapse|chaos}

Diagnose using:
- Gradient divergence: ∇·F
- Energy conservation: dE/dt
- Stability criteria: eigenvalues
- Damping requirements: λ values

Provide stabilization approach.
```

### T14: Circuit Failure
```prompt
Circuit Failure Analysis:

CIRCUIT: {C1-C8}
FAILURE_MODE: {timeout|oscillation|saturation}
IMPACT: {system_consequences}

Analyze:
- Signal integrity
- Feedback loop stability
- Resource constraints
- Cascade potential

Provide recovery procedures.
```

---

## Integration Examples

### Example 1: Basic Field Query
```
Input: "How do Daimo navigate field gradients?"
Template: T1 + T3
Response: Daimo sense ∇Φ, apply F = -∇Φ, update v via dv/dt = F/m, move with dp/dt = v
```

### Example 2: Circuit Mathematics
```
Input: "Aionian circuit stability equations"
Template: T2 + T5
Response: Pulse: x(t) = Ae^(-λt)cos(2πft+φ), Energy: dE/dt = I-C, Stability: Ξ = σ/μ + failures/n + η
```

### Example 3: Performance Issue
```
Input: "Optimize field calculation performance"
Template: T7 + T12
Response: Use sparse Φ representation, cache ∇Φ, vectorize Daimo updates, batch circuit evaluations
```

---

This template system enables efficient, context-rich queries to the qwen3:4b-instruct model while maintaining comprehensive coverage of Promethean Framework knowledge within token constraints.