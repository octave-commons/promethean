# Eta-Mu-Pi Charter

**Version**: 1.0.0
**Status**: Draft
**Purpose**: Constitutional layer for cognitive architectures, cephalon systems, and organizational philosophy.

---

## Overview

Eta-Mu-Pi (η-μ-Π) is a philosophical framework for understanding how meaning moves through systems. It describes cognition as beginning in **contact** rather than explanation, and action as the proving ground for knowledge.

The framework applies to:
- **Individual cognition**: How agents process signals they cannot yet name
- **Multi-agent systems**: How cephalons coordinate perception and action
- **Organizations**: How communities create and transmit meaning
- **Constitutional governance**: What principles govern autonomous systems

---

## Core Definitions

| Symbol | Name | Definition |
|--------|------|------------|
| **η** | Eta | That which affects an agent but is not yet understood by that agent |
| **μ** | Mu | That which an agent knows but cannot yet fully explain, while still being able to demonstrate it through action |
| **Π** | Pi | The result of actions taken under μ, including how those actions alter the η present in the minds of others |

### Plain Language

- **η**: What reaches me before I can name it
- **μ**: What I know in action before I can explain it
- **Π**: What my actions plant in the minds of others

---

## Axioms

### Axiom 1: Contact Precedes Understanding

All cognition begins in contact with η. The agent is first **affected** before it fully **understands**.

This is not a weakness—it is the fundamental condition of embedded intelligence.

### Axiom 2: Embodiment Precedes Articulation

μ is not reducible to verbal explanation. Some knowledge becomes real in action before it becomes explicit in language.

Embodied knowledge can be demonstrated before it can be stated.

### Axiom 3: Action is the Proving Ground

Action is where μ is tested. An agent demonstrates μ through consistent behavior, not elegant speech.

Judge μ by its consistency in action, not only by its elegance in expression.

### Axiom 4: Actions Reshape the Unknown

Π does not merely express knowledge—it reorganizes the unknown in other minds.

Action taken under μ changes the field of what others experience but may not yet understand.

### Axiom 5: The Loop Generates New Unknowns

Because Π changes what others feel but may not understand, Π generates new η downstream.

The full loop is: `η → μ → Π → η'`

---

## Process Model

### Basic Sequence

```
η ───→ μ ───→ Π
```

An agent is first affected by what it cannot understand, then stabilizes a demonstrable but only partly explicable orientation, then acts in ways that reshape the world and the minds of others.

### Deep Loop

```
η ───→ μ ───→ Π ───→ η'
 ↑                      │
 └──────────────────────┘
```

Because Π changes what others experience, Π generates new η in them, which eventually cycles back as new η in the original agent.

---

## Operating Principles

1. **Do not dismiss η merely because it is not yet explainable.**
   - Pressure, anomaly, signal, mystery are valid inputs before they are understood.

2. **Do not dismiss μ merely because it cannot yet be fully verbalized.**
   - Practiced truth has value even when its propositional form is incomplete.

3. **Judge μ by its consistency in action, not only by its elegance in speech.**
   - What an agent reliably does under μ is more important than what it claims.

4. **Judge Π by the transformations it causes in the surrounding field.**
   - Look at perception, behavior, and meaning changes in others—not just output volume.

5. **Treat explanation as downstream of contact and practice, not always prior to them.**
   - Verbal models serve action; they do not always precede it.

---

## Cephalon Application

Within a cephalon architecture, the framework maps as follows:

| Layer | Eta-Mu-Pi | Cephalon Role |
|-------|-----------|---------------|
| **Perception** | η | Incoming stream of external pressures, signals, anomalies, unresolved observations |
| **Cognition** | μ | Embodied policy layer, constitutional orientation, action-guiding invariants |
| **Action** | Π | Outward effects: messages, interventions, changes to other minds and environments |

The cephalon needs continuous external data (η) to avoid collapsing into self-referential loops. The constitutional layer (μ) governs how signals become actions. The action layer (Π) is what the system outputs and how that reshapes the world.

---

## Categorical Formalization

For systems that benefit from mathematical precision:

### Index Categories

- **J** = Perception category (structure of admissible inputs)
- **C** = Cognition category (internal semantic transformations)
- **A** = Action category (structure of outputs and effects)

### Functors

```
P : J → C     (perception functor)
E : C → A     (enactment functor)
F : A → J     (feedback functor)
```

### Composite Loop

```
L = E ∘ P : J → A    (the operative cephalon loop)
```

With feedback `F : A → J`, the full recurrent system becomes:

```
J ─→ P ─→ C ─→ E ─→ A ─→ F ─→ J
```

### Mapping to Symbols

- **η** = incoming region of J (unresolved inputs)
- **μ** = distinguished substructure of C (embodied action-guiding knowledge)
- **Π** = image of L in A (world-imprint of enacted cognition)

---

## Foundation Application

For organizational and governance contexts, the framework suggests:

### For Communities

- **η** = What the community experiences but cannot yet articulate
- **μ** = Shared practices, rituals, norms that work before they are explained
- **Π** = What the community's actions plant in the broader society

### For Governance

- Representation is power: communities need meaningful avenues of voice
- Sovereignty must be respected: distinct political entities have government-to-government relationships
- Partial justice is still worth winning: interim gains matter while pursuing fuller forms
- Material autonomy supports political autonomy: legal power needs resilient infrastructure
- Solidarity is not substitution: allies labor beside, not in place of

---

## Canonical Definition

> **A cephalon is a recurrent functorial system J → C → A → J, where J specifies the structure of perceived inputs, C organizes internal semantic and normative transformations, A contains enacted outputs, and η, μ, and Π denote respectively the unresolved incoming field, the embodied action-guiding substructure of cognition, and the world-imprint of enacted cognition.**

---

## References

- `research/eta-mu-pi-symbol-meanings.md` - Symbol definitions and epistemology
- `research/eta-mu-pi-formal-charter.md` - Axioms and process model
- `packages/cephalon-ts/docs/ARCHITECTURE.md` - Cephalon implementation