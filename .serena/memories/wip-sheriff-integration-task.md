# Task: Integrate WIP-Sheriff Dual-Mode Capacity Calculation into enforce-wip-limits

## Summary
Integrate the valuable dual-mode capacity calculation functionality from `wip-sheriff.ts` into the `enforce-wip-limits` command while preserving the existing modern system integration. This enhancement will provide downstream consumers with customizable WIP limit enforcement based on either task count or story points.

## Background
The current `wip-sheriff.ts` contains sophisticated dual-mode capacity calculation logic that supports both task count and story points-based WIP limit enforcement. However, it uses outdated file-based board parsing and is not integrated with the modern kanban system. The `enforce-wip-limits` command has proper system integration but only supports simple task count-based enforcement.

## Requirements

### Core Integration Requirements
1. **Preserve Dual-Mode Functionality**: Maintain support for both `points` and `count` capacity calculation modes
2. **Modern API Integration**: Update wip-sheriff implementation to use modern kanban system APIs instead of direct file parsing
3. **Backward Compatibility**: Ensure existing enforce-wip-limits command interface remains unchanged
4. **Configuration Support**: Add support for capacity basis selection via command-line flags and config
5. **Smart Task Selection**: Preserve wip-sheriff's intelligent victim selection algorithm (priority + age-based)

### Technical Requirements
1. **TypeScript Integration**: Proper typing and interfaces following Promethean Framework conventions
2. **Error Handling**: Robust error handling and logging consistent with existing commands
3. **Event Log Integration**: Maintain proper event logging for all WIP limit enforcement actions
4. **Testing**: Comprehensive test coverage for new functionality
5. **Documentation**: Update CLI reference and command help documentation

## Acceptance Criteria

### Functional Requirements
- [ ] `enforce-wip-limits` command supports `--basis points|count` flag (default: count)
- [ ] Points-based mode calculates capacity using task `points` field or estimates.complexity
- [ ] Count-based mode maintains existing behavior (task count only)
- [ ] Smart victim selection prioritizes lower priority and newer tasks for movement
- [ ] Command respects existing `--fix` and `--column` filter options
- [ ] Proper integration with transition rules engine and event logging

### Integration Requirements
- [ ] wip-sheriff interface preserved but implementation updated to use Board type
- [ ] No breaking changes to existing enforce-wip-limits command interface
- [ ] Configuration support in `promethean.kanban.json` for default capacity basis
- [ ] Backward compatibility with existing scripts and automation

### Quality Requirements
- [ ] All existing tests continue to pass
- [ ] New test coverage for dual-mode functionality (>90% coverage)
- [ ] TypeScript strict mode compliance
- [ ] ESLint compliance with no new warnings
- [ ] Proper error messages and user feedback

### Documentation Requirements
- [ ] CLI reference updated with enforce-wip-limits documentation
- [ ] Command help includes new `--basis` option
- [ ] Examples for both points and count modes
- [ ] Configuration documentation updated

## Technical Implementation Details

### Phase 1: Interface Design and Core Logic
1. **Extract WIP-Sheriff Interface**: Create clean interfaces for capacity calculation
2. **Modernize Implementation**: Replace file-based parsing with Board type usage
3. **Dual-Mode Calculator**: Implement configurable capacity calculation logic
4. **Smart Selection Algorithm**: Port victim selection logic with proper typing

### Phase 2: Command Integration
1. **Update Command Handler**: Integrate dual-mode logic into `handleEnforceWipLimits`
2. **Add Command Options**: Implement `--basis` flag parsing with validation
3. **Configuration Support**: Add config file support for default basis setting
4. **Error Handling**: Proper error handling for invalid configurations

### Phase 3: Testing and Documentation
1. **Unit Tests**: Comprehensive tests for capacity calculation logic
2. **Integration Tests**: End-to-end tests for command behavior
3. **CLI Documentation**: Update help system and reference documentation
4. **Examples**: Add usage examples for both modes

### File Structure Changes

