# Spec: CommandPalette Testing

> *Fuzzy search, keyboard navigation, and instant results—the command palette is the power user's best friend.*

---

## Status: `incoming`

---

## Context

CommandPalette (422 lines) implements fuzzy search, keyboard navigation, recent items, and grouping. It's the primary interaction pattern for power users and requires thorough testing of search and keyboard behavior.

**Component:** `orgs/open-hax/uxx/react/src/primitives/CommandPalette.tsx`
**Contract:** `orgs/open-hax/uxx/contracts/command-palette.edn`

---

## Test Categories

### 1. Rendering Tests

- [ ] Renders search input
- [ ] Renders command list when open
- [ ] Renders all commands
- [ ] Renders group headers
- [ ] Renders shortcuts when provided
- [ ] Renders empty state when no results

### 2. Search Tests

- [ ] Typing filters commands by label
- [ ] Fuzzy search matches partial text
- [ ] Fuzzy search matches non-consecutive characters
- [ ] Search is case-insensitive
- [ ] Empty search shows all commands
- [ ] No results shows empty state message

### 3. Keyboard Navigation Tests

- [ ] Arrow Down moves selection to next command
- [ ] Arrow Up moves selection to previous command
- [ ] Home moves selection to first command
- [ ] End moves selection to last command
- [ ] Enter executes selected command
- [ ] Escape closes palette
- [ ] Tab closes palette (if configured)

### 4. Selection Tests

- [ ] First command is selected by default
- [ ] Selection highlights visually
- [ ] Selection wraps from last to first (optional)
- [ ] Selection wraps from first to last (optional)

### 5. Execution Tests

- [ ] Click on command executes it
- [ ] Enter on selected command executes it
- [ ] `onSelect` callback is called with command
- [ ] Command `action` function is called
- [ ] Palette closes after execution

### 6. Recent Items Tests

- [ ] Recently used commands appear first
- [ ] Recent items count is configurable
- [ ] Recent items update after execution

### 7. Grouping Tests

- [ ] Commands are grouped correctly
- [ ] Group headers render
- [ ] Search respects groups
- [ ] Empty groups are hidden

### 8. Accessibility Tests

- [ ] `role="combobox"` on container
- [ ] `role="listbox"` on command list
- [ ] `role="option"` on each command
- [ ] `aria-activedescendant` tracks selection
- [ ] `aria-expanded` reflects open state
- [ ] Screen reader announces selection changes

### 9. Edge Cases

- [ ] Empty commands array
- [ ] Single command
- [ ] Commands without groups
- [ ] Commands with same label
- [ ] Very long command labels
- [ ] Commands with special characters in label

---

## Test Implementation

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette } from './CommandPalette.js';

