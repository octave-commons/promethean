# Master Spec: UI Component Testing

> *Untested code is broken code waiting to happen.*

---

## Context

The UI component library has 34 React primitives but only 5 have unit tests (15% coverage). This spec defines the testing strategy to reach optimal coverage while prioritizing high-value, high-risk components.

---

## Current State (2026-04-03)

| Metric | Current | Target |
|--------|---------|--------|
| Components with tests | 5 (15%) | 34 (100%) |
| Test files | 5 | 34 |
| Estimated coverage | ~20% | ≥80% |

### Tested Components

| Component | Lines | Test Focus |
|-----------|-------|------------|
| SearchableSelect | 597 | Keyboard, filtering, selection, ARIA |
| Progress | 332 | Variants, gradients, segments, animations |
| CollapsiblePanel | 306 | Controlled/uncontrolled, chevron animation |
| KeyValueSection | 280 | Layouts, icons, dividers |
| Badge | 262 | Variants, pulse, sizes, icons |

### Untested Components (29)

Ordered by complexity (lines of code):

**High Complexity (400+ lines) — 9 components**
| Component | Lines | Risk Level |
|-----------|-------|------------|
| InspectorPane | 663 | HIGH — complex state, multiple modes |
| RichTextEditor | 591 | HIGH — WYSIWYG, toolbar, mentions |
| MarkdownEditor | 555 | HIGH — split pane, preview modes |
| Feed | 542 | MEDIUM — variants, grouping |
| PermissionPrompts | 508 | MEDIUM — async handling |
| DiffViewer | 488 | MEDIUM — syntax, modes |
| Chat | 486 | HIGH — streaming, markdown |
| CommandPalette | 422 | HIGH — fuzzy search, keyboard |
| CodeBlock | 404 | MEDIUM — syntax highlighting |

**Medium Complexity (200-399 lines) — 12 components**
| Component | Lines | Risk Level |
|-----------|-------|------------|
| Markdown | 394 | MEDIUM |
| Tabs | 374 | HIGH — keyboard navigation, ARIA |
| FileTree | 354 | MEDIUM — hierarchy, search |
| Toast | 319 | MEDIUM — positioning, stacking |
| WhichKeyPopup | 310 | MEDIUM |
| Modal | 300 | HIGH — focus trap, accessibility |
| Tooltip | 285 | LOW |
| Input | 281 | MEDIUM — validation, icons |
| ResizablePane | 227 | MEDIUM |
| ReactReagentSeam | 211 | MEDIUM |
| Card | 207 | LOW |

**Low Complexity (<200 lines) — 8 components**
| Component | Lines | Risk Level |
|-----------|-------|------------|
| Button | 179 | LOW — variants, loading |
| DataTableShell | 175 | MEDIUM |
| SurfaceHero | 128 | LOW |
| Spinner | 73 | LOW |
| PanelHeader | 70 | LOW |
| MetricTile | 70 | LOW |
| StatusChipStack | 53 | LOW |
| FilterToolbar | 35 | LOW |
| ActionStrip | 32 | LOW |
| MetricTileGrid | 20 | LOW |

---

## Testing Strategy

### Test Categories

Each component should have tests covering:

1. **Rendering** — Component renders with required props
2. **Props** — All prop variants work correctly
3. **State** — Controlled/uncontrolled modes, state transitions
4. **Events** — Click, keyboard, focus handlers
5. **Accessibility** — ARIA attributes, keyboard navigation
6. **Edge Cases** — Empty states, error states, boundary values

### Priority Matrix

| Priority | Criteria | Components |
|----------|----------|------------|
| P0 | High complexity + HIGH risk | InspectorPane, RichTextEditor, MarkdownEditor, Chat, CommandPalette, Tabs, Modal |
| P1 | High complexity + MEDIUM risk | Feed, PermissionPrompts, DiffViewer, CodeBlock, Markdown, FileTree |
| P2 | Medium complexity | Toast, WhichKeyPopup, Input, ResizablePane, ReactReagentSeam |
| P3 | Low complexity | Button, Card, Tooltip, Spinner, PanelHeader, MetricTile, etc. |

---

## Phased Approach

### Phase 1: Critical Path (35 pts)

**P0 components — High complexity, high accessibility requirements.**

These components are used frequently and have complex interaction patterns:

