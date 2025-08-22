
(function() {
  /* src/macros.sibilant:19:8 */

  var path = require("path");
  var p = "/",
      inc = "/home/aaron/devel/Algae-speciation-tech-demo/app/sibilant/js/";
  return module.paths = module.paths.concat(inc.split(path.sep).map((function(el) {
    /* src/macros.sibilant:25:33 */
  
    var r = path.join(p, "node_modules");
    p = path.join(p, el);
    return r;
  })), [ path.join(inc, "node_modules") ]);
}).call(this)


(function(a, b, c) {
  /* ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/defs.sibilant:53:9 */

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

var R = require("ramda");
var { 
  create,
  extend,
  mixin
 } = require("../../util");
var $ = require("jquery/dist/jquery.min.js"),
    { 
  EventEmitter
 } = require("events"),
    { 
  Buffer,
  Program,
  Shader,
  Attribute,
  Type,
  Context,
  Uniform
 } = require("webgl/lib/webgl/gl.js"),
    { 
  BlendMode
 } = require("webgl/lib/math/color.js");
var { 
  ubyte
 } = Type;
Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each app/sibilant/js/lib/natives/array.sibilant:1:0 */

  this.forEach(f);
  return this;
});
Array.prototype.bind = (function Array$prototype$bind$(f) {
  /* Array.prototype.bind app/sibilant/js/lib/natives/array.sibilant:4:0 */

  return (function(r) {
    /* app/sibilant/js/meta/macros.sibilant:119:9 */
  
    this.each(((a) => {
    	
      return r.push(f(a));
    
    }));
    return r;
  })([]);
});
// [ [ 1, 2, 3 ], [ 4, 5, 6 ] ].bind(((a) => {
// 	
//   return a;
// 
// }));
Map.prototype.each = (function Map$prototype$each$(f) {
  /* Map.prototype.each app/sibilant/js/lib/natives/map.sibilant:1:0 */

  this.forEach(f);
  return this;
});
const PromiseWriter={ 
  symbol:Symbol("PromiseWriter"),
  init( stream = this.stream,promise = Promise.resolve() ){ 
    
      this.stream = stream;this.promise = promise;
      return this;
    
   }
 };
PromiseWriter.write = (function PromiseWriter$write$(message = this.message, promise = this.promise, stream = this.stream) {
  /* Promise-writer.write ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  console.log("writing", message);
  return (function() {
    if (message) {
      return this.promise = promise.then(((nil) => {
      	
        return Promise.resolve(message).then(((value) => {
        	
          return (new Promise(((success, fail) => {
          	
            var resolve = success,
                reject = fail;
            console.log("wrote to stream with promise");
            return stream.write(value, success);
          
          })));
        
        }));
      
      }));
    }
  }).call(this);
});
var euclidianDistance = (function euclidianDistance$(x, y, a, b) {
  /* euclidian-distance app/sibilant/js/lib/math/geometry.sibilant:1:0 */

  return Math.sqrt((Math.pow((x - a), 2) + Math.pow((y - b), 2)));
});
exports.euclidianDistance = euclidianDistance;
var square = (function square$(dim, f) {
  /* square app/sibilant/js/lib/math/geometry.sibilant:6:0 */

  var lim = Math.round((dim / 2));
  (function() {
    /* app/sibilant/js/meta/macros.sibilant:27:8 */
  
    var $for = null;
    for (var i = (0 - lim);i <= lim;++(i))
    {
    $for = (function() {
      /* app/sibilant/js/meta/macros.sibilant:29:35 */
    
      return (function() {
        /* app/sibilant/js/meta/macros.sibilant:27:8 */
      
        var $for = null;
        for (var j = (0 - lim);j <= lim;++(j))
        {
        $for = (function() {
          /* app/sibilant/js/meta/macros.sibilant:29:35 */
        
          return f(i, j);
        }).call(this);
        }
        ;
        return $for;
      }).call(this);
    }).call(this);
    }
    ;
    return $for;
  }).call(this);
  return null;
});
;
var add = (function add$(a, b) {
  /* add app/sibilant/js/lib/math.sibilant:7:0 */

  return (a + b);
});
var summate = (function summate$(a) {
  /* summate app/sibilant/js/lib/math.sibilant:8:0 */

  return a.reduce(add, 0);
});
var http = require("http"),
    Future = require("./lib/common/async"),
    R = require("ramda");
var writeElementAttribute = (function writeElementAttribute$(value, key) {
  /* write-element-attribute app/sibilant/js/lib/html/element.sibilant:16:0 */

  return Promise.resolve(value).then(((value) => {
  	
    return stream.write((key + "=" + "'" + value + "' "));
  
  }));
});
const HtmlElement={ 
  symbol:Symbol("HtmlElement"),
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
    
   }
 };
var htmlElement = create(HtmlElement);
var renderElementAttribute = R.curry(((value, key, stream) => {
	
  "given a key and a value, render the attribute string fragment";
  return stream.write((" " + (key + "=" + "'" + value + "' ")));

}));
HtmlElement.render = (function HtmlElement$render$(stream = this.stream, name = this.name, attributes = this.attributes, body = this.body) {
  /* Html-element.render ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "Write an html document fragment to a stream, and its content. Content can be a string, promise, or a renderable. ";
  return (function(renderElementAttribute, renderChildSegment, endOpeningTag, renderOpeningTag, renderClosingTag) {
    /* app/sibilant/js/meta/macros.sibilant:119:9 */
  
    return (function(renderAttributes, renderChildren) {
      /* app/sibilant/js/meta/macros.sibilant:119:9 */
    
      renderOpeningTag();
      renderAttributes();
      endOpeningTag();
      renderChildren();
      return renderClosingTag();
    })((() => {
    	
      return Object.keys(attributes).map(((k) => {
      	
        return renderElementAttribute(attributes[k], k);
      
      }));
    
    }), (() => {
    	
      return body.map(((element) => {
      	
        return renderChildSegment(element);
      
      }));
    
    }));
  })(((value, key) => {
  	
    "given a key and a value, render the attribute string fragment associated to the given stream";
    return stream.write((" " + key + "=" + "'" + value + "' "));
  
  }), ((segment) => {
  	
    "Function that is to be called for each segment of the stream, calls the render method of the segment\n"+"if it has one, otherwise its just written to the stream";
    return (function() {
      if (segment.render) {
        return segment.render(stream);
      } else {
        return stream.write(("" + segment));
      }
    }).call(this);
  
  }), (() => {
  	
    "insert the end of an opening html tag.";
    return stream.write(">");
  
  }), (() => {
  	
    return stream.write(("<" + name));
  
  }), (() => {
  	
    return stream.write(("</" + name + ">"));
  
  }));
});
Array.prototype.each = (function Array$prototype$each$(f) {
  /* Array.prototype.each app/sibilant/js/lib/html/element.sibilant:83:0 */

  this.forEach(f);
  return this;
});
var renderTestDocument = (function renderTestDocument$(res) {
  /* render-test-document app/sibilant/js/lib/html/element.sibilant:122:0 */

  return "html"({  }, create(HtmlElement)("head"({  }, create(HtmlElement)()), "body"({  }, create(HtmlElement)("h1"({  }, create(HtmlElement)("this is a shitty website!")), "div"({ id: "main-container" }, create(HtmlElement)("div"({  }, create(HtmlElement)("yes, yes it is.")), "div"({  }, create(HtmlElement)(Date.now())), "div"({  }, create(HtmlElement)("and that was the time.")))))))).render(res);
});
var DOMNode = extend(EventEmitter.prototype, { 
  symbol:Symbol("DOMNode")
 });
