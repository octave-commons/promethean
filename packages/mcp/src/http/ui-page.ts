export const renderUiPage = (): string => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Promethean MCP Dev UI</title>
    <script type="module" src="/ui/assets/main.js"></script>
  </head>
  <body>
    <mcp-dev-app></mcp-dev-app>
    <noscript>
      <p style="font-family: sans-serif; color: #1f2937; text-align: center; padding: 2rem;">
        The Promethean MCP developer console requires JavaScript. Please enable it to continue.
      </p>
    </noscript>
  </body>
</html>`;
