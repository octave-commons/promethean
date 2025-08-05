# Hy Macro Cheatsheet: Surviving Lisp on Python

This cheatsheet summarizes the hard-won lessons of making macros work in Hy — the Lisp that runs on top of Python — and reminds future-you how to avoid the mines you just crawled through.

---

## 🔧 Comprehensions

### ✅ List Comprehension (Built-in)

```hy
(lfor x (range 5) (* 2 x))
```

Expands to:

```python
[2 * x for x in range(5)]
```

### ✅ With Conditions and Multiple Binds

```hy
(lfor
  x (range 3)
  y (range 3)
  :if (!= x y)
  :setv total (+ x y)
  [x y total])
```

### ✅ Dictionary Comprehension

```hy
(dfor x (range 3)
      :if (even? x)
      [x (* x x)])
```

---

## 🧠 Macro Patterns

### ❌ Don’t do this (breaks Python's rules):

```hy
(defmacro bad [x &optional y z]) ;; ❌ optional followed by required
```

### ✅ Do this:

```hy
(defmacro good [x y &optional z])
```

---

## 🛠 Functional Replacements

### ✅ list-comp (DIY)

```hy
(defmacro list-comp [expr binding source &optional condition]
  `(list
     [~expr
      for ~binding in ~source
      ~@(if condition [`(if ~condition)] [])]))
```

Use like:

```hy
(list-comp x x (range 5))
(list-comp x x (range 5) (even? x))
```

But better yet: **use `lfor`**.

---

## 🧪 Macros That Work

### ✅ Define a Service List

```hy
(defmacro define-service-list [name root-dir]
  `(setv ~name
         (lfor p (sorted (glob.glob (+ ~root-dir "/*")))
               :if (isdir p)
               p)))
```

### ✅ Define a Command

```hy
(defmacro defn-cmd [name args #* body]
  `(setv ~name
         (let [func (lambda ~args ~@body)]
           (.append commands [(quote ~name) func])
           func)))
```

---

## 🧘 Final Truths

* Hy macros are real macros. But Python is not a Lisp.
* Always remember: macro-expansion time ≠ runtime.
* Avoid embedding logic that relies on runtime-evaluated variables inside macro-spliced forms.
* Don’t trust that `list-comp`, `@`, or destructuring will behave like they do in Common Lisp or Clojure. Hy is its own beast.
* When in doubt, use `lfor`/`dfor`. They Just Work™.

---

## 💥 You Earned This

> "The pain I go through for Lisp..."

You're not using a language. You're building one.

Now go write beautiful things.

---

## 🧷 Reference

* [Hy Docs v1.1.0](https://hylang.org/hy/doc/v1.1.0/api)
* [Hy GitHub](https://github.com/hylang/hy)
* [Hyrule (optional utils)](https://github.com/hylang/hyrule)
