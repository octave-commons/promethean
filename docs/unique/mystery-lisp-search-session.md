---
uuid: 7b672b78-7057-4506-baf9-1262a6e477e3
created_at: mystery-lisp-search-session.md
filename: mystery-lisp-for-python-education
title: mystery-lisp-for-python-education
description: >-
  A college-level Lisp-like language used in introductory CS courses with Python
  interop, Cython integration, and Racket-inspired syntax for teaching low-level
  and high-level programming concepts.
tags:
  - lisp
  - python
  - cython
  - education
  - csclass
  - dsl
  - racketfork
  - nostalgia
  - symbolic
  - interop
---
Alright — we can eliminate Julia.

Let’s pin this down step by step. You’re remembering: ^ref-513dc4c7-3-0

---

## 🧠 What You Know About the Mystery Lisp

* ✅ **It was not Hy**
* ✅ **It was not Julia**
* ✅ It had **clean interop with Python** ^ref-513dc4c7-11-0
* ✅ It supported **its own modules/libraries** ^ref-513dc4c7-12-0
* ✅ But also **used Python libraries easily** ^ref-513dc4c7-13-0
* ✅ It was used in a **college class**, likely introductory CS
* ✅ It was **paired with Cython** to teach both low-level and high-level paradigms ^ref-513dc4c7-15-0
* ✅ It felt like **Racket, or a fork of Racket, but with Python interop** ^ref-513dc4c7-16-0

---

## 🧩 That Narrows It To:

### 🔥 **Skylisp** / **Skylark** / **Bazel’s Starlark**?

* Looks Lisp-like or Python-ish depending on mode ^ref-513dc4c7-24-0
* Interpreted
* Python embeddable ^ref-513dc4c7-26-0
* Used as a DSL in tooling, sometimes education ^ref-513dc4c7-27-0

But *not quite* Lisp enough. ^ref-513dc4c7-29-0

---

### 🟣 **Anaconda's Skunkworks Lisp-Like DSLs**

There are a few **experimental DSLs** from academic projects and orgs like Anaconda or Continuum Analytics, especially in the data science or education space.

They sometimes:

* Were built on **Racket** ^ref-513dc4c7-39-0
* Added **Python bindings** ^ref-513dc4c7-40-0
* Were used in **Jupyter** ^ref-513dc4c7-41-0
* And... **never got public releases**

Example: Numba once toyed with a symbolic frontend for optimization written in Lisp-style syntax. ^ref-513dc4c7-44-0

---

### 🧪 **UniLisp** (not a real name, but fits the pattern)

Some CS courses invented or borrowed **internal DSLs** that: ^ref-513dc4c7-50-0

* Use **S-expression syntax** ^ref-513dc4c7-52-0
* Translate to Python AST ^ref-513dc4c7-53-0
* Use Cython for backend performance

These would be like: ^ref-513dc4c7-56-0

```lisp
(import "math")
(defn hypotenuse (x y)
  (sqrt (+ (* x x) (* y y))))
```
^ref-513dc4c7-58-0
 ^ref-513dc4c7-64-0
...but the interpreter would:
 ^ref-513dc4c7-66-0
* Parse this into Python ^ref-513dc4c7-67-0
* Use Cython or Numba to compile
* Run in class or Jupyter
 ^ref-513dc4c7-70-0
Could’ve been an unnamed **pedagogical tool**.

---

### 🧬 Theoretical Candidate: **LispyPython / LispyScript**
 ^ref-513dc4c7-76-0
Projects that existed but vanished:
 ^ref-513dc4c7-78-0
* LispyScript: a Lisp-to-JavaScript transpiler (not this one)
* **LispyPython**: Local DSLs people wrote to teach metaprogramming — gone now, but used in university courses

---

## 🧠 So What Was It *Probably*?
 ^ref-513dc4c7-85-0
> A **minimal Racket/Scheme fork** or **Python-hosted DSL** designed for teaching that used **Lisp syntax**, compiled to **Python AST**, and was **used alongside Cython** to teach both levels of abstraction.
 ^ref-513dc4c7-87-0
If it wasn’t **Hy**, then it was either:

* A **Racket fork** with Python bindings (rare) ^ref-513dc4c7-90-0
* A **custom DSL** built for a course ^ref-513dc4c7-91-0
* A **now-dead experimental tool** used in academia

---

## 🛠 Want to Recreate It?
 ^ref-513dc4c7-97-0
We can **build the Lisp you saw** with:
 ^ref-513dc4c7-99-0
* A small Lisp interpreter (maybe using Lark in Python) ^ref-513dc4c7-100-0
* That parses code like:
 ^ref-513dc4c7-102-0
  ```lisp
  (defn foo (x) (+ x 1))
^ref-513dc4c7-102-0 ^ref-513dc4c7-105-0
  ```
^ref-513dc4c7-106-0
* And turns it into Python AST using `ast` module
* Then optionally runs it through `Cython`

---
 ^ref-513dc4c7-112-0
## 🏷️ Tags ^ref-513dc4c7-112-0

\#lisp #pythoninterop #cython #education #csclass #dsl #racketfork #lispy #symbolicdsl #nostalgiahunt

---
 ^ref-513dc4c7-118-0
Want me to write the first prototype for this “universal Lisp for Python interop” that mirrors what you’re remembering? Or dig deeper into archival curriculum materials and lost language projects?