describe('CommandPalette', () => {
  const defaultCommands = [
    { id: 'save', label: 'Save File', shortcut: 'Ctrl+S', action: vi.fn() },
    { id: 'open', label: 'Open File', shortcut: 'Ctrl+O', action: vi.fn() },
    { id: 'close', label: 'Close File', action: vi.fn() },
    { id: 'quit', label: 'Quit Application', shortcut: 'Ctrl+Q', action: vi.fn() },
  ];

  const defaultGroups = [
    { id: 'file', label: 'File Operations' },
    { id: 'app', label: 'Application' },
  ];

  const defaultProps = {
    commands: defaultCommands,
    groups: defaultGroups,
    open: true,
    onClose: vi.fn(),
    placeholder: 'Type a command...',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders search input', () => {
      render(<CommandPalette {...defaultProps} />);
      expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
    });

    it('renders all commands', () => {
      render(<CommandPalette {...defaultProps} />);
      expect(screen.getByText('Save File')).toBeInTheDocument();
      expect(screen.getByText('Open File')).toBeInTheDocument();
      expect(screen.getByText('Close File')).toBeInTheDocument();
      expect(screen.getByText('Quit Application')).toBeInTheDocument();
    });

    it('renders shortcuts', () => {
      render(<CommandPalette {...defaultProps} />);
      expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+O')).toBeInTheDocument();
    });

    it('renders group headers', () => {
      render(<CommandPalette {...defaultProps} />);
      expect(screen.getByText('File Operations')).toBeInTheDocument();
      expect(screen.getByText('Application')).toBeInTheDocument();
    });

    it('renders empty state when no results', async () => {
      render(<CommandPalette {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      await userEvent.type(input, 'nonexistent');
      
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('filters commands by label', async () => {
      render(<CommandPalette {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      await userEvent.type(input, 'save');
      
      expect(screen.getByText('Save File')).toBeInTheDocument();
      expect(screen.queryByText('Open File')).not.toBeInTheDocument();
    });

    it('fuzzy matches non-consecutive characters', async () => {
      render(<CommandPalette {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      await userEvent.type(input, 'sf'); // matches "Save File"
      
      expect(screen.getByText('Save File')).toBeInTheDocument();
    });

    it('search is case-insensitive', async () => {
      render(<CommandPalette {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      await userEvent.type(input, 'SAVE');
      
      expect(screen.getByText('Save File')).toBeInTheDocument();
    });

    it('shows all commands when search is cleared', async () => {
      render(<CommandPalette {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      await userEvent.type(input, 'save');
      await userEvent.clear(input);
      
      expect(screen.getByText('Save File')).toBeInTheDocument();
      expect(screen.getByText('Open File')).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('Arrow Down moves selection to next command', async () => {
      render(<CommandPalette {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      input.focus();
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      // Second command should be selected
      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('Arrow Up moves selection to previous command', async () => {
      render(<CommandPalette {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      input.focus();
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      
      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('Home moves selection to first command', async () => {
      render(<CommandPalette {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      input.focus();
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Home' });
      
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('End moves selection to last command', async () => {
      render(<CommandPalette {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      input.focus();
      fireEvent.keyDown(input, { key: 'End' });
      
      const options = screen.getAllByRole('option');
      expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true');
    });

    it('Enter executes selected command', async () => {
      const commands = [
        { id: 'save', label: 'Save File', action: vi.fn() },
      ];
      render(<CommandPalette {...defaultProps} commands={commands} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      input.focus();
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(commands[0].action).toHaveBeenCalled();
    });

    it('Escape closes palette', async () => {
      const onClose = vi.fn();
      render(<CommandPalette {...defaultProps} onClose={onClose} />);
      
      const input = screen.getByPlaceholderText('Type a command...');
      input.focus();
      fireEvent.keyDown(input, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('execution', () => {
    it('click on command executes it', async () => {
      const commands = [
        { id: 'save', label: 'Save File', action: vi.fn() },
      ];
      render(<CommandPalette {...defaultProps} commands={commands} />);
      
      await userEvent.click(screen.getByText('Save File'));
      
      expect(commands[0].action).toHaveBeenCalled();
    });

    it('onSelect callback is called', async () => {
      const onSelect = vi.fn();
      const commands = [
        { id: 'save', label: 'Save File', action: vi.fn() },
      ];
      render(<CommandPalette {...defaultProps} commands={commands} onSelect={onSelect} />);
      
      await userEvent.click(screen.getByText('Save File'));
      
      expect(onSelect).toHaveBeenCalledWith(commands[0]);
    });

    it('palette closes after execution', async () => {
      const onClose = vi.fn();
      const commands = [
        { id: 'save', label: 'Save File', action: vi.fn() },
      ];
      render(<CommandPalette {...defaultProps} commands={commands} onClose={onClose} />);
      
      await userEvent.click(screen.getByText('Save File'));
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has combobox role on container', () => {
      render(<CommandPalette {...defaultProps} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('has listbox role on command list', () => {
      render(<CommandPalette {...defaultProps} />);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('commands have option role', () => {
      render(<CommandPalette {...defaultProps} />);
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });

    it('aria-activedescendant tracks selection', async () => {
      render(<CommandPalette {...defaultProps} />);
      
      const combobox = screen.getByRole('combobox');
      const input = screen.getByPlaceholderText('Type a command...');
      
      input.focus();
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      const options = screen.getAllByRole('option');
      expect(combobox).toHaveAttribute('aria-activedescendant', options[1].id);
    });
  });

  describe('edge cases', () => {
    it('handles empty commands array', () => {
      render(<CommandPalette {...defaultProps} commands={[]} />);
      expect(screen.getByText(/no commands/i)).toBeInTheDocument();
    });

    it('handles single command', () => {
      const commands = [{ id: 'save', label: 'Save File', action: vi.fn() }];
      render(<CommandPalette {...defaultProps} commands={commands} />);
      expect(screen.getAllByRole('option')).toHaveLength(1);
    });

    it('handles commands without groups', () => {
      render(<CommandPalette {...defaultProps} groups={undefined} />);
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });
  });
});
```

---

## Success Criteria

- [ ] All rendering tests pass
- [ ] All search tests pass
- [ ] All keyboard navigation tests pass
- [ ] All execution tests pass
- [ ] All accessibility tests pass
- [ ] Code coverage ≥85%

---

## Story Points: 5

**Complexity factors:**
- Fuzzy search algorithm testing
- Complex keyboard navigation (arrow keys, home/end, enter, escape)
- ARIA combobox pattern implementation
- Recent items state management
- Grouping logic

---

## Dependencies

- `@testing-library/user-event` for keyboard simulation
- Vitest configuration fix for test file discovery
