const Base = (
  typeof HTMLElement === "undefined" ? class {} : HTMLElement
) as typeof HTMLElement;

export class UiChatPanel extends Base {
  connectedCallback(): void {
    if (!this.isConnected) return;
    this.innerHTML = '<div class="chat-panel"><slot></slot></div>';
    this.style.display = "block";
  }
}