| Spec | Points | Focus |
|------|--------|-------|
| Modal | 5 | Focus trap, escape key, backdrop click, ARIA |
| Tabs | 5 | Keyboard navigation (arrow keys), ARIA tabs pattern, lazy rendering |
| CommandPalette | 5 | Fuzzy search, keyboard nav, recent items, grouping |
| InspectorPane | 8 | Selection state, error handling, pinned entities, context |
| Chat | 5 | Message rendering, streaming, markdown, send handler |
| RichTextEditor | 5 | Toolbar actions, mentions, format conversion |
| MarkdownEditor | 2 | Preview modes, toolbar, onChange |

### Phase 2: High Complexity (25 pts)

**P1 components — Complex but lower accessibility risk.**

| Spec | Points | Focus |
|------|--------|-------|
| Feed | 3 | Variants, grouping, item actions, timestamps |
| PermissionPrompts | 3 | Permission flow, input prompts, timeout handling |
| DiffViewer | 5 | Unified/split modes, line highlighting, syntax |
| CodeBlock | 3 | Language detection, line numbers, copy button |
| Markdown | 3 | GFM rendering, syntax highlighting, headings |
| FileTree | 5 | Hierarchy, selection, search, expand/collapse |
| Toast | 3 | Positioning, stacking, auto-dismiss, actions |

### Phase 3: Medium Complexity (20 pts)

**P2 components — Standard interactive components.**

| Spec | Points | Focus |
|------|--------|-------|
| Input | 3 | Types, validation states, icons, error messages |
| WhichKeyPopup | 2 | Keyboard shortcuts display, positioning |
| ResizablePane | 3 | Drag handle, min/max sizes, controlled size |
| ReactReagentSeam | 2 | React-Reagent interop, prop conversion |
| Tooltip | 2 | Placements, triggers, delay |
| Card | 2 | Variants, interactive mode, slots |
| Button | 2 | Variants, loading state, icons |
| DataTableShell | 4 | Sorting, pagination, selection |

### Phase 4: Low Complexity (12 pts)

**P3 components — Simple, low-risk components.**

| Spec | Points | Focus |
|------|--------|-------|
| Spinner | 1 | Sizes, label, animation |
| PanelHeader | 1 | Title, actions, collapse |
| MetricTile | 1 | Value, label, trend |
| SurfaceHero | 1 | Background, content |
| StatusChipStack | 1 | Status array, max display |
| FilterToolbar | 2 | Filters, search, actions |
| ActionStrip | 1 | Actions array, overflow |
| MetricTileGrid | 1 | Grid layout, children |
| SurfaceHero | 1 | Background gradient, content |
| PanelHeader | 1 | Title, badge, actions |

---

## Spec Files

### Phase 1: Critical Path

1. [modal-testing.spec.md](./modal-testing.spec.md) — 5 pts
2. [tabs-testing.spec.md](./tabs-testing.spec.md) — 5 pts
3. [command-palette-testing.spec.md](./command-palette-testing.spec.md) — 5 pts
4. [inspector-pane-testing.spec.md](./inspector-pane-testing.spec.md) — 8 pts
5. [chat-testing.spec.md](./chat-testing.spec.md) — 5 pts
6. [rich-text-editor-testing.spec.md](./rich-text-editor-testing.spec.md) — 5 pts
7. [markdown-editor-testing.spec.md](./markdown-editor-testing.spec.md) — 2 pts

### Phase 2: High Complexity

8. [feed-testing.spec.md](./feed-testing.spec.md) — 3 pts
9. [permission-prompts-testing.spec.md](./permission-prompts-testing.spec.md) — 3 pts
10. [diff-viewer-testing.spec.md](./diff-viewer-testing.spec.md) — 5 pts
11. [code-block-testing.spec.md](./code-block-testing.spec.md) — 3 pts
12. [markdown-testing.spec.md](./markdown-testing.spec.md) — 3 pts
13. [file-tree-testing.spec.md](./file-tree-testing.spec.md) — 5 pts
14. [toast-testing.spec.md](./toast-testing.spec.md) — 3 pts

### Phase 3: Medium Complexity

15. [input-testing.spec.md](./input-testing.spec.md) — 3 pts
16. [which-key-popup-testing.spec.md](./which-key-popup-testing.spec.md) — 2 pts
17. [resizable-pane-testing.spec.md](./resizable-pane-testing.spec.md) — 3 pts
18. [react-reagent-seam-testing.spec.md](./react-reagent-seam-testing.spec.md) — 2 pts
19. [tooltip-testing.spec.md](./tooltip-testing.spec.md) — 2 pts
20. [card-testing.spec.md](./card-testing.spec.md) — 2 pts
21. [button-testing.spec.md](./button-testing.spec.md) — 2 pts
22. [data-table-shell-testing.spec.md](./data-table-shell-testing.spec.md) — 4 pts

