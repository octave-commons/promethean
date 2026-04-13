# Spec: SearchableSelect Text Highlighting

> *Matches glow. Patterns visible.*

---

## Status: `done`

---

## Context

Highlights matching text in dropdown options to show which parts match the user's input.

**Parent Epic:** `MASTER.searchable-select.spec.md`

**Dependencies:** `searchable-select-core.spec.md`

---

## Story Points: 1

**Complexity factors:**
- Split option text into matching/non-matching parts
- Render with highlight style
- Case-insensitive matching
- Handle empty input (no highlight)

**Low complexity:** Simple text processing and conditional rendering.

---

## Interface

```typescript
export interface SearchableSelectHighlightProps {
  /** Whether to highlight matching text */
  highlightMatches?: boolean;
}
```

---

## Behavior

### Highlighting

1. **When enabled** — If `highlightMatches=true`, highlight matching text in options
2. **Case-insensitive** — Match regardless of case
3. **First match** — Highlight only the first occurrence
4. **Empty input** — No highlighting when input is empty

### Visual Style

- Bold text for matching portion
- Same text color, just bolder
- Or: slight background tint (optional)

---

## Implementation Notes

### Text Splitting

```tsx
function highlightMatch(
  text: string,
  query: string
): React.ReactNode {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <strong style={{ fontWeight: 600 }}>
        {text.slice(index, index + query.length)}
      </strong>
      {text.slice(index + query.length)}
    </>
  );
}
```

### Usage in Option

```tsx
<li role="option">
  {highlightMatches 
    ? highlightMatch(getOptionLabel(option), inputValue)
    : getOptionLabel(option)
  }
</li>
```

### Multiple Matches (Optional Enhancement)

Highlight all matches:

```tsx
function highlightAllMatches(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));
  
  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase()
      ? <strong key={i}>{part}</strong>
      : part
  );
}
```

---

## Token Integration

```typescript
const styles = {
  highlight: {
    fontWeight: tokens.fontWeight.semibold,
    // Optional: slight background
    // backgroundColor: 'rgba(102, 217, 239, 0.2)',
    // borderRadius: '2px',
    // padding: '0 2px',
  },
};
```

---

## Success Criteria

- [x] Matching text is highlighted when `highlightMatches=true`
- [x] Highlighting is case-insensitive
- [x] Only first match is highlighted (or all, if chosen)
- [x] No highlight when input is empty
- [x] Works with object options
- [x] Works with recent options section
- [x] Storybook story demonstrating highlighting
- [x] Unit tests for text splitting logic

---

## Out of Scope

- Custom highlight styles (future: `highlightStyle` prop)
- Multiple highlight colors
- Regex-based matching

---

## Dependencies

Requires `searchable-select-core.spec.md`. Independent of keyboard, accessibility, and recent specs.

---

## Edge Cases

- Query longer than option text → no match
- Query contains special regex characters → escape them
- Empty query → no highlight
- Option text is empty → render nothing
