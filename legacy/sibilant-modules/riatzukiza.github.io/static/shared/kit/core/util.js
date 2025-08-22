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
const create=((source) => {
	return ((...args) => {
	const r=Object.create(source);
r.init(...args);
return r;
});
});
const defined=((value) => {
	return !(value === undefined);
});
var mixin = (function mixin$(sources = this.sources, target = {  }) {
  /* mixin inc/core/function-expressions.sibilant:28:8 */

  sources = (Array.isArray(sources)) ? sources : [ sources ];
  sources.each(((source) => {
  	const descriptors=Object.keys(source).reduce(((descriptors, key) => {
  	descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
  return descriptors;
  }), {  });
  Object.getOwnPropertySymbols(source).each(((sym) => {
  	const descriptor=source.getOwnPropertyDescriptor(sym);
  return (function() {
    if (descriptor.enumerable) {
      return descriptors[sym] = descriptor;
    }
  }).call(this);
  }));
  return Object.defineProperties(target, descriptors);
  }));
  return target;
});
var extend = (function extend$(proto, extension) {
  /* extend eval.sibilant:32:0 */

  return mixin(extension, Object.create(proto));
});
var hasProperties = (function hasProperties$(object, key, ...keys) {
  /* has-properties eval.sibilant:36:0 */

  const hasKey=object.hasOwnProperty(key);
  return (!(keys.length)) ? hasKey : (hasKey && hasProperties(object, ...keys));
});
var either = (function either$(left, right, value) {
  /* either eval.sibilant:44:0 */

  return (function() {
    if (value) {
      return left(value);
    } else {
      return right(value);
    }
  }).call(this);
});
export { 
  either
 };
var conditional = (function conditional$(value, pred, action, ...rest) {
  /* conditional eval.sibilant:49:0 */

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
export { 
  conditional
 };
var cond = (function cond$(pred, action, ...rest) {
  /* cond eval.sibilant:62:0 */

  "A lazy application of a functional conditional operator. Waits for a value to be given to it before applying its functional arguements";
  return ((value) => {
  	return conditional(value, pred, action, ...rest);
  });
});
export { 
  cond
 };
var partiallyApplyAfter = (function partiallyApplyAfter$(f, ...args) {
  /* partially-apply-after eval.sibilant:67:0 */

  "partially apply a function with the rest of the arguements to this function being appended to the end of the arguements of the given function";
  return (function(...restArgs) {
    /* eval.sibilant:69:2 */
  
    return f(...restArgs, ...args);
  });
});
export { 
  partiallyApplyAfter
 };
Object.prototype.keys = (function Object$prototype$keys$(object = this) {
  /* Object.prototype.keys inc/core/function-expressions.sibilant:28:8 */

  return Object.keys(object);
});
Object.prototype.each = (function Object$prototype$each$(f = this.f, object = this) {
  /* Object.prototype.each inc/core/function-expressions.sibilant:28:8 */

  object.keys().each(((k, i) => {
  	return f(object[k], k, object);
  }));
  return object;
});
Array.prototype.each = (function Array$prototype$each$(f = this.f, array = this) {
  /* Array.prototype.each inc/core/function-expressions.sibilant:28:8 */

  array.forEach(f);
  return this;
});
Map.prototype.each = (function Map$prototype$each$(f) {
  /* Map.prototype.each eval.sibilant:90:0 */

  this.forEach(f);
  return this;
});
var curry = (function curry$(f = this.f, args = [], self = this.self) {
  /* curry inc/core/function-expressions.sibilant:28:8 */

  return (function() {
    if (args.length === f.length) {
      return f.apply(self, args);
    } else {
      return (function(...args) {
        /* eval.sibilant:98:6 */
      
        return curry(f, [ ...args, ...newArgs ], (self || this));
      });
    }
  }).call(this);
});
Function.prototype.curry = (function Function$prototype$curry$(args) {
  /* Function.prototype.curry eval.sibilant:102:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return curry(this, args);
});
const Obj={ 
  hasProperties,
  extend,
  create,
  mixin,
  keys:Object.keys,
  map( o = this.o,f = this.f,target = {  },keys = Obj.keys(o) ){ 
    
      return Arr.mapto(keys, ((k) => {
      	return f(o[k], k, o, target, keys);
      }), target);
    
   },
  product( o = this.o,f = this.f,target = {  },keys = this.keys ){ 
    
      return Obj.keys(o).each(((k) => {
      	return target[k] = f[k](o[k], k, o, target);
      }));
    
   },
  Product( f ){ 
    
      return ((o) => {
      	return Obj.product(o, f);
      });
    
   },
  symbolize( structure = {  },symbolNames = Obj.keys(structure),$ = Sym.Namespace,target = {
    init: structure.init,
    $: $
  } ){ 
    
      return symbolNames.each(((name) => {
      	return target[$[name]] = structure[name];
      }));
    
   }
 };
const Arr={ 
  mapto( keys = this.keys,f = this.f,o = {  } ){ 
    
      keys.each(((k) => {
      	return o[k] = f(k);
      }));
      return o;
    
   },
  mixin
 };
const Sym={ 
  Namespace( symbolNames ){ 
    
      return (Array.isArray(symbolNames)) ? Arr.mapto(symbolNames, Symbol) : Obj.map(symbolNames, Symbol);
    
   }
 };
export { 
  Obj,
  Sym,
  Arr,
  create,
  defined,
  extend,
  mixin,
  curry
 };