mixin({ 
  init( tagName = this.tagName,attributes = this.attributes,children = this.children,_parent = document.body ){ 
    
      this.tagName = tagName;this.attributes = attributes;this.children = children;this._parent = _parent;
      EventEmitter.call(this);
      return this;
    
   }
 }, DOMNode);
console.log(document.appendChild);
DOMNode.render = (function DOMNode$render$(_parent = this._parent, attributes = this.attributes, tagName = this.tagName, _node = this._node, children = this.children) {
  /* DOM-node.render ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  (function() {
    if (_node) {
      console.log("clearing an old node", _node, _parent);
      return _node.remove();
    }
  }).call(this);
  parent = (function() {
    if (parent.symbol === DOMNode.symbol) {
      return parent._parent;
    } else {
      return parent;
    }
  }).call(this);
  this._node = document.createElement(tagName);
  _parent.appendChild(this._node);
  attributes.each(((a, k) => {
  	
    return this._node[k] = a;
  
  }));
  children.each(((c) => {
  	
    return (function() {
      if (c.render) {
        console.log("encountered renderable child", c, this._node, _parent);
        return c.render(this._node);
      } else {
        return this._node.appendChild(document.createTextNode(c));
      }
    }).call(this);
  
  }));
  return this;
});
var Matrix = {  };
mixin({ 
  init( width = this.width,height = this.height,array = [] ){ 
    
      this.width = width;this.height = height;this.array = array;
      return this;
    
   }
 }, Matrix);
Matrix.size = (function Matrix$size$(height = this.height, width = this.width) {
  /* Matrix.size ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return (width * height);
});
Matrix.getIndex = (function Matrix$getIndex$([ i, j ] = [ 0, 0 ], width = this.width) {
  /* Matrix.get-index ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "generate an index for an element in a 1d array from 2d coordinates.";
  return ((i * width) + j);
});
Matrix.get = (function Matrix$get$(x = this.x, y = this.y, width = this.width, height = this.height, array = this.array, getIndex = this.getIndex) {
  /* Matrix.get ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "retrieve an element of a matrix by its x and y coordinates ";
  x = ((x + width) % width);
  y = ((y + height) % height);
  return array[getIndex([ x, y ], width)];
});
Matrix.set = (function Matrix$set$(x = this.x, y = this.y, value = this.value, width = this.width, height = this.height, array = this.array, getIndex = this.getIndex) {
  /* Matrix.set ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "change the value of an array using 2d coordinates.";
  x = ((x + width) % width);
  y = ((y + height) % height);
  return array[getIndex([ x, y ], width)] = value;
});
Matrix.addToCell = (function Matrix$addToCell$(x = this.x, y = this.y, value = this.value, height = this.height, width = this.width, array = this.array) {
  /* Matrix.add-to-cell ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "add a number to a value found with 2d coordinates";
  var i = this.getIndex([ x, y ]);
  return array[i] = (array[i] + value);
});
Matrix.add = (function Matrix$add$() {
  /* Matrix.add ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  
});
Matrix.scalarMultiply = (function Matrix$scalarMultiply$(scalar = this.scalar, m = this) {
  /* Matrix.scalar-multiply ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return m.map(((v) => {
  	
    return (v * scalar);
  
  }));
});
Matrix.mult = (function Matrix$mult$(value = this.value, m = this) {
  /* Matrix.mult ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return (function() {
    if (typeof value === "number") {
      return m.scalarMultiply(value);
    } else {
      return m.dotProduct(value);
    }
  }).call(this);
});
Matrix.transit = (function Matrix$transit$(target = this.target, f = this.f, matrix = this, height = this.height, width = this.width) {
  /* Matrix.transit ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "Mapping operator. Performs a map over every element in a matrix, inserting the\n"+"map's results into a target matrix of the same dimensions as the originating matrix ";
  return matrix.map(f, matrix, height, width, target);
});
Matrix.dotProduct = (function Matrix$dotProduct$(B = this.B, A = this) {
  /* Matrix.dot-product ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "Standard matrix multiplication, two matricies can only be multiplied\n"+"if the height of the second is equal to the width of the first.";
  return (function() {
    if (A.width === B.height) {
      return (function(m) {
        /* app/sibilant/js/meta/macros.sibilant:119:9 */
      
        for (var r = 0;r < A.width;++(r))
        {
        for (var c = 0;c < B.height;++(c))
        {
        m.set(r, c, 0);
        for (var i = 0;i < A.height;++(i))
        {
        m.addToCell(r, c, (A.get(r, i) * B.get(i, c)))
        }
        
        }
        
        }
        ;
        return m;
      })(matrix(A.height, B.width));
    }
  }).call(this);
});
Matrix.each = (function Matrix$each$(f = this.f, width = this.width, height = this.height) {
  /* Matrix.each ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "standard itterative operator, accepts a function and applies it to every\n"+"element of the matrix";
  var r = this;
  for (var x = 0;x < width;++(x))
  {
  for (var y = 0;y < height;++(y))
  {
  f(r.get(x, y), x, y, r)
  }
  
  }
  ;
  return r;
});
Matrix.map = (function Matrix$map$(f = this.f, m = this, width = this.width, height = this.height, result = create(this)(width, height)) {
  /* Matrix.map ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "standard itterative operator, takes a produces a new Matrix from the successive\n"+"application of that function to every element of the input matrix";
  return (function(r) {
    /* app/sibilant/js/meta/macros.sibilant:119:9 */
  
    m.each(((v, x, y, m) => {
    	
      return r.set(x, y, (f(v, x, y, m) || 0));
    
    }));
    return r;
  })(result);
});
Matrix.dmap = (function Matrix$dmap$(f = this.f, m = this, width = this.width, height = this.height) {
  /* Matrix.dmap ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "short for destructive map, dmap takes a function and applies it to every\n"+"element of the matrix, swapping out the value of the functions return with its input. ";
  return m.map(f, m, width, height, m);
});
var matrix = create(Matrix);
exports.Matrix = Matrix;
exports.matrix = matrix;
// var assert = require("assert");// (function(m) {
//   /* app/sibilant/js/meta/macros.sibilant:119:9 */
// 
//   return (function(x2Y2) {
//     /* app/sibilant/js/meta/macros.sibilant:119:9 */
//   
//     assert.strictEqual(x2Y2, 3, ("it does not get!" + m.get(2, 2)));
//     m.set(2, 2, 10);
//     assert(m.get(2, 2) === 10);
//     return console.log("it is setted good", m.get(2, 2));
//   })(m.get(2, 2));
// })(matrix(5, 5, [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5 ]));
var MatrixView = extend(Matrix, { 
  symbol:Symbol("MatrixView")
 });
mixin({ 
  offset:[ 0, 0 ],
  init( _matrix = this._matrix,width = this.width,height = this.height,offset = this.offset ){ 
    
      this._matrix = _matrix;this.width = width;this.height = height;this.offset = offset;
      return this;
    
   }
 }, MatrixView);
MatrixView.getIndex = (function MatrixView$getIndex$([ x, y ] = [ 0, 0 ], [ offx, offy ] = this.offset, width = (this.width + this._matrix.width)) {
  /* Matrix-view.get-index ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "\n"+"Locate the index of an element with an offset, and a limit on width and height.\n"+"";
  return (((x + offx) * width) + (y + offy));
});
MatrixView.get = (function MatrixView$get$(x = this.x, y = this.y, width = this.width, height = this.height, [ offx, offy ] = this.offset) {
  /* Matrix-view.get ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "retrieve an element of a matrix by its x and y coordinates ";
  return this._matrix.get((x + offx), (y + offy));
});
MatrixView.set = (function MatrixView$set$(x = this.x, y = this.y, value = this.value, width = this.width, height = this.height, [ offx, offy ] = this.offset) {
  /* Matrix-view.set ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "change the value of an array using 2d coordinates.";
  return this._matrix.set((x + offx), (y + offy), value);
});
var Kernel = extend(Matrix, { 
  symbol:Symbol("Kernel")
 });
mixin({ 
  init( width = this.width,height = this.height,_kernel = (function(r) {
    /* app/sibilant/js/meta/macros.sibilant:119:9 */
  
    for (var x = 0;x < width;++(x))
    {
    r.push([])
    }
    ;
    return r;
  })([]) ){ 
    
      this.width = width;this.height = height;this._kernel = _kernel;
      return this;
    
   },
  get _matrix(  ){ 
    
      return this._kernel;
    
   },
  get array(  ){ 
    
      return this._kernel;
    
   }
 }, Kernel);
