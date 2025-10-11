---
uuid: "70e6305a-a2ae-40e0-ae9a-dce9849529b9"
title: "Usage: pass the *value* (not variable name)"
slug: "usage-pass-the-value-not-variable-name"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T03:39:14.373Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.09.19.16.36.28.md

## 📝 Context Summary

Hey — good question. What you wrote has a *few issues*, and I’d tweak it. I’ll walk through what’s wrong / risky, how to fix it, then show a better version.

---

## What’s problematic in your version

You wrote:

Here’s what’s off:

   * `assert_empty` name suggests: “variable (or value) is empty”. But your test `[ "val" ] || fail ...` fails *if* `"val"` is *empty*. That’s inverted: it asserts *not* empty. If val is empty, `[ "val" ]` is false, so it fails. So this asserts *non-emptiness*, not emptiness.
   * If you want it to assert *that* something *is* empty, you need something like `-z "val"`, not `[ "val" ]`.

   * You pass `assert_empty "$rg . -e 'index.cjs'"`: That runs `rg . -e 'index.cjs'`, takes its output, and uses *that output string* as `varname`. Inside the function you do `local val="{!varname-}"`, which uses indirect expansion expecting `varname` to be the *name* of a variable (not its content). So you’re mixing two different things: calling with a *value* vs a *variable name*. Indirect expansion `{!varname}` won’t do what you expect here.

   * If the output of `rg ...` contains spaces, multiple lines, etc., passing it as a single positional parameter with `(...)`

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