#### New Files
```
packages/kanban/src/lib/wip/
├── capacity-calculator.ts      # Dual-mode capacity calculation logic
├── task-selector.ts           # Smart victim selection algorithm
├── types.ts                   # WIP-related interfaces
└── index.ts                   # Public exports
```

#### Modified Files
```
packages/kanban/src/cli/command-handlers.ts  # Update enforce-wip-limits handler
packages/kanban/src/lib/types.ts             # Add WIP-related types (if needed)
docs/agile/kanban-cli-reference.md           # Update documentation
```

### Configuration Schema Extension

Add to `promethean.kanban.json`:
```json
{
  "wipLimits": {
    "defaultBasis": "count",  // "count" | "points"
    "pointsFallback": true,   // Use count if points not available
    "selectionStrategy": "priority-age"  // Algorithm for victim selection
  }
}
```

### Command Interface Extensions

```bash
# Existing interface (unchanged)
pnpm kanban enforce-wip-limits [--fix] [--column=<name>]

# New options
pnpm kanban enforce-wip-limits [--fix] [--column=<name>] [--basis=count|points]

# Examples
pnpm kanban enforce-wip-limits --basis=points --fix
pnpm kanban enforce-wip-limits --column=in_progress --basis=count
```

### Implementation Notes

#### Capacity Calculation Logic
- **Points Mode**: Sum of `task.points` or `task.estimates.complexity` (fallback to 1)
- **Count Mode**: Simple task count (existing behavior)
- **Mixed Mode**: Support for tasks with and without points in points mode

#### Task Selection Algorithm
1. **Priority Sorting**: Lower priority numbers first (P0 > P1 > P2 > P3)
2. **Age Sorting**: Newer tasks first (based on created_at or file mtime)
3. **Points Consideration**: In points mode, lower point tasks preferred
4. **Bot Tasks**: Bot-generated tasks moved first (origin starts with "bot/")

#### Error Handling
- Invalid basis value: Clear error message with valid options
- Missing points data: Graceful fallback to count or default value
- Configuration errors: Warnings with sensible defaults
- Transition failures: Detailed error logging with rollback options

## Dependencies

### Internal Dependencies
- `@promethean/kanban` Board type and related interfaces
- Event log manager for audit trail
- Transition rules engine for workflow compliance
- Configuration system for default settings

### External Dependencies
- None new (existing dependencies sufficient)

## Risks and Mitigations

### Risk 1: Breaking Changes
- **Mitigation**: Maintain full backward compatibility with existing command interface
- **Validation**: Comprehensive regression testing

### Risk 2: Performance Impact
- **Mitigation**: Efficient algorithms with minimal computational overhead
- **Monitoring**: Performance testing with large boards

### Risk 3: Configuration Complexity
- **Mitigation**: Sensible defaults with optional configuration
- **Documentation**: Clear examples and migration guide

## Success Metrics

1. **Functional**: All acceptance criteria met with comprehensive test coverage
2. **Performance**: No measurable performance degradation on large boards (>1000 tasks)
3. **Usability**: Clear error messages and intuitive command interface
4. **Maintainability**: Clean, well-documented code following framework conventions
5. **Adoption**: Seamless integration for existing users and workflows

## Definition of Done

- [ ] All acceptance criteria fulfilled
- [ ] Code review completed and approved
- [ ] All tests passing (unit + integration)
- [ ] Documentation updated and reviewed
- [ ] CLI help system updated
- [ ] No TypeScript or ESLint errors
- [ ] Performance benchmarks meet requirements
- [ ] Backward compatibility verified
- [ ] Change log entry created

## Additional Notes

This integration preserves the valuable dual-mode functionality from wip-sheriff while modernizing the implementation and ensuring proper system integration. The smart task selection algorithm provides significant value for downstream consumers who need customizable WIP limit enforcement behavior.

The implementation follows Promethean Framework conventions including functional programming patterns, immutable data structures, comprehensive testing, and proper documentation.