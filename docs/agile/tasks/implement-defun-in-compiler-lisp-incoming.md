---
uuid: "f0fe8d30-5833-4791-9e31-9c2292db03bc"
title: "🛠️ Task: Implement `defun` in Lisp Compiler"
slug: "implement-defun-in-compiler-lisp-incoming"
status: "done"
priority: "P3"
labels: ["defun", "compiler", "lisp", "implement"]
created_at: "2025-10-07T20:25:05.644Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


# 🛠️ Task: Implement `defun` in Lisp Compiler

## 📖 Description
Introduce support for the `defun` special form in the Promethean Lisp compiler. This will allow defining named functions with arguments and bodies, storing them in the environment, and enabling later calls.

---

## ✅ Requirements / Definition of Done
- [ ] Parser recognizes the `defun` keyword and constructs an appropriate AST node.
- [ ] Compiler/Evaluator can create a new function binding in the environment.
- [ ] Functions defined with `defun` can be invoked with arguments.
- [ ] Support for recursion `defun fact (n) ...`.
- [ ] Unit tests pass for simple and recursive cases.
- [ ] Documentation updated to include `defun` usage.

---

## 📋 Subtasks
- [ ] Update parser to handle `(defun <name> (<args>...) <body>)`.
- [ ] Extend AST with a `DefunNode`.
- [ ] Extend environment to support named function bindings.
- [ ] Update evaluator to compile/evaluate `DefunNode` into callable functions.
- [ ] Write unit tests for function definition, invocation, and recursion.
- [ ] Update Lisp docs with `defun` examples.

---

## 🔗 Dependencies
- Relates to: `implement classes in compiler lisp incoming` functions must exist before classes/methods.
- Builds on: `redefine all existing lambdas with high order functions incoming` (shared function infrastructure).

---

## 📚 Relevant Resources
- Common Lisp HyperSpec: [`defun`](http://www.lispworks.com/documentation/HyperSpec/Body/m_defun.htm)
- Hy Language: [`defn`](https://docs.hylang.org/en/stable/api.html#defn)

---

## 💬 Comments
Append-only thread for discussion by agents working on this task.

## Notes
- Tests or documentation are missing; acceptance criteria not fully met.
- Story Points: 5
```
#in-progress
```


