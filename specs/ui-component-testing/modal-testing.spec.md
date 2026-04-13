# Spec: Modal Testing

> *The modal must trap focus, announce itself, and release control gracefully.*

---

## Status: `incoming`

---

## Context

Modal is a critical accessibility component (300 lines). It implements focus trapping, keyboard handling, and portal rendering. Untested behavior risks accessibility regressions.

**Component:** `orgs/open-hax/uxx/react/src/primitives/Modal.tsx`
**Contract:** `orgs/open-hax/uxx/contracts/modal.edn`

---

## Test Categories

### 1. Rendering Tests

- [ ] Modal renders when `open={true}`
- [ ] Modal does not render when `open={false}`
- [ ] Portal renders to document body
- [ ] Title renders in header
- [ ] Children render in body
- [ ] Footer renders when provided
- [ ] All size variants render (`sm`, `md`, `lg`, `xl`, `full`)

### 2. Focus Management Tests

- [ ] Focus moves to modal when opened
- [ ] Focus moves to first focusable element
- [ ] Tab cycles through focusable elements
- [ ] Shift+Tab cycles backwards
- [ ] Focus is trapped (doesn't escape to backdrop)
- [ ] Focus returns to trigger element when closed
- [ ] `initialFocus` prop sets initial focus

### 3. Keyboard Interaction Tests

- [ ] Escape key closes modal
- [ ] Escape key does nothing when `closeOnEscape={false}`
- [ ] Enter key does not close modal (unless button inside)

### 4. Backdrop Interaction Tests

- [ ] Click on backdrop closes modal
- [ ] Click on backdrop does nothing when `closeOnBackdropClick={false}`
- [ ] Click inside modal does not close modal

### 5. Accessibility Tests

- [ ] `role="dialog"` is set
- [ ] `aria-modal="true"` is set
- [ ] `aria-labelledby` points to title
- [ ] `aria-describedby` points to description if provided
- [ ] Screen reader announces modal title when opened

### 6. Scroll Lock Tests

- [ ] Body scroll is locked when modal opens
- [ ] Body scroll is restored when modal closes
- [ ] Multiple modals don't break scroll lock

### 7. Edge Cases

- [ ] Modal with no title (should not crash)
- [ ] Modal with no children (should not crash)
- [ ] Modal with very long content (scrolls internally)
- [ ] Nested modals (if supported)

### 8. Controlled vs Uncontrolled

- [ ] Controlled mode: `open` prop controls visibility
- [ ] `onClose` callback is called on close actions
- [ ] Modal doesn't close itself in controlled mode

---

## Test Implementation

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal.js';

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'Test Modal',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders when open', () => {
      render(<Modal {...defaultProps}>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<Modal {...defaultProps} open={false}>Content</Modal>);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders all size variants', () => {
      const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
      sizes.forEach(size => {
        const { unmount } = render(
          <Modal {...defaultProps} size={size}>Content</Modal>
        );
        expect(screen.getByRole('dialog')).toHaveAttribute('data-size', size);
        unmount();
      });
    });
  });

  describe('focus management', () => {
    it('traps focus within modal', async () => {
      const user = userEvent.setup();
      render(
        <Modal {...defaultProps}>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </Modal>
      );

      const firstBtn = screen.getByRole('button', { name: 'First' });
      const secondBtn = screen.getByRole('button', { name: 'Second' });
      const thirdBtn = screen.getByRole('button', { name: 'Third' });

      expect(firstBtn).toHaveFocus();

      await user.tab();
      expect(secondBtn).toHaveFocus();

      await user.tab();
      expect(thirdBtn).toHaveFocus();

      await user.tab();
      // Focus should cycle back to first
      expect(firstBtn).toHaveFocus();
    });

    it('returns focus to trigger on close', async () => {
      const TriggerButton = () => {
        const [open, setOpen] = useState(false);
        return (
          <>
            <button onClick={() => setOpen(true)}>Open</button>
            <Modal open={open} onClose={() => setOpen(false)} title="Test">
              Content
            </Modal>
          </>
        );
      };

      render(<TriggerButton />);
      const trigger = screen.getByRole('button', { name: 'Open' });
      trigger.focus();
      await userEvent.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });
  });

  describe('keyboard interaction', () => {
    it('closes on Escape key', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('does not close on Escape when closeOnEscape=false', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('backdrop interaction', () => {
    it('closes on backdrop click', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      // Click on backdrop (outside dialog content)
      fireEvent.click(screen.getByRole('dialog').parentElement!);
      expect(onClose).toHaveBeenCalled();
    });

    it('does not close on content click', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose}>Content</Modal>);
      fireEvent.click(screen.getByText('Content'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Modal {...defaultProps} description="Modal description">Content</Modal>);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });
  });

  describe('scroll lock', () => {
    it('locks body scroll when open', () => {
      render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when closed', () => {
      const { unmount } = render(<Modal {...defaultProps} />);
      unmount();
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });
});
```

---

## Success Criteria

- [ ] All rendering tests pass
- [ ] All focus management tests pass
- [ ] All keyboard interaction tests pass
- [ ] All backdrop interaction tests pass
- [ ] All accessibility tests pass
- [ ] All scroll lock tests pass
- [ ] Code coverage ≥85%

---

## Story Points: 5

**Complexity factors:**
- Focus trap testing requires user-event simulation
- Portal rendering adds complexity
- Multiple close mechanisms (Escape, backdrop, button)
- Accessibility testing requires ARIA assertion patterns
- Scroll lock requires DOM observation

---

## Dependencies

- Vitest configuration fix for test file discovery
- `@testing-library/user-event` for keyboard simulation
