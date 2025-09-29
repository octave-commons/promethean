const Base = (
  typeof HTMLElement === "undefined" ? class {} : HTMLElement
) as typeof HTMLElement;

export class UiFileExplorer extends Base {
  connectedCallback(): void {
    if (!this.isConnected || this.shadowRoot !== null) return;
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.append(document.createTextNode(":host { display: block; }"));
    const slot = document.createElement("slot");
    shadow.append(style, slot);
  }
}
