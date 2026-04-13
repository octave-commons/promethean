/**
 * Desktop Tools - Screenshots and Screen Capture
 *
 * Enables cephalons to "see" the desktop - capture screenshots and analyze them.
 *
 * NOTE: These tools require platform-specific screenshot tools.
 * Placeholders are in the registry until dependencies are verified.
 */

import type { ToolDependencies } from "./types.js";

/**
 * Desktop tool placeholder - requires screenshot tools
 * The actual implementations are in the registry as placeholders.
 */

export interface DesktopToolOptions {
  display?: number;
  analyze?: boolean;
  window?: string;
}

export interface DesktopToolResult {
  toolName: string;
  success: boolean;
  result?: {
    imageBase64?: string;
    mimeType: string;
    display?: number;
    window?: string;
    analysis?: string;
  };
  error?: string;
  hint?: string;
}

/**
 * Placeholder for desktop screenshot capture
 * Requires:
 * - Linux: apt install scrot imagemagick
 * - macOS: built-in screencapture
 * - Windows: PowerShell
 */
export async function captureDesktop(
  options: DesktopToolOptions = {}
): Promise<DesktopToolResult> {
  return {
    toolName: "desktop.capture",
    success: false,
    error:
      "Desktop capture requires screenshot tools to be available.",
    hint: "On Linux: apt install scrot imagemagick. On macOS: built-in screencapture. On Windows: PowerShell.",
  };
}

/**
 * Placeholder for window capture
 * Requires: Linux with xdotool and import (ImageMagick)
 */
export async function captureWindow(
  window: string
): Promise<DesktopToolResult> {
  return {
    toolName: "desktop.window",
    success: false,
    error:
      "Window capture requires xdotool and import (ImageMagick) on Linux.",
    hint: "Install with: apt install xdotool imagemagick",
  };
}

/**
 * List available windows
 * Requires: Linux with wmctrl
 */
export async function listWindows(): Promise<{
  toolName: string;
  success: boolean;
  result?: { windows: Array<{ id: string; title: string }> };
  error?: string;
  hint?: string;
}> {
  return {
    toolName: "desktop.windows",
    success: false,
    error: "Window listing only supported on Linux with wmctrl.",
    hint: "Install with: apt install wmctrl",
  };
}
