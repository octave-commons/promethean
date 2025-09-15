import { UiFileExplorer } from "./file-explorer.js";
import { UiChatPanel } from "./chat-panel.js";

export function registerUiComponents(): void {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("ui-file-explorer")) {
    customElements.define("ui-file-explorer", UiFileExplorer);
  }
  if (!customElements.get("ui-chat-panel")) {
    customElements.define("ui-chat-panel", UiChatPanel);
  }
}
