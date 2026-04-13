/**
 * Browser Tools - Web Automation and Code Execution
 *
 * Enables cephalons to control a headless browser, navigate pages,
 * execute arbitrary JavaScript, and extract content.
 */

import type { ToolRegistryEntry, ToolDependencies } from "./types.js";
import { callVisionWithOpenAI } from "../vision.js";

// Browser session state - shared across all browser tool handlers
let browserSession: {
  browser: import("playwright").Browser | null;
  page: import("playwright").Page | null;
  context: import("playwright").BrowserContext | null;
} | null = null;

type BrowserActionRecord = {
  timestamp: number;
  tool: string;
  phase: "success" | "error";
  summary: string;
  url?: string;
  title?: string;
};

const browserActionLog: BrowserActionRecord[] = [];

async function snapshotBrowserPage(): Promise<{ url?: string; title?: string }> {
  if (!browserSession?.page) {
    return {};
  }

  let title = "";
  try {
    title = await browserSession.page.title();
  } catch {
    title = "";
  }

  return {
    url: browserSession.page.url(),
    title: title || undefined,
  };
}

async function recordBrowserAction(
  tool: string,
  phase: "success" | "error",
  summary: string,
): Promise<void> {
  const snapshot = await snapshotBrowserPage();
  browserActionLog.push({
    timestamp: Date.now(),
    tool,
    phase,
    summary,
    url: snapshot.url,
    title: snapshot.title,
  });
  while (browserActionLog.length > 40) {
    browserActionLog.shift();
  }
}

export async function getBrowserSessionState(): Promise<{
  open: boolean;
  url?: string;
  title?: string;
  recentActions: BrowserActionRecord[];
}> {
  const snapshot = await snapshotBrowserPage();
  return {
    open: Boolean(browserSession?.browser && browserSession?.page),
    url: snapshot.url,
    title: snapshot.title,
    recentActions: [...browserActionLog].slice(-10).reverse(),
  };
}

async function getOrCreateBrowser() {
  if (browserSession?.browser && browserSession?.page) {
    return browserSession;
  }

  const { chromium } = await import("playwright");
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  
  const page = await context.newPage();
  
  browserSession = { browser, page, context };
  return browserSession;
}

