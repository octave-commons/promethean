---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Force input event trigger"
conversation_id: 6898ca9b-8380-832c-bc79-968b08c63180
create_time: 08/10/2025 at 11:36 AM
update_time: 08/10/2025 at 11:48 AM
---

# Title: Force input event trigger

Created: 08/10/2025 at 11:36 AM
Last Updated: 08/10/2025 at 11:48 AM
Chat URL: https://chat.openai.com/c/6898ca9b-8380-832c-bc79-968b08c63180


>[!nexus_user] **User** - 08/10/2025 at 11:36 AM
> I'm trying to hack this html input el in obsidian to trigger it's "oninput" event handler by force to trigger something else to rerender. Just setting input.value doesn't trigger the drop down to rerendere
<!-- UID: 8787d200-9abb-47e1-b6bf-d091a1ea3af5 -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 11:36 AM
> Yup—just doing `input.value = "foo"` won’t fire the handler. You need to (1) use the native value setter (so frameworks “see” the change), then (2) dispatch an `input` event that bubbles.
> 
> Here’s a tiny helper that works in Obsidian’s DOM (Electron) for `<input>`/`<textarea>`:
> 
> ```js
> function forceInput(el, value) {
>  if (!el) throw new Error("Need an element");
> 
>  // Pick the right prototype for native setter
>  const proto = el.tagName === 'TEXTAREA'
>  ? HTMLTextAreaElement.prototype
>  : HTMLInputElement.prototype;
> 
>  const valueSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
>  valueSetter.call(el, value); // set via native setter
> 
>  // Make sure it's focused if the UI cares
>  el.focus?.();
> 
>  // Fire events the way React/Vue/etc expect (must bubble)
>  el.dispatchEvent(new Event('input', { bubbles: true }));
>  el.dispatchEvent(new Event('change', { bubbles: true }));
> }
> ```
> 
> Usage:
> ```js
> const el = document.querySelector('input.your-selector'); // or document.activeElement
> forceInput(el, 'duck duck goose');
> ```
> 
> If the dropdown is filtering on keystrokes specifically, also fake a keyup after the input:
> 
> ```js
> el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'e' }));
> ```
> 
> If it’s using the newer `InputEvent` (some UIs do), try:
> 
> ```js
> el.dispatchEvent(new InputEvent('input', {
>  bubbles: true,
>  inputType: 'insertText',
>  data: 'e',
>  isComposing: false
> }));
> ```
> 
> Notes/gotchas:
> - Inside Shadow DOM? Grab `host.shadowRoot.querySelector('input')` first.
> - Contenteditable instead of input? Set `el.textContent = 'value'` and then `el.dispatchEvent(new Event('input', { bubbles: true }))`.
> - Some Obsidian components recompute on focus/blur; if needed, do `el.blur(); el.focus();` between the setter and event dispatch.
> 
> If you drop me the specific selector (or a screenshot of the element in DevTools), I’ll tailor the exact sequence.
<!-- UID: bd56e174-e550-4657-a6a6-a75f0a46826b -->

---




>[!nexus_user] **User** - 08/10/2025 at 11:48 AM
> excellent, seems to solve the issue.
<!-- UID: d3ed7ab5-eab9-4666-9118-a3dc90f9e8bf -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 11:48 AM
> Nice — glad it worked! 
> In Obsidian, a lot of those dropdowns are wired through React-style synthetic events, so skipping the native setter is usually why `input.value = …` alone does nothing. 
> 
> If you need to hook this into a script so it *always* rerenders after you tweak something, you can wrap it in a small “poke” utility that finds the active element and fires the chain. That way you don’t have to manually hunt the input each time. 
> 
> Do you want me to make you a reusable `pokeActiveInput()` version so you can just call one function anywhere?
<!-- UID: b83f5f8b-f84f-4163-aec7-8aa770911d44 -->

---


