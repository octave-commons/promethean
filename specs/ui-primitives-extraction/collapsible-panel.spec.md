# Spec: CollapsiblePanel

> *Headers that fold. Content that breathes.*

---

## Status: `done`

---

## Context

The collapsible panel pattern appears **8+ times** across the corpus:
- `gates-of-aker/web/src/components/EventFeed.tsx`
- `gates-of-aker/web/src/components/LedgerPanel.tsx`
- `fork_tales/part64/frontend/src/components/Panels/Chat.tsx`
- `promethean/packages/frontend/src/kanban/cljs/components.cljs`

No such component exists in `orgs/open-hax/uxx`.

---

## Pattern Signature

```tsx
const [isCollapsed, setIsCollapsed] = useState(false);

<button
  type="button"
  onClick={() => setIsCollapsed(!isCollapsed)}
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    width: "100%",
  }}
>
  <strong>{title} ({items.length})</strong>
  <span style={{ 
    transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
    transition: "transform 0.2s ease"
  }}>
    ▼
  </span>
</button>

{!isCollapsed && (
  <div style={{ maxHeight: 300, overflowY: "auto" }}>
    {content}
  </div>
)}
```

---

## Interface

```typescript
export interface CollapsiblePanelProps {
  /** Panel title */
  title: string;
  /** Optional count badge */
  count?: number;
  /** Whether panel starts collapsed */
  defaultCollapsed?: boolean;
  /** Controlled collapse state */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Panel content */
  children: ReactNode;
  /** Optional header content (replaces default) */
  header?: ReactNode;
  /** Optional extra header content (rendered after count) */
  extra?: ReactNode;
  /** Optional stats summary shown in header */
  stats?: Array<{ label: string; value: string | number }>;
  /** Max height for content area */
  maxHeight?: number | string;
  /** Whether to animate collapse/expand */
  animate?: boolean;
  /** Visual variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg';
}
```

---

## Behavior

1. **Header Interaction**
   - Click anywhere in header to toggle collapse state
   - Chevron rotates 90° when collapsed (animated)
   - Count badge shows item count if provided

2. **Content Area**
   - Rendered only when expanded (uncontrolled) or `collapsed=false` (controlled)
   - Optional max-height with overflow scroll
   - Smooth height animation when `animate=true`

3. **Stats Summary**
   - Optional stats array rendered as inline badges in header
   - Format: `<label>: <value>` separated by `|` or as chips

4. **Accessibility**
   - Header has `aria-expanded` attribute
   - Content has `aria-hidden` when collapsed
   - Keyboard: Enter/Space toggles collapse

---

## Token Integration

```typescript
// Use tokens for consistent styling
const styles = {
  header: {
    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
    borderBottom: isCollapsed ? 'none' : `1px solid ${tokens.colors.border.default}`,
    backgroundColor: tokens.colors.background.surface,
  },
  chevron: {
    color: tokens.colors.text.muted,
    transition: tokens.transitions.transform,
  },
  content: {
    padding: `${tokens.spacing[4]}px`,
    backgroundColor: tokens.colors.background.default,
  },
};
```

---

## Variants

### Default
- Border around entire panel
- Background: surface
- Header with bottom border when expanded

### Outlined
- Border on header only
- Background: transparent
- No fill

### Elevated
- Shadow when expanded
- Background: elevated
- Rounded corners

---

## Composition

```tsx
// Basic usage
<CollapsiblePanel title="Events" count={events.length}>
  <EventList events={events} />
</CollapsiblePanel>

// With stats
<CollapsiblePanel 
  title="Ledger" 
  count={entries.length}
  stats={[
    { label: "Entries", value: stats.totalEntries },
    { label: "Mentions", value: stats.totalMentions },
  ]}
>
  <LedgerTable data={entries} />
</CollapsiblePanel>

// With extra header content
<CollapsiblePanel 
  title="Filters"
  extra={<Button size="sm">Reset</Button>}
>
  <FilterControls />
</CollapsiblePanel>
```

---

## Reagent Wrapper

```clojure
(ns devel.ui.primitives.collapsible-panel
  (:require [reagent.core :as r]
            [devel.ui.tokens :as tok]))

(defn collapsible-panel
  [{:keys [title count default-collapsed on-collapse-change
           max-height variant radius animate]
    :or {default-collapsed false
         variant "default"
         radius "md"
         animate true}}
   children]
  (let [collapsed? (r/atom default-collapsed)]
    (fn []
      [:div.collapsible-panel
       {:data-variant variant
        :data-radius radius}
       [:button.header
        {:on-click (fn []
                     (swap! collapsed? not)
                     (when on-collapse-change
                       (on-collapse-change @collapsed?)))}
        [:strong.title title]
        (when count
          [:span.count (str "(" count ")")])
        [:span.chevron
         {:style {:transform (if @collapsed? "rotate(-90deg)" "rotate(0deg)")}}
         "▼"]]
       (when-not @collapsed?
         [:div.content
          {:style {:max-height max-height}}
          children])])))
```

---

## Success Criteria

- [x] Component renders with title and optional count
- [x] Collapse state toggles on header click
- [x] Chevron animates rotation
- [x] Content renders only when expanded
- [x] Stats array renders in header
- [x] `aria-expanded` attribute updates correctly
- [x] Keyboard navigation works (Enter/Space)
- [x] All variants render correctly
- [ ] Reagent wrapper mirrors React behavior — future work
- [x] Storybook story with all variants
- [x] Unit tests ≥80% coverage

---

## Corpus References

- `orgs/octave-commons/gates-of-aker/.worktrees/issue-34-replace-println-logging/web/src/components/EventFeed.tsx`
- `orgs/octave-commons/gates-of-aker/.worktrees/issue-34-replace-println-logging/web/src/components/LedgerPanel.tsx`
- `orgs/octave-commons/fork_tales/part64/frontend/src/components/Panels/Chat.tsx`
- `orgs/octave-commons/promethean/packages/frontend/src/kanban/cljs/components.cljs`

---

## Story Points: 5

**Complexity factors:**
- Controlled/uncontrolled state management
- Animated chevron rotation (CSS transitions)
- Stats summary in header
- Accessibility (aria-expanded, keyboard navigation)
- Multiple variants (default, outlined, elevated)
- Reagent wrapper
- Storybook stories
- Unit tests ≥80% coverage