Kernel.get = (function Kernel$get$(x = this.x, y = this.y, width = this.width, height = this.height, _kernel = this._kernel) {
  /* Kernel.get ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "retrieve an element of a matrix by its x and y coordinates";
  return _kernel[x][y];
});
Kernel.set = (function Kernel$set$(x = this.x, y = this.y, value = this.value, _kernel = this._kernel) {
  /* Kernel.set ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "change the value of an array using 2d coordinates.";
  return _kernel[x][y] = value;
});
Kernel.convolve = (function Kernel$convolve$(B = this.B, A = this, height = this.height, width = this.width) {
  /* Kernel.convolve ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "perform a kernel filter convolution of two matricies '";
  return (function(m) {
    /* app/sibilant/js/meta/macros.sibilant:119:9 */
  
    for (var x = 0;x < width;++(x))
    {
    for (var y = 0;y < height;++(y))
    {
    m = (m + (A.get(x, y) * B.get(x, y)));
    }
    
    }
    ;
    return m;
  })(0);
});
Kernel.identity = (function Kernel$identity$(w, h) {
  /* Kernel.identity app/sibilant/js/lib/collection/matrix/kernel.sibilant:33:0 */

  return kernel(w, h).dmap((() => {
  	
    return 1;
  
  }));
});
var kernel = create(Kernel);
var matrix = create(Matrix);
var matrixView = create(MatrixView);
const StateSpace={ 
  symbol:Symbol("StateSpace"),
  init( width = this.width,height = this.height,state = create(Matrix)(height, width, (new Float32Array((height * width)))).dmap((function() {
    /* app/sibilant/js/meta/macros.sibilant:69:62 */
  
    return 0;
  })),transition = create(Matrix)(height, width, (new Float32Array((height * width)))).dmap((function() {
    /* app/sibilant/js/meta/macros.sibilant:69:62 */
  
    return 0;
  })) ){ 
    
      this.width = width;this.height = height;this.state = state;this.transition = transition;
      return this;
    
   }
 };
StateSpace.resize = (function StateSpace$resize$(w = this.w, h = this.h, c = this.c) {
  /* State-space.resize ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return this.init.call(this, w, h);
});
StateSpace.get = (function StateSpace$get$(x = this.x, y = this.y, state = this.state) {
  /* State-space.get ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return this.getState(x, y, state);
});
StateSpace.getState = (function StateSpace$getState$(x = this.x, y = this.y, state = this.state) {
  /* State-space.get-state ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return state.get(x, y);
});
StateSpace.getTransition = (function StateSpace$getTransition$(x = this.x, y = this.y, transition = this.transition) {
  /* State-space.get-transition ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return transition.get(x, y);
});
StateSpace.set = (function StateSpace$set$(x = this.x, y = this.y, value = this.value, state = this.state) {
  /* State-space.set ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return this.setTransition(x, y, value);
});
StateSpace.setState = (function StateSpace$setState$(x = this.x, y = this.y, value = this.value, state = this.state) {
  /* State-space.set-state ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return state.set(x, y, value);
});
StateSpace.setTransition = (function StateSpace$setTransition$(x = this.x, y = this.y, value = this.value, transition = this.transition) {
  /* State-space.set-transition ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return transition.set(x, y, value);
});
StateSpace.eachState = (function StateSpace$eachState$(f = this.f, state = this.state) {
  /* State-space.each-state ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  state.each(f);
  return this;
});
StateSpace.each = (function StateSpace$each$(f = this.f, state = this.state) {
  /* State-space.each ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  state.each(f);
  return this;
});
StateSpace.transit = (function StateSpace$transit$(f = this.f, state = this.state, transition = this.transition) {
  /* State-space.transit ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/defs.sibilant:222:8 */

  state.transit(transition, f);
  return this;
});
StateSpace.eachTransition = (function StateSpace$eachTransition$(f = this.f, transition = this.transition) {
  /* State-space.each-transition ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  transition.each(f);
  return this;
});
StateSpace.clear = (function StateSpace$clear$(width = this.width, height = this.height) {
  /* State-space.clear ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  this.clearTransitions();
  return this.clearStates();
});
StateSpace.clearTransitions = (function StateSpace$clearTransitions$(width = this.width, height = this.height) {
  /* State-space.clear-transitions ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  var r = create(Matrix)([], width, height),
      setTransition = (() => {
  	
    return 0;
  
  });
  return this.transition = r.dmap(setTransition);
});
StateSpace.clearStates = (function StateSpace$clearStates$(width = this.width, height = this.height) {
  /* State-space.clear-states ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  var r = create(Matrix)([], width, height),
      setState = (() => {
  	
    return 0;
  
  });
  return this.state = r.dmap(setState);
});
StateSpace.update = (function StateSpace$update$(f = this.f, state = this.state, transition = this.transition) {
  /* State-space.update ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/defs.sibilant:222:8 */

  this.state = transition;
  this.transition = state;
  return this;
});
exports.StateSpace = StateSpace;
var setValue = R.curry(((value, entity) => {
	
  return entity.value = value;

}));
var curry = R.curry;
var { 
  not:fnot,
  pipe:fpipe,
  equals
 } = R;
Object.prototype.each = (function Object$prototype$each$(f) {
  /* Object.prototype.each app/sibilant/js/lib/lib.sibilant:31:0 */

  return Object.keys(this).each(((k) => {
  	
    return f(this[k], k);
  
  }));
});
global.create = create;
global.extend = extend;
global.mixin = mixin;
var green = { 
  red:0,
  green:255,
  blue:0
 },
    yellow = { 
  red:255,
  green:255,
  blue:0
 };
var memoize = (function memoize$(f) {
  /* memoize app/sibilant/js/lib/lib.sibilant:41:0 */

  "create a memoized version of any function. A memoized function will return\n"+"previously calculated results from a cache if the arguments given to it are the same";
  var m = {  };
  return cond(R.has, R.prop, ((...args) => {
  	
    return f.apply(this, args);
  
  }));
});
var domNode = create(DOMNode);
var { 
  EventEmitter
 } = require("events");
var { 
  Layers
 } = require("../../js/webgl-layer.js");
const Location={ 
  symbol:Symbol("Location"),
  init( x = this.x,y = this.y,layers = [] ){ 
    
      this.x = x;this.y = y;this.layers = layers;
      return this;
    
   }
 };
var Simulation = extend(EventEmitter.prototype, { 
  symbol:Symbol("Simulation")
 });
mixin({ 
  init( fps = this.fps,_width = this._width,_scale = this._scale,state = false,layers = (new Layers(document.getElementById("stage"), "gl", _width, _scale)).setBGColor(),coord = matrix(_width, _width).dmap(((nil, x, y) => {
  	
    return create(Location)(x, y);
  
  })),systems = (new Set()),ticks = 0,sim = this ){ 
    
      this.fps = fps;this._width = _width;this._scale = _scale;this.state = state;this.layers = layers;this.coord = coord;this.systems = systems;this.ticks = ticks;this.sim = sim;
      EventEmitter.call(this);
      return this;
    
   },
  get rate(  ){ 
    
      return (1000 / this.fps);
    
   },
  get width(  ){ 
    
      return this._width;
    
   },
  get scale(  ){ 
    
      return this._scale;
    
   },
  set width( value ){ 
    
      return this._width = value;
    
   }
 }, Simulation);
