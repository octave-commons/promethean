const Base = (
  typeof HTMLElement === "undefined" ? class {} : HTMLElement
) as typeof HTMLElement;

export class UiChatPanel extends Base {
  connectedCallback(): void {
    if (!this.isConnected || this.shadowRoot !== null) return;
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.append(
      document.createTextNode(
        [":host { display: block; }", ".chat-panel { display: flex; flex-direction: column; }"]
          .join(" "),
      ),
    );
    const wrapper = document.createElement("div");
    wrapper.classList.add("chat-panel");
    wrapper.append(document.createElement("slot"));
    shadow.append(style, wrapper);
  }
}
