# Spec: Tabs Testing

> *Tabs must sing the ARIA song: roles, states, and keyboard harmony.*

---

## Status: `incoming`

---

## Context

Tabs (374 lines) implements the full ARIA tabs pattern with keyboard navigation, lazy rendering, and multiple visual variants. It's a high-accessibility component requiring thorough keyboard testing.

**Component:** `orgs/open-hax/uxx/react/src/primitives/Tabs.tsx`
**Contract:** `orgs/open-hax/uxx/contracts/tabs.edn`

---

## Test Categories

### 1. Rendering Tests

- [ ] Tabs render with required `items` prop
- [ ] First tab is selected by default
- [ ] Tab labels render correctly
- [ ] Tab content renders for selected tab
- [ ] All visual variants render (`default`, `pills`, `underline`, `enclosed`)
- [ ] All sizes render (`sm`, `md`, `lg`)
- [ ] Horizontal orientation renders
- [ ] Vertical orientation renders

### 2. Selection Tests

- [ ] Clicking tab selects it
- [ ] `value` prop controls selection (controlled mode)
- [ ] `defaultValue` sets initial selection (uncontrolled mode)
- [ ] `onChange` is called on selection change
- [ ] Disabled tab cannot be selected
- [ ] Selected tab has `aria-selected="true"`

### 3. Keyboard Navigation Tests (Horizontal)

- [ ] Tab key moves focus into tab list
- [ ] Arrow Right moves focus to next tab
- [ ] Arrow Left moves focus to previous tab
- [ ] Home key moves focus to first tab
- [ ] End key moves focus to last tab
- [ ] Enter/Space activates focused tab
- [ ] Focus does not wrap by default

### 4. Keyboard Navigation Tests (Vertical)

- [ ] Arrow Down moves focus down
- [ ] Arrow Up moves focus up
- [ ] Home/End work in vertical orientation

### 5. Lazy Rendering Tests

- [ ] `lazy={true}` only renders active tab content
- [ ] `lazy={false}` renders all tab content
- [ ] `keepMounted={true}` keeps inactive tabs in DOM
- [ ] Lazy tabs render on first selection

### 6. Accessibility Tests

- [ ] Tab list has `role="tablist"`
- [ ] Tabs have `role="tab"`
- [ ] Tab panels have `role="tabpanel"`
- [ ] `aria-labelledby` connects tab to panel
- [ ] `aria-controls` connects tab to panel
- [ ] Selected tab has `aria-selected="true"`
- [ ] Unselected tabs have `aria-selected="false"`
- [ ] Disabled tab has `aria-disabled="true"`

### 7. Tab Features Tests

- [ ] Tab icons render
- [ ] Tab badges render
- [ ] Close button renders when `showClose={true}`
- [ ] `onClose` is called with tab ID
- [ ] Add button renders when `addable={true}`
- [ ] `onAdd` is called when add button clicked

### 8. Edge Cases

- [ ] Empty items array (should not crash)
- [ ] Single tab (should render correctly)
- [ ] Tab with no content
- [ ] All tabs disabled
- [ ] Very long tab label (should truncate)

---

## Test Implementation

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs.js';