Simulation.start = (function Simulation$start$() {
  /* Simulation.start ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/defs.sibilant:222:8 */

  "start the simulation";
  this.state = true;
  this.previous = Date.now();
  this.tick();
  return this;
});
Simulation.toggle = (function Simulation$toggle$() {
  /* Simulation.toggle ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/defs.sibilant:222:8 */

  "switches the state of the simulation, if its on, turn it off, if its off, turn it on.";
  this.state = !(this.state);
  (function() {
    if (this.state) {
      return this.start();
    }
  }).call(this);
  return this;
});
Simulation.stop = (function Simulation$stop$() {
  /* Simulation.stop ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/defs.sibilant:222:8 */

  "stop the simulation";
  this.state = false;
  return this;
});
Simulation.tick = (function Simulation$tick$(previous = this.previous, rate = this.rate) {
  /* Simulation.tick ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/defs.sibilant:222:8 */

  "Decides when to tick based on specified framerate, and turns the simulation off if it was previously on and the state has since changed.";
  (function() {
    if (this.state) {
      var now = Date.now();
      this.elapsed = (now - previous);
      window.requestAnimationFrame((() => {
      	
        return this.tick();
      
      }));
      return (function() {
        if (this.elapsed > rate) {
          ++(this.ticks);
          this.previous = (now - (this.elapsed % rate));
          return this.emit("tick", now, this.ticks);
        }
      }).call(this);
    }
  }).call(this);
  return this;
});
exports.Simulation = Simulation;






var domTreeRoot = domNode("div", { id: "container" }, [ domNode("h1", {  }, [ "SPECIATION" ]), domNode("div", { id: "stage" }, []) ]).render(document.body);
domTreeRoot.render()
var sim = create(Simulation)(30, 100, 8);
global.sim = sim;
var fields = [];
var FieldSystem = extend(Matrix, { 
  symbol:Symbol("FieldSystem")
 });
var Descriptions = {  };
var stateSpace = create(StateSpace);
const Component={ 
  symbol:Symbol("Component")
 };
Descriptions.Component = mixin({ 
  init( x = this.x,y = this.y,neiborhood = moore(x, y, this.field) ){ 
    
      this.x = x;this.y = y;this.neiborhood = neiborhood;
      return this;
    
   },
  get influences(  ){ 
    
      return this.system.influences.map(((s) => {
      	
        return s.field.get(this.x, this.y);
      
      }));
    
   },
  get value(  ){ 
    
      return this.field.get(this.x, this.y);
    
   },
  set value( v ){ 
    
      return this.field.set(this.x, this.y, v);
    
   }
 }, Component);
Descriptions.FieldSystem = mixin({ 
  init( name = this.name,render__QUERY = false,height = this.height,width = this.width,symbol = Symbol(name),field = stateSpace(width, height),components = [],layer = (function() {
    if (render__QUERY) {
      return sim.layers.get();
    } else {
      return (new Set());
    }
  }).call(this),system = this,_Component = extend(this, Component) ){ 
    
      this.name = name;this.render__QUERY = render__QUERY;this.height = height;this.width = width;this.symbol = symbol;this.field = field;this.components = components;this.layer = layer;this.system = system;this._Component = _Component;
      systems.push(this);
      return this;
    
   },
  get Component(  ){ 
    
      return this._Component;
    
   },
  doc:"A quantity which has a value over every point of a global space for all locations in space and time.",
  height:sim._width,
  width:sim._width,
  get array(  ){ 
    
      return this.components;
    
   }
 }, FieldSystem);
FieldSystem.populate = (function FieldSystem$populate$(field = this.field) {
  /* Field-system.populate ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "for every value influenced by the field, create a point object to represent that value";
  return field.each(((v, x, y) => {
  	
    return this.addComponent(x, y, v);
  
  }));
});
FieldSystem.clear = (function FieldSystem$clear$(field = this.field, components = this.components) {
  /* Field-system.clear ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  field.transit(((x) => {
  	
    return 0;
  
  }));
  field.update();
  field.transit(((x) => {
  	
    return x;
  
  }));
  return field.update();
});
FieldSystem.addComponent = (function FieldSystem$addComponent$(x = this.x, y = this.y, value = this.value, _Component = this._Component, layer = this.layer, components = this.components) {
  /* Field-system.add-component ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  var component = create(_Component)(x, y);
  components.push(component);
  return layer.add(component);
});
FieldSystem.removeComponent = (function FieldSystem$removeComponent$(r = this.r, layer = this.layer, components = this.components) {
  /* Field-system.remove-component ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  components.filter(((c) => {
  	
    return !(r === c);
  
  }));
  return layer.delete(r);
});
FieldSystem.update = (function FieldSystem$update$(ticks = this.ticks, components = this.components, field = this.field) {
  /* Field-system.update ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  "update every component of the field.";
  return components.each(((c) => {
  	
    return c.update(ticks);
  
  }));
});
var randomizeField = (function randomizeField$(field = this.field, system = this) {
  /* randomize-field ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  field.transit(((x) => {
  	
    return Math.random();
  
  }));
  field.update();
  field.transit(((x) => {
  	
    return x;
  
  }));
  field.update();
  return system.max = 0;
});
FieldSystem.randomize = randomizeField;
var fieldSystem = create(FieldSystem);
var total = (function total$(arr) {
  /* total eval.sibilant:1:0 */

  "calculate the total sum of all values in an eachable.";
  var sum = 0;
  arr.each(((v) => {
  	
    return sum += v;
  
  }));
  return sum;
});
var displayStats = (function displayStats$(fieldSystem) {
  /* display-stats eval.sibilant:1:0 */

  "calculate and log the average and total values for all cells in a system.";
  return (function(b, ...others) {
    /* ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/console.sibilant:10:8 */
  
    console.log("average", fieldSystem.name, b, ...others);
    return b;
  })(((function(b, ...others) {
    /* ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/console.sibilant:10:8 */
  
    console.log("total", fieldSystem.name, b, ...others);
    return b;
  })(total(fieldSystem.field)) / (100 * 100)));
});
var updateEntities = (function updateEntities$() {
  /* update-entities eval.sibilant:1:0 */

  "update the state of every entity. Entity updates may affect fields and other systems.";
  return entities.each(((ent) => {
  	
    return ent.update();
  
  }));
});
var updateOnBeatField = (function updateOnBeatField$(currentSystem, ticks) {
  /* update-on-beat-field eval.sibilant:1:0 */

  "calculate the values for the system that is said to currently be active. Systems are updated one\n"+"at a time, one per tick,so that updates to each can make changes to each. Values of each system will\n"+"be integrated for the time missing between each of their updates.";
  currentSystem.update(ticks);
  return currentSystem.field.update();
});
var getOnbeat = (function getOnbeat$(ticks) {
  /* get-onbeat eval.sibilant:1:0 */

  "return the id of the *onbeat* or major system of the current tick";
  return systems[(ticks % systems.length)].symbol;
});
var refreshFields = (function refreshFields$() {
  /* refresh-fields eval.sibilant:1:0 */

  "update the state matricies of every existing field.";
  return systems.each(((system) => {
  	
    return system.field.update();
  
  }));
});
var updateDisplay = (function updateDisplay$() {
  /* update-display eval.sibilant:1:0 */

  return sim.layers.update().render();
});
var systems = [];
var System = {  };
var e = Math.E;
var createInstanceOf = (function createInstanceOf$(type, ...args) {
  /* create-instance-of app/sibilant/js/game/systems.sibilant:6:0 */

  return create(type)(...args);
});
var moore = (function moore$(x, y, field) {
  /* moore app/sibilant/js/game/systems.sibilant:27:0 */

  return create(MatrixView)(field, 3, 3, [ (x - 1), (y - 1) ]);
});
var countKernel = kernel(3, 3, [ [ 1, 1, 1 ], [ 1, 1, 1 ], [ 1, 1, 1 ] ]);
var identity = (function identity$() {
  /* identity app/sibilant/js/game/systems.sibilant:36:0 */

  return matrix(3, 3, [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ]);
});
var averageKernel = countKernel.mult((1 / 9));
var additiveSmooth = memoize((function(s, a, b) {
  /* app/sibilant/js/game/systems.sibilant:50:30 */

  return ((s + a) / (s + b));
}));
var additiveSmooth = (function additiveSmooth$(s, a, b) {
  /* additive-smooth app/sibilant/js/game/systems.sibilant:52:0 */

  return ((s + a) / (s + b));
});
var _convolve = (function _convolve$(A, B) {
  /* *convolve app/sibilant/js/game/systems.sibilant:55:0 */

  return A.convolve(B);
});
var percentToColor = (function percentToColor$(percentage) {
  /* percent-to-color app/sibilant/js/game/systems.sibilant:58:0 */

  return (percentage * 255);
});
var inverseSquare = (function inverseSquare$(rate, c, pos, { 
  x,
  y
 }) {
  /* inverse-square app/sibilant/js/game/systems.sibilant:61:0 */

  return (rate / (c + Math.pow(euclidianDistance(x, y, pos.x, pos.y), 2)));
});
var Sun = createInstanceOf(FieldSystem, "Sun");
mixin({ 
  ySkew:2.4,
  xSkew:1.1,
  rate:100,
  dampening:100,
  mid:(Sun.width / 2),
  gamma:0.9,
  max:0,
  get r(  ){ 
    
      return percentToColor(Math.pow((3 * this.value), this.gamma));
    
   },
  get g(  ){ 
    
      return percentToColor(Math.pow((2 * this.value), this.gamma));
    
   },
  get b(  ){ 
    
      return (60 + percentToColor(Math.pow(this.value, this.gamma)));
    
   },
  get a(  ){ 
    
      return percentToColor(0.2);
    
   }
 }, Sun.Component);
