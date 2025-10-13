# Task Completion Checklist for Cephalon

## Before Completing Any Task

### Code Quality Checks
- [ ] Run `pnpm build:check` - Ensure TypeScript compilation succeeds
- [ ] Run `pnpm lint` - Fix any ESLint warnings/errors
- [ ] Run `pnpm format` - Ensure code formatting consistency
- [ ] Run `pnpm test` - All tests must pass
- [ ] Check for `console.log` statements that should be removed
- [ ] Verify no `any` types where specific types could be used

### Security Review
- [ ] Review environment variable usage - no hardcoded secrets
- [ ] Check input validation and sanitization
- [ ] Verify prompt injection protection is working
- [ ] Ensure permission checks are in place for Discord commands
- [ ] Review error handling for information disclosure

### Performance Considerations
- [ ] Check for memory leaks in event handlers
- [ ] Verify proper cleanup in dispose methods
- [ ] Review async operations for proper error handling
- [ ] Check for unnecessary computations in hot paths

### Documentation Updates
- [ ] Update JSDoc comments for new functions
- [ ] Add/update type definitions for new interfaces
- [ ] Update README.md if API changes were made
- [ ] Add changelog entry in `changelog.d/` directory

### Testing Requirements
- [ ] Write unit tests for new functionality
- [ ] Add integration tests for new workflows
- [ ] Include security tests for new input handling
- [ ] Verify test coverage remains high

### Discord-Specific Checks
- [ ] Verify command registration works correctly
- [ ] Test permission handling for new commands
- [ ] Check voice channel integration if applicable
- [ ] Verify proper error responses to users

### Audio Processing Checks
- [ ] Test audio capture functionality
- [ ] Verify proper buffer handling
- [ ] Check ffmpeg integration
- [ ] Test audio format conversions

### ENSO Integration Checks
- [ ] Verify ENSO protocol compliance
- [ ] Test guardrail evaluation mode
- [ ] Check tool call rationale generation
- [ ] Verify proper event handling

## After Task Completion

### Final Verification
- [ ] Full test suite passes: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] Code is formatted: `pnpm format`
- [ ] Documentation is updated
- [ ] Changelog entry created

### Git Workflow
- [ ] Stage only relevant files
- [ ] Write clear, descriptive commit message
- [ ] Ensure commit follows project conventions
- [ ] Create pull request if required

### Deployment Preparation
- [ ] Verify environment variables are documented
- [ ] Check migration scripts if schema changes
- [ ] Verify deployment configuration
- [ ] Test in development environment first