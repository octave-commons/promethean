

(function(a, b, c) {
  /* ../../node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);


;

;
var Descriptions = {  };
var R = require("ramda");
var fmap = R.curry((f, a) => {
	
  return a.map(f);

});
var is = { 
  string( v ){ 
    
      return typeof v === "string";
    
   }
 };
is.empty__QUERY = (function is$empty__QUERY$(value) {
  /* is.empty? ../../node_modules/kit/inc/core/fp.sibilant:12:0 */

  return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
  /* athrow ../../node_modules/kit/inc/core/fp.sibilant:14:0 */

  return () => {
  	
    return (new errType(message));
  
  };
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of ../../node_modules/kit/inc/core/fp.sibilant:17:0 */

  return o.getValue();
});
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("kit/js/util");


(function(a, b, c) {
  /* ../../node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);


;

;


(function(a, b, c) {
  /* ../../node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);


;

;
var Descriptions = {  };
var R = require("ramda");
var fmap = R.curry((f, a) => {
	
  return a.map(f);

});
var is = { 
  string( v ){ 
    
      return typeof v === "string";
    
   }
 };
is.empty__QUERY = (function is$empty__QUERY$(value) {
  /* is.empty? ../../node_modules/kit/inc/core/fp.sibilant:12:0 */

  return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
  /* athrow ../../node_modules/kit/inc/core/fp.sibilant:14:0 */

  return () => {
  	
    return (new errType(message));
  
  };
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of ../../node_modules/kit/inc/core/fp.sibilant:17:0 */

  return o.getValue();
});
var { 
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("kit/js/util");
var { 
  Model,
  ProbabilityTree,
  Storage
 } = require("./index");
var { 
  create
 } = require("kit/js/util"),
    { 
  Interface
 } = require("./lib/interface"),
    { 
  FileSystem
 } = require("./lib/file-system"),
    { 
  TreeMap
 } = require("./lib/tree");
var parsed = (function() {
  /* tests.sibilant:14:12 */

  return arguments[0].replace((new RegExp("([.,!?])", "g")), " $1 ").split((new RegExp("\\s+", undefined)));
});
(function() {
  /* tests.sibilant:17:6 */

  var m = create(Model)();
  m.train(2, [ "a", "a", "b", "b", "c", "d", "a", "b", "t", "g", "g", "t", "a", "a", "g", "r", "t", "y", "w", "r", "q", "g", "d", "f", "q", "a", "f", "h", "e", "a" ]);
  m.train(2, [ "a", "a", "b", "b", "c", "d", "a", "b", "t", "g", "g", "t", "a", "a", "g", "r", "t", "y", "w", "r", "q", "g", "d", "f", "q", "a", "f", "h", "e", "a" ]);
  m.train(2, [ "a", "a", "b", "b", "c", "d", "a", "b", "t", "g", "g", "t", "a", "a", "g", "r", "t", "y", "w", "r", "q", "g", "d", "f", "q", "a", "f", "h", "e", "a" ]);
  m.train(2, [ "d", "f", "g", "h", "r", "w", "g", "h", "j", "q", "w", "f", "a", "g", "a", "g", "r", "t", "y", "h", "s", "f", "s", "q", "w", "e", "r", "q", "w", "er", "we", "q", "t", "s", "f", "q", "f", "a", "f", "a", "g", "h", "w", "e", "d", "f", "g", "w", "f", "w", "d", "a", "q", "w", "e", "r", "tq", "w", "e", "r", "t", "q", "t" ]);
  console.log("random string", m.generateRandomPhrase(50));
  var t = m.random(),
      _t = m.random();
  console.log("a random node t", t.seq);
  console.log("a random node *t", _t.seq);
  console.log("count of t", t.count);
  console.log("count of *t", _t.count);
  console.log("likelyhood of t", t.likelyhood);
  console.log("likelyhood of *t", _t.likelyhood);
  console.log("degrading value of t for m");
  m.degrade(t.seq);
  console.log("count of t", t.count);
  console.log("count of *t", _t.count);
  console.log("likelyhood of t", t.likelyhood);
  console.log("likelyhood of *t", _t.likelyhood);
  console.log(t.likelyhood);
  return Storage.save("./models", m).then((function(b, ...others) {
    /* ../../node_modules/kit/inc/console.sibilant:10:8 */
  
    console.log("saved", b, ...others);
    return b;
  })).then((nil) => {
  	
    return Storage.load("./models");
  
  }).then((function(b, ...others) {
    /* ../../node_modules/kit/inc/console.sibilant:10:8 */
  
    console.log("loaded", b, ...others);
    return b;
  })).then((m) => {
  	
    console.log("random string", m.generateRandomPhrase(50));
    var t = m.random(),
        _t = m.random();
    console.log("a random node t", t.seq);
    console.log("a random node *t", _t.seq);
    console.log("likelyhood of t", t.likelyhood);
    console.log("likelyhood of *t", _t.likelyhood);
    console.log("count of t", t.count);
    console.log("count of *t", _t.count);
    console.log("total in m", m.total);
    console.log("degrading value of t for m");
    m.degrade(t.seq);
    console.log("likelyhood of t", t.likelyhood);
    console.log("likelyhood of *t", _t.likelyhood);
    console.log("count of t", t.count);
    console.log("count of *t", _t.count);
    console.log("total in m", m.total);
    return console.log(t.likelyhood);
  
  });
}).call(this).catch((function(b, ...others) {
  /* ../../node_modules/kit/inc/console.sibilant:10:8 */

  console.log("failiure", b, ...others);
  return b;
}));