### Phase 4: Low Complexity

23. [spinner-testing.spec.md](./spinner-testing.spec.md) — 1 pt
24. [panel-header-testing.spec.md](./panel-header-testing.spec.md) — 1 pt
25. [metric-tile-testing.spec.md](./metric-tile-testing.spec.md) — 1 pt
26. [surface-hero-testing.spec.md](./surface-hero-testing.spec.md) — 1 pt
27. [status-chip-stack-testing.spec.md](./status-chip-stack-testing.spec.md) — 1 pt
28. [filter-toolbar-testing.spec.md](./filter-toolbar-testing.spec.md) — 2 pts
29. [action-strip-testing.spec.md](./action-strip-testing.spec.md) — 1 pt
30. [metric-tile-grid-testing.spec.md](./metric-tile-grid-testing.spec.md) — 1 pt

---

## Test Templates

### Standard Component Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName.js';

describe('ComponentName', () => {
  describe('rendering', () => {
    it('renders with required props', () => {
      render(<ComponentName required="value" />);
      expect(screen.getByRole('...')).toBeInTheDocument();
    });

    it('applies data attributes', () => {
      const { container } = render(<ComponentName />);
      expect(container.firstChild).toHaveAttribute('data-component', 'component-name');
    });
  });

  describe('variants', () => {
    it('renders all variants', () => {
      const variants = ['default', 'primary', 'secondary'];
      variants.forEach(variant => {
        const { unmount } = render(<ComponentName variant={variant} />);
        expect(screen.getByRole('...')).toHaveAttribute('data-variant', variant);
        unmount();
      });
    });
  });

  describe('interaction', () => {
    it('handles click events', () => {
      const onClick = vi.fn();
      render(<ComponentName onClick={onClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalled();
    });

    it('handles keyboard events', () => {
      const onKeyDown = vi.fn();
      render(<ComponentName onKeyDown={onKeyDown} />);
      fireEvent.keyDown(screen.getByRole('...'), { key: 'Enter' });
      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<ComponentName />);
      expect(screen.getByRole('...')).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', () => {
      render(<ComponentName />);
      // Test Tab, Arrow keys, Enter, Escape as appropriate
    });
  });

  describe('edge cases', () => {
    it('handles empty state', () => {
      render(<ComponentName items={[]} />);
      expect(screen.getByText('No items')).toBeInTheDocument();
    });

    it('handles loading state', () => {
      render(<ComponentName loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
```

### Accessibility Test Helpers

```typescript
// Test utilities for accessibility
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<ComponentName />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## Success Metrics

### Quantitative

- [ ] All 34 components have test files
- [ ] All tests pass in CI
- [ ] Code coverage ≥80% for all components
- [ ] All accessibility-critical components have ARIA tests

### Qualitative

- [ ] Tests cover all prop combinations
- [ ] Tests cover all event handlers
- [ ] Tests cover controlled/uncontrolled patterns where applicable
- [ ] Tests cover edge cases (empty, loading, error states)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Test brittleness | Use role-based queries, avoid implementation details |
| Slow test suite | Keep unit tests fast; defer visual/e2e tests |
| Mock complexity | Test real behavior where possible; mock only external deps |
| Coverage without quality | Require meaningful assertions, not just line coverage |

---

## Infrastructure Prerequisites

### Vitest Configuration Fix

Current issue: Vitest config doesn't include `src/**/*.test.tsx` pattern.

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // ... rest of config
  },
});
```

### Test Dependencies

Ensure these are installed:
- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- `jsdom` (for DOM environment)

---

## References

- Existing tests: `orgs/open-hax/uxx/react/src/primitives/*.test.tsx`
- Contracts: `orgs/open-hax/uxx/contracts/*.edn`
- Storybook stories: `orgs/open-hax/uxx/react/src/primitives/*.stories.tsx`

---

## Story Points Summary

| Phase | Points | Components |
|-------|--------|------------|
| Phase 1: Critical Path | 35 pts | 7 components |
| Phase 2: High Complexity | 25 pts | 7 components |
| Phase 3: Medium Complexity | 20 pts | 8 components |
| Phase 4: Low Complexity | 12 pts | 8 components |
| **Total** | **92 pts** | **30 components** |

Already tested (5 components, ~28 pts estimated):
- SearchableSelect, Progress, CollapsiblePanel, KeyValueSection, Badge

**Grand Total: ~120 pts for complete test coverage**
