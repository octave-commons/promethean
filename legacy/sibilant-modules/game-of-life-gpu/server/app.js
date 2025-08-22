(function(a, b, c) {
    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/defs.sibilant:53:9 */

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
var Http = require("kit-http/index.js");
var {
    Router
} = Http;
var handleRouterError = R.curry(((res, e) => {

    res.writeHead(500);
    return res.end(e.message);

}));
var {
    Interface
} = require("kit-interface");
var {
    FileSystem
} = require("kit-file-system"), {
    serveStaticFiles
} = require("./static-files");
var staticDir = FileSystem.load("./");
var app = create(Http.MiddleWare)();
var js = Interface.define("js", {
    client: FileSystem.load("./client"),
    bundles: FileSystem.load("./bundles")
});
var html = Interface.define("html", {
    files: FileSystem.load("./html")
});
app.use("/html", serveStaticFiles(html.files));
app.use("/js", serveStaticFiles(js.client));
app.use("/bundles", serveStaticFiles(js.bundles));
module.exports = app;