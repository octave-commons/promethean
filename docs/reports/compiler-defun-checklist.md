---
project: Promethean
hashtags: [#compiler, #lisp, #defun]
---

# 📋 Lisp Compiler — `defun` Implementation Checklist

This checklist tracks the implementation of the `defun` special form in the Promethean Lisp compiler.

---

## ✅ Core Implementation
- [ ] Extend parser to recognize `(defun <name> (<args>...) <body>)`
- [ ] Add AST node `DefunNode`
- [ ] Extend environment to bind functions by name
- [ ] Extend evaluator to handle `DefunNode` → callable function
- [ ] Ensure support for recursion (`defun fact (n) ...`)

---

## ⚠️ Testing
- [ ] Unit test: simple function definition + call
- [ ] Unit test: recursive function (factorial, Fibonacci)
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
- [ ] All parser, AST, evaluator tests for `defun` pass
- [ ] Docs updated
- [ ] Kanban card moved to **Done**

---

> ✅ Once this is complete, Promethean Lisp will support **named functions**, enabling recursion, modularity, and class/method expansion later.