var solarIntensity = (function solarIntensity$(x, y, rate, dampening, mid, xSkew, ySkew) {
  /* solar-intensity app/sibilant/js/headers.sibilant:21:8 */

  return inverseSquare(rate, dampening, { 
    x:(mid / xSkew),
    y:(mid / ySkew)
   }, { 
    x:(x / xSkew),
    y:(y / ySkew)
   });
});
Sun.Component.update = (function Sun$Component$update$(tick = this.tick, x = this.x, y = this.y, rate = this.rate, dampening = this.dampening, ySkew = this.ySkew, xSkew = this.xSkew, mid = this.mid, field = this.field) {
  /* Sun.Component.update ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  var value = solarIntensity(x, y, rate, dampening, mid, xSkew, ySkew);
  (function() {
    if (value > Sun.max) {
      console.log("new max sun value");
      return Sun.max = value;
    }
  }).call(this);
  return field.set((tick + x), (y + Math.round((50 * Math.sin((tick / 10000))))), value);
});
console.log(Sun.components.filter(((c) => {
	
  return c.value > 1;

})).map(((c) => {
	
  return [ c.x, c.y, c.value ];

})));
var Heat = createInstanceOf(FieldSystem, "Heat", true);
mixin({ 
  gain:1,
  retention:0.9,
  loss:0.1,
  max:0,
  total:0,
  influences:[ Sun ],
  update( ticks = this.ticks,components = this.components,field = this.field ){ 
    
      FieldSystem.update(ticks, components, field);
      return this.total = 0;
    
   }
 }, Heat);
mixin({ 
  init( x = this.x,y = this.y,neiborhood = moore(x, y, this.field) ){ 
    
      this.x = x;this.y = y;this.neiborhood = neiborhood;
      return this;
    
   },
  gamma:1,
  get r(  ){ 
    
      return percentToColor(Math.pow((this.value / this.max), this.gamma));
    
   },
  g:1,
  b:1,
  get a(  ){ 
    
      return percentToColor(0.9);
    
   },
  update( tick = this.tick,x = this.x,y = this.y,influences = this.influences,loss = this.loss,retention = this.retention,gain = this.gain,field = this.field,value = this.value,max = this.max,neiborhood = this.neiborhood ){ 
    
      var heat = value;
      var net = netHeat(retention, gain, loss, influences, neiborhood);
      (function() {
        if (net > this.max) {
          return Heat.max = net;
        }
      }).call(this);
      return field.set(x, y, net);
    
   }
 }, Heat.Component);
var netHeat = (function netHeat$(retention, gain, loss, influences, neiborhood) {
  /* net-heat app/sibilant/js/headers.sibilant:21:8 */

  var net = ((retention * gain * summate(influences)) + _convolve(averageKernel, neiborhood));
  return (function() {
    if (net > loss) {
      return (net - loss);
    } else {
      return 0;
    }
  }).call(this);
});
console.log(systems);
console.log(Heat.components.map(((c) => {
	
  return c.influences;

})));
console.log(Heat.components.length, Heat.components.map(((c) => {
	
  return [ c.x, c.y, c.value, c.r ];

})));
console.log(averageKernel);
console.log(averageKernel.convolve(matrix(3, 3, [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ])));
var Light = createInstanceOf(FieldSystem, "Light", true);
mixin({ 
  influences:[ Sun ]
 }, Light);
mixin({ 
  gamma:0.5,
  get r(  ){ 
    
      return percentToColor(Math.pow((3 * this.value), this.gamma));
    
   },
  get g(  ){ 
    
      return percentToColor(Math.pow((2 * this.value), this.gamma));
    
   },
  get b(  ){ 
    
      return (60 + percentToColor(Math.pow(this.value, this.gamma)));
    
   },
  get a(  ){ 
    
      return percentToColor(0.2);
    
   }
 }, Light.Component);
Light.Component.update = (function Light$Component$update$(tick = this.tick, x = this.x, y = this.y, influences = this.influences, gain = this.gain, loss = this.loss, field = this.field, value = this.value, max = this.max, neiborhood = this.neiborhood) {
  /* Light.Component.update ../kit-lang/shell-utils/electron-kit/node_modules/kit/inc/core/function-expressions.sibilant:30:8 */

  return field.set(x, y, (1 * summate(influences)));
});
var Water = createInstanceOf(FieldSystem, "Water", true);
mixin({ 
  influences:[ Heat ],
  gain:100,
  max:0,
  total:0
 }, Water);
mixin({ 
  init( x = this.x,y = this.y,neiborhood = moore(x, y, this.field) ){ 
    
      this.x = x;this.y = y;this.neiborhood = neiborhood;
      return this;
    
   },
  gamma:1,
  get b(  ){ 
    
      return percentToColor(Math.pow((this.value / this.max), this.gamma));
    
   },
  g:1,
  r:1,
  get a(  ){ 
    
      return percentToColor(0.2);
    
   },
  update( tick = this.tick,x = this.x,y = this.y,field = this.field,value = this.value,neiborhood = this.neiborhood,influences = this.influences ){ 
    
      var heat = influences[0];
      var averageWater = _convolve(averageKernel, neiborhood),
          averageHeat = _convolve(averageKernel, Heat.get(x, y).neiborhood);
      var heatInfluence = additiveSmooth(1, averageHeat, heat);
      var saturation = additiveSmooth(1, averageWater, value);
      var net = (value * saturation * heatInfluence);
      (function() {
        if (net > Water.max) {
          return Water.max = net;
        }
      }).call(this);
      return field.set(x, y, net);
    
   }
 }, Water.Component);
