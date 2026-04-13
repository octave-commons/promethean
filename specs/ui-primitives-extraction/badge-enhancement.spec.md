# Spec: Badge Enhancement

> *Status at a glance. Dots that pulse.*

---

## Status: `done`

---

## Context

The status badge pattern appears **20+ times** across the corpus. `orgs/open-hax/uxx/react/src/primitives/Badge.tsx` already implements the basic pattern, but corpus usage reveals additional features:
- Dot indicator pattern (underused)
- Pulse animation for "live" states
- Additional semantic variants

---

## Current Implementation

```typescript
// orgs/open-hax/uxx/react/src/primitives/Badge.tsx
export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  rounded?: boolean;
  outline?: boolean;
  children?: ReactNode;
}
```

Has dot indicator but:
- No pulse animation
- Missing semantic variants (merged, open, closed, alive, dead)
- Size variants don't match corpus usage

---

## Corpus Pattern Signatures

```tsx
// Dot indicator (open-hax)
<span className="flex items-center gap-1">
  <div className="w-2 h-2 rounded-full bg-green-500" />
  <span className="text-sm capitalize">{status}</span>
</span>

// Status badge with color (gates-of-aker AgentCard)
<div style={{
  backgroundColor: moodColor,
  color: "#fff",
  padding: "2px 6px",
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600
}}>
  {moodLabel}
</div>

// State badge (open-hax PR state)
<span className={cond
  (= state "open") "bg-green-100 text-green-800"
  (= state "merged") "bg-purple-100 text-purple-800"
  :else "bg-gray-100 text-gray-800"}>
  {state}
</span>

// Alive/Dead badge (gates-of-aker AgentCard)
<div style={{
  backgroundColor: alive ? "#e8f5e9" : "#ffebee",
  color: alive ? "#2e7d32" : "#c62828",
  padding: "2px 6px",
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600
}}>
  {alive ? "ALIVE" : "DEAD"}
</div>
```

---

## Enhanced Interface

```typescript
export interface BadgeProps {
  /** Visual style variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' 
    | 'open' | 'closed' | 'merged' 
    | 'alive' | 'dead'
    | 'running' | 'stopped';
  /** Size of the badge */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Whether to show a status dot before the content */
  dot?: boolean;
  /** Whether dot should pulse (live/active state) */
  pulse?: boolean;
  /** Whether to use fully rounded (pill) corners */
  rounded?: boolean;
  /** Whether to use outline style instead of filled */
  outline?: boolean;
  /** Custom dot color (overrides variant) */
  dotColor?: string;
  /** Badge content */
  children?: ReactNode;
  /** Optional icon before text */
  iconStart?: ReactNode;
  /** Optional icon after text */
  iconEnd?: ReactNode;
}
```

---

## New Features

### 1. Pulse Animation

```tsx
// Live/active state with pulsing dot
<Badge variant="success" dot pulse>
  Live
</Badge>

// Running process
<Badge variant="running" dot pulse>
  Processing
</Badge>
```

### 2. Semantic Variants

```tsx
// PR/Issue states
<Badge variant="open">Open</Badge>
<Badge variant="closed">Closed</Badge>
<Badge variant="merged">Merged</Badge>

// Entity states
<Badge variant="alive">Alive</Badge>
<Badge variant="dead">Dead</Badge>

// Process states
<Badge variant="running">Running</Badge>
<Badge variant="stopped">Stopped</Badge>
```

### 3. Extra Small Size

```tsx
<Badge size="xs">Tag</Badge>
```

### 4. Custom Dot Color

```tsx
<Badge dot dotColor="#ff6b6b">
  Custom Status
</Badge>
```

### 5. Icons

```tsx
<Badge iconStart={<CheckIcon />} variant="success">
  Verified
</Badge>
```

---

## Variant Colors

```typescript
const variantStyles: Record<BadgeVariant, { bg: string; fg: string }> = {
  default: { bg: 'neutral.100', fg: 'neutral.700' },
  success: { bg: 'green.100', fg: 'green.800' },
  warning: { bg: 'amber.100', fg: 'amber.800' },
  error: { bg: 'red.100', fg: 'red.800' },
  info: { bg: 'blue.100', fg: 'blue.800' },
  
  // Semantic variants
  open: { bg: 'green.100', fg: 'green.800' },
  closed: { bg: 'gray.100', fg: 'gray.800' },
  merged: { bg: 'purple.100', fg: 'purple.800' },
  alive: { bg: 'green.50', fg: 'green.700' },
  dead: { bg: 'red.50', fg: 'red.700' },
  running: { bg: 'cyan.100', fg: 'cyan.800' },
  stopped: { bg: 'gray.100', fg: 'gray.600' },
};
```

