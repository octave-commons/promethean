# Spec: EntityCard Composition

> *Every entity deserves a face. Cards give them form.*

---

## Status: `done`

---

## Context

The entity card pattern appears **12+ times** across the corpus:
- `gates-of-aker/web/src/components/AgentCard.tsx` - agent with needs, stats, relationships
- `promethean/packages/frontend/src/pantheon/pages/ActorDetail.tsx` - actor with config, logs
- `open-hax/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs` - issue/pr/worktree items
- `fork_tales/part64/frontend/src/components/Panels/Vitals.tsx` - entity vitals cards

This is a **composition** of existing primitives, not a primitive itself. Extract to `orgs/open-hax/uxx/react/src/compositions/EntityCard.tsx`.

---

## Pattern Signature

```tsx
<article className="border rounded-2xl p-4 bg-gradient-to-br">
  <header className="flex justify-between items-center">
    <strong>{entity.name}</strong>
    <StatusBadge variant={status} />
  </header>
  
  <KeyValueSection data={entity.metadata} />
  
  {actions && (
    <footer className="flex gap-2">
      <Button variant="primary">Primary Action</Button>
      <Button variant="ghost">Secondary</Button>
    </footer>
  )}
</article>
```

---

## Interface

```typescript
export interface EntityCardProps {
  /** Entity identifier */
  id: string;
  /** Entity display name */
  name: string;
  /** Entity type/subtype label */
  type?: string;
  /** Entity status for badge */
  status?: {
    value: string;
    variant?: BadgeVariant;
  };
  /** Metadata key-value pairs */
  metadata?: Array<{
    label: string;
    value: ReactNode;
    icon?: ReactNode;
  }>;
  /** Optional image/avatar */
  image?: {
    src: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg';
  };
  /** Optional tags/labels */
  tags?: string[];
  /** Primary action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  /** Secondary actions */
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;
  /** Whether card is interactive (clickable) */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onClick?: () => void;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated' | 'gradient';
  /** Custom gradient for gradient variant */
  gradient?: string;
  /** Whether to show dividers between sections */
  dividers?: boolean;
  /** Custom header content (replaces default) */
  header?: ReactNode;
  /** Custom footer content (replaces actions) */
  footer?: ReactNode;
}
```

---

## Composition Structure

```
┌─────────────────────────────────────────┐
│  HEADER                                 │
│  ┌─────────────────┬──────────────────┐ │
│  │ Name            │ Status Badge     │ │
│  │ Type label      │                  │ │
│  └─────────────────┴──────────────────┘ │
├─────────────────────────────────────────┤
│  IMAGE (optional)                       │
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │         Avatar / Image              ││
│  │                                     ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  METADATA                               │
│  ┌─────────────────────────────────────┐│
│  │ Key              Value              ││
│  │ Key              Value              ││
│  │ Key              Value              ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  TAGS (optional)                        │
│  ┌─────┐ ┌─────┐ ┌─────┐               ││
│  │Tag  │ │Tag  │ │Tag  │               ││
│  └─────┘ └─────┘ └─────┘               ││
├─────────────────────────────────────────┤
│  FOOTER / ACTIONS                       │
│  ┌─────────────────────────────────────┐│
│  │  [Primary Action] [Secondary]       ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## Variants

### Default
- Standard border
- Surface background
- No gradient

### Outlined
- Border only
- Transparent background
- No fill

### Elevated
- Shadow
- Elevated background
- Rounded corners

### Gradient
- Custom gradient background
- From corpus visual identity

---

## Composition Examples

```tsx
// Basic entity card
<EntityCard
  id={agent.id}
  name={agent.name}
  type="Agent"
  status={{ value: agent.alive ? 'Alive' : 'Dead', variant: agent.alive ? 'alive' : 'dead' }}
  metadata={[
    { label: 'Position', value: `(${agent.pos[0]}, ${agent.pos[1]})` },
    { label: 'Role', value: agent.role },
    { label: 'Mood', value: `${Math.round(agent.needs.mood * 100)}%` },
  ]}
/>

