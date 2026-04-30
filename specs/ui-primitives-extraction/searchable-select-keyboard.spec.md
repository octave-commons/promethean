# Spec: SearchableSelect Keyboard Navigation

> *Arrow keys traverse. Enter commits. Escape cancels.*

---

## Status: `done`

---

## Context

Adds keyboard navigation to SearchableSelect Core, enabling users to navigate options with arrow keys and select with Enter.

**Parent Epic:** `MASTER.searchable-select.spec.md`

**Dependencies:** `searchable-select-core.spec.md`

---

## Story Points: 2

**Complexity factors:**
- Arrow key navigation with highlight index
- Enter key selection
- Escape key cancel
- Tab key behavior (select and move focus)
- Focus management (keep focus in input)
- Edge cases (first/last option wrapping)

---

## Interface

No new props. Keyboard behavior is internal to the component.

---

## Behavior

### Arrow Keys

1. **Arrow Down** — Move highlight to next option
   - If dropdown closed, open it
   - If at last option, stay at last (no wrap)
   - Highlight the option visually

2. **Arrow Up** — Move highlight to previous option
   - If at first option, stay at first (no wrap)
   - Highlight the option visually

### Enter Key

1. **Enter** — Select highlighted option
   - If no option highlighted, select first filtered option
   - Set value, close dropdown, call onChange
   - Keep focus in input

### Escape Key

1. **Escape** — Close dropdown without selection
   - Clear highlight
   - Keep focus in input
   - Do not call onChange

### Tab Key

1. **Tab** — Select highlighted option and move focus
   - If option highlighted, select it and call onChange
   - Allow natural tab order to proceed

2. **Shift+Tab** — Same as Tab, but reverse direction

---

## Implementation Notes

### Highlight Index State

```tsx
const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

// Reset highlight when filter changes
useEffect(() => {
  setHighlightedIndex(-1);
}, [inputValue]);
```

### Keyboard Handler

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (!showDropdown) {
        setShowDropdown(true);
      } else if (highlightedIndex < filteredOptions.length - 1) {
        setHighlightedIndex(i => i + 1);
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      if (highlightedIndex > 0) {
        setHighlightedIndex(i => i - 1);
      }
      break;

    case 'Enter':
      e.preventDefault();
      if (highlightedIndex >= 0) {
        selectOption(filteredOptions[highlightedIndex]);
      } else if (filteredOptions.length > 0) {
        selectOption(filteredOptions[0]);
      }
      break;

    case 'Escape':
      e.preventDefault();
      setShowDropdown(false);
      setHighlightedIndex(-1);
      break;

    case 'Tab':
      if (highlightedIndex >= 0) {
        selectOption(filteredOptions[highlightedIndex]);
      }
      break;
  }
};
```

### Highlighted Option Styling

```tsx
const optionStyles = (index: number, isHighlighted: boolean) => ({
  ...baseOptionStyles,
  backgroundColor: isHighlighted 
    ? tokens.colors.background.elevated 
    : 'transparent',
});
```

### Scroll to Highlighted

Ensure highlighted option stays visible in scrollable dropdown:

```tsx
useEffect(() => {
  if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
    optionRefs.current[highlightedIndex].scrollIntoView({
      block: 'nearest',
    });
  }
}, [highlightedIndex]);
```

---

## Success Criteria

- [x] Arrow Down opens dropdown if closed
- [x] Arrow Down moves highlight to next option
- [x] Arrow Up moves highlight to previous option
- [x] Arrow keys don't wrap at boundaries
- [x] Enter selects highlighted option
- [x] Enter selects first option if none highlighted
- [x] Escape closes dropdown without selection
- [x] Tab selects and moves focus
- [x] Highlighted option scrolls into view
- [x] Focus stays in input during navigation
- [x] Unit tests for all keyboard interactions
- [x] Storybook story demonstrating keyboard navigation

---

## Out of Scope

- ARIA accessibility attributes (Spec 3)
- Recent options section (Spec 4)
- Text highlighting (Spec 5)

---

## Dependencies

Requires `searchable-select-core.spec.md` to be implemented first.
