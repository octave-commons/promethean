---
project: Promethean
hashtags: [#compiler, #lisp, #defun]
---

# 📋 Lisp Compiler — `defun` Implementation Checklist

This checklist tracks the implementation of the `defun` special form in the Promethean Lisp compiler.

---

## ✅ Core Implementation

- [x] Extend parser to recognize `(defun <name> (<args>...) <body>)`
- [x] Add AST node `DefunNode`
- [x] Extend environment to bind functions by name
- [x] Extend evaluator to handle `DefunNode` → callable function
- [x] Ensure support for recursion $`defun fact (n) ...`$

---

## ⚠️ Testing

- [x] Unit test: simple function definition + call
- [x] Unit test: recursive function (factorial, Fibonacci)
- [ ] Unit test: higher-order usage (`map`, `reduce`)
- [ ] Integration test: multiple functions in program

---

## ⚠️ Documentation

- [ ] Add `defun` usage examples in compiler docs
- [ ] Cross-reference with `lambda` and `high-order functions`
- [ ] Update language reference in `docs/`

---

## 🔗 Dependencies

- [ ] Blocked by: `redefine all existing lambdas with high order functions incoming`
- [ ] Required before: `implement classes in compiler lisp incoming`

---

## 🏁 Completion Criteria

- [x] All parser, AST, evaluator tests for `defun` pass
- [ ] Docs updated
- [ ] Kanban card moved to **Done**

---

> ✅ Once this is complete, Promethean Lisp will support **named functions**, enabling recursion, modularity, and class/method expansion later.
