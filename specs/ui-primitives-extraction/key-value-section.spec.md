# Spec: KeyValueSection

> *Labels meet values. Clarity meets structure.*

---

## Status: `done`

---

## Context

The key-value section pattern appears **10+ times** across the corpus:
- `promethean/packages/frontend/src/pantheon/pages/ActorDetail.tsx`
- `gates-of-aker/web/src/components/AgentCard.tsx`
- `fork_tales/part64/frontend/src/components/Panels/Vitals.tsx`

No such component exists in `orgs/open-hax/uxx`.

---

## Pattern Signature

```tsx
<div className="space-y-4">
  <div>
    <label className="text-sm font-medium text-gray-500">Key</label>
    <p className="text-sm text-muted">{value}</p>
  </div>
  <div>
    <label className="text-sm font-medium text-gray-500">Another Key</label>
    <p className="text-sm text-muted">{anotherValue}</p>
  </div>
</div>
```

Often paired with Card component for entity metadata display.

---

## Interface

```typescript
export interface KeyValueEntry {
  /** Label text */
  label: string;
  /** Value - can be string, number, or ReactNode for complex rendering */
  value: ReactNode;
  /** Optional icon before label */
  icon?: ReactNode;
  /** Optional badge after value */
  badge?: string;
  /** Optional tooltip for label */
  tooltip?: string;
  /** Whether to hide if value is empty/null */
  hideIfEmpty?: boolean;
  /** Optional key for React list rendering */
  key?: string;
}

export interface KeyValueSectionProps {
  /** Key-value entries */
  entries: KeyValueEntry[];
  /** Layout direction */
  layout?: 'vertical' | 'grid' | 'inline';
  /** Number of columns for grid layout */
  columns?: number;
  /** Whether to show dividers between entries */
  dividers?: boolean;
  /** Label width for inline layout */
  labelWidth?: string | number;
  /** Gap between entries */
  gap?: 'sm' | 'md' | 'lg';
  /** Section title (optional) */
  title?: string;
  /** Section title size */
  titleSize?: 'sm' | 'md' | 'lg';
  /** Empty state message when no entries */
  emptyMessage?: string;
}
```

---

## Behavior

1. **Layout Modes**
   - `vertical`: Stack entries vertically with full-width labels
   - `grid`: Grid layout with configurable columns
   - `inline`: Label and value on same line, label has fixed width

2. **Entry Rendering**
   - `hideIfEmpty=true` skips entries with null/undefined/empty string values
   - Icon renders before label with gap
   - Badge renders after value with gap

3. **Dividers**
   - `dividers=true` adds border between entries (vertical layout only)
   - No divider after last entry

4. **Empty State**
   - When all entries are hidden or entries array is empty
   - Render `emptyMessage` if provided

---

## Token Integration

```typescript
const gapSizes = {
  sm: tokens.spacing[2],
  md: tokens.spacing[4],
  lg: tokens.spacing[6],
};

const styles = {
  label: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.text.muted,
  },
  value: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text.default,
  },
  divider: {
    borderBottom: `1px solid ${tokens.colors.border.default}`,
  },
};
```

---

## Variants

### Vertical
```
┌────────────────────┐
│ Label              │
│ Value              │
├────────────────────┤
│ Another Label      │
│ Another Value      │
└────────────────────┘
```

### Grid (2 columns)
```
┌────────────┬────────────┐
│ Label      │ Label      │
│ Value      │ Value      │
├────────────┼────────────┤
│ Label      │ Label      │
│ Value      │ Value      │
└────────────┴────────────┘
```

### Inline
```
┌──────────────────────────┐
│ Label        Value       │
│ Another      AnotherVal  │
│ Third        ThirdVal    │
└──────────────────────────┘
```

---

## Composition

