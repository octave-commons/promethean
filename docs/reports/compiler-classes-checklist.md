---
project: Promethean
hashtags: [#compiler, #lisp, #classes]
---

# 📋 Lisp Compiler — `defclass` Implementation Checklist

This checklist tracks the implementation of the `defclass` macro in the Promethean Lisp compiler.

---

## ✅ Core Implementation
- [ ] Parser recognizes `(defclass <name> (<fields>) (<methods>))`
- [ ] Add AST nodes: `ClassNode`, `MethodNode`
- [ ] Extend evaluator to create and bind class objects
- [ ] Support instance creation via `$make-instance <Class>$`
- [ ] Implement method dispatch `(call <instance> <method> <args>...)`
- [ ] Support field defaults
- [ ] Support single inheritance (optional v1)

---

## ⚠️ Testing
- [ ] Unit test: class creation + field access
- [ ] Unit test: method definition + invocation
- [ ] Unit test: instance-specific state
- [ ] Unit test: inheritance (if implemented)
- [ ] Integration test: multiple classes interacting

---

## ⚠️ Documentation
- [ ] Add `defclass` usage examples in compiler docs
- [ ] Document `make-instance` and `call`
- [ ] Cross-reference with `defun` and `lambda`
- [ ] Update language reference in `docs/`

---

## 🔗 Dependencies
- [ ] Blocked by: `implement defun in compiler lisp incoming`
- [ ] Builds toward: `lisp ecosystem files`, `lisp package files`

---

## 🏁 Completion Criteria
- [ ] All parser, AST, evaluator tests for `defclass` pass
- [ ] Docs updated
- [ ] Kanban card moved to **Done**

---

> ✅ Once complete, Promethean Lisp will support **object-oriented abstractions** via `defclass`, building on `defun` and paving the way for packages.