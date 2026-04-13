# UI Pattern Extraction Analysis

**Date:** 2026-04-03  
**Scope:** `orgs/octave-commons/promethean`, `orgs/open-hax/openhax`, `orgs/octave-commons/fork_tales`, `orgs/octave-commons/gates-of-aker`  
**Target:** `orgs/open-hax/uxx` (React + Reagent)

---

## Signal

### Patterns Found (Ranked by Recurrence)

| Pattern | Recurrence | Locations | Priority |
|---------|------------|-----------|----------|
| **CollapsiblePanel** | 8+ | gates-of-aker (EventFeed, LedgerPanel), fork_tales (Chat minimal mode), promethean (kanban panels) | **HIGH** |
| **EntityCard** | 12+ | gates-of-aker (AgentCard), promethean (ActorDetail), open-hax (issue-item, pr-item, worktree-item) | **HIGH** |
| **StatusBadge** | 20+ | Every repo, every panel | **HIGH** |
| **KeyValueSection** | 10+ | promethean (ActorDetail), gates-of-aker (AgentCard), fork_tales (VitalsPanel) | **MEDIUM** |
| **ProgressMeter** | 8+ | fork_tales (VitalsPanel continuity), gates-of-aker (AgentCard needs) | **MEDIUM** |
| **EventFeed** | 6+ | gates-of-aker (EventFeed, TraceFeed), open-hax (events-log), fork_tales (Chat messages) | **MEDIUM** |
| **SearchableSelect** | 4+ | open-hax (repo-controls), gates-of-aker (LedgerPanel filters) | **MEDIUM** |
| **PresenceIndicator** | 4+ | fork_tales (VitalsPanel, Chat), gates-of-aker (StatusBar) | **LOW** |
| **EntityList** | 6+ | open-hax (issues-section, prs-section), gates-of-aker (AgentList) | **MEDIUM** |

---

## Evidence

### 1. CollapsiblePanel

**Found in:**
- `gates-of-aker/web/src/components/EventFeed.tsx` - `collapsible` prop with chevron rotation
- `gates-of-aker/web/src/components/LedgerPanel.tsx` - collapsible header with stats
- `fork_tales/part64/frontend/src/components/Panels/Chat.tsx` - minimal mode collapse
- `promethean/packages/frontend/src/kanban/cljs/components.cljs` - panel collapse pattern

**Pattern signature:**
```tsx
// Shared pattern across all instances
const [isCollapsed, setIsCollapsed] = useState(false);
// Chevron rotation animation
transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)"
// Header with count
<strong>{title} ({items.length})</strong>
// Conditional content render
{!isCollapsed && <div>...</div>}
```

**Missing from orgs/open-hax/uxx:** No CollapsiblePanel or Accordion component.

---

### 2. EntityCard

**Found in:**
- `gates-of-aker/web/src/components/AgentCard.tsx` - agent with status, needs, stats, relationships
- `promethean/packages/frontend/src/pantheon/pages/ActorDetail.tsx` - actor with config, logs
- `open-hax/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs` - issue-item, pr-item, worktree-item
- `fork_tales/part64/frontend/src/components/Panels/Vitals.tsx` - entity cards with vitals

**Pattern signature:**
```tsx
// Common structure
<article className="border rounded-2xl p-4 bg-gradient-to-br ...">
  <header>
    <strong>{entity.name}</strong>
    <StatusBadge variant={status} />
  </header>
  <KeyValueSection data={entity.metadata} />
  <footer>
    <Button>Primary Action</Button>
    <Button variant="ghost">Secondary</Button>
  </footer>
</article>
```

**Key sub-patterns:**
- Header with title + status badge
- Key-value metadata section
- Action buttons in footer
- Gradient background variants
- Hover states for interactivity

**Missing from orgs/open-hax/uxx:** Card exists but lacks entity-specific structure (header/footer pattern is generic, not entity-optimized).

---

### 3. StatusBadge

**Found in:** Every single codebase examined.

**Pattern signature:**
```tsx
// Universal pattern
<span className="px-2 py-1 text-xs font-semibold rounded-full">
  {status}
</span>

// With dot indicator
{dot && <span className="w-2 h-2 rounded-full bg-green-500" />}
{children}
```

**Variant colors observed:**
- `success/open/alive` → green
- `warning/degraded` → amber/orange
- `error/dead/closed` → red
- `info/default` → blue/gray
- `merged` → purple (open-hax PR state)

**Existing in orgs/open-hax/uxx:** `Badge.tsx` exists with variants. However, the dot indicator pattern is underused.

---

### 4. KeyValueSection

**Found in:**
- `promethean/packages/frontend/src/pantheon/pages/ActorDetail.tsx` - "Actor Information", "Configuration"
- `gates-of-aker/web/src/components/AgentCard.tsx` - needs, stats, inventory display
- `fork_tales/part64/frontend/src/components/Panels/Vitals.tsx` - vitals metadata

**Pattern signature:**
```tsx
<div className="space-y-4">
  <div>
    <label className="text-sm font-medium">Key</label>
    <p className="text-sm text-muted">{value}</p>
  </div>
  // ...repeat
</div>
```

