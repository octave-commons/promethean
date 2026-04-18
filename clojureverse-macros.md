<!-- source: https://clojureverse.org/t/possible-to-use-macros-in-a-node-target/9801 | content-type: text/html; charset=utf-8 | bytes: 282124 -->

[ClojureVerse](https://clojureverse.org/)

# [Possible to use macros in a node target?](https://clojureverse.org/t/possible-to-use-macros-in-a-node-target/9801)

 [Questions & Help](https://clojureverse.org/c/questions-help/29) 

 [Troubleshooting](https://clojureverse.org/c/questions-help/troubleshooting/31) 

[shadow-cljs](https://clojureverse.org/tag/shadow-cljs)

 [rmschindler](https://clojureverse.org/u/rmschindler)   February 21, 2023, 12:00am 

1

I’ve been using [shadow-cljs](https://github.com/thheller/shadow-cljs) to emit code for use with Firebase Functions (which is like AWS Lambda).

Today I wondered, Can I use macros? I’ve never written a macro before. My first question is, Is this possible?

Then if it is possible: how do I `require` the `cljc` file in my function’s `cljs` file?

Any other important clues would be appreciated.

 [rmschindler](https://clojureverse.org/u/rmschindler)   February 21, 2023, 6:29am 

2

It turns out to be trivial. For those interested:

- Define your macro in a `cljc` file. UPDATE: a `clj` file.
- Then in your ClojureScript code, us the `ns` construct `:require-macros`.

 [thheller](https://clojureverse.org/u/thheller)   February 21, 2023, 7:04am 

3

I don’t recommend using `.cljc` files since they make things much more complicated IMHO.

See my post about macros, applies to any CLJS target.

[code.thheller.com](https://code.thheller.com/blog/shadow-cljs/2019/10/12/clojurescript-macros.html)

### [ClojureScript Macros](https://code.thheller.com/blog/shadow-cljs/2019/10/12/clojurescript-macros.html)

ClojureScript Macros are a hurdle for most CLJS beginners and wrapping your head around how they work can be quite confusing. I’ll try to cover the basics yo...

1 Like

 [system](https://clojureverse.org/u/system) Closed   August 22, 2023, 7:05pm 

4

This topic was automatically closed 182 days after the last reply. New replies are no longer allowed.

-  [Home](https://clojureverse.org/) 
-  [Categories](https://clojureverse.org/categories) 
-  [Guidelines](https://clojureverse.org/guidelines) 
-  [Terms of Service](https://clojureverse.org/tos) 
-  [Privacy Policy](https://clojureverse.org/privacy) 

Powered by [Discourse](https://www.discourse.org), best viewed with JavaScript enabled
