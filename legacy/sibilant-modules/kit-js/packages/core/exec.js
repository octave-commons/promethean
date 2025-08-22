"use strict";
var Path = require("path");

var print = console.log.bind(console);
var part = require("./lib/functional/partialApplication.js");
var maybe = require("./lib/functional/logical.js").maybe;
var curry = part["curry"];
var defer = part["defer"];
var prom = require("./lib/wrappers/promise.js");
var child_process = require("child_process");

var handleExec = curry(function handleExec(s, f, e, stdout, stderr) {
    if (stderr.length > 0) {
        print("stderr", stderr.toString());
    }
    return maybe.binary(function() {
        return f(e.stack);
    }, function() {
        return s(stdout.toString());
    }, e);
})
module.exports = function exec(c, args) {
    return prom.create(function(success, fail) {
        print("executing", c);
        return child_process.exec(c, args, handleExec(success, fail));
    });
}
