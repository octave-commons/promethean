# UI Component Library Extraction Report

## Executive Summary

Analysis of **1,432 UI source files** across the `devel` monorepo reveals:

| Metric | Count |
|--------|-------|
| TSX/JSX files | 1,001 (861 TSX + 140 JSX) |
| CLJS/CLJC files | 431 |
| Components defined | 1,096 unique names |
| Components used (frequency) | 2,014 total usages |

**Key Finding**: The codebase already contains a mature UI component library (`@opencode-ai/ui`) built with **SolidJS + Kobalte + Tailwind**. The challenge is not creating a new library, but:

1. **Harmonizing** across framework boundaries (SolidJS, React, Reagent)
2. **Extracting shared patterns** from app-specific implementations
3. **Creating Reagent wrappers** for consistent CLJS development

---

## Existing Component Libraries

### 1. @opencode-ai/ui (SolidJS)

**Location**: `orgs/anomalyco/opencode/orgs/open-hax/uxx/`

**Stack**: SolidJS, Kobalte, Tailwind CSS, Storybook

**Components**: 104 documented components including:
- Primitives: Button, Card, Checkbox, Dialog, Dropdown, Input, Select, Tabs, Tooltip
- Data Display: Diff, Code, Table, Tree
- Feedback: Spinner, Toast, Progress
- Layout: Accordion, Collapsible, Dock
- Icons: App icons, Provider icons, File type icons

**Export Pattern**: Direct exports from `./src/components/*.tsx`

```typescript
// package.json exports
"./*": "./src/components/*.tsx"
```

### 2. opencode-reactant (Reagent)

**Location**: `orgs/riatzukiza/openhax/packages/opencode-reactant/`

**Stack**: Reagent, Tailwind CSS, re-frame patterns

**Components**:
- `issue-item`, `pr-item`, `worktree-item` - GitHub item cards
- `scrolling-container` - Reusable scroll container
- `events-log` - Event display
- `file-explorer`, `file-entry` - File browser
- `nav-link` - Navigation link
- `main-layout` - Application shell

**Styling Pattern**: Tailwind classes in hiccup vectors

```clojure
[:div.bg-white.border.border-gray-200.p-4.rounded-lg.shadow-sm]
```

### 3. Domain-Specific Components

**Gates of Aker** (`orgs/octave-commons/gates-of-aker/web/src/components/`):
- `AgentCard` - Complex entity card with needs, inventory, relationships
- `BuildingPalette`, `BuildControls` - Game-specific controls
- `EventCard`, `EventFeed` - Timeline display
- `MainMenu` - Game navigation

**Threat Radar** (`threat-radar-deploy/services/threat-radar-web/src/ui/components/`):
- `RiskGauge` - Semi-circular gauge visualization
- `BranchMap` - Tree visualization
- `EtaLane`, `MuLane` - Kanban-style lanes
- `FirehosePanel`, `HeroPanel` - Dashboard panels

---

## Component Frequency Analysis

### Top 20 Defined Components (TSX/JSX)

| Component | Files | Category |
|-----------|-------|----------|
| App | 22 | Application root |
| Home | 12 | Page |
| Footer | 8 | Navigation |
| Header | 8 | Navigation |
| Layout | 6 | Layout |
| Button | 5 | Primitive |
| Spinner | 5 | Feedback |
| IconCheck | 4 | Icon |
| Card | 4 | Primitive |
| Modal | 4 | Composite |

### Top 20 Used Components (JSX Usage)

| Component | Usages | Framework | Props |
|-----------|--------|-----------|-------|
| Show | 754 | SolidJS | `when`, `fallback`, `keyed` |
| Match | 336 | SolidJS | `when` |
| For | 195 | SolidJS | `each`, `fallback` |
| Button | 187 | All | `variant`, `size`, `onClick`, `disabled`, `icon` |
| Switch | 149 | SolidJS | `fallback`, `checked`, `disabled`, `onChange` |
| Icon | 109 | All | `name`, `size`, `className` |
| Route | 77 | Router | `path`, `element`, `exact` |
| Link | 67 | Navigation | `href`, `className`, `style` |
| Card | 46 | Layout | `variant`, `class`, `title`, `extra` |
| Tooltip | 45 | Overlay | `placement`, `gutter`, `content` |

