# OSC Filtering Implementation Complete

## Summary
Successfully implemented filtering for stray OSC/iTerm2 payloads in the OpenCode project.

## What Was Done

### 1. Fixed OSC Regex
- Updated `packages/opencode/src/util/osc.ts` to properly handle both BEL (`\x07`) and ST (`\x1b\\`) terminators
- Fixed issue where ESC + \ (two characters) wasn't being matched correctly
- All 8 test cases now pass

### 2. Integrated OSC Stripping into ANSI Pipeline
- Added `stripOSC` import to `packages/opencode/src/util/terminal.ts`
- Modified `processAnsiContent` function to strip OSC sequences before ANSI processing
- This ensures all terminal output goes through OSC filtering, not just bash tool output

### 3. Verified Integration
- OSC test suite passes (8/8 tests)
- TypeScript compilation successful for terminal utilities
- OSC stripping already integrated in TUI session component for bash output

## Files Modified
- `packages/opencode/src/util/osc.ts` - Fixed regex patterns
- `packages/opencode/src/util/terminal.ts` - Added OSC stripping to ANSI processing pipeline

## Technical Details
The `stripOSC` function now correctly handles:
- Basic OSC sequences with BEL terminators
- OSC sequences with ST (ESC + \) terminators  
- iTerm2 annotations (OSC 1337)
- OSC 8 hyperlinks
- OSC 52 clipboard operations
- Multiple consecutive OSC sequences
- Malformed sequences
- Mixed ANSI and OSC sequences

The integration ensures that any text processed through `TerminalUtil.processAnsiContent` will have stray OSC sequences removed before ANSI processing or terminal output.

## Impact
This fixes the issue where stray iTerm2 OSC payloads were appearing in terminal output, improving the user experience and preventing potential display corruption.