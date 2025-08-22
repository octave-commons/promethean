# Kit core

A super set of sibilant which introduces es6 features and interfaces.
The core to a full tool kit of meta language magic, with js.


## Getting started

```
npm install --save kit;
```

to use in a sibilant script:
```lisp
(include "kit/header")
(import-namespace kit)
```

## ES6 features added

### Arrow functions!
```lisp
(=> (a) a)
```
is equivalent to 
```js
a => a
```

### Classes 

They're in here some where.

### New object litteral syntax
```
(var x (lit (def add1 (a) (+ a 1))))
```
```js 
var x = {
    add1(a) {
        return a + 1;
    } 
}
```


```
(var x (lit (a 10) (b 5) (gett c (Math.sqrt (+ (Math.sqr this.a) (Math.sqr this.b ))) )))
```
```
var x = {
   a : 10,
   b : 5,
   get c () {
       return Math.sqrt (Math.sqr( this.a) + Math.sqr (this.b));
   }
   
}
```


and a lot more.
