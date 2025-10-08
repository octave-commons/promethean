# 🗂️ {{file_name}} — {{short description}}

**Path:** `{{relative/path/to/file}}`  
```
**Service / Module:** [[{{service_or_module}}]]
```
```
**Layer / Circuit:** #{{layer_tag}}
```
```
**Tags:** #doc #{{language}} #{{domain}} #{{custom_tags}}
```
---

## 📄 Summary

> What does this file do?  
Describe the **primary responsibility** of this file.  
Mention the domain (e.g. TTS, STT, Vector Fields, etc.) and any specialized logic it contains.

---

## 🧠 Design Intent

> Why does this file exist the way it does?  
Explain design choices, intended patterns, constraints, and things a future dev should *know before changing it*.  
E.g., why this abstraction? What does it *not* handle?

---

## 🧩 Interfaces / API

> What does this file export or expose?

- **Exports**:
  - `{{exported_func_or_class}}`: `{{brief purpose}}`
- **Receives input from**:
  - `{{input interface}}`: `{{how it's used}}`
- **Sends output to**:
  - `{{downstream system}}`: `{{data format or protocol}}`

---

## 🔗 Dependencies

> Which other files/modules does this file depend on?

- [file-a]
- [file-b]
- [shared/py/utils]
- External: `{{external library or API}}`

---

## 📎 Dependents

> Which files/modules depend on this one?

- [service-x]
- [[main entrypoint]]
- [doc-template generator]

---

## 🧭 Position in System

> Where does this fit into the broader system flow?

```mermaid
flowchart TD
  Upstream[Upstream Source]
  This[{{file_name}}]
  Downstream[Downstream Consumer]

  Upstream --> This --> Downstream
````

---

## 🧪 Tests (if applicable)

* \\[test/{{file\_name}}.test.ts]
* [ ] Describe expected behavior
* [ ] Edge cases handled

---

## 🧱 Related Documents

* \\[system-overview]
* \\[{{service\_or\_module}}]
* \\[{{layer\_doc}}]
* \\[{{project\_principles}}]

---

## 📌 Notes

> Anything weird, unique, or "you had to be there"?
> Capture tribal knowledge here.
> Future you or an AI co-pilot will thank you.

---

## 🔖 Tags

\#doc #{{language}} #{{layer\_tag}} #{{service\_or\_module}} #{{project\_tag}}

