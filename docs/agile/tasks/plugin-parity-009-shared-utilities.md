# Consolidate Shared Utilities

**Priority:** Medium  
**Story Points:** 3  
**Status:** todo

## Description

Create a unified utilities library by consolidating shared functionality between pseudo and package implementations.

## Key Requirements

- Identify and consolidate duplicate utilities
- Create unified API for common operations
- Maintain backward compatibility
- Add comprehensive unit tests
- Document utility APIs
- Performance optimization
- Type safety improvements

## Files to Create/Modify

- `packages/opencode-client/src/utils/` (reorganize)
- `packages/opencode-client/src/shared/` (new directory)
- `packages/opencode-client/src/helpers/` (new directory)
- Remove duplicate utilities from pseudo/

## Acceptance Criteria

- [ ] All duplicate utilities identified and consolidated
- [ ] Unified API provides consistent interface
- [ ] Backward compatibility maintained for existing code
- [ ] Comprehensive unit tests achieve high coverage
- [ ] Utility APIs documented with examples
- [ ] Performance optimized for common operations
- [ ] Type safety improved across utilities

## Dependencies

None

## Notes

This will reduce code duplication and improve maintainability across the system.
