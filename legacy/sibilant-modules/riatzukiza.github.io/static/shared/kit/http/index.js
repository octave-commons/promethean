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
import '/bundles/external.js';
import { 
  mixin,
  create,
  extend
 } from "/shared/kit/core/util.js";
var handleRouterError = R.curry(((res, e) => {
	res.writeHead(500);
return res.end(e.message);
}));
import { 
  Trie
 } from "../../data-structures/trees/trie.js";
var http = require("http"),
    url = require("url");
const TreeMap=Trie;
var parse = (function parse$(path) {
  /* parse eval.sibilant:20:0 */

  return (function(parsedUrl) {
    /* inc/scope.sibilant:12:9 */
  
    return mixin(parsedUrl, { 
      key:parsedUrl.pathname.split("/")
     });
  })(url.parse(path));
});
var Http = Interface.define("Http", { 
  get( config ){ 
    
      return (new Promise(((success, fail) => {
      	var resolve = success,
          reject = fail;
      return http.get(config, success).on("error", fail);
      })));
    
   },
  request( config ){ 
    
      var request = http.request(config);
      return { 
        request,
        response:(new Promise(((success, fail) => {
        	var resolve = success,
            reject = fail;
        return request.on("response", success).on("error", fail);
        })))
       };
    
   }
 });
module.exports = Http;
Http.Request = Interface.define("Http.Request", { 
  init( config = this.config ){ 
    
      this.config = config;
      return this;
    
   }
 });
Http.Message = Interface.define("Http.Message", { 
  init( request = this.request,response = this.response ){ 
    
      this.request = request;this.response = response;
      return this;
    
   },
  get url(  ){ 
    
      return parse(this.request.url);
    
   },
  get path(  ){ 
    
      return this.url.pathname;
    
   },
  get key(  ){ 
    
      return this.path.split("/");
    
   }
 });
var notFound404 = (function() {
  /* eval.sibilant:56:19 */

  return (function() {
    /* src/macros/pipe.sibilant:66:9 */
  
    arguments[0].statusCode = 404;
    arguments[0].statusMessage = "Not found";
    return arguments[0];
  })(arguments[0].response).end("resource not found.");
});
var MiddleWare = Interface.define("MiddleWare", { 
  init( router = create(Router)() ){ 
    
      this.router = router;
      return this;
    
   },
  _parseKey( k ){ 
    
      return k;
    
   },
  use( k,handler ){ 
    
      var key = this._parseKey(k);
      handler.key = key;
      return this.router.add(key, handler);
    
   },
  send( message ){ 
    
      return this.router.send(message);
    
   }
 });
Http.MiddleWare = MiddleWare.define("Http.MiddleWare", { 
  _parseKey( path ){ 
    
      return path.split("/");
    
   },
  init( router = create(Router)() ){ 
    
      this.router = router;
      router.add("", notFound404);
      router.events.on("noRoute", notFound404).on("emptyKey", notFound404);
      return this;
    
   }
 });
var keyOf = (function keyOf$(path) {
  /* key-of eval.sibilant:87:0 */

  return parse(path).key;
});
var Router = Interface.define("Router", { 
  init( _tree = create(TreeMap)(),events = create(EventEmitter)() ){ 
    
      this._tree = _tree;this.events = events;
      return this;
    
   },
  start(  ){ 
    
      return this.init();
    
   },
  send( message ){ 
    
      var route = this.find(message.key);
      message.route = route;
      return (function() {
        if (!(((route && route.value)))) {
          return this.events.emit("noRoute", message);
        } else if (!(route.value.key)) {
          return this.events.emit("emptyKey", message);
        } else {
          return cond((() => {
          	return typeof route.value === "function";
          }), (function() {
            /* eval.sibilant:108:15 */
          
            return route.value(arguments[0]);
          }), (() => {
          	return typeof route.value.send === "function";
          }), (function() {
            /* eval.sibilant:110:15 */
          
            return route.value.send(arguments[0]);
          }))(extend(message, { 
            key:message.key.slice(route.value.key.length)
           }));
        }
      }).call(this);
    
   },
  add( key = this.key,handler = this.handler,_tree = this._tree ){ 
    
      "introduce a new routing node to the tree.";
      _tree.set(key, handler);
      return this;
    
   },
  find( key = this.key,_tree = this._tree ){ 
    
      "locate a route given an array of keys";
      return (function(s) {
        /* inc/scope.sibilant:12:9 */
      
        return (function(child) {
          /* inc/scope.sibilant:12:9 */
        
          return (function() {
            if (child) {
              return Router.find(key.slice(1), child);
            } else {
              return _tree;
            }
          }).call(this);
        })(_tree._children.get(s));
      })(key[0]);
    
   },
  stop(  ){ 
    
   }
 });
export { 
  Router
 };
var ReadStream = Interface.define("ReadStream", { 
  init( stream = this.stream ){ 
    
      this.stream = stream;
      return this;
    
   },
  reduce( f = this.f,value = this.value,stream = this.stream ){ 
    
      return ReadStream.each(((chunk) => {
      	return value = f(value, chunk);
      }), stream).then((() => {
      	return value;
      }));
    
   },
  each( f = this.f,stream = this.stream ){ 
    
      return (new Promise(((success, fail) => {
      	var resolve = success,
          reject = fail;
      return stream.on("data", f).on("error", fail).on("end", success);
      })));
    
   },
  drain( stream = this.stream ){ 
    
      return ReadStream.reduce(((value, chunk) => {
      	return (value + chunk);
      }), "", stream);
    
   }
 });
Http.Server = Interface.define("Http.Server", { 
  init( port = this.port,_server = http.createServer(),_middleWares = [] ){ 
    
      this.port = port;this._server = _server;this._middleWares = _middleWares;
      return this;
    
   },
  get events(  ){ 
    
      return this._server;
    
   },
  get event(  ){ 
    
      return this._server;
    
   },
  start(  ){ 
    
      this._server.listen(this.port);
      return this._server.on("request", ((req, res) => {
      	var message = create(Http.Message)(req, res);
      return this._middleWares.forEach(((m) => {
      	return m.send(message);
      }));
      }));
    
   },
  use( middleWare ){ 
    
      return this._middleWares.push(middleWare);
    
   }
 });