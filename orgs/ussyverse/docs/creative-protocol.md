# Creative Protocol

**Version**: 0.1.0
**Status**: World Building
**Purpose**: Define the creative constraints, output contract, and cycle shape for Fork Tales creative work.

---

## Constraints

**MUST NOT**:
- Use real author names in output

**SHOULD**:
- Encode author and inspiration directly into style description

**ALWAYS**:
- All work is ShareAlike Creative Commons

---

## Creative Loop

Output is any combination of reasonable bounds (max dice rolls: 15):

### Output Types

| Type | Description |
|------|-------------|
| `zip` | Called `ημ_op_mf_part_<n>.zip` containing session artifacts |
| `Lyrics` | New song lyrics |
| `Song` | `eta_mu_<song_name>.part_<n>.(mp3|wav)` |
| `Sound` | World sounds, music, tunes, voices |
| `World state update` | Changes to canonical state |
| `#fnord` | Fnord tag |
| `Constraints` | Add/adjust constraints (never remove, only disable) |
| `Dialog` | Paragraph of dialog |
| `Cover art` | Visual for a song |
| `Story board` | Visual story sequence |
| `Story Artifacts` | Narrative elements |
| `World Lore` | Canon additions |
| `Gates of Truth` | System announcement |
| `Fork tax` | Pay fork tax, perform session handoff |

### Dice Mechanics

- Maximum dice rolls per cycle: 15
- Constraints are additive until world is over limit
- Then documents get consolidated
- Things are never forgotten, just less remembered

---

## Zip Naming Convention

```
ημ_op_mf_part_<n>.zip
```

Where:
- `ημ` = Eta-Mu prefix
- `op` = Operation
- `mf` = Mindfuck
- `part_<n>` = Part number in sequence

---

## Constraint Protocol

Constraints follow specific rules:

1. **Additive**: New constraints can always be added
2. **Disable, don't remove**: Constraints are never deleted, only disabled
3. **Consolidate at limit**: When constraints exceed threshold, consolidate into fewer, stronger constraints
4. **Preserve provenance**: Track which constraints came from which part

```typescript
interface Constraint {
  id: string;
  text: string;
  source: string;  // Which part/zip added it
  active: boolean;
  disabled_by?: string;  // Why it was disabled
}
```

---

## Session Handoff Protocol

When context needs compression:

1. **Pay fork tax**: Commit current state
2. **Generate handoff document**: Key decisions, state changes, open questions
3. **Create zip**: Package artifacts
4. **Start fresh**: New session can load handoff document

---

## World State Management

World state updates follow:

1. **Additive updates**: New elements can always be added
2. **Retcon protocol**: If changes conflict, newer takes precedence
3. **Provenance tracking**: Every update has source and timestamp
4. **Consolidation**: Periodic merges reduce redundancy

```typescript
interface WorldState {
  elements: Map<string, WorldElement>;
  timeline: TimelineEvent[];
  constraints: Constraint[];
  provenance: Map<string, Source>;
}
```

---

## Music Generation Philosophy

From the creative protocol:

> "Music is a technology"
> "Why we write music: To transform generational trauma into force"

Music generation includes:
- Tones, math, sine waves
- More creative ways of generating music with Python
- Genre style extraction and encoding
- Lyric rhythm matching

---

## Gates of Truth Announcements

System announcements follow:

```
GATES OF TRUTH // <announcement>
<content>
END TRANSMISSION
```

These are canonical updates that modify world state or constraints.

---

## Example Creative Cycle

```
Cycle 1:
- Dice roll: World state update (new location)
- Dice roll: Dialog (character introduction)
- Dice roll: Constraints (add: "no magic in this region")
- Dice roll: World lore (location history)

Cycle 2:
- Dice roll: Lyrics (song for location)
- Dice roll: Cover art (visual for song)
- Dice roll: #fnord (hidden reference)

Cycle 3:
- Dice roll: Fork tax (context getting full)
- Zip: ημ_op_mf_part_3.zip
- Handoff document created
```

---

## References

- `research/creative-protocol-manifest.md` - Original creative constraints
- `orgs/ussyverse/docs/eta-mu-pi-charter.md` - Philosophical framework