var specificHeat = 4.186;
var dHvap = 2257;
var R_ = 8.3145;
var coriolisKernel = kernel(3, 3, [ [ 1, 1, 1 ], [ 1, 1, 1 ], [ 1, 1, 1 ] ]).mult((1 / 9));
console.log(systems);
systems.each(((s) => {
	
  return s.populate();

}));
console.log(Water);
var sum = 0;
Water.field.transit(((v, x, y) => {
	
  var r = Math.random();
  return r;

}));
Water.field.update();
Water.field.transit(((v, x, y) => {
	
  return v;

}));
Water.field.update();
var sum = 0;
Water.field.each(((v) => {
	
  return sum += v;

}));
console.log("total water", sum);
var Silt = createInstanceOf(FieldSystem, "Silt", true);
mixin({ 
  influences:[ Water ],
  randomize( field = this.field ){ 
    
      return randomizeField(field);
    
   }
 }, Silt);
mixin({ 
  init( x = this.x,y = this.y,neiborhood = moore(x, y, this.field) ){ 
    
      this.x = x;this.y = y;this.neiborhood = neiborhood;
      return this;
    
   },
  get r(  ){ 
    
      return percentToColor(this.value);
    
   },
  get g(  ){ 
    
      return percentToColor((0.7 * this.value));
    
   },
  get b(  ){ 
    
      return percentToColor((0.4 * this.value));
    
   },
  get a(  ){ 
    
      return percentToColor(0.3);
    
   },
  update( tick = this.tick,x = this.x,y = this.y,field = this.field,value = this.value,neiborhood = this.neiborhood,influences = this.influences ){ 
    
      var water = influences[0];
      var averageSilt = _convolve(averageKernel, neiborhood);
      var averageWater = _convolve(averageKernel, Water.get(x, y).neiborhood);
      var waterInfluence = additiveSmooth(1, averageWater, water),
          saturation = additiveSmooth(1, averageSilt, value);
      var net = (value * saturation * waterInfluence);
      (function() {
        if (net > Silt.max) {
          return Silt.max = net;
        }
      }).call(this);
      return field.set(x, y, net);
    
   }
 }, Silt.Component);
Silt.randomize();
const Collision={ 
  symbol:Symbol("Collision")
 };
mixin({ 
  _map:(new Map()),
  has( [ x, y ],_map = this._map ){ 
    
      return _map.has(sim.coord.get(x, y));
    
   },
  set( [ x, y ],entity,_map = this._map ){ 
    
      return _map.set(sim.coord.get(x, y), entity);
    
   },
  get( [ x, y ],_map = this._map ){ 
    
      return _map.get(sim.coord.get(x, y));
    
   },
  move( [ x, y ],entity ){ 
    
      return (function() {
        if (!(Collision.has([ x, y ]))) {
          _map.delete(sim.coord.get(entity.x, entity.y));
          _map.set(sim.coord.get(x, y), entity);
          entity.x = x;
          entity.y = y;
          return this;
        }
      }).call(this);
    
   },
  delete( [ x, y ],_map = this._map ){ 
    
      return _map.delete(sim.coord.get(x, y));
    
   }
 }, Collision);
systems.each(((s) => {
	
  return s.populate();

}));
var entities = [];
var lastOf = (function lastOf$(arr) {
  /* last-of app/sibilant/js/game/components.sibilant:12:0 */

  return arr.slice(-1)[0];
});
const Container={ 
  symbol:Symbol("Container")
 };
mixin({ 
  max:100,
  init( entity = this.entity,max = this.max,value = max,delta = {
    positive: 0,
    negative: 0
  } ){ 
    
      this.entity = entity;this.max = max;this.value = value;this.delta = delta;
      return this;
    
   },
  add( v = this.v ){ 
    
      return this.delta.positive += v;
    
   },
  remove( v = this.v ){ 
    
      return this.delta.negative += v;
    
   },
  full__QUERY( value = this.value,max = this.max ){ 
    
      return value > max;
    
   },
  empty__QUERY( value = this.value ){ 
    
      return value < 0;
    
   },
  update( entity = this.entity,max = this.max,value = this.value,delta = this.delta,container = this ){ 
    
      (function() {
        if (container.full__QUERY()) {
          return (function(percentFull) {
            /* app/sibilant/js/meta/macros.sibilant:119:9 */
          
            return (function(multiplier) {
              /* app/sibilant/js/meta/macros.sibilant:119:9 */
            
              return (function(newValue) {
                /* app/sibilant/js/meta/macros.sibilant:119:9 */
              
                return container.value = newValue;
              })(((value + (multiplier * delta.positive)) - delta.negative));
            })((1 / ((container.value / container.max) - 1)));
          })((container.value / container.max));
        } else if (container.empty__QUERY()) {
          return container.value = 0;
        } else {
          return (function(newValue) {
            /* app/sibilant/js/meta/macros.sibilant:119:9 */
          
            return container.value = newValue;
          })(((value + delta.positive) - delta.negative));
        }
      }).call(this);
      container.delta.positive = 0;
      return container.delta.negative = 0;
    
   }
 }, Container);
const Absorber={ 
  symbol:Symbol("Absorber")
 };
mixin({ 
  kernel:kernel(3, 3, [ [ 1, 1, 1 ], [ 1, 4, 1 ], [ 1, 1, 1 ] ]).mult((1 / 12)),
  cost:0.00001,
  Field:null,
  Container:null,
  init( entity = this.entity,Field = this.Field,neiborhood = moore(entity.x, entity.y, Field.field) ){ 
    
      this.entity = entity;this.Field = Field;this.neiborhood = neiborhood;
      return this;
    
   },
  update( entity = this.entity,neiborhood = this.neiborhood,kernel = this.kernel,cost = this.cost,Container = this.Container ){ 
    
      return (function(container) {
        /* app/sibilant/js/meta/macros.sibilant:119:9 */
      
        return (function(current) {
          /* app/sibilant/js/meta/macros.sibilant:119:9 */
        
          return (function() {
            if (current < container.max) {
              return (function(calories, absorbed) {
                /* app/sibilant/js/meta/macros.sibilant:119:9 */
              
                kernel.each(((v, x, y) => {
                	
                  return (function(r) {
                    /* app/sibilant/js/meta/macros.sibilant:119:9 */
                  
                    return neiborhood.set(x, y, (r > 0) ? r : 0);
                  })((neiborhood.get(x, y) - v));
                
                }));
                container.add(absorbed);
                return calories.remove((absorbed * cost));
              })(entity[Calories.symbol], kernel.convolve(neiborhood));
            }
          }).call(this);
        })(container.value);
      })(entity[Container.symbol]);
    
   }
 }, Absorber);
const NaturalHealing={ 
  symbol:Symbol("NaturalHealing")
 };
mixin({ 
  rate:30,
  cost:1,
  init( entity = this.entity ){ 
    
      this.entity = entity;
      return this;
    
   },
  update( entity = this.entity,rate = this.rate,healing = this ){ 
    
      return (function(calories, health, nutriants) {
        /* app/sibilant/js/meta/macros.sibilant:119:9 */
      
        health.add(rate);
        return (function(gainedHealth) {
          /* app/sibilant/js/meta/macros.sibilant:119:9 */
        
          calories.remove(gainedHealth);
          return nutriants.remove(gainedHealth);
        })(((rate / 2) * (1 / (nutriants.value / nutriants.max))));
      })(entity[Calories.symbol], entity[Health.symbol], entity[Nutriants.symbol]);
    
   }
 }, NaturalHealing);