**Missing from orgs/open-hax/uxx:** No dedicated KeyValueSection or DescriptionList component.

---

### 5. ProgressMeter

**Found in:**
- `fork_tales/part64/frontend/src/components/Panels/Vitals.tsx` - continuity line, click pressure
- `gates-of-aker/web/src/components/AgentCard.tsx` - needs bars (mood, social, food, sleep, warmth)
- `fork_tales/part64/frontend/src/components/Panels/Chat.tsx` - continuity percent bars

**Pattern signature:**
```tsx
<div className="h-2 rounded-full overflow-hidden bg-gray-200">
  <div
    className="h-full transition-[width] duration-1000"
    style={{
      width: `${percent}%`,
      background: "linear-gradient(90deg, ...)"
    }}
  />
</div>
<span className="text-xs">{percent}%</span>
```

**Existing in orgs/open-hax/uxx:** `Progress.tsx` exists but is linear and basic. Missing:
- Gradient fills
- Animated transitions
- Multi-segment bars
- Pressure/continuity variants

---

### 6. EventFeed

**Found in:**
- `gates-of-aker/web/src/components/EventFeed.tsx` - generic event feed with EventCard
- `gates-of-aker/web/src/components/TraceFeed.tsx` - trace-specific feed
- `open-hax/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs` - events-log
- `fork_tales/part64/frontend/src/components/Panels/Chat.tsx` - message feed

**Pattern signature:**
```tsx
<div className="max-h-[300px] overflow-y-auto border rounded-lg">
  <header>
    <strong>{title} ({events.length})</strong>
  </header>
  {[...events].reverse().map(event => (
    <EventCard key={event.id} event={event} />
  ))}
</div>
```

**Existing in orgs/open-hax/uxx:** `Feed.tsx` exists with timeline/cards/list/compact variants. This is well-covered.

---

### 7. SearchableSelect

**Found in:**
- `open-hax/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs` - repo-controls with suggestions dropdown
- `gates-of-aker/web/src/components/LedgerPanel.tsx` - event type filter, sort by

**Pattern signature:**
```tsx
const [showSuggestions, setShowSuggestions] = useState(false);
const [input, setInput] = useState("");

<input
  value={input}
  onFocus={() => setShowSuggestions(true)}
  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
  onChange={e => setInput(e.target.value)}
/>
{showSuggestions && filteredSuggestions.length > 0 && (
  <div className="absolute z-10 ...">
    {filteredSuggestions.map(s => (
      <button onClick={() => select(s)}>{s}</button>
    ))}
  </div>
)}
```

**Missing from orgs/open-hax/uxx:** No SearchableSelect or Combobox component.

---

### 8. PresenceIndicator

**Found in:**
- `fork_tales/part64/frontend/src/components/Panels/Vitals.tsx` - witness thread continuity
- `fork_tales/part64/frontend/src/components/Panels/Chat.tsx` - muse presence indicators
- `gates-of-aker/web/src/components/StatusBar.tsx` - health indicator

**Pattern signature:**
```tsx
// Continuity/pressure indicator
<div className="rounded-md border px-3 py-2">
  <p className="text-xs uppercase">continuity index</p>
  <p className="text-sm font-semibold">{percent}%</p>
  <div className="h-1.5 rounded overflow-hidden bg-gray-200">
    <div style={{ width: `${percent}%`, background: gradient }} />
  </div>
</div>

// Presence dot
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-green-500" />
  <span>Connected</span>
</div>
```

**Missing from orgs/open-hax/uxx:** No dedicated presence/continuity indicator component.

---

### 9. EntityList

**Found in:**
- `open-hax/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs` - issues-section, prs-section, worktrees-section
- `gates-of-aker/web/src/components/AgentList.tsx` (implied from AgentCard usage)

**Pattern signature:**
```tsx
<div className="flex flex-col h-full min-h-0">
  <ScrollingContainer title={title}>
    {items.length === 0 ? (
      <EmptyState message="No items" />
    ) : (
      items.map(item => <EntityCard key={item.id} item={item} />)
    )}
  </ScrollingContainer>
</div>
```

**Sub-pattern: ScrollingContainer**
```cljs
;; From open-hax CLJS
(defn scrolling-container [title content & {:keys [max-height class extra-header-content]}]
  [:div.flex.flex-col.h-full.min-h-0
   [:div.flex.items-center.justify-between.mb-4.flex-shrink-0
    [:h2.text-xl.font-bold title]
    extra-header-content]
   [:div.flex-1.overflow-y-auto.min-h-0
    {:class class :style {:max-height max-height}}
    content]])
```

**Missing from orgs/open-hax/uxx:** No ScrollingContainer or EntityList pattern.

---

## Frames

### Frame 1: Corpus-Specific vs Universal

Many patterns (EntityCard, PresenceIndicator) are tuned to the domain semantics of the Promethean/fork_tales universe (presences, muses, continuity, lineage). These may be too specialized for a general UI library.

**However**, the structural patterns (CollapsiblePanel, KeyValueSection, SearchableSelect) are universally applicable and genuinely missing from orgs/open-hax/uxx.