---

## Pulse Animation CSS

```css
@keyframes badge-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

.badge-dot.pulse {
  animation: badge-pulse 2s ease-in-out infinite;
}
```

---

## Token Integration

```typescript
const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  xs: {
    padding: '1px 4px',
    fontSize: tokens.fontSize.xs,
    gap: '2px',
  },
  sm: {
    padding: `${tokens.spacing[0.5]}px ${tokens.spacing[1.5]}px`,
    fontSize: tokens.fontSize.xs,
    gap: `${tokens.spacing[0.5]}px`,
  },
  md: {
    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
    fontSize: tokens.fontSize.xs,
    gap: `${tokens.spacing[0.5]}px`,
  },
  lg: {
    padding: `${tokens.spacing[1.5]}px ${tokens.spacing[3]}px`,
    fontSize: tokens.fontSize.sm,
    gap: `${tokens.spacing[1]}px`,
  },
};
```

---

## Composition Examples

```tsx
// Issue status
<Badge variant="open" dot>Open</Badge>
<Badge variant="closed">Closed</Badge>
<Badge variant="merged" dot>Merged</Badge>

// Agent status (gates-of-aker style)
<Badge variant={alive ? 'alive' : 'dead'}>
  {alive ? 'ALIVE' : 'DEAD'}
</Badge>

// Mood indicator with pulse
<Badge variant="success" dot pulse size="xs">
  HAPPY
</Badge>

// Process state
<Badge variant="running" dot pulse>
  <Activity size={12} />
  Running
</Badge>

// Status with icon
<Badge variant="success" iconStart={<Check size={12} />}>
  Verified
</Badge>

// Custom dot color
<Badge dot dotColor={moodColor}>
  {moodLabel}
</Badge>
```

---

## Reagent Wrapper Enhancement

```clojure
;; Add to existing badge.cljs
(defn badge
  [{:keys [variant size dot pulse rounded outline dot-color 
           icon-start icon-end]
    :or {variant "default"
         size "md"
         dot false
         pulse false
         rounded false
         outline false}} 
   children]
  (let [{:keys [bg fg]} (variant-styles variant)
        dot-size (case size
                   "xs" 4
                   "sm" 6
                   "lg" 10
                   8)]
    [:span.badge
     {:class [size (when rounded "rounded")
              (when outline "outline")
              (when pulse "pulse")]
      :style {:background-color (if outline "transparent" bg)
              :color (if outline bg fg)
              :border (when outline (str "1px solid " bg))}}
     (when dot
       [:span.badge-dot
        {:class (when pulse "pulse")
         :style {:width dot-size
                 :height dot-size
                 :background-color (or dot-color fg)}}])
     (when icon-start icon-start)
     children
     (when icon-end icon-end)]))
```

---

## Success Criteria

- [x] Pulse animation works
- [x] All semantic variants render correctly
- [x] `xs` size renders correctly
- [x] Custom dot color works
- [x] Icons render in correct positions
- [x] Backward compatible with existing API
- [ ] Reagent wrapper updated — future work
- [x] Storybook stories for new features
- [x] Unit tests ≥80% coverage

---

## Corpus References

- `orgs/open-hax/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs`
- `orgs/octave-commons/gates-of-aker/.worktrees/issue-34-replace-println-logging/web/src/components/AgentCard.tsx`
- `orgs/octave-commons/promethean/packages/frontend/src/pantheon/pages/ActorDetail.tsx`

---

## Story Points: 2

**Complexity factors:**
- Pulse animation (CSS keyframes)
- 6 new semantic variants (open, closed, merged, alive, dead, running)
- Extra small size variant
- Custom dot color support
- Icon start/end support
- Backward compatible
- Reagent wrapper update
- Storybook stories
- Unit tests ≥80% coverage

**Low complexity:** Small enhancement to existing, well-understood component. Minimal risk.
