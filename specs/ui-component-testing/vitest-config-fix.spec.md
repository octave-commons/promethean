# Spec: Vitest Configuration Fix

> *Tests that can't run might as well not exist.*

---

## Status: `done`

---

## Context

Vitest configuration in `orgs/open-hax/uxx/react` doesn't include the test file pattern `src/**/*.test.tsx`. Tests exist but Vitest can't discover them. This blocks all testing work.

---

## Problem

Current Vitest config likely has:
```typescript
include: ['**/*.{test,spec}.{ts,tsx}']
```

This pattern doesn't match `src/**/*.test.tsx` files because the pattern is too broad or the root path is misconfigured.

---

## Solution

Update Vitest configuration to explicitly include the test file patterns.

### Implementation

```typescript
// orgs/open-hax/uxx/react/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.tsx'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.test.tsx',
        'src/**/index.ts',
      ],
    },
  },
});
```

### Setup File

```typescript
// orgs/open-hax/uxx/react/vitest.setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

---

## Success Criteria

- [x] `pnpm vitest run` discovers all test files
- [x] All 5 existing test files run successfully
- [x] Coverage report is generated
- [x] No configuration errors or warnings

---

## Story Points: 1

**Complexity factors:**
- Simple configuration change
- Verification requires running tests
- May need to update dependencies if missing

---

## Verification

```bash
cd orgs/open-hax/uxx/react
pnpm vitest run --reporter=verbose
```

Expected output:
```
 ✓ src/primitives/Badge.test.tsx
 ✓ src/primitives/CollapsiblePanel.test.tsx
 ✓ src/primitives/KeyValueSection.test.tsx
 ✓ src/primitives/Progress.test.tsx
 ✓ src/primitives/SearchableSelect.test.tsx
```
