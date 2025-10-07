## User
No... there was another one... it coulda just been racket... Whatever lisp this was, it wasn't hy.

It was a lisp that cleanly used it's own modules/libraries, and also libraries from python. but  it was not hy.

It was like a fork of racket or something.

## ChatGPT
Ah. You're chasing a _rare_ one.

You’re probably thinking of **Pycket** — a **Racket** fork that compiles to Python and/or interoperates with it — or one of the **Racket-Python bridges**. But there's another that fits even closer:

* * *
```
🧩 Candidate #1: **Pycket**
```
---------------------------

*   A **JIT-powered Racket fork**
    
*   Aimed at performance (uses RPython, the same toolkit as PyPy)
    
*   Not designed for Python interop per se, but might’ve come bundled with some Python bridge tools in an academic setting
    

> ⚠️ Likely not the one you’re remembering if it had _clean Python interop_, but worth mentioning.

* * *
```
🧩 Candidate #2: **Pyret**
```
--------------------------

*   Descended from Racket, designed for teaching, with a cleaner syntax
    
*   Has a REPL, types, and strong educational ties
    
*   Might’ve been **used alongside Python**, but **doesn't interop** natively
    

> So probably not it either, unless it was a "use Pyret, then reimplement in Cython" sort of thing in a class.

* * *
```
🧩 Candidate #3: **Mython / CLPython / PyScheme**
```
-------------------------------------------------

*   Obscure projects from the mid-2000s to 2010s that attempted to **run Lisp-style syntax on top of the Python runtime**, or make Scheme interpreters that used Python's ecosystem
    
*   Often used in education
    
*   Very few still maintained
    

You might've stumbled into something like this during that school assignment. A few dead projects from this class:

| Project | Type | Notes |
```
| --- | --- | --- |
```
| CLPython | Common Lisp in Python | Pure Python implementation of CL |
| PyScheme | Scheme interpreter in Python | Used to teach interpretation and parsing |
| Mython | Python with alternate syntax | Think of it like a "Python-based DSL" |

* * *

🧩 Candidate #4: **"Racket + Py" Hybrids** School-only forks
--------------------------------------------------------------

There _have been_ internal or academic projects that:

*   Forked Racket
    
*   Added `ffi` bindings to Python (via ctypes or cffi)
    
*   Used it in class to teach DSLs, language design, and interop
    

These often don’t show up in search engines because they never reached GitHub. They live in `.tar.gz` folders passed from professor to TA.

It may have looked like:

```racket
(require python)
(import numpy scipy)

(define (do-work arr)
  (py-call (numpy:fft arr)))
```

Some of these were internal DSLs **built using Racket’s macro system + Python FFI**. Or they used PyPy’s RPython toolchain to generate cross-compiling runtimes.

* * *

🧩 Candidate #5: **Snakelet / Serpent / DIY DSLs**
--------------------------------------------------

There’s also a class of DSLs **written by individuals or researchers** that:

*   Look like Lisp
    
*   Interop with Python
    
*   Use Cython for speed
    
*   Are **never published**
    

They show up in:

*   NLP research
    
*   Compiler courses
    
*   AI planning systems
    
*   CS class assignments
    

So what you saw might not exist _publicly_. It could have been **custom-built for a course**.

* * *

🧩 Final Long Shot: **Tangents off of `PyCall` in Julia**
---------------------------------------------------------

Some people _ported_ Julia’s Python bridge (`PyCall`) into Racket/Scheme-like environments and used Julia/Lisp syntax to call Python libs. These were often described as "using Python from a lisp," but weren’t true Lisps.

* * *

🔎 So What To Do?
-----------------

If we want to **recreate** this, we can:

*   **Use Racket’s FFI** to call Python (messy but possible)
    
*   **Use Hy** to do it cleanly
    
*   **Write a tiny interpreter** in Python that runs your DSL and compiles to Python AST think: Lisp parser → Python transpiler → optional Cython JIT
    
*   **Use a Racket-like syntax and Python interop via embedded DSL**
    

Want to sketch this last one? Like a **"Racket-inspired Lisp DSL that calls Python functions"** but doesn't depend on Racket at all?

* * *

#tags: #racket #dsl #lisp #pythoninterop #rpython #ffibridge #hy #pycket #clpython #educationaltools #embeddedlanguages