export const browserTools: Record<string, ToolRegistryEntry> = {
  "browser.navigate": {
    schema: {
      name: "browser.navigate",
      description:
        "Navigate the browser to a URL. Creates a new browser session if needed. Returns page title and URL after navigation.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to navigate to",
          },
          wait_until: {
            type: "string",
            description:
              "When to consider navigation complete: 'load', 'domcontentloaded', 'networkidle' (default: 'networkidle')",
          },
          timeout: {
            type: "number",
            description: "Navigation timeout in milliseconds (default: 30000)",
          },
        },
        required: ["url"],
      },
    },
    handler: async (args, deps) => {
      const { url, wait_until = "domcontentloaded", timeout = 30000 } = args as {
        url: string;
        wait_until?: "load" | "domcontentloaded" | "networkidle";
        timeout?: number;
      };

      console.log(`[TOOL] browser.navigate: Navigating to ${url}`);

      try {
        const { page } = await getOrCreateBrowser();
        if (!page) throw new Error("Failed to create browser page");

        await page.goto(url, {
          waitUntil: wait_until,
          timeout,
        });

        const title = await page.title();
        const currentUrl = page.url();

        console.log(`[TOOL] browser.navigate: Loaded "${title}" at ${currentUrl}`);
        await recordBrowserAction("browser.navigate", "success", `loaded ${title || "(untitled)"} @ ${currentUrl}`);

        return {
          toolName: "browser.navigate",
          success: true,
          result: {
            url: currentUrl,
            title,
            message: `Navigated to ${currentUrl}`,
          },
        };
      } catch (error) {
        console.error(`[TOOL] browser.navigate: Error:`, error);
        await recordBrowserAction("browser.navigate", "error", error instanceof Error ? error.message : String(error));
        return {
          toolName: "browser.navigate",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "browser.screenshot": {
    schema: {
      name: "browser.screenshot",
      description:
        "Take a screenshot of the current page or a specific element. Returns base64 PNG image.",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description:
              "Optional CSS selector to screenshot a specific element. If not provided, screenshots the full page.",
          },
          full_page: {
            type: "boolean",
            description: "If true, capture the full scrollable page (default: false)",
          },
          analyze: {
            type: "boolean",
            description:
              "If true (default), also analyze the screenshot with vision AI",
          },
        },
        required: [],
      },
    },
    handler: async (args, deps) => {
      const { selector, full_page = false, analyze = true } = args as {
        selector?: string;
        full_page?: boolean;
        analyze?: boolean;
      };

      console.log(`[TOOL] browser.screenshot: Taking screenshot`);

      try {
        const { page } = await getOrCreateBrowser();
        if (!page) throw new Error("No browser session. Call browser.navigate first.");

        let screenshot: Buffer;

        if (selector) {
          const element = await page.$(selector);
          if (!element) {
            return {
              toolName: "browser.screenshot",
              success: false,
              error: `Element not found: ${selector}`,
            };
          }
          screenshot = Buffer.from(await element.screenshot());
        } else {
          screenshot = Buffer.from(await page.screenshot({ fullPage: full_page }));
        }

        console.log(`[TOOL] browser.screenshot: Captured ${screenshot.length} bytes`);

        const base64 = screenshot.toString("base64");

        // Optionally analyze with vision
        let analysis: string | undefined;
        if (analyze) {
          console.log(`[TOOL] browser.screenshot: Analyzing with vision...`);
          try {
            const result = await callVisionWithOpenAI(
              [
                {
                  role: "user",
                  content: [
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:image/png;base64,${base64}`,
                      },
                    },
                    {
                      type: "text",
                      text: "Describe what you see in this webpage screenshot. What content, layout, and interactive elements are visible? Be concise.",
                    },
                  ],
                },
              ],
              { maxTokens: 1024 },
            );

            analysis = result.content;
          } catch (e) {
            console.warn(`[TOOL] browser.screenshot: Vision analysis failed:`, e);
          }
        }

        await recordBrowserAction(
          "browser.screenshot",
          "success",
          `screenshot ${selector || '(page)'}${analysis ? ' + vision' : ''}`,
        );

        return {
          toolName: "browser.screenshot",
          success: true,
          result: {
            imageBase64: base64,
            mimeType: "image/png",
            selector,
            fullPage: full_page,
            analysis,
          },
        };
      } catch (error) {
        console.error(`[TOOL] browser.screenshot: Error:`, error);
        await recordBrowserAction("browser.screenshot", "error", error instanceof Error ? error.message : String(error));
        return {
          toolName: "browser.screenshot",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "browser.execute": {
    schema: {
      name: "browser.execute",
      description:
        "Execute arbitrary JavaScript code in the browser context. The code runs in the page and can access DOM, make fetch requests, etc. Return value is serialized back.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description:
              "JavaScript code to execute. Use `return` to return a value. Has access to `document`, `window`, `fetch`, etc.",
          },
        },
        required: ["code"],
      },
    },
    handler: async (args, deps) => {
      const { code } = args as { code: string };

      console.log(`[TOOL] browser.execute: Executing JavaScript (${code.length} chars)`);

      try {
        const { page } = await getOrCreateBrowser();
        if (!page) throw new Error("No browser session. Call browser.navigate first.");

        // Wrap in an async IIFE so callers can write `return ...` and/or use `await`.
        const wrapped = `(async () => {\n${code}\n})()`;
        const result = await page.evaluate(wrapped);

        console.log(`[TOOL] browser.execute: Result type: ${typeof result}`);
        await recordBrowserAction("browser.execute", "success", `executed js -> ${typeof result}`);

        return {
          toolName: "browser.execute",
          success: true,
          result: {
            value: result,
            type: typeof result,
          },
        };
      } catch (error) {
        console.error(`[TOOL] browser.execute: Error:`, error);
        await recordBrowserAction("browser.execute", "error", error instanceof Error ? error.message : String(error));
        return {
          toolName: "browser.execute",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "browser.click": {
    schema: {
      name: "browser.click",
      description:
        "Click an element on the page by CSS selector. Waits for the element to be visible before clicking.",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the element to click",
          },
          timeout: {
            type: "number",
            description: "Wait timeout in milliseconds (default: 10000)",
          },
        },
        required: ["selector"],
      },
    },
    handler: async (args, deps) => {
      const { selector, timeout = 10000 } = args as {
        selector: string;
        timeout?: number;
      };

      console.log(`[TOOL] browser.click: Clicking "${selector}"`);

      try {
        const { page } = await getOrCreateBrowser();
        if (!page) throw new Error("No browser session. Call browser.navigate first.");

        await page.click(selector, { timeout });

        console.log(`[TOOL] browser.click: Clicked "${selector}"`);
        await recordBrowserAction("browser.click", "success", `clicked ${selector}`);

        return {
          toolName: "browser.click",
          success: true,
          result: {
            selector,
            clicked: true,
          },
        };
      } catch (error) {
        console.error(`[TOOL] browser.click: Error:`, error);
        await recordBrowserAction("browser.click", "error", error instanceof Error ? error.message : String(error));
        return {
          toolName: "browser.click",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "browser.type": {
    schema: {
      name: "browser.type",
      description:
        "Type text into an input field identified by CSS selector. Optionally press Enter after typing.",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the input field",
          },
          text: {
            type: "string",
            description: "Text to type",
          },
          press_enter: {
            type: "boolean",
            description: "If true, press Enter after typing (default: false)",
          },
          delay: {
            type: "number",
            description: "Delay between keystrokes in ms (default: 50)",
          },
        },
        required: ["selector", "text"],
      },
    },
    handler: async (args, deps) => {
      const { selector, text, press_enter = false, delay = 50 } = args as {
        selector: string;
        text: string;
        press_enter?: boolean;
        delay?: number;
      };

      console.log(`[TOOL] browser.type: Typing into "${selector}"`);

      try {
        const { page } = await getOrCreateBrowser();
        if (!page) throw new Error("No browser session. Call browser.navigate first.");

        // Clear then type with per-keystroke delay.
        await page.click(selector, { timeout: 10_000 });
        await page.fill(selector, "");
        await page.type(selector, text, { delay: Math.max(0, delay) });
        
        if (press_enter) {
          await page.press(selector, "Enter");
        }

        console.log(`[TOOL] browser.type: Typed ${text.length} characters`);
        await recordBrowserAction("browser.type", "success", `typed ${text.length} chars into ${selector}`);

        return {
          toolName: "browser.type",
          success: true,
          result: {
            selector,
            textLength: text.length,
            pressEnter: press_enter,
          },
        };
      } catch (error) {
        console.error(`[TOOL] browser.type: Error:`, error);
        await recordBrowserAction("browser.type", "error", error instanceof Error ? error.message : String(error));
        return {
          toolName: "browser.type",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "browser.wait": {
    schema: {
      name: "browser.wait",
      description:
        "Wait for an element to appear, a URL to match, or a fixed duration.",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector to wait for (optional)",
          },
          url: {
            type: "string",
            description: "URL pattern to wait for (optional)",
          },
          duration: {
            type: "number",
            description: "Fixed duration to wait in milliseconds (optional)",
          },
          timeout: {
            type: "number",
            description: "Maximum wait time in ms (default: 30000)",
          },
        },
        required: [],
      },
    },
    handler: async (args, deps) => {
      const { selector, url, duration, timeout = 30000 } = args as {
        selector?: string;
        url?: string;
        duration?: number;
        timeout?: number;
      };

      console.log(`[TOOL] browser.wait: Waiting...`);

      try {
        const { page } = await getOrCreateBrowser();
        if (!page) throw new Error("No browser session. Call browser.navigate first.");

        if (duration) {
          await page.waitForTimeout(duration);
          await recordBrowserAction("browser.wait", "success", `waited ${duration}ms`);
          return {
            toolName: "browser.wait",
            success: true,
            result: { waited: duration, type: "duration" },
          };
        }

        if (selector) {
          await page.waitForSelector(selector, { timeout });
          await recordBrowserAction("browser.wait", "success", `selector ${selector}`);
          return {
            toolName: "browser.wait",
            success: true,
            result: { selector, type: "selector" },
          };
        }

        if (url) {
          await page.waitForURL(url, { timeout });
          await recordBrowserAction("browser.wait", "success", `url ${url}`);
          return {
            toolName: "browser.wait",
            success: true,
            result: { url, type: "url" },
          };
        }

        return {
          toolName: "browser.wait",
          success: false,
          error: "Must specify selector, url, or duration",
        };
      } catch (error) {
        console.error(`[TOOL] browser.wait: Error:`, error);
        await recordBrowserAction("browser.wait", "error", error instanceof Error ? error.message : String(error));
        return {
          toolName: "browser.wait",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "browser.content": {
    schema: {
      name: "browser.content",
      description:
        "Extract content from the current page. Returns HTML, text, or specific elements.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description:
              "Content type: 'html', 'text', or 'markdown' (default: 'text')",
          },
          selector: {
            type: "string",
            description:
              "Optional CSS selector to extract content from a specific element",
          },
        },
        required: [],
      },
    },
    handler: async (args, deps) => {
      const { type = "text", selector } = args as {
        type?: "html" | "text" | "markdown";
        selector?: string;
      };

      console.log(`[TOOL] browser.content: Extracting ${type}`);

      try {
        const { page } = await getOrCreateBrowser();
        if (!page) throw new Error("No browser session. Call browser.navigate first.");

        let content: string;

        if (selector) {
          const element = await page.$(selector);
          if (!element) {
            return {
              toolName: "browser.content",
              success: false,
              error: `Element not found: ${selector}`,
            };
          }
          
          if (type === "html" || type === "markdown") {
            content = await element.innerHTML();
          } else {
            content = await element.innerText();
          }
        } else {
          if (type === "html" || type === "markdown") {
            content = await page.content();
          } else {
            content = await page.innerText("body");
          }
        }

        if (type === "markdown") {
          const { default: TurndownService } = await import("turndown");
          const turndown = new TurndownService({ headingStyle: "atx" });
          content = turndown.turndown(content);
        }

        // Truncate if too large
        const truncated = content.length > 10000 ? content.slice(0, 10000) + "..." : content;

        console.log(`[TOOL] browser.content: Extracted ${content.length} characters`);
        await recordBrowserAction("browser.content", "success", `extracted ${type} (${content.length} chars)`);

        return {
          toolName: "browser.content",
          success: true,
          result: {
            content: truncated,
            type,
            selector,
            length: content.length,
            truncated: content.length > 10000,
          },
        };
      } catch (error) {
        console.error(`[TOOL] browser.content: Error:`, error);
        await recordBrowserAction("browser.content", "error", error instanceof Error ? error.message : String(error));
        return {
          toolName: "browser.content",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },

  "browser.close": {
    schema: {
      name: "browser.close",
      description:
        "Close the browser session. Use this to free resources when done browsing.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    handler: async (args, deps) => {
      console.log(`[TOOL] browser.close: Closing browser`);

      try {
        if (browserSession?.browser) {
          await browserSession.browser.close();
          browserSession = null;
        }

        await recordBrowserAction("browser.close", "success", "closed browser session");

        return {
          toolName: "browser.close",
          success: true,
          result: { closed: true },
        };
      } catch (error) {
        console.error(`[TOOL] browser.close: Error:`, error);
        await recordBrowserAction("browser.close", "error", error instanceof Error ? error.message : String(error));
        return {
          toolName: "browser.close",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  },
};