---

## Repeating Patterns Identified

### 1. Card/Item Patterns

Found in:
- `AgentCard` (Gates of Aker)
- `issue-item`, `pr-item` (OpenCode Reactant)
- `EtaThreadCard`, `MuThreadCard` (Threat Radar)
- `EventCard` (Gates of Aker)

**Common structure**:
```
┌─────────────────────────────┐
│ Header (title, status)      │
├─────────────────────────────┤
│ Body (description, metadata)│
├─────────────────────────────┤
│ Footer (actions)            │
└─────────────────────────────┘
```

**Extraction candidate**: `@open-hax/uxx/Card` with composable parts:
- `Card.Header`
- `Card.Body`  
- `Card.Footer`
- `Card.Status`

### 2. Badge/Chip Patterns

Found in:
- Status badges (alive/dead, open/closed)
- Category chips (role, type)
- Affinity indicators

**Extraction candidate**: `@open-hax/uxx/Badge` with variants:
- `status` (success, warning, error, info)
- `category` (default, primary, secondary)
- Custom color support

### 3. Navigation Patterns

Found in:
- `Header` (8 implementations)
- `Footer` (8 implementations)
- `Sidebar` variants
- `nav-link` (Reagent)

**Extraction candidate**: Navigation primitives:
- `TopNav` with slots (logo, links, actions)
- `SideNav` with collapsible sections
- `Breadcrumb`

### 4. Loading States

Found in:
- `Spinner` (5 implementations)
- `LoadingSkeleton` (Threat Radar)
- Inline loading indicators

**Extraction candidate**: Loading feedback:
- `Spinner` with size/color variants
- `Skeleton` with shape presets
- `LoadingOverlay` for containers

### 5. Button Patterns

Found in:
- 187 usages across all projects
- Variants: primary, secondary, ghost, danger
- Sizes: small, normal, large
- With icons

**Existing**: `@opencode-ai/ui/button` already implements this well.

**Action**: Create React + Reagent equivalents with matching API.

---

## Framework Distribution

```
┌─────────────────────────────────────────────────────────────┐
│ SolidJS (Kobalte)    ████████████████████  104 components   │
│ React                ██████████████████    ~80 components   │
│ Reagent              ███████               ~30 components   │
└─────────────────────────────────────────────────────────────┘
```

**Challenge**: Components are not portable across frameworks.

**Solution**: 
1. **Token layer** (framework-agnostic): Colors, spacing, typography, motion
2. **Primitive layer** (framework-specific with shared contracts): Button, Input, Card
3. **Composite layer** (framework-specific): DataTable, CommandPalette

---

## Recommended Library Structure

```
orgs/open-hax/uxx/
├── tokens/                          # @open-hax/uxx/tokens
│   ├── src/
│   │   ├── colors.ts               # Monokai + semantic aliases
│   │   ├── spacing.ts              # 4px base scale
│   │   ├── typography.ts           # Font families, sizes, weights
│   │   ├── motion.ts               # Animation durations, easings
│   │   ├── shadows.ts              # Elevation system
│   │   └── index.ts
│   └── package.json
│
├── react/                           # @open-hax/uxx
│   ├── src/
│   │   ├── primitives/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── index.ts
│   │   ├── composites/
│   │   │   ├── Modal.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── package.json
│
├── reagent/                         # @open-hax/uxx-reagent
│   ├── src/
│   │   ├── devel/ui/
│   │   │   ├── primitives/
│   │   │   │   ├── button.cljs
│   │   │   │   ├── badge.cljs
│   │   │   │   ├── card.cljs
│   │   │   │   ├── icon.cljs
│   │   │   │   ├── input.cljs
│   │   │   │   ├── spinner.cljs
│   │   │   │   └── core.cljs
│   │   │   ├── composites/
│   │   │   │   ├── modal.cljs
│   │   │   │   ├── command_palette.cljs
│   │   │   │   └── core.cljs
│   │   │   └── core.cljs
│   │   └── index.cljs
│   └── package.json
│
└── contracts/                       # @open-hax/uxx contracts
    ├── button.edn
    ├── badge.edn
    ├── card.edn
    └── ...
```

