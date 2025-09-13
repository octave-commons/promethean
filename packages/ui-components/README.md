# @promethean/ui-components

Design tokens and reusable Web Components for Promethean front-ends.

## Usage

```ts
import { applyDesignTokens, registerUiComponents } from '@promethean/ui-components';

applyDesignTokens();
registerUiComponents();
```

### Components
- `<ui-file-explorer>` – container element for file navigation UIs.
- `<ui-chat-panel>` – simple wrapper for chat conversations.

### Styling
Design tokens are exposed as CSS variables on the `:root` element after calling `applyDesignTokens()`. Example:

```css
:root {
  --color-primary: #4A90E2;
}
```