// With image
<EntityCard
  id={actor.id}
  name={actor.name}
  type="LLM Actor"
  status={{ value: actor.status, variant: 'running' }}
  image={{ src: actor.avatar, size: 'lg' }}
  metadata={[
    { label: 'Model', value: actor.config.model },
    { label: 'Temperature', value: actor.config.temperature },
    { label: 'Total Ticks', value: actor.ticks },
  ]}
  primaryAction={{ label: 'View Details', onClick: () => navigate(`/actors/${actor.id}`) }}
/>

// Issue/PR card (open-hax style)
<EntityCard
  id={issue.id}
  name={`Issue #${issue.number}`}
  type={issue.title}
  status={{ value: issue.state, variant: issue.state === 'open' ? 'open' : 'closed' }}
  tags={issue.labels}
  primaryAction={{ label: 'Create Worktree', onClick: () => createWorktree(issue.number) }}
  secondaryActions={[
    { label: 'Open PR', onClick: () => openPr(issue.number) },
  ]}
  interactive
  onClick={() => navigate(`/issues/${issue.number}`)}
/>

// Gradient variant (fork_tales style)
<EntityCard
  id={presence.id}
  name={presence.name.en}
  type={presence.name.ja}
  status={{ value: 'Active', variant: 'success' }}
  variant="gradient"
  gradient="linear-gradient(135deg, rgba(45,46,39,0.94), rgba(39,40,34,0.92))"
  metadata={[
    { label: 'Continuity', value: `${Math.round(continuity * 100)}%` },
    { label: 'Linked', value: linkedPresences.join(', ') },
  ]}
/>

// With custom header/footer
<EntityCard
  id={entity.id}
  name={entity.name}
  header={<CustomEntityHeader entity={entity} />}
  footer={<CustomEntityActions entity={entity} />}
/>
```

---

## Implementation

EntityCard is a composition that uses:
- `Card` for container
- `Badge` for status
- `KeyValueSection` for metadata
- `Button` for actions
- `Input` components for tags (as badges)

```tsx
// orgs/open-hax/uxx/react/src/compositions/EntityCard.tsx
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { KeyValueSection } from '../primitives/KeyValueSection';
import { Button } from '../primitives/Button';

