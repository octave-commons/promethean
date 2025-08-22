"use strict";
const R = require("ramda");
const {
    create,
    extend,
    mixin,
    curry
} = require("./lib/util");
const {
    File,
    Directory
} = require("./lib/file-system");
var conditional = (function conditional$(value, pred, action, ...rest) {
    /* conditional build.sibilant:12:0 */

    "A functional conditional operator. Immediately evaluates its arguements.";
    return (function() {
        if (action) {
            return (function() {
                if (pred(value)) {
                    return action(value);
                } else {
                    return conditional(value, ...rest);
                }
            }).call(this);
        } else if (pred) {
            return pred(value);
        } else {
            return value;
        }
    }).call(this);
});
var cond = (function cond$(pred, action, ...rest) {
    /* cond build.sibilant:23:0 */

    "A lazy application of a functional conditional operator.\n" +
    "Waits for a value to be given to it before applying its functional arguements";
    return (value) => {

        return conditional(value, pred, action, ...rest);

    };
});
var Sibilant = (require("./lib/sibilant")).Sibilant;
var stripSib = R.replace("/sibilant/", "/"),
    changeExt = R.replace(".sibilant", ".js");
var translatePath = R.compose(stripSib, changeExt);
var getString = R.prop("string");
var transpile = R.invoker(0, "transpile");
var fromFile = Sibilant.fromFile;
var saveFile = R.invoker(1, "saveFile");
var build = R.pipe(translatePath, fromFile, transpile, saveFile);
var bulkBundle = (function bulkBundle$(dir, bundle) {
    /* bulk-bundle build.sibilant:42:0 */

    console.log("bulk add on", dir.path);
    return dir.each((name) => {

        return dir.find(name).then((node) => {

            return (function() {
                if (!(name === "includes")) {
                    return (function() {
                        if (node.symbol === Directory.symbol) {
                            return bulkBundle(node, bundle);
                        } else {
                            console.log("adding", node.path, "to bundle");
                            return bundle.add(node.path);
                        }
                    }).call(this);
                }
            }).call(this);

        });

    });
});
var isDirSymbol = R.equals(Directory.symbol);
var symbolOf = R.prop("symbol");
var isDir = R.pipe(symbolOf, isDirSymbol);
var traverse = R.invoker(1, "traverse");
var has = R.invoker(1, "has");
var find = curry((list, k) => {

    return list.find(k);

});
var then = curry((p, f) => {

    return p.then(f);

});
var getChild = curry((children, name) => {

    return children.get(name);

});
var setChild = curry((children, name, data) => {

    return children.set(name, data);

});
const Cache = {
    symbol: Symbol("Cache"),
    init(value = this.value, branchType = this.branchType, leafType = this.leafType, children = (new Map())) {

        this.value = value;
        this.branchType = branchType;
        this.leafType = leafType;
        this.children = children;
        return this;

    },
    has(name = this.name, children = this.children) {

        return children.has(name);

    },
    get(k = this.k, value = this.value, children = this.children) {

        return (function() {
            if (children.has(k)) {
                return children.get(k);
            } else {
                return value.find(k).then((subValue) => {

                    let node = create(this)(subValue);
                    children.set(k, node);
                    return node;

                });
            }
        }).call(this);

    },
    each(f = this.f, value = this.value, children = this.children) {

        return value.each((name) => {

            return this.get(name).then(f);

        });

    },
    filter(filter = this.filter, f = this.f, dir = this.dir, node = this) {

        return node.each(cond(filter, f), dir);

    },
    traverse(f = this.f, branchType = this.branchType, leafType = this.leafType) {

        return this.each((child) => {

            return (function() {
                if (branchType.symbol === child.value.symbol) {
                    return child.traverse(f);
                } else {
                    return f(child);
                }
            }).call(this);

        });

    }
};
let d = create(Cache)(create(Directory)("."), Directory, File);
d.traverse((...b) => {

    return console.log("dir", ...b);

}).catch((...b) => {

    return console.log("failed to traverse", ...b);

});
