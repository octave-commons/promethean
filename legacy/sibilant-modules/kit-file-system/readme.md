# kit file system

file system meta protocol library, for managing directory trees as magical little file systems of their own.

# Examples 

```lisp

(include "kit/header")
(import-namespace kit)

(require! (lit File-system Directory File) "./index"
          'assert)
(var home (.load File-system "./") )
(var test-value "hello world")


(pipe (.set home  "./test.txt" test-value)
      (.then (aprint "test file set"))
      (.then (-> (.find home "test.txt")))
      (.then (aprint "file found, checking value"))
      (.then (#-> (get 'string)))
      (.then (=> (s)
                 (assert (= s test-value)
                         "file was not set with appropriate value"))))
```

same thing but the compiled js 

```js

var {FileSystem, Directory, File} = require("./index"),
    assert = require("assert");
var home = FileSystem.load("./");

var testValue = "hello world";

home.set("./test.txt", testValue)
    .then((function(b, ...others) {
        /* node_modules/kit/inc/console.sibilant:10:8 */

        console.log("test file set", b, ...others);
        return b;
    })).then((() => {

        return home.find("test.txt");

    })).then((function(b, ...others) {
        /* node_modules/kit/inc/console.sibilant:10:8 */

        console.log("file found, checking value", b, ...others);
        return b;
    })).then((function() {
        /* tests/base.sibilant:15:13 */

        return arguments[0].string;
    })).then(((s) => {

        return assert(s === testValue, "file was not set with appropriate value");

    }));
```
