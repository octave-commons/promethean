# Spec: Progress Enhancement

> *Bars that breathe. Gradients that flow.*

---

## Status: `done`

---

## Context

The progress meter pattern appears **8+ times** across the corpus with features not present in `orgs/open-hax/uxx/react/src/primitives/Progress.tsx`:
- Gradient fills
- Animated transitions
- Multi-segment bars
- Pressure/continuity variants

Current `Progress.tsx` is basic linear progress without these features.

---

## Current Implementation

```typescript
// orgs/open-hax/uxx/react/src/primitives/Progress.tsx
export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  animated?: boolean;
}
```

Missing:
- Gradient fills
- Multi-segment support
- Custom colors
- Pressure/continuity semantics

---

## Corpus Pattern Signature

```tsx
// Gradient fill (fork_tales VitalsPanel)
<div className="h-1.5 rounded-full overflow-hidden bg-gray-200">
  <div
    className="h-full"
    style={{
      width: `${percent}%`,
      background: "linear-gradient(90deg, rgba(102,217,239,0.92), rgba(166,226,46,0.86))",
    }}
  />
</div>

// Animated transition (gates-of-aker AgentCard)
<div className="h-2 bg-gray-200 rounded-full">
  <div
    className="h-full transition-[width] duration-1000 ease-in-out"
    style={{ width: `${value * 100}%`, backgroundColor: color }}
  />
</div>

// Multi-segment (implied from continuity + click + file pressure)
<div className="grid grid-cols-4 gap-2">
  <div className="rounded-md border px-3 py-2">
    <p className="text-xs">continuity</p>
    <p className="font-semibold">{continuity}%</p>
    <div className="h-1.5 rounded overflow-hidden bg-gray-200">
      <div style={{ width: `${continuity}%`, background: gradient1 }} />
    </div>
  </div>
  {/* ... more segments */}
</div>
```

---

## Enhanced Interface

```typescript
export interface ProgressProps {
  /** Current value (0-100 for percentage, or use value/max) */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Size of the progress bar */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Gradient fill (overrides variant color) */
  gradient?: string | { from: string; to: string; angle?: number };
  /** Whether to animate width changes */
  animated?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Whether to show value label */
  showValue?: boolean;
  /** Value label position */
  valuePosition?: 'inside' | 'right' | 'tooltip';
  /** Custom value formatter */
  formatValue?: (value: number, max: number) => string;
  /** Multi-segment progress */
  segments?: ProgressSegment[];
  /** Whether to stripe the fill */
  striped?: boolean;
  /** Whether stripes animate */
  stripedAnimated?: boolean;
  /** Custom label above/below bar */
  label?: string;
  /** Whether bar is indeterminate (loading) */
  indeterminate?: boolean;
}

export interface ProgressSegment {
  /** Segment value */
  value: number;
  /** Segment color/gradient */
  color?: string;
  /** Segment gradient (overrides color) */
  gradient?: string | { from: string; to: string };
  /** Optional label for segment */
  label?: string;
}
```

---

## New Features

### 1. Gradient Fills

```tsx
// String gradient
<Progress value={75} gradient="linear-gradient(90deg, #66d9ef, #a6e22e)" />

// Object gradient (generates CSS)
<Progress 
  value={75} 
  gradient={{ from: '#66d9ef', to: '#a6e22e', angle: 90 }} 
/>
```

### 2. Animated Transitions

```tsx
// Smooth width transitions
<Progress 
  value={continuity} 
  animated 
  animationDuration={1000}
/>
```

### 3. Multi-Segment

```tsx
// Multiple segments in one bar
<Progress
  value={100} // total
  segments={[
    { value: 30, color: '#66d9ef', label: 'continuity' },
    { value: 25, color: '#ae81ff', label: 'click pressure' },
    { value: 20, color: '#fd971f', label: 'file pressure' },
  ]}
/>
```

### 4. Striped

```tsx
// Static stripes
<Progress value={60} striped />

// Animated stripes
<Progress value={60} striped stripedAnimated />
```

### 5. Indeterminate

```tsx
// Loading state
<Progress indeterminate />
```

### 6. Pressure/Continuity Variant

```tsx
// Semantic colors for pressure/continuity
<Progress 
  value={pressure} 
  variant="pressure"
  label="File Pressure"
  showValue
/>
```

---

## Token Integration

