Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each inc/misc.sibilant:1:1831 */

  this.forEach(f);
  return this;
});
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each inc/misc.sibilant:1:1893 */

  return Object.keys(this).forEach(((k) => {
  	return f(this[k], k);
  }));
});
var R = require("ramda");
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("@kit-js/core/js/util");
var Http = require("@kit-js/http/index.js");
var { 
  Router
 } = Http;
var handleRouterError = R.curry(((res, e) => {
	
  res.writeHead(500);
  return res.end(e.message);

}));
var { 
  Interface
 } = require("@kit-js/interface");
var { 
  FileSystem
 } = require("kit-file-system"),
    { 
  serveStaticFiles
 } = require("./static-files");
var app = create(Http.MiddleWare)();
const staticFiles=FileSystem.load("./static");
console.log("who????");
app.use("", serveStaticFiles(staticFiles));
module.exports = app;