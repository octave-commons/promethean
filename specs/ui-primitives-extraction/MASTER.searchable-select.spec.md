# Master Spec: SearchableSelect Epic

> *Type to find. Click to choose. Keyboard to navigate.*

---

## Status: `done`

---

## Context

SearchableSelect is an 8-point primitive that provides a text input with dropdown suggestions, keyboard navigation, and selection management. Due to its complexity, it is broken into 5 smaller specs that can be delivered incrementally.

**Parent Epic:** `MASTER.ui-primitives-extraction.spec.md`

**Implementation:** `orgs/open-hax/uxx/react/src/primitives/SearchableSelect.tsx`

---

## Story Points: 8 (Total)

| Spec | Points | Priority | Dependencies |
|------|--------|----------|--------------|
| searchable-select-core.spec.md | 2 | HIGH | None |
| searchable-select-keyboard.spec.md | 2 | HIGH | Core |
| searchable-select-accessibility.spec.md | 2 | MEDIUM | Core, Keyboard |
| searchable-select-recent.spec.md | 1 | LOW | Core |
| searchable-select-highlight.spec.md | 1 | LOW | Core |

---

## Incremental Value Delivery

### Sprint 1: Core + Keyboard (4 pts)
Delivers minimum viable searchable dropdown with full keyboard support. Users can type, filter, and select via mouse or keyboard.

### Sprint 2: Accessibility (2 pts)
Delivers full ARIA combobox pattern. Screen reader users get equivalent experience.

### Sprint 3: Polish (2 pts)
Delivers recent options section and text highlighting. Enhanced UX for frequent users.

---

## Interface (Full Vision)

```typescript
export interface SearchableSelectProps<T = string> {
  // Core (Spec 1)
  options: T[];
  value?: T | null;
  onChange: (value: T) => void;
  getOptionLabel?: (option: T) => string;
  getOptionKey?: (option: T) => string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  maxSuggestions?: number;
  size?: 'sm' | 'md' | 'lg';

  // Keyboard (Spec 2)
  // (no new props - behavior is internal)

  // Accessibility (Spec 3)
  ariaLabel?: string;
  ariaDescribedBy?: string;

  // Recent (Spec 4)
  recentOptions?: T[];
  maxRecentOptions?: number;

  // Highlight (Spec 5)
  highlightMatches?: boolean;

  // Advanced
  filterOption?: (option: T, inputValue: string) => boolean;
  noOptionsMessage?: string;
  autoFocus?: boolean;
}
```

---

## Spec Files

1. [searchable-select-core.spec.md](./searchable-select-core.spec.md) — **2 pts** ✅
   - Input with dropdown
   - Filter options by input
   - Click to select
   - Basic focus/blur handling

2. [searchable-select-keyboard.spec.md](./searchable-select-keyboard.spec.md) — **2 pts** ✅
   - Arrow up/down navigation
   - Enter to select
   - Escape to close
   - Tab behavior

3. [searchable-select-accessibility.spec.md](./searchable-select-accessibility.spec.md) — **2 pts** ✅
   - ARIA combobox pattern
   - aria-expanded, aria-activedescendant
   - Role attributes
   - Screen reader announcements

4. [searchable-select-recent.spec.md](./searchable-select-recent.spec.md) — **1 pt** ✅
   - Recent options section
   - Divider between recent/all
   - Max recent count

5. [searchable-select-highlight.spec.md](./searchable-select-highlight.spec.md) — **1 pt** ✅
   - Highlight matching text
   - Bold or background highlight
   - Case-insensitive matching

---

## Success Criteria (Epic Level)

- [x] All 5 specs implemented and tested
- [x] Full keyboard navigation works
- [x] Screen reader compatible
- [x] Recent options show correctly
- [x] Matching text highlighted
- [ ] Reagent wrapper mirrors React behavior — future work
- [x] Storybook story demonstrates all features
- [x] Integration tests cover user flows

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Scope creep between specs | Strict interface boundaries; each spec adds behavior without modifying core |
| Keyboard conflicts with accessibility | Spec 2 and 3 developed together; accessibility reviews keyboard behavior |
| Dropdown positioning edge cases | Core spec uses simple positioning; defer portal/flip to future enhancement |

---

## Out of Scope

- Async option loading (future: `AsyncSearchableSelect`)
- Multi-select (future: `MultiSearchableSelect`)
- Virtualized option lists for large datasets
- Dropdown portal rendering (append to body)
- Flip/shift positioning (Popper.js integration)

---

## References

- Corpus: `orgs/open-hax/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs`
- Corpus: `orgs/octave-commons/gates-of-aker/.worktrees/issue-34-replace-println-logging/web/src/components/LedgerPanel.tsx`
- WAI-ARIA Combobox Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