export function EntityCard({
  id,
  name,
  type,
  status,
  metadata,
  image,
  tags,
  primaryAction,
  secondaryActions,
  interactive,
  onClick,
  variant = 'default',
  gradient,
  dividers = true,
  header,
  footer,
}: EntityCardProps) {
  return (
    <Card
      variant={variant === 'gradient' ? 'elevated' : variant}
      interactive={interactive}
      onClick={onClick}
      style={gradient ? { background: gradient } : undefined}
    >
      {header ?? (
        <Card.Header>
          <div className="flex justify-between items-center">
            <div>
              <strong className="text-lg font-semibold">{name}</strong>
              {type && <span className="text-sm text-muted ml-2">{type}</span>}
            </div>
            {status && (
              <Badge variant={status.variant ?? 'default'}>
                {status.value}
              </Badge>
            )}
          </div>
        </Card.Header>
      )}
      
      {image && (
        <div className="flex justify-center py-4">
          <img
            src={image.src}
            alt={image.alt ?? name}
            style={{
              width: image.size === 'sm' ? 48 : image.size === 'lg' ? 96 : 64,
              height: image.size === 'sm' ? 48 : image.size === 'lg' ? 96 : 64,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}
      
      {metadata && metadata.length > 0 && (
        <KeyValueSection
          entries={metadata.map(m => ({
            label: m.label,
            value: m.value,
            icon: m.icon,
          }))}
          dividers={dividers}
        />
      )}
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map(tag => (
            <Badge key={tag} size="sm" variant="default">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      {footer ?? ((primaryAction || secondaryActions) && (
        <Card.Footer>
          {primaryAction && (
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.onClick();
              }}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}
          {secondaryActions?.map((action, i) => (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </Card.Footer>
      ))}
    </Card>
  );
}
```

---

## Reagent Wrapper

```clojure
(ns devel.ui.compositions.entity-card
  (:require [devel.ui.primitives.card :as card]
            [devel.ui.primitives.badge :as badge]
            [devel.ui.primitives.key-value-section :as kvs]
            [devel.ui.primitives.button :as btn]))

(defn entity-card
  [{:keys [id name type status metadata image tags
           primary-action secondary-actions interactive on-click
           variant gradient dividers header footer]}]
  [card/card
   {:variant (if (= variant "gradient") "elevated" variant)
    :interactive interactive
    :on-click on-click
    :style (when gradient {:background gradient})}
   
   (or header
       [card/header
        [:div.flex.justify-between.items-center
         [:div
          [:strong.text-lg name]
          (when type
            [:span.text-sm.text-muted.ml-2 type])]
         (when status
           [badge/badge
            {:variant (or (:variant status) "default")}
            (:value status)])]])
   
   (when image
     [:div.flex.justify-center.py-4
      [:img
       {:src (:src image)
        :alt (or (:alt image) name)
        :style {:width (case (:size image)
                         "sm" 48
                         "lg" 96
                         64)
                :height (case (:size image)
                          "sm" 48
                          "lg" 96
                          64)
                :border-radius "50%"
                :object-fit "cover"}}]])
   
   (when (seq metadata)
     [kvs/key-value-section
      {:entries (map (fn [m] {:label (:label m)
                              :value (:value m)
                              :icon (:icon m)})
                     metadata)
       :dividers dividers}])
   
   (when (seq tags)
     [:div.flex.flex-wrap.gap-2.mt-3
      (for [tag tags]
        ^{:key tag}
        [badge/badge {:size "sm"} tag])])
   
   (or footer
       (when (or primary-action secondary-actions)
         [card/footer
          (when primary-action
            [btn/button
             {:variant "primary"
              :on-click (fn [e]
                          (.stopPropagation e)
                          ((:on-click primary-action)))}
             (:icon primary-action)
             (:label primary-action)])
          (for [action secondary-actions]
            ^{:key (:label action)}
            [btn/button
             {:variant "ghost"
              :size "sm"
              :on-click (fn [e]
                          (.stopPropagation e)
                          ((:on-click action)))}
             (:icon action)
             (:label action)])]))])
```

---

## Success Criteria

- [x] Component renders with name and type
- [x] Status badge renders correctly
- [x] Metadata section renders with KeyValueSection
- [x] Image renders when provided
- [x] Tags render as badges
- [x] Primary action renders in footer
- [x] Secondary actions render in footer
- [x] Interactive mode triggers onClick
- [x] All variants render correctly
- [x] Gradient variant applies custom gradient
- [x] Custom header/footer work
- [x] Dividers show/hide correctly
- [x] Click events don't propagate from buttons
- [ ] Reagent wrapper mirrors React behavior — future work
- [x] Storybook story with all variants
- [x] Unit tests ≥80% coverage

---

## Corpus References

- `orgs/octave-commons/gates-of-aker/.worktrees/issue-34-replace-println-logging/web/src/components/AgentCard.tsx`
- `orgs/octave-commons/promethean/packages/frontend/src/pantheon/pages/ActorDetail.tsx`
- `orgs/open-hax/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs`
- `orgs/octave-commons/fork_tales/part64/frontend/src/components/Panels/Vitals.tsx`

---

## Story Points: 5

**Complexity factors:**
- Composition of multiple primitives (Card, Badge, KeyValueSection, Button)
- Image/avatar rendering with size variants
- Tag rendering
- Interactive mode with click handling
- Event propagation from action buttons
- Multiple variants including gradient
- Custom header/footer support
- Reagent wrapper
- Storybook stories
- Unit tests ≥80% coverage

**Dependencies:**
- Requires KeyValueSection (3 pts)
- Card, Badge, Button (existing)

**Medium complexity:** Composition reduces implementation risk, but surface area for edge cases in interactions and layout.

---

## Dependencies

- [x] CollapsiblePanel (for complex card layouts)
- [x] KeyValueSection (for metadata)
- [x] Badge (existing)
- [x] Button (existing)
- [ ] Card (existing, but EntityCard uses inline styles)
