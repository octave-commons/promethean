# Spec: SearchableSelect Recent Options

> *History at the top. Quick access to the familiar.*

---

## Status: `done`

---

## Context

Adds a "Recent" section to the dropdown, showing previously selected options at the top for quick access.

**Parent Epic:** `MASTER.searchable-select.spec.md`

**Dependencies:** `searchable-select-core.spec.md`

---

## Story Points: 1

**Complexity factors:**
- Recent options section with divider
- Conditional rendering (only show if recentOptions provided)
- Limit to maxRecentOptions
- Exclude recent from main list (or dedupe)

**Low complexity:** Small feature addition. No complex state or interactions.

---

## Interface

```typescript
export interface SearchableSelectRecentProps<T = string> {
  /** Recent selections (shown at top) */
  recentOptions?: T[];
  /** Maximum recent options to show */
  maxRecentOptions?: number;
}
```

---

## Behavior

### Recent Section

1. **Show recent** — If `recentOptions` provided, show "Recent" section at top of dropdown
2. **Limit count** — Show at most `maxRecentOptions` (default 5)
3. **Divider** — Visual divider between Recent and All sections
4. **Click to select** — Same as any option

### Filtering

When user types:
- Filter both recent and all options
- Show filtered recent in Recent section
- Show filtered all in All section
- If no recent match, hide Recent section

---

## Implementation Notes

### Section Structure

```tsx
<div className="dropdown">
  {filteredRecent.length > 0 && (
    <div className="recent-section">
      <div className="section-label">Recent</div>
      {filteredRecent.map((option, index) => (
        <option key={getOptionKey(option)}>{getOptionLabel(option)}</option>
      ))}
    </div>
  )}
  
  {filteredRecent.length > 0 && filteredAll.length > 0 && (
    <div className="divider" />
  )}
  
  <div className="all-section">
    {filteredAll.map((option, index) => (
      <option key={getOptionKey(option)}>{getOptionLabel(option)}</option>
    ))}
  </div>
</div>
```

### Filter Recent

```tsx
const filteredRecent = useMemo(() => {
  if (!recentOptions) return [];
  return recentOptions
    .filter(opt => matchesFilter(opt, inputValue))
    .slice(0, maxRecentOptions ?? 5);
}, [recentOptions, inputValue, maxRecentOptions]);
```

### Deduping

Options in recent should not appear in all section:

```tsx
const recentKeys = new Set(filteredRecent.map(getOptionKey));
const filteredAll = allOptions
  .filter(opt => matchesFilter(opt, inputValue))
  .filter(opt => !recentKeys.has(getOptionKey(opt)));
```

---

## Token Integration

```typescript
const styles = {
  sectionLabel: {
    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  divider: {
    height: '1px',
    backgroundColor: tokens.colors.border.default,
    margin: `${tokens.spacing[1]}px 0`,
  },
};
```

---

## Success Criteria

- [x] Recent section shows when `recentOptions` provided
- [x] Limited to `maxRecentOptions`
- [x] Divider between Recent and All sections
- [x] Recent options are clickable
- [x] Recent section hides when empty after filter
- [x] Options don't duplicate between sections
- [x] Recent section highlighted correctly with keyboard
- [x] Screen reader announces "Recent" group
- [x] Storybook story with recent options
- [x] Unit tests

---

## Out of Scope

- Persisting recent options (parent component responsibility)
- Text highlighting (Spec 5)

---

## Dependencies

Requires `searchable-select-core.spec.md`. Independent of keyboard and accessibility specs.