var Nutriants = extend(Container, { 
  symbol:Symbol("Nutriants")
 });
var Hydration = extend(Container, { 
  symbol:Symbol("Hydration")
 });
var Calories = extend(Container, { 
  symbol:Symbol("Calories")
 });
mixin({ 
  max:1000,
  doc:"Calories are units of potential energy, when calories are used,\n"+"damage will be done to the entity based on how many calories are burned. Hydration\n"+"reduces energy used, vitamins reduce the amount of damage taken per calorie burned",
  update( entity = this.entity,max = this.max,value = this.value,delta = this.delta,calories = this ){ 
    
      return (function(hydration, health) {
        /* app/sibilant/js/meta/macros.sibilant:119:9 */
      
        return (function(burn) {
          /* app/sibilant/js/meta/macros.sibilant:119:9 */
        
          delta.negative = burn;
          hydration.remove(burn);
          health.remove(burn);
          (function() {
            if (calories.value < burn) {
              return health.remove((2 * burn));
            }
          }).call(this);
          return Container.update.call(calories, entity);
        })((delta.negative / (0.001 + (hydration.value / hydration.max))));
      })(entity[Hydration.symbol], entity[Health.symbol]);
    
   }
 }, Calories);
var Health = extend(Container, { 
  symbol:Symbol("Health")
 });
mixin({ 
  doc:"Health represents the amount of damage an entity is capable of taking,\n"+"damage can come from any where,even the entities own body;though digestion. When an entities health reaches 0, it dies.\n"+"Dead entities still exist for a while, until their resources have been completely decayed into the surrounding, either from\n"+"being eaten, or passive movement of gasses and liquids away from a high density source.",
  update( entity = this.entity,health = this ){ 
    
      Container.update.call(this, entity);
      return (function() {
        if (health.value <= 0) {
          return entity.emit("death", entity);
        }
      }).call(this);
    
   }
 }, Health);
var NutriantAbsorber = extend(Absorber, { 
  symbol:Symbol("NutriantAbsorber")
 });
mixin({ 
  Container:Nutriants,
  Field:Silt
 }, NutriantAbsorber);
var Photoreceptor = extend(Absorber, { 
  symbol:Symbol("Photoreceptor")
 });
mixin({ 
  Container:Calories,
  Field:Light,
  update( entity = this.entity,neiborhood = this.neiborhood,kernel = this.kernel,cost = this.cost,Container = this.Container ){ 
    
      return Absorber.update(entity, neiborhood, kernel, cost, Container);
    
   }
 }, Photoreceptor);
var WaterAbsorbtion = extend(Absorber, { 
  symbol:Symbol("WaterAbsorbtion")
 });
mixin({ 
  doc:"water decreases the amount of calories burned when performing an action",
  Container:Hydration,
  Field:Water
 }, WaterAbsorbtion);
({
  value: 50,
  max: 100
}.value / {
  value: 50,
  max: 100
}.max);
var probProd = (function probProd$(arr) {
  /* prob-prod app/sibilant/js/game/components/mitosis.sibilant:7:0 */

  return arr.reduce(((v, comp) => {
  	
    return (v * (comp.value / comp.max));
  
  }), 1);
});
var reduceUntil = (function reduceUntil$(matrix, cond, f, value) {
  /* reduce-until app/sibilant/js/game/components/mitosis.sibilant:11:0 */

  var break__QUERY = false;
  for (var x = 0;x < matrix.width;++(x))
  {
  if( break__QUERY ){ 
    break
   };
  for (var y = 0;y < matrix.height;++(y))
  {
  var cell = matrix.get(x, y);;
  value = f(value, cell, x, y, matrix);;
  if( cond(value, cell, x, y, matrix) ){ 
    break__QUERY = true;;
    break
   }
  }
  
  }
  ;
  return value;
});
var decide = (function decide$(random) {
  /* decide app/sibilant/js/game/components/mitosis.sibilant:27:0 */

  return (([ counter ]) => {
  	
    return counter >= random;
  
  });
});
var incrementCounter = (function incrementCounter$(counter$1, p, x, y) {
  /* increment-counter app/sibilant/js/game/components/mitosis.sibilant:29:0 */

  var counter = counter$1[0];

  return [ (counter + p), x, y ];
});
var selectRandomLocation = (function selectRandomLocation$(matrix) {
  /* select-random-location app/sibilant/js/game/components/mitosis.sibilant:31:0 */

  var total = countKernel.convolve(matrix),
      prob = matrix.map(((v) => {
  	
    return (v / total);
  
  }));
  return reduceUntil(prob, decide(Math.random()), incrementCounter, [ 0, 0, 0 ]).slice(1);
});
var conditionalProbability = probProd;
const ProbabilitySpace={ 
  symbol:Symbol("ProbabilitySpace")
 };
mixin({ 
  init( matrix = this.matrix ){ 
    
      this.matrix = matrix;
      return this;
    
   },
  get total(  ){ 
    
      return countKernel.convolve(this.matrix);
    
   },
  get prob(  ){ 
    
      return this.matrix.map(((v) => {
      	
        return (v / this.total);
      
      }));
    
   },
  getTotal( matrix = this.matrix ){ 
    
      return countKernel.convolve(matrix);
    
   },
  getProbabilityMatrix( matrix = this.matrix,total = ProbabilitySpace.getTotal(matrix) ){ 
    
      return matrix.map(((v) => {
      	
        return (v / total);
      
      }));
    
   },
  joint( probs ){ 
    
      return probs.reduce(mult, identity());
    
   },
  randomLocation( prob = this.prob ){ 
    
      return reduceUntil(prob, decide(Math.random()), incrementCounter, [ 0, 0, 0 ]).slice(1);
    
   }
 }, ProbabilitySpace);
var find = (function find$(entCoordPart, c) {
  /* find app/sibilant/js/game/components/mitosis.sibilant:63:0 */

  return ((entCoordPart + -1 + (function() {
    if (c <= 0) {
      return (c + 100);
    } else {
      return c;
    }
  }).call(this)) % 100);
});
var localJointProbability = R.curry(((entity, prob, field) => {
	
  return (function(location) {
    /* app/sibilant/js/meta/macros.sibilant:119:9 */
  
    return prob.mult(location);
  })(field.get(entity.x, entity.y).neiborhood);

}));
var mult = (function mult$(a, b) {
  /* mult app/sibilant/js/game/components/mitosis.sibilant:71:0 */

  return a.mult(b);
});
var localJointOf = R.curry(((arr, entity) => {
	
  return arr.reduce(localJointProbability(entity), identity());

}));
var randomNeighbor = (function randomNeighbor$(entity, kernels, probabilitySpace) {
  /* random-neighbor app/sibilant/js/game/components/mitosis.sibilant:76:0 */

  return ProbabilitySpace.randomLocation(ProbabilitySpace.getProbabilityMatrix(localJointOf(kernels, entity)));
});
const Mitosis={ 
  symbol:Symbol("Mitosis")
 };
