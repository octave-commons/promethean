# Master Spec: UI Primitives Extraction

> *The corpus remembers what the library forgets. We remember the corpus.*

---

## Context

The codebase contains a rich corpus of React and Reagent UI components across multiple domains: Promethean, fork_tales, gates-of-aker, and open-hax. These codebases have independently developed repeating UI patterns that should be extracted into `orgs/open-hax/uxx/` for reuse.

Analysis report: `docs/reports/ui-pattern-extraction-analysis.md`

---

## Current State (2026-04-03)

| Pattern | Recurrence | Locations | In orgs/open-hax/uxx | Priority | Points | Status |
|---------|------------|-----------|----------------|----------|--------|--------|
| CollapsiblePanel | 8+ | gates-of-aker, fork_tales, promethean | **Yes** | HIGH | 5 | ✅ Done |
| KeyValueSection | 10+ | promethean, gates-of-aker, fork_tales | **Yes** | HIGH | 3 | ✅ Done |
| SearchableSelect | 4+ | open-hax, gates-of-aker | **Yes** | MEDIUM | 8 | ✅ Done |
| EntityCard | 12+ | All codebases | **Yes** (composition) | MEDIUM | 5 | ✅ Done |
| ProgressMeter | 8+ | fork_tales, gates-of-aker | **Enhanced** (Progress) | MEDIUM | 5 | ✅ Done |
| StatusBadge | 20+ | All codebases | **Enhanced** (Badge) | LOW | 2 | ✅ Done |

**Total Story Points: 28 (All Complete)**

---

## Target State (ACHIEVED)

### New Primitives in `orgs/open-hax/uxx/react/src/primitives/`

```
orgs/open-hax/uxx/react/src/primitives/
├── CollapsiblePanel.tsx    # ✅ CREATED
├── KeyValueSection.tsx     # ✅ CREATED
├── SearchableSelect.tsx    # ✅ CREATED
└── Progress.tsx            # ✅ ENHANCED (gradients, animations, segments)
```

### New Compositions in `orgs/open-hax/uxx/react/src/compositions/`

```
orgs/open-hax/uxx/react/src/compositions/
├── EntityCard.tsx          # ✅ CREATED
└── index.ts                # ✅ CREATED
```

### Enhanced Primitives

```
orgs/open-hax/uxx/react/src/primitives/
└── Badge.tsx               # ✅ ENHANCED (semantic variants, pulse, icons)
```

---

## Phased Approach

### Phase 1: Core Primitives (8 points)

**High-priority structural patterns with universal applicability.**

1. **KeyValueSection** (3 pts) - Label/value pairs in grid or vertical layout
2. **CollapsiblePanel** (5 pts) - Header with title, count, animated chevron, controlled/uncontrolled state

These are the most frequently repeated patterns and have no domain-specific dependencies. KeyValueSection is also a dependency for EntityCard.

### Phase 2: Interactive Primitives (13 points)

**Medium-priority patterns requiring more complex interaction logic.**

3. **SearchableSelect** (8 pts) - Input with dropdown suggestions, keyboard navigation, history
4. **ProgressMeter enhancements** (5 pts) - Gradient fills, animations, multi-segment bars

### Phase 3: Compositions & Enhancements (7 points)

**Domain-agnostic compositions built from primitives and small enhancements.**

5. **EntityCard** (5 pts) - Composition of Card + Badge + KeyValueSection + Button
6. **Badge enhancements** (2 pts) - Pulse animation, semantic variants, icons

---

## Spec Files

1. [collapsible-panel.spec.md](./collapsible-panel.spec.md) — **5 pts** — Extract CollapsiblePanel primitive
2. [key-value-section.spec.md](./key-value-section.spec.md) — **3 pts** — Extract KeyValueSection primitive
3. [MASTER.searchable-select.spec.md](./MASTER.searchable-select.spec.md) — **8 pts** — SearchableSelect epic
4. [progress-enhancement.spec.md](./progress-enhancement.spec.md) — **5 pts** — Enhance Progress with gradients and animations
5. [badge-enhancement.spec.md](./badge-enhancement.spec.md) — **2 pts** — Enhance Badge with pulse and semantic variants
6. [entity-card-composition.spec.md](./entity-card-composition.spec.md) — **5 pts** — Create EntityCard composition

### SearchableSelect Breakdown (8 pts total)

