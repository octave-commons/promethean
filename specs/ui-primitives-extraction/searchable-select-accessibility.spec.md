# Spec: SearchableSelect Accessibility

> *Screen readers speak. Keyboards suffice.*

---

## Status: `done`

---

## Context

Implements full ARIA combobox pattern for SearchableSelect, ensuring screen reader users have equivalent experience.

**Parent Epic:** `MASTER.searchable-select.spec.md`

**Dependencies:** `searchable-select-core.spec.md`, `searchable-select-keyboard.spec.md` (both complete)

---

## Story Points: 2

**Complexity factors:**
- ARIA combobox pattern (complex specification)
- aria-expanded state management
- aria-activedescendant for highlight
- Role attributes on all elements
- Screen reader announcements for selection
- Live region for option count

---

## Interface

```typescript
export interface SearchableSelectA11yProps {
  /** Accessible label for the combobox */
  ariaLabel?: string;
  /** ID of element that describes the combobox */
  ariaDescribedBy?: string;
}
```

---

## ARIA Pattern

Following [WAI-ARIA Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/):

### Structure

```html
<div role="combobox" aria-expanded="false" aria-haspopup="listbox">
  <input
    type="text"
    aria-autocomplete="list"
    aria-controls="listbox-id"
    aria-activedescendant="option-id"
  />
  <ul role="listbox" id="listbox-id">
    <li role="option" id="option-1" aria-selected="false">Option 1</li>
    <li role="option" id="option-2" aria-selected="false">Option 2</li>
  </ul>
</div>
```

### Attributes

| Element | Attribute | Value |
|---------|-----------|-------|
| Container | `role` | `combobox` |
| Container | `aria-expanded` | `true` when open, `false` when closed |
| Container | `aria-haspopup` | `listbox` |
| Input | `aria-autocomplete` | `list` |
| Input | `aria-controls` | ID of listbox |
| Input | `aria-activedescendant` | ID of highlighted option |
| Listbox | `role` | `listbox` |
| Option | `role` | `option` |
| Option | `aria-selected` | `true` for current value, `false` otherwise |

---

## Implementation Notes

### ID Generation

Generate unique IDs for listbox and options:

```tsx
const id = useId();
const listboxId = `${id}-listbox`;
const getOptionId = (index: number) => `${id}-option-${index}`;
```

### aria-activedescendant

Update as highlight changes:

```tsx
<input
  aria-activedescendant={
    highlightedIndex >= 0 
      ? getOptionId(highlightedIndex) 
      : undefined
  }
/>
```

### aria-expanded

Reflect dropdown state:

```tsx
<div
  role="combobox"
  aria-expanded={showDropdown}
  aria-haspopup="listbox"
>
```

### Screen Reader Announcements

Announce selection and count:

```tsx
// Live region for announcements
<div
  role="status"
  aria-live="polite"
  className="sr-only"
>
  {selected && `Selected ${getOptionLabel(selected)}`}
  {showDropdown && `${filteredOptions.length} options available`}
</div>
```

### Option IDs

Each option needs a stable ID:

```tsx
<li
  role="option"
  id={getOptionId(index)}
  aria-selected={value === option}
>
  {getOptionLabel(option)}
</li>
```

---

## Token Integration

Screen reader only class (visually hidden):

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Success Criteria

- [x] Container has `role="combobox"`
- [x] `aria-expanded` reflects dropdown state
- [x] Input has `aria-autocomplete="list"`
- [x] Input has `aria-controls` pointing to listbox
- [x] Input has `aria-activedescendant` when highlighting
- [x] Listbox has `role="listbox"`
- [x] Options have `role="option"`
- [x] Selected option has `aria-selected="true"`
- [x] Selection announced to screen readers
- [x] Option count announced when dropdown opens
- [ ] Works with VoiceOver (macOS) — manual testing required
- [ ] Works with NVDA (Windows) — manual testing required
- [ ] Axe DevTools passes with no violations — manual testing required
- [x] Unit tests for ARIA attributes

---

## Out of Scope

- Recent options section (Spec 4)
- Text highlighting (Spec 5)

---

## Dependencies

Requires both Core and Keyboard specs to be implemented first. The ARIA pattern depends on highlight state from keyboard navigation.

---

## Testing Notes

Manual testing required with:
- VoiceOver on macOS (Safari, Chrome)
- NVDA on Windows (Chrome, Firefox)
- Axe DevTools for automated checks

Automated tests should verify:
- All ARIA attributes are present
- Attributes update correctly with state changes
