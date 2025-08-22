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
var mimeTypes = require("mime-types"),
    Path = require("path");
var serveStaticFiles = (function serveStaticFiles$(sys) {
  /* serve-static-files eval.sibilant:1:574 */

  var serve = (function serve$(message) {
    /* serve eval.sibilant:1:609 */
  
    const { 
      request,
      response,
      route,
      key
     }=message;
    var path = (function() {
      if (key[0] === "") {
        return "./";
      } else {
        return key.filter(((k) => {
        	
          return !((k === "." || k === ".."));
        
        })).join("/");
      }
    }).call(this);
    console.log("serving path", path);
    var serveFile = (function serveFile$(file) {
      /* serve-file eval.sibilant:1:908 */
    
      var ext = Path.extname(file.path),
          mime = mimeTypes.lookup(ext);
      console.log("serving static file", file.path);
      response.setHeader("Content-Type", mime);
      response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      response.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
      return file.readStream.pipe(response);
    });
    var serveDirectory = (function serveDirectory$(index) {
      /* serve-directory eval.sibilant:1:1318 */
    
      console.log("serving directory");
      return response.end("directory");
    });
    var handleDirectory = (function handleDirectory$(file) {
      /* handle-directory eval.sibilant:1:1425 */
    
      return file.get("index.html").then(serveFile).catch((() => {
      	
        return serveDirectory(file);
      
      }));
    });
    return sys.find(path).then(((file) => {
    	
      return (function() {
        if (file.isDir__QUERY()) {
          return handleDirectory(file);
        } else {
          return serveFile(file);
        }
      }).call(this);
    
    })).catch(((err) => {
    	
      console.log("file not found", route, key);
      response.statusCode = 404;
      return response.end();
    
    }));
  });
  return serve;
});
exports.serveStaticFiles = serveStaticFiles;