| Spec | Points | Priority | Dependencies |
|------|--------|----------|--------------|
| [searchable-select-core.spec.md](./searchable-select-core.spec.md) | 2 | HIGH | None |
| [searchable-select-keyboard.spec.md](./searchable-select-keyboard.spec.md) | 2 | HIGH | Core |
| [searchable-select-accessibility.spec.md](./searchable-select-accessibility.spec.md) | 2 | MEDIUM | Core, Keyboard |
| [searchable-select-recent.spec.md](./searchable-select-recent.spec.md) | 1 | LOW | Core |
| [searchable-select-highlight.spec.md](./searchable-select-highlight.spec.md) | 1 | LOW | Core |

---

## Token Alignment Strategy

The corpus uses a distinctive visual vocabulary (monokai-inspired gradients, glows). The extraction must:

1. **Support token references** - All colors, spacing, typography via `@open-hax/uxx/tokens`
2. **Allow custom overrides** - Preserve corpus visual identity through style props
3. **Document gradient patterns** - Extract common gradients as token extensions

### Proposed Token Extensions

```typescript
// orgs/open-hax/uxx/tokens/src/gradients.ts
export const gradients = {
  continuity: 'linear-gradient(90deg, rgba(102,217,239,0.92), rgba(166,226,46,0.86), rgba(174,129,255,0.72))',
  pressure: {
    click: 'linear-gradient(90deg, rgba(174,129,255,0.9), rgba(102,217,239,0.82))',
    file: 'linear-gradient(90deg, rgba(253,151,31,0.94), rgba(249,38,114,0.84))',
  },
  status: {
    success: 'linear-gradient(135deg, rgba(166,226,46,0.2), rgba(166,226,46,0.1))',
    warning: 'linear-gradient(135deg, rgba(253,151,31,0.2), rgba(253,151,31,0.1))',
    error: 'linear-gradient(135deg, rgba(249,38,114,0.2), rgba(249,38,114,0.1))',
  }
};
```

---

## Success Metrics

### Quantitative

- [x] All new primitives have Storybook stories
- [x] All new primitives have unit tests (≥80% coverage)
- [x] All new primitives have TypeScript types exported
- [ ] Reagent wrappers exist for all React primitives — future work
- [x] No increase in bundle size >5KB per primitive

### Qualitative

- [x] Each primitive has a single, clear responsibility
- [x] Primitives compose well with existing components
- [x] Visual identity of corpus codebases can be preserved
- [x] Documentation includes corpus usage examples

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Over-extraction | Focus on structural patterns first; domain-specific patterns stay in application code |
| Token fragmentation | Support both token-based styling and custom style overrides |
| React/Reagent divergence | Extract React first, then create idiomatic Reagent wrappers |
| Behavior drift | Comprehensive test coverage; visual regression tests via Storybook |
| Bundle size bloat | Tree-shakeable exports; side-effect free modules |

---

## References

- Analysis Report: `docs/reports/ui-pattern-extraction-analysis.md`
- Existing Primitives: `orgs/open-hax/uxx/react/src/primitives/`
- Token System: `orgs/open-hax/uxx/tokens/`
- Reagent Primitives: `orgs/open-hax/uxx/reagent/src/devel/ui/primitives/`

---

## Appendix: Corpus Pattern Signatures

### CollapsiblePanel

```tsx
const [isCollapsed, setIsCollapsed] = useState(false);
// Header with count
<strong>{title} ({items.length})</strong>
// Animated chevron
<span style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>▼</span>
// Conditional content
{!isCollapsed && <div>...</div>}
```

### KeyValueSection

```tsx
<div className="space-y-4">
  <div>
    <label className="text-sm font-medium">{key}</label>
    <p className="text-sm text-muted">{value}</p>
  </div>
</div>
```

### SearchableSelect

```tsx
<input
  value={input}
  onFocus={() => setShowSuggestions(true)}
  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
/>
{showSuggestions && (
  <div className="absolute z-10">
    {filteredSuggestions.map(s => <button>{s}</button>)}
  </div>
)}
```

### ProgressMeter

```tsx
<div className="h-2 rounded-full overflow-hidden bg-gray-200">
  <div
    style={{
      width: `${percent}%`,
      background: "linear-gradient(90deg, ...)"
    }}
  />
</div>
```

### EntityCard

```tsx
<article className="border rounded-2xl p-4 bg-gradient-to-br">
  <header>
    <strong>{entity.name}</strong>
    <StatusBadge variant={status} />
  </header>
  <KeyValueSection data={entity.metadata} />
  <footer>
    <Button>Primary</Button>
    <Button variant="ghost">Secondary</Button>
  </footer>
</article>
```
