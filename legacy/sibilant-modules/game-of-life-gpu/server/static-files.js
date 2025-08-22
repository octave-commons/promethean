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
var mimeTypes = require("mime-types"),
    Path = require("path");
var serveStaticFiles = (function serveStaticFiles$(sys) {
    /* serve-static-files eval.sibilant:10:0 */

    return async function serve({
        request,
        response,
        route,
        key
    }) {

        var path = key.filter(((k) => {

            return !((k === "." || k === ".."));

        })).join("/");
        var file = await sys.find(path);
        return (function() {
            if (file.isDir__QUERY()) {
                return response.end("directory");
            } else {
                var ext = Path.extname(file.path),
                    mime = mimeTypes.lookup(ext);
                response.setHeader("Content-Type", mime);
                return file.readStream.pipe(response);
            }
        }).call(this);

    };
});
exports.serveStaticFiles = serveStaticFiles;