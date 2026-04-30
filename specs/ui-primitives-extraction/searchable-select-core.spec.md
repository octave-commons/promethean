# Spec: SearchableSelect Core

> *Type, filter, click. The foundation.*

---

## Status: `done`

---

## Context

Core implementation of SearchableSelect providing basic filtering dropdown functionality. This is the foundation that keyboard navigation, accessibility, and polish features build upon.

**Parent Epic:** `MASTER.searchable-select.spec.md`

---

## Story Points: 2

**Complexity factors:**
- Input state management
- Dropdown show/hide on focus/blur
- Option filtering by input text
- Click handling with blur timing
- Value selection and callback
- Clear button (optional)

**Lower complexity:** Well-scoped MVP. No keyboard navigation, no ARIA, no advanced features.

---

## Interface

```typescript
export interface SearchableSelectCoreProps<T = string> {
  /** Options to search and select from */
  options: T[];
  /** Currently selected value */
  value?: T | null;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Function to get display string from option */
  getOptionLabel?: (option: T) => string;
  /** Function to get unique key from option */
  getOptionKey?: (option: T) => string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether to show clear button */
  clearable?: boolean;
  /** Maximum number of suggestions to show */
  maxSuggestions?: number;
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
}
```

---

## Behavior

### Input Interaction

1. **Focus** — Show dropdown with all options (or filtered if input has text)
2. **Type** — Filter options by input text (case-insensitive contains)
3. **Blur** — Hide dropdown after 100ms delay (allows click to register)
4. **Clear button** — Clear value and input, focus input

### Dropdown

1. **Position** — Below input, full width, absolute positioned
2. **Z-index** — Above other content (dropdown z-index)
3. **Max height** — Scrollable if options exceed max height
4. **Empty state** — Show "No options found" when filter matches nothing

### Selection

1. **Click option** — Set value, close dropdown, call onChange
2. **Option highlight** — Hover state on options
3. **Selected state** — Visual indicator for current value

---

## Implementation Notes

### Blur Timing

The 100ms delay on blur is critical for click handling:

```tsx
const handleBlur = () => {
  // Delay to allow click event to fire on dropdown option
  setTimeout(() => setShowDropdown(false), 100);
};
```

### Filter Function

Default filter is case-insensitive contains:

```tsx
const filterOptions = (options: T[], input: string) => {
  const lower = input.toLowerCase();
  return options.filter(opt => 
    getOptionLabel(opt).toLowerCase().includes(lower)
  );
};
```

### Object Options

Support both string and object options:

```tsx
// String options
<SearchableSelect
  options={['apple', 'banana', 'cherry']}
  value={selected}
  onChange={setSelected}
/>

// Object options
<SearchableSelect
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  getOptionLabel={user => user.name}
  getOptionKey={user => user.id}
/>
```

---

## Token Integration

```typescript
const styles = {
  input: {
    padding: sizeStyles[size],
    fontSize: tokens.fontSize.sm,
    border: `1px solid ${tokens.colors.border.default}`,
    borderRadius: tokens.spacing[1.5],
    backgroundColor: tokens.colors.background.surface,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.background.elevated,
    border: `1px solid ${tokens.colors.border.default}`,
    borderRadius: tokens.spacing[1.5],
    boxShadow: tokens.shadow.lg,
    zIndex: tokens.zIndex.dropdown,
    maxHeight: '240px',
    overflow: 'auto',
  },
  option: {
    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colors.background.surface,
    },
  },
};
```

---

## Success Criteria

- [x] Input renders with placeholder
- [x] Dropdown shows on focus
- [x] Options filter as user types
- [x] Clicking option selects it
- [x] Dropdown closes after selection
- [x] Clear button clears value (when clearable)
- [x] Object options work with getOptionLabel
- [x] maxSuggestions limits shown options
- [x] "No options found" shows when empty
- [x] Storybook story with basic usage
- [x] Unit tests ≥80% coverage

---

## Out of Scope

- Keyboard navigation (Spec 2)
- ARIA accessibility (Spec 3)
- Recent options section (Spec 4)
- Text highlighting (Spec 5)

---

## Corpus References

- `orgs/open-hax/openhax/packages/opencode-reactant/src/opencode/ui/components.cljs` (repo-controls)
- `orgs/octave-commons/gates-of-aker/.worktrees/issue-34-replace-println-logging/web/src/components/LedgerPanel.tsx`

---

## Dependencies

None. This is the foundation spec.
