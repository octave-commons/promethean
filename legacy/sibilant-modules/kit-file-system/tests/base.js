(function(a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);





;
var R = require("ramda");
var {
    create,
    extend,
    mixin,
    conditional,
    cond,
    partiallyApplyAfter
} = require("kit/js/util");
var {
    FileSystem,
    Directory,
    File
} = require("./index"),
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
var mapAll = (function mapAll$(a, f) {
    /* map-all tests/base.sibilant:20:0 */

    return Promise.all(a.map(f));
});
(function(testDirectories, testFiles) {
    /* node_modules/kit/inc/scope.sibilant:12:9 */

    console.log("inserting temp directory");
    return home.insert("./temp", Directory).then((function(b, ...others) {
        /* node_modules/kit/inc/console.sibilant:10:8 */

        console.log("directory was inserted,deleting", b, ...others);
        return b;
    })).then((function() {
        /* tests/base.sibilant:28:15 */

        return arguments[0].remove();
    })).then((() => {

        return home.exists("./temp");

    })).then(((exists__QUERY) => {

        return (function() {
            if (exists__QUERY) {
                throw "directory was not deleted"
            } else {
                return console.log("directory was successfully deleted");
            }
        }).call(this);

    }));
})(["a", "b", "c", "d", "e", "f", "g"], ["t", "u", "v", "w", "x", "y", "z"]);
(function(path) {
    /* node_modules/kit/inc/scope.sibilant:12:9 */

    console.log("testing deep nesting insertion");
    return home.insert(path, Directory).then((function(b, ...others) {
        /* node_modules/kit/inc/console.sibilant:10:8 */

        console.log(path, "was inserted", b, ...others);
        return b;
    })).then((function() {
        /* tests/base.sibilant:60:15 */

        return arguments[0];
    }));
})("./temp/a/b/c/d/e");