```tsx
// Basic usage
<KeyValueSection
  entries={[
    { label: "Status", value: "Running" },
    { label: "Uptime", value: "2d 4h" },
    { label: "CPU", value: "45%" },
  ]}
/>

// With title
<KeyValueSection
  title="Actor Information"
  entries={[
    { label: "ID", value: actor.id },
    { label: "Type", value: actor.type },
    { label: "Status", value: actor.status },
    { label: "Total Ticks", value: actor.ticks },
  ]}
/>

// With icons and badges
<KeyValueSection
  layout="grid"
  columns={2}
  entries={[
    { label: "Temperature", value: "0.7", icon: <Thermometer />, badge: "default" },
    { label: "Max Tokens", value: "1000", icon: <Hash /> },
  ]}
/>

// Complex value rendering
<KeyValueSection
  entries={[
    { label: "Config", value: <CodeBlock code={JSON.stringify(config)} /> },
    { label: "Tags", value: tags.map(t => <Badge key={t}>{t}</Badge>) },
  ]}
/>

// With hideIfEmpty
<KeyValueSection
  entries={[
    { label: "Name", value: entity.name },
    { label: "Email", value: entity.email, hideIfEmpty: true },
    { label: "Phone", value: entity.phone, hideIfEmpty: true },
  ]}
/>
```

---

## Reagent Wrapper

```clojure
(ns devel.ui.primitives.key-value-section
  (:require [reagent.core :as r]
            [devel.ui.tokens :as tok]))

(defn key-value-entry
  [{:keys [label value icon badge hide-if-empty]}]
  (when (or (not hide-if-empty)
            (and (some? value) (not= value "")))
    [:div.entry
     (when icon [:span.icon icon])
     [:label label]
     [:span.value value]
     (when badge [:span.badge badge])]))

(defn key-value-section
  [{:keys [entries layout columns dividers gap title title-size empty-message]
    :or {layout "vertical"
         columns 2
         dividers false
         gap "md"
         title-size "md"}}]
  (let [visible-entries (filter
                          (fn [e]
                            (or (not (:hide-if-empty e))
                                (and (some? (:value e))
                                     (not= (:value e) ""))))
                          entries)]
    [:div.key-value-section
     {:data-layout layout
      :data-gap gap
      :style (when (= layout "grid")
               {:grid-template-columns (str "repeat(" columns ", 1fr)")})}
     (when title
       [:h3.title
        {:data-size title-size}
        title])
     (if (empty? visible-entries)
       (when empty-message
         [:p.empty-message empty-message])
       [:div.entries
        {:class (when dividers "with-dividers")}
        (for [entry visible-entries]
          ^{:key (or (:key entry) (:label entry))}
          [key-value-entry entry])])]))
```

---

## Success Criteria

- [x] Component renders entries with labels and values
- [x] All layout modes work correctly (vertical, grid, inline)
- [x] `hideIfEmpty` correctly filters entries
- [x] Icons render before labels
- [x] Badges render after values
- [x] Dividers render between entries (vertical only)
- [x] Title renders with correct size
- [x] Empty state renders when no visible entries
- [x] Complex values (ReactNode) render correctly
- [x] Grid layout respects columns prop
- [ ] Reagent wrapper mirrors React behavior — future work
- [x] Storybook story with all variants
- [x] Unit tests ≥80% coverage

---

## Corpus References

- `orgs/octave-commons/promethean/packages/frontend/src/pantheon/pages/ActorDetail.tsx`
- `orgs/octave-commons/gates-of-aker/.worktrees/issue-34-replace-println-logging/web/src/components/AgentCard.tsx`
- `orgs/octave-commons/fork_tales/part64/frontend/src/components/Panels/Vitals.tsx`

---

## Story Points: 3

**Complexity factors:**
- Three layout modes (vertical, grid, inline)
- hideIfEmpty filtering logic
- Dividers between entries
- Icon and badge support per entry
- Reagent wrapper
- Storybook stories
- Unit tests ≥80% coverage

**Lower complexity:** Well-scoped, no complex state management, straightforward rendering logic.
