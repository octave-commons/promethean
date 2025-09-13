const Base = (
  typeof HTMLElement === "undefined" ? class {} : HTMLElement
) as typeof HTMLElement;

export class UiFileExplorer extends Base {
  connectedCallback(): void {
    if (!this.isConnected) return;
    this.innerHTML = "<slot></slot>";
    this.style.display = "block";
  }
}