describe('Tabs', () => {
  const defaultItems = [
    { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
    { id: 'tab2', label: 'Tab 2', content: 'Content 2' },
    { id: 'tab3', label: 'Tab 3', content: 'Content 3' },
  ];

  const defaultProps = {
    items: defaultItems,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all tab labels', () => {
      render(<Tabs {...defaultProps} />);
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
    });

    it('renders first tab content by default', () => {
      render(<Tabs {...defaultProps} />);
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('renders all variants', () => {
      const variants = ['default', 'pills', 'underline', 'enclosed'] as const;
      variants.forEach(variant => {
        const { unmount } = render(<Tabs {...defaultProps} variant={variant} />);
        const tablist = screen.getByRole('tablist');
        expect(tablist).toHaveAttribute('data-variant', variant);
        unmount();
      });
    });

    it('renders vertical orientation', () => {
      render(<Tabs {...defaultProps} orientation="vertical" />);
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('selection', () => {
    it('selects tab on click', async () => {
      const onChange = vi.fn();
      render(<Tabs {...defaultProps} onChange={onChange} />);
      
      await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
      
      expect(onChange).toHaveBeenCalledWith('tab2');
    });

    it('shows selected tab content', async () => {
      render(<Tabs {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
      
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('respects controlled value prop', () => {
      render(<Tabs {...defaultProps} value="tab3" />);
      
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('disabled tab cannot be selected', async () => {
      const items = [
        { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
        { id: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true },
      ];
      const onChange = vi.fn();
      
      render(<Tabs items={items} onChange={onChange} />);
      
      await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation (horizontal)', () => {
    it('Arrow Right moves focus to next tab', async () => {
      render(<Tabs {...defaultProps} />);
      
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      
      tab1.focus();
      fireEvent.keyDown(tab1, { key: 'ArrowRight' });
      
      expect(tab2).toHaveFocus();
    });

    it('Arrow Left moves focus to previous tab', async () => {
      render(<Tabs {...defaultProps} value="tab2" />);
      
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      
      tab2.focus();
      fireEvent.keyDown(tab2, { key: 'ArrowLeft' });
      
      expect(tab1).toHaveFocus();
    });

    it('Home moves focus to first tab', async () => {
      render(<Tabs {...defaultProps} value="tab3" />);
      
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      
      tab3.focus();
      fireEvent.keyDown(tab3, { key: 'Home' });
      
      expect(tab1).toHaveFocus();
    });

    it('End moves focus to last tab', async () => {
      render(<Tabs {...defaultProps} />);
      
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      
      tab1.focus();
      fireEvent.keyDown(tab1, { key: 'End' });
      
      expect(tab3).toHaveFocus();
    });

    it('Enter activates focused tab', async () => {
      const onChange = vi.fn();
      render(<Tabs {...defaultProps} onChange={onChange} />);
      
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      
      tab1.focus();
      fireEvent.keyDown(tab1, { key: 'ArrowRight' });
      fireEvent.keyDown(tab2, { key: 'Enter' });
      
      expect(onChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('accessibility', () => {
    it('has correct tablist role', () => {
      render(<Tabs {...defaultProps} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('tabs have correct roles', () => {
      render(<Tabs {...defaultProps} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('selected tab has aria-selected="true"', () => {
      render(<Tabs {...defaultProps} />);
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('aria-selected', 'true');
    });

    it('tab panel has correct role', () => {
      render(<Tabs {...defaultProps} />);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('tab controls panel via aria-controls', () => {
      render(<Tabs {...defaultProps} />);
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const panel = screen.getByRole('tabpanel');
      
      expect(tab1).toHaveAttribute('aria-controls', panel.id);
    });
  });

  describe('lazy rendering', () => {
    it('only renders active tab content when lazy=true', () => {
      render(<Tabs {...defaultProps} lazy />);
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('renders content on selection when lazy=true', async () => {
      render(<Tabs {...defaultProps} lazy />);
      
      await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
      
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('keeps all tabs mounted when keepMounted=true', () => {
      render(<Tabs {...defaultProps} keepMounted />);
      
      // All content should be in DOM (hidden)
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });
  });

  describe('close and add buttons', () => {
    it('renders close button when showClose=true', () => {
      render(<Tabs {...defaultProps} showClose />);
      
      // Should have close buttons on tabs
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('calls onClose when close button clicked', async () => {
      const onClose = vi.fn();
      render(<Tabs {...defaultProps} showClose onClose={onClose} />);
      
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      await userEvent.click(closeButtons[0]);
      
      expect(onClose).toHaveBeenCalledWith('tab1');
    });

    it('renders add button when addable=true', () => {
      render(<Tabs {...defaultProps} addable />);
      
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('calls onAdd when add button clicked', async () => {
      const onAdd = vi.fn();
      render(<Tabs {...defaultProps} addable onAdd={onAdd} />);
      
      await userEvent.click(screen.getByRole('button', { name: /add/i }));
      
      expect(onAdd).toHaveBeenCalled();
    });
  });
});
```

---

## Success Criteria

- [ ] All rendering tests pass
- [ ] All selection tests pass
- [ ] All keyboard navigation tests pass
- [ ] All accessibility tests pass
- [ ] All lazy rendering tests pass
- [ ] Code coverage ≥85%

---

## Story Points: 5

**Complexity factors:**
- ARIA tabs pattern is complex (role hierarchy, state management)
- Keyboard navigation testing requires focus tracking
- Lazy rendering verification requires DOM inspection
- Multiple variants and orientations
- Close/add button interactions

---

## Dependencies

- `@testing-library/user-event` for keyboard simulation
- Vitest configuration fix for test file discovery