### Frame 2: Token System Alignment

orgs/open-hax/uxx uses `@open-hax/uxx/tokens` extensively. The corpus codebases use a mix of:
- Direct Tailwind classes
- Inline styles with hardcoded colors
- CSS-in-JS with monokai-inspired palettes

**Bridging required:** Extracted components should accept token references while maintaining the visual richness of the corpus patterns (gradients, glows, monokai accents).

### Frame 3: React vs Reagent Parity

orgs/open-hax/uxx has both React (`orgs/open-hax/uxx/react`) and Reagent (`orgs/open-hax/uxx/reagent`) implementations. The corpus is split:
- **React TSX:** fork_tales, gates-of-aker, promethean/pantheon
- **Reagent CLJS:** promethean/kanban, open-hax/opencode-reactant

**Recommendation:** Prioritize React implementations with Reagent wrappers, following the existing pattern in orgs/open-hax/uxx.

---

## Countermoves

### Risk: Over-Extraction

Not every repeating pattern should become a primitive. EntityCard is highly domain-specific. Extracting it would create maintenance burden for limited reuse.

**Mitigation:** Focus on structural primitives (CollapsiblePanel, KeyValueSection, SearchableSelect) that compose well with existing components.

### Risk: Token Fragmentation

The corpus uses different color systems. Forcing token alignment may lose the distinctive visual identity of fork_tales/gates-of-aker.

**Mitigation:** Support both token-based styling (for consistency) and custom overrides (for visual identity).

### Risk: CLJS/React Divergence

The Reagent components use a functional DSL that doesn't map 1:1 to React component patterns.

**Mitigation:** Extract the structural patterns as React components first, then create Reagent wrappers that translate the DSL idiomatically.

---

## Next

### Immediate Extraction Candidates (High Confidence)

1. **CollapsiblePanel** - Add to orgs/open-hax/uxx/react/src/primitives/CollapsiblePanel.tsx
   - Header with title, count, chevron
   - Controlled/uncontrolled collapse state
   - Animated chevron rotation
   - Optional stats summary in header

2. **KeyValueSection** - Add to orgs/open-hax/uxx/react/src/primitives/KeyValueSection.tsx
   - Label + value pairs
   - Grid or vertical layout variants
   - Support for complex value rendering (ReactNode)
   - Optional dividers

3. **SearchableSelect** - Add to orgs/open-hax/uxx/react/src/primitives/SearchableSelect.tsx
   - Input with dropdown suggestions
   - Keyboard navigation
   - Recent history support
   - Custom filter function

### Secondary Extraction Candidates (Medium Confidence)

4. **ProgressMeter** - Enhance existing Progress.tsx
   - Add gradient fill support
   - Add animated transitions
   - Add multi-segment variant
   - Add label position options

5. **StatusBadge** - Enhance existing Badge.tsx
   - Add dot indicator pattern (exists, document usage)
   - Add pulse animation for "live" states
   - Add size variants matching corpus usage

### Domain-Specific (Extract to Separate Package)

6. **EntityCard** - Consider orgs/open-hax/uxx/react/src/compositions/EntityCard.tsx
   - Composition of Card + Badge + KeyValueSection + Button
   - Domain-agnostic structure with domain-specific rendering

### Recommended Architecture

```
orgs/open-hax/uxx/
├── react/
│   └── src/
│       ├── primitives/
│       │   ├── CollapsiblePanel.tsx   # NEW
│       │   ├── KeyValueSection.tsx    # NEW
│       │   ├── SearchableSelect.tsx   # NEW
│       │   ├── Progress.tsx           # ENHANCE
│       │   └── Badge.tsx              # ENHANCE
│       └── compositions/
│           └── EntityCard.tsx         # NEW (composition)
└── reagent/
    └── src/
        └── devel/ui/
            └── primitives/
                ├── collapsible_panel.cljs
                ├── key_value_section.cljs
                └── searchable_select.cljs
```

---

## Appendix: Corpus File Index

### Promethean
- `packages/frontend/src/pantheon/components/Layout.tsx` - navigation pattern
- `packages/frontend/src/pantheon/pages/ActorDetail.tsx` - entity detail pattern
- `packages/frontend/src/kanban/cljs/components.cljs` - CLJS component DSL

### Open-Hax
- `packages/opencode-reactant/src/opencode/ui/components.cljs` - issue/pr/worktree cards
- `packages/opencode-reactant/src/opencode/ui/detail.cljs` - detail views

### Fork Tales
- `part64/frontend/src/components/Panels/Chat.tsx` - muse chat, presence, continuity
- `part64/frontend/src/components/Panels/Vitals.tsx` - entity vitals, lineage

### Gates of Aker
- `web/src/components/EventFeed.tsx` - collapsible feed
- `web/src/components/LedgerPanel.tsx` - collapsible ledger with filters
- `web/src/components/AgentCard.tsx` - entity card with needs/stats
- `web/src/components/StatusBar.tsx` - health indicator
- `web/src/components/TraceFeed.tsx` - trace feed pattern