```typescript
const gradients = {
  default: `linear-gradient(90deg, ${tokens.colors.primary.light}, ${tokens.colors.primary.default})`,
  success: `linear-gradient(90deg, ${tokens.monokai.accent.green}CC, ${tokens.monokai.accent.green})`,
  warning: `linear-gradient(90deg, ${tokens.monokai.accent.orange}CC, ${tokens.monokai.accent.orange})`,
  error: `linear-gradient(90deg, ${tokens.monokai.accent.red}CC, ${tokens.monokai.accent.red})`,
  info: `linear-gradient(90deg, ${tokens.monokai.accent.cyan}CC, ${tokens.monokai.accent.cyan})`,
  pressure: `linear-gradient(90deg, rgba(102,217,239,0.92), rgba(166,226,46,0.86), rgba(174,129,255,0.72))`,
};

const sizes = {
  xs: { height: 2, fontSize: tokens.fontSize.xs },
  sm: { height: 4, fontSize: tokens.fontSize.xs },
  md: { height: 8, fontSize: tokens.fontSize.sm },
  lg: { height: 12, fontSize: tokens.fontSize.sm },
};
```

---

## Composition Examples

```tsx
// Continuity bar (fork_tales style)
<div className="rounded-md border px-3 py-2">
  <p className="text-xs uppercase">continuity index</p>
  <p className="font-semibold">{continuity}%</p>
  <Progress 
    value={continuity}
    gradient={{ from: '#66d9ef', to: '#a6e22e' }}
    animated
    animationDuration={1000}
    size="sm"
  />
</div>

// Needs bars (gates-of-aker style)
<div className="space-y-2">
  {['mood', 'social', 'food', 'sleep', 'warmth'].map(need => (
    <div key={need}>
      <span className="text-xs">{need}:</span>
      <Progress
        value={needs[need] * 100}
        size="xs"
        variant={needs[need] > 0.7 ? 'success' : needs[need] < 0.3 ? 'error' : 'warning'}
        showValue
        valuePosition="right"
      />
    </div>
  ))}
</div>

// Multi-pressure display
<div className="grid grid-cols-4 gap-2">
  <Progress value={continuity} label="Continuity" gradient="..." />
  <Progress value={clickPressure} label="Click" gradient="..." />
  <Progress value={filePressure} label="File" gradient="..." />
  <Progress value={particles} label="Particles" gradient="..." />
</div>
```

---

## Reagent Wrapper Enhancement

```clojure
;; Add to existing progress.cljs
(defn progress
  [{:keys [value max size variant gradient animated animation-duration
           show-value value-position format-value segments striped
           striped-animated label indeterminate]
    :or {max 100
         size "md"
         variant "default"
         animated false
         animation-duration 300
         show-value false
         value-position "right"
         striped false
         striped-animated false
         indeterminate false}}]
  (let [gradient-style (cond
                         (string? gradient) gradient
                         (map? gradient)
                         (str "linear-gradient("
                              (or (:angle gradient) 90)
                              "deg, "
                              (:from gradient)
                              ", "
                              (:to gradient)
                              ")")
                         :else (gradients variant))]
    [:div.progress-wrapper
     (when label
       [:label label])
     [:div.progress-track
      {:class size}
      (if indeterminate
        [:div.progress-fill.indeterminate]
        (if (seq segments)
          ;; Multi-segment render
          (for [{:keys [value color gradient label] :as seg} segments]
            [:div.progress-segment
             {:key label
              :style {:width (str (* (/ value max) 100) "%")
                      :background (or gradient color)}}])
          ;; Single segment
          [:div.progress-fill
           {:style {:width (str (* (/ value max) 100) "%")
                    :background gradient-style
                    :transition (when animated
                                  (str "width " animation-duration "ms ease"))}}]))]
     (when show-value
       [:span.progress-value
        (if format-value
          (format-value value max)
          (str (Math/round (* (/ value max) 100)) "%"))])]))
```

---

## Success Criteria

- [x] Gradient fills work (string and object)
- [x] Animated transitions work smoothly
- [x] Multi-segment progress renders correctly
- [x] Striped variant works
- [x] Striped animated variant works
- [x] Indeterminate state works
- [x] Pressure/continuity gradient available
- [x] All sizes render correctly
- [x] Value label positions work
- [x] Custom formatters work
- [x] Backward compatible with existing API
- [ ] Reagent wrapper updated — future work
- [x] Storybook stories for new features
- [x] Unit tests ≥80% coverage

---

## Corpus References

- `orgs/octave-commons/fork_tales/part64/frontend/src/components/Panels/Vitals.tsx`
- `orgs/octave-commons/fork_tales/part64/frontend/src/components/Panels/Chat.tsx`
- `orgs/octave-commons/gates-of-aker/.worktrees/issue-34-replace-println-logging/web/src/components/AgentCard.tsx`

---

## Story Points: 5

**Complexity factors:**
- Gradient fills (string and object syntax)
- Animated width transitions
- Multi-segment progress bars
- Striped and striped-animated variants
- Indeterminate loading state
- Backward compatibility with existing API
- Reagent wrapper enhancement
- Storybook stories for new features
- Unit tests ≥80% coverage

**Medium complexity:** Enhancing existing component reduces risk, but multi-segment and animation features add complexity.
