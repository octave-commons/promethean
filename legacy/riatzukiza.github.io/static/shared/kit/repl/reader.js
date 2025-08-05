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
import { 
  Interface
 } from "../interface/index.js";
import { 
  Actor
 } from "../actor/index.js";
import { 
  emit
 } from "../events/index.js";
var scanning__QUERY = (function scanning__QUERY$(parser) {
  /* scanning? eval.sibilant:17:0 */

  return !((parser.inQuote || parser.comment));
});
var readers = { 
  "\"":(function(c) {
    /* eval.sibilant:21:12 */
  
    this.inQuote = !(this.inQuote);
    return c;
  }),
  ";":(function(c) {
    /* eval.sibilant:22:11 */
  
    return (function() {
      if (this.inQuote) {
        return c;
      } else {
        this.comment = true;
        return "";
      }
    }).call(this);
  })
 };
readers["("] = (function(char) {
  /* eval.sibilant:28:13 */

  return (function() {
    if (scanning__QUERY(this)) {
      ((this.parens)++);
      return char;
    } else {
      return char;
    }
  }).call(this);
});
readers[")"] = (function(char) {
  /* eval.sibilant:28:13 */

  return (function() {
    if (scanning__QUERY(this)) {
      ((this.parens)--);
      return char;
    } else {
      return char;
    }
  }).call(this);
});
readers["["] = (function(char) {
  /* eval.sibilant:28:13 */

  return (function() {
    if (scanning__QUERY(this)) {
      ((this.squareBraces)++);
      return char;
    } else {
      return char;
    }
  }).call(this);
});
readers["]"] = (function(char) {
  /* eval.sibilant:28:13 */

  return (function() {
    if (scanning__QUERY(this)) {
      ((this.squareBraces)--);
      return char;
    } else {
      return char;
    }
  }).call(this);
});
readers["{"] = (function(char) {
  /* eval.sibilant:28:13 */

  return (function() {
    if (scanning__QUERY(this)) {
      ((this.curlyBraces)++);
      return char;
    } else {
      return char;
    }
  }).call(this);
});
readers["}"] = (function(char) {
  /* eval.sibilant:28:13 */

  return (function() {
    if (scanning__QUERY(this)) {
      ((this.curlyBraces)--);
      return char;
    } else {
      return char;
    }
  }).call(this);
});
var Reader = Actor.define("Reader", { 
  init( fragment = (typeof fragment !== "undefined") ? fragment : [];,parens = (typeof parens !== "undefined") ? parens : 0;,squareBraces = (typeof squareBraces !== "undefined") ? squareBraces : 0;,curlyBraces = (typeof curlyBraces !== "undefined") ? curlyBraces : 0;,inQuote__QUERY = (typeof inQuote__QUERY !== "undefined") ? inQuote__QUERY : false; ){ 
    
      this.fragment = fragment;this.parens = parens;this.squareBraces = squareBraces;this.curlyBraces = curlyBraces;this.inQuote__QUERY = inQuote__QUERY;
      Actor.init.call(this);
      return this;
    
   },
  parsers:(new Map()),
  spawn( compiler ){ 
    
      return (function() {
        if (this.parsers.has(compiler)) {
          return this.parsers.get(compiler);
        } else {
          var r = (function() {
            /* inc/misc.sibilant:1:1399 */
          
            return create(Parser)().start();
          }).call(this);
          this.parsers.set(compiler, r);
          return r;
        }
      }).call(this);
    
   },
  _send( string = (typeof string !== "undefined") ? string : this.string;,fragment = (typeof fragment !== "undefined") ? fragment : this.fragment; ){ 
    
      var lines = string.split("\n");
      return line().forEach((function(lines) {
        /* eval.sibilant:65:4 */
      
        var looping = true,
            i = 0;
        var chars = line.split("");
        this.comment = false;
        (function() {
          var while$86 = undefined;
          while ((looping && !(this.comment))) {
            while$86 = (function() {
              var char = chars[((i)++)];
              (function() {
                if (readers[char]) {
                  return char = readers[char].call(this, char, chars, i);
                }
              }).call(this);
              return (function() {
                if (looping) {
                  this.fragment.push(char);
                  (function() {
                    if ((!(this.parens) && !(this.curlyBraces) && !(this.squareBraces))) {
                      var s = this.fragment.join("").trim();
                      (function() {
                        if (!(s.length === 0)) {
                          return this.emit("message", s);
                        }
                      }).call(this);
                      return this.fragment = [];
                    }
                  }).call(this);
                  return (function() {
                    if (i >= chars.length) {
                      return looping = false;
                    }
                  }).call(this);
                }
              }).call(this);
            }).call(this);
          };
          return while$86;
        }).call(this);
        return this.fragment.push("\n");
      }));
    
   }
 });
exports.Reader = Reader;