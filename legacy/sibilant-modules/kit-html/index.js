

(function(a, b, c) {
  /* node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);





;
var R = require("ramda");
var { 
  Interface
 } = require("kit-interface");
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("kit/js/util");
var { 
  Interface
 } = require("kit-interface");
var writeElementAttribute = (function writeElementAttribute$(value, key) {
  /* write-element-attribute src/html.sibilant:9:0 */

  return Promise.resolve(value).then(((value) => {
  	
    return promiseWriteToStream(stream, (key + "=" + "'" + value + "' "));
  
  }));
});
var renderElementAttribute = R.curry(((value, key, stream) => {
	
  "given a key and a value, render the attribute string fragment";
  return promiseWriteToStream(stream, (" " + (key + "=" + "'" + value + "' ")));

}));
var promiseWriteToStream = (function promiseWriteToStream$(stream, data) {
  /* promise-write-to-stream node_modules/kit/inc/core/function-expressions.sibilant:23:8 */

  return (new Promise(((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return stream.write(data, success);
  
  })));
});
var renderChildSegment = R.curry(((stream, segment) => {
	
  return (function() {
    if (typeof segment === "undefined") {
      return Promise.resolve();
    } else if ((segment && "object" === typeof segment && "Array" === segment.constructor.name)) {
      return Promise.all(segment).then(renderChildren(stream));
    } else if (segment.render) {
      return segment.render(stream);
    } else {
      return promiseWriteToStream(stream, ("" + segment));
    }
  }).call(this);

}));
var renderChildren = R.curry(((stream, children) => {
	
  return children.reduce(((promise, promisedElement) => {
  	
    return promise.then(((nil) => {
    	
      return promisedElement;
    
    })).then(renderChildSegment(stream));
  
  }), Promise.resolve());

}));
var endOpeningTag = (function endOpeningTag$(stream) {
  /* end-opening-tag src/html.sibilant:47:0 */

  return (() => {
  	
    return promiseWriteToStream(stream, ">");
  
  });
});
var renderOpeningTag = (function renderOpeningTag$(stream, name) {
  /* render-opening-tag src/html.sibilant:50:0 */

  return (() => {
  	
    return promiseWriteToStream(stream, ("<" + name));
  
  });
});
var renderClosingTag = (function renderClosingTag$(stream, name) {
  /* render-closing-tag src/html.sibilant:53:0 */

  return (() => {
  	
    return promiseWriteToStream(stream, ("</" + name + ">\n"));
  
  });
});
var HtmlElement = Interface.define("HtmlElement", { 
  get body(  ){ 
    
      return this._body;
    
   },
  get stream(  ){ 
    
      return create(PromiseWriter)(this._stream);
    
   },
  get promise(  ){ 
    
      return this._promise;
    
   },
  init( name = "",attributes = {  },_body = [],_stream = this._stream,_promise = Promise.resolve() ){ 
    
      this.name = name;this.attributes = attributes;this._body = _body;this._stream = _stream;this._promise = _promise;
      return this;
    
   },
  render( stream = this.stream,name = this.name,attributes = this.attributes,body = this.body,promise = this.promise ){ 
    
      
      return (function(renderElementAttribute) {
        /* node_modules/kit/inc/scope.sibilant:12:9 */
      
        return (function(renderAttributes) {
          /* node_modules/kit/inc/scope.sibilant:12:9 */
        
          return Promise.resolve().then(renderOpeningTag(stream, name)).then(renderAttributes).then(endOpeningTag(stream)).then((() => {
          	
            return renderChildren(stream, body);
          
          })).then(renderClosingTag(stream, name));
        })((() => {
        	
          return Promise.all(Object.keys(attributes).map(((k) => {
          	
            return renderElementAttribute(attributes[k], k);
          
          })));
        
        }));
      })(((value, key) => {
      	
        
        return Promise.resolve(value).then(((value) => {
        	
          return promiseWriteToStream(stream, (" " + key + "=" + "'" + value + "' "));
        
        }));
      
      }));
    
   }
 });
exports.HtmlElement = HtmlElement;
var htmlElement = create(HtmlElement);
module.export = htmlElement;
exports.htmlElement = htmlElement;