mixin({ 
  init( entity = this.entity,probabilitySpace = create(ProbabilitySpace)() ){ 
    
      this.entity = entity;this.probabilitySpace = probabilitySpace;
      return this;
    
   },
  divide( entity = this.entity,probabilitySpace = this.probabilitySpace,loc = randomNeighbor(entity, [ Water, Light, Silt ], probabilitySpace) ){ 
    
      "attempt to create a new instance of the entity at a near by location";
      return (function(Health, Hydration, Calories, Nutriants) {
        /* app/sibilant/js/meta/macros.sibilant:119:9 */
      
        Hydration.remove((Hydration.value / 2));
        Nutriants.remove((Hydration.value / 2));
        Calories.remove((Hydration.value / 2));
        return createInstanceOf(Algae, find(entity.x, loc[0]), find(entity.y, loc[1]));
      })(entity[Health.symbol], entity[Hydration.symbol], entity[Calories.symbol], entity[Nutriants.symbol]);
    
   },
  update( entity = this.entity,probabilitySpace = this.probabilitySpace,divide = this.divide ){ 
    
      "choose randomly a cell to divide into, biased against total amount of available resources in all locations around the cell";
      return (function(Health, Hydration, Calories, Nutriants) {
        /* app/sibilant/js/meta/macros.sibilant:119:9 */
      
        return (function(chanceToDivide, random) {
          /* app/sibilant/js/meta/macros.sibilant:119:9 */
        
          return (function() {
            if ((0.5 * chanceToDivide) > random) {
              return divide(entity, probabilitySpace);
            }
          }).call(this);
        })(probProd([ Health, Hydration, Calories, Nutriants ]), Math.random());
      })(entity[Health.symbol], entity[Hydration.symbol], entity[Calories.symbol], entity[Nutriants.symbol]);
    
   }
 }, Mitosis);
const Decaying={ 
  symbol:Symbol("Decaying")
 };
mixin({ 
  init( entity = this.entity ){ 
    
      this.entity = entity;
      return this;
    
   },
  update( entity = this.entity,decaying = this.decaying,delta = this.delta ){ 
    
      return (function(Hydration, Nutriants) {
        /* app/sibilant/js/meta/macros.sibilant:119:9 */
      
        return (function() {
          if ((Hydration.value <= 0 && Nutriants.value <= 0)) {
            return entity.remove();
          }
        }).call(this);
      })(entity[Hydration.symbol], entity[Nutriants.symbol]);
    
   }
 }, Decaying);
const FieldEmitter={ 
  symbol:Symbol("FieldEmitter")
 };
mixin({ 
  kernel:kernel(3, 3, [ [ 1, 1, 1 ], [ 1, 4, 1 ], [ 1, 1, 1 ] ]).mult((1 / 12)),
  Field:null,
  Container:null,
  init( entity = this.entity,Field = this.Field,neiborhood = moore(entity.x, entity.y, Field.field) ){ 
    
      this.entity = entity;this.Field = Field;this.neiborhood = neiborhood;
      return this;
    
   },
  update( entity = this.entity,neiborhood = this.neiborhood,kernel = this.kernel,Container = this.Container ){ 
    
      return (function(comp) {
        /* app/sibilant/js/meta/macros.sibilant:119:9 */
      
        return (function(current) {
          /* app/sibilant/js/meta/macros.sibilant:119:9 */
        
          return (function(emitted) {
            /* app/sibilant/js/meta/macros.sibilant:119:9 */
          
            kernel.each(((v, x, y) => {
            	
              return (function(r) {
                /* app/sibilant/js/meta/macros.sibilant:119:9 */
              
                return neiborhood.set(x, y, (r > 0) ? r : 0);
              })((neiborhood.get(x, y) + v));
            
            }));
            return comp.remove(emitted);
          })(kernel.convolve(neiborhood));
        })(comp.value);
      })(entity[Container.symbol]);
    
   }
 }, FieldEmitter);
var NutriantEmitter = extend(FieldEmitter, { 
  symbol:Symbol("NutriantEmitter")
 });
mixin({ 
  Container:Nutriants,
  Field:Silt
 }, NutriantEmitter);
var WaterEmitter = extend(FieldEmitter, { 
  symbol:Symbol("WaterEmitter")
 });
mixin({ 
  doc:"water decreases the amount of calories burned when performing an action",
  Container:Hydration,
  Field:Water
 }, WaterEmitter);
var Entity = extend(EventEmitter.prototype, { 
  symbol:Symbol("Entity")
 });
mixin({ 
  layer:sim.layers.get(),
  init( x = this.x,y = this.y,components = this.components ){ 
    
      this.x = x;this.y = y;this.components = components;
      (function() {
        if (!(Collision.has([ x, y ]))) {
          Collision.set([ x, y ], this);
          this.layer.add(this);
          entities.push(this);
          this.components = components.map(((T) => {
          	
            return this[T.symbol] = createInstanceOf(T, this);
          
          }));
          return this.spawned__QUERY = true;
        } else {
          return this.spawned__QUERY = false;
        }
      }).call(this);
      return this;
    
   },
  move( [ x, y ] ){ 
    
      return Collision.move([ x, y ], this);
    
   },
  remove( entity = this,layer = this.layer ){ 
    
      entities = R.without([ entity ], entities);
      Collision.delete([ this.x, this.y ]);
      return layer.delete(entity);
    
   },
  update( components = this.components ){ 
    
      return components.each(((comp) => {
      	
        return comp.update();
      
      }));
    
   }
 }, Entity);
var Algae = extend(Entity, { 
  symbol:Symbol("Algae")
 });
mixin({ 
  r:0,
  g:255,
  b:0,
  a:255,
  init( x = this.x,y = this.y,components = this.components ){ 
    
      this.x = x;this.y = y;this.components = components;
      Entity.init.call(this, x, y, components);
      this.on("death", ((entity) => {
      	
        entity.remove();
        return (function(Hydration, Calories, Nutriants) {
          /* app/sibilant/js/meta/macros.sibilant:119:9 */
        
          entity.r = 128;
          entity.g = 100;
          entity.b = 80;
          entity.components = [ Hydration, Nutriants, NutriantEmitter, WaterEmitter, Decaying ];
          return Entity.init.call(entity);
        })(entity[Hydration.symbol], entity[Calories.symbol], entity[Nutriants.symbol]);
      
      })).once("error", ((err) => {
      	
        console.log("error on", "death", "of", "this", "given", "entity()");
        return console.log(err);
      
      }));
      return this;
    
   },
  components:[ Health, WaterAbsorbtion, Photoreceptor, NutriantAbsorber, Mitosis, createInstanceOf(Nutriants, this), Calories, Hydration, NaturalHealing ]
 }, Algae);
console.log(entities.length);
var bulkSpawnEntity = (function bulkSpawnEntity$(T, args) {
  /* bulk-spawn-entity app/sibilant/js/game/starting-entities.sibilant:1:0 */

  return args.each(((a) => {
  	
    return createInstanceOf(T, ...a);
  
  }));
});
var clearEntities = (function clearEntities$() {
  /* clear-entities app/sibilant/js/game/starting-entities.sibilant:4:0 */

  return entities.each(((e) => {
  	
    return e.remove();
  
  }));
});
var updateGame = (function updateGame$(ticks) {
  /* update-game app/sibilant/js/game/starting-entities.sibilant:7:0 */

  "Gets called every tick of the game, and for every system of the process,\n"+"we update its state, and recaculate the values of the current major field.";
  (function() {
    if (0 === entities.length) {
      return initializeGame();
    }
  }).call(this);
  var currentSystem = systems[(ticks % systems.length)];
  updateOnBeatField(currentSystem, ticks);
  refreshFields();
  updateEntities();
  refreshFields();
  displayStats(Water);
  return updateDisplay();
});
var initializeGame = (function initializeGame$() {
  /* initialize-game app/sibilant/js/game/starting-entities.sibilant:40:0 */

  clearEntities();
  systems.each(((s) => {
  	
    return s.randomize();
  
  }));
  return bulkSpawnEntity(Algae, [ [ 20, 50 ], [ 10, 50 ] ]);
});
initializeGame();
sim.start().on("tick", ((now, ticks) => {
	
  return updateGame(ticks);

})).once("error", ((err) => {
	
  console.log("error on", "tick", "of", "sim.start()", "given", "now(ticks)");
  return console.log(err);

}))