---

## Component Contract Example

```edn
;; contracts/button.edn
{:component :button
 :props
 {:variant   {:type :enum 
              :values [:primary :secondary :ghost :danger] 
              :default :secondary}
  :size      {:type :enum 
              :values [:sm :md :lg] 
              :default :md}
  :disabled  {:type :boolean 
              :default false}
  :loading   {:type :boolean 
              :default false}
  :icon-start {:type :element 
               :required false}
  :icon-end   {:type :element 
               :required false}
  :on-click  {:type :function 
              :required false}
  :type      {:type :enum 
              :values [:button :submit :reset]
              :default :button}}
 :slots [:children]
 :forbidden-props [:style :class]
 ;; Accessibility
 :aria {:disabled :disabled}
 ;; Keyboard
 :keyboard {:focusable true
            :activatable true}}
```

---

## Migration Path

### Phase 1: Tokens (Week 1)

1. Extract design tokens from existing codebases
2. Create `@open-hax/uxx/tokens` package
3. Generate CSS custom properties
4. Generate CLJS constants

### Phase 2: React Primitives (Week 2-3)

1. Create `@open-hax/uxx` package
2. Implement Button, Badge, Card, Icon, Input, Spinner
3. Match SolidJS `@opencode-ai/ui` API where possible
4. Add Storybook stories

### Phase 3: Reagent Wrappers (Week 4)

1. Create `@open-hax/uxx-reagent` package
2. Implement Reagent components with same contracts
3. Provide ratom integration helpers
4. Add devcards

### Phase 4: Migration (Week 5-6)

1. Add ESLint rules to enforce library imports
2. Add clj-kondo hooks for CLJS
3. Migrate low-risk components first
4. Deprecate inline implementations

---

## Immediate Actions

1. **Create `orgs/open-hax/uxx/` directory structure**
2. **Extract tokens from `@opencode-ai/ui` theme**
3. **Create first contract: `button.edn`**
4. **Implement React Button matching SolidJS API**
5. **Implement Reagent Button matching contract**

---

## Appendix: File Locations

### High-Value Extraction Targets

| Component | Source | Priority |
|-----------|--------|----------|
| Button | `orgs/anomalyco/opencode/orgs/open-hax/uxx/src/components/button.tsx` | P0 |
| Card | `orgs/anomalyco/opencode/orgs/open-hax/uxx/src/components/card.tsx` | P0 |
| Badge | Extract from `AgentCard`, `issue-item` patterns | P1 |
| Spinner | `orgs/anomalyco/opencode/orgs/open-hax/uxx/src/components/spinner.tsx` | P0 |
| Modal | `orgs/anomalyco/opencode/orgs/open-hax/uxx/src/components/dialog.tsx` | P1 |
| Tooltip | `orgs/anomalyco/opencode/orgs/open-hax/uxx/src/components/tooltip.tsx` | P1 |

### Reagent Reference Implementations

| Component | Location |
|-----------|----------|
| scrollable-container | `orgs/riatzukiza/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs` |
| nav-link | `orgs/riatzukiza/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs` |
| item-card patterns | `orgs/riatzukiza/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs` |

---

*Generated: 2026-04-02*
*Tool: tools/ui-audit/analyze-components.mjs*
