# Kit html

A small sibilant lisp macro library I wrote for the fun of it.

It isn't on npm yet, so add the git url to your `package.json' dependencies.

# Examples

```lisp
(include "kit/header")
(import-namespace kit)

(include "kit-html/header")
(import-namespace markup)

(require! 'express)

(var app (express));; or what ever you fancy

(var hello (markup (.div .id "hello-container" "hi there!")))

(.get app "/hello" (=> (req res) (with-markup-to-stream (.html (.body hello)))))

(.listen app 8080)
```
