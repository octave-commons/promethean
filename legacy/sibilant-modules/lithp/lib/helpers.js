var debug__BANG = (function debug__BANG$(level, message) {
  /* debug! src/helpers.sibilant:1:0 */

  var message = Array.prototype.slice.call(arguments, 1);

  var debug = sibilant.debug;
  return (function() {
    if ((debug && level <= debug)) {
      return message.forEach((function() {
        /* src/helpers.sibilant:4:29 */
      
        return console.log(arguments[0]);
      }));
    }
  }).call(this);
});
var recurseIndent = (function recurseIndent$(arg) {
  /* recurse-indent src/helpers.sibilant:6:0 */

  return (function() {
    if (node__QUERY(arg)) {
      return mergeInto(arg, { contents: recurseIndent(flatCompact(arg.contents)) });
    } else if ((arg && "object" === typeof arg && "Array" === arg.constructor.name)) {
      return map(arg, recurseIndent);
    } else if (typeof arg === "number") {
      return arg.toString();
    } else if (typeof arg === "string") {
      return arg.replace((new RegExp("\\n", "g")), "\n  ").replace((new RegExp("\\n\\s+\\n", "g")), "\n\n");
    } else {
      return arg;
    }
  }).call(this);
});
var indent = (function indent$(args) {
  /* indent src/helpers.sibilant:16:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return [ "\n  ", recurseIndent(map(args, transpile)), "\n" ];
});
var escapeRegex = (function escapeRegex$(string) {
  /* escape-regex src/helpers.sibilant:19:0 */

  return string.replace((new RegExp("[\\-\\[\\]\\/\\{\\}\\(\\)\\*\\+\\?\\.\\\\\^\\$\\|]", "g")), "\\$&");
});
var qescape = (function qescape$(content) {
  /* qescape src/helpers.sibilant:22:0 */

  return (function() {
    if (!((typeof content !== "undefined" && content !== null))) {
      return "";
    } else if (typeof content === "string") {
      return content.split("\\\\ "[0]).join("\\\\ ".slice(0, -1)).replace((new RegExp("\"", "g")), "\\\"").replace((new RegExp("\\n", "g")), "\\n\" +\n\"");
    } else {
      return content;
    }
  }).call(this);
});
var mapNode = (function mapNode$(node, fn) {
  /* map-node src/helpers.sibilant:32:0 */

  return (function() {
    if (node__QUERY(node)) {
      var mappedNode = fn(node);
      (function() {
        if (node__QUERY(mappedNode)) {
          return mappedNode.contents = mapNode(mappedNode.contents, fn);
        }
      }).call(this);
      return mappedNode;
    } else if ((node && "object" === typeof node && "Array" === node.constructor.name)) {
      return map(node, (function() {
        /* src/helpers.sibilant:41:27 */
      
        return mapNode(arguments[0], fn);
      }));
    } else {
      return fn(node);
    }
  }).call(this);
});
var eachNode = (function eachNode$(node, fn) {
  /* each-node src/helpers.sibilant:45:0 */

  return (function() {
    if (node__QUERY(node)) {
      return (function() {
        if (fn(node)) {
          return eachNode(node.contents, fn);
        }
      }).call(this);
    } else if ((node && "object" === typeof node && "Array" === node.constructor.name)) {
      return node.forEach((function(c) {
        /* src/helpers.sibilant:48:17 */
      
        return eachNode(c, fn);
      }));
    } else {
      return fn(node);
    }
  }).call(this);
});
var statement__QUERY = (function statement__QUERY$(transpiled) {
  /* statement? src/helpers.sibilant:51:0 */

  return (function() {
    if (node__QUERY(transpiled)) {
      return statement__QUERY(transpiled.contents);
    } else if ((transpiled && "object" === typeof transpiled && "Array" === transpiled.constructor.name)) {
      return statement__QUERY(transpiled.slice(-1)[0]);
    } else if (typeof transpiled === "string") {
      return ";" === transpiled.slice(-1)[0];
    } else {
      return false;
    }
  }).call(this);
});
var asStatement = (function asStatement$(node) {
  /* as-statement src/helpers.sibilant:58:0 */

  var transpiled = transpile(node);
  return (function() {
    if (emptyNode__QUERY(transpiled)) {
      return undefined;
    } else if (statement__QUERY(transpiled)) {
      return transpiled;
    } else {
      return [ transpiled, ";" ];
    }
  }).call(this);
});
var unquote__QUERY = (function unquote__QUERY$(node) {
  /* unquote? src/helpers.sibilant:65:0 */

  return node__QUERY(node, "at");
});
var findUnquotes = (function findUnquotes$(node) {
  /* find-unquotes src/helpers.sibilant:67:0 */

  var unquotes = {  };
  eachNode(node, (function(n) {
    /* src/helpers.sibilant:69:21 */
  
    (function() {
      if (unquote__QUERY(n)) {
        return unquotes[n.nodeId] = transpile(n);
      }
    }).call(this);
    return !(node__QUERY(n, "tick"));
  }));
  return unquotes;
});
var spliceDots = (function spliceDots$(node) {
  /* splice-dots src/helpers.sibilant:75:0 */

  (function() {
    if ((node && (node.contents && "object" === typeof node.contents && "Array" === node.contents.constructor.name))) {
      var contents = [];
      node.contents.forEach((function(content) {
        /* src/helpers.sibilant:78:11 */
      
        return (function() {
          if ((node__QUERY(content, "dots") && (content.contents && "object" === typeof content.contents && "Array" === content.contents.constructor.name) && content.contents.length === 1 && (content.contents[0] && "object" === typeof content.contents[0] && "Array" === content.contents[0].constructor.name))) {
            return contents.push.apply(contents, content.contents[0]);
          } else {
            return contents.push(content);
          }
        }).call(this);
      }));
      return node.contents = contents;
    }
  }).call(this);
  return node;
});
var alternatingKeysAndValues = (function alternatingKeysAndValues$(hash) {
  /* alternating-keys-and-values src/helpers.sibilant:90:0 */

  return flatten(map(Object.keys(hash), (function(key) {
    /* src/helpers.sibilant:92:14 */
  
    return [ key, hash[key] ];
  })));
});
var mapNodeForQuoteExpansion = (function mapNodeForQuoteExpansion$(node, expansions) {
  /* map-node-for-quote-expansion src/helpers.sibilant:95:0 */

  return (function() {
    if (node__QUERY(node)) {
      var mappedNode = (function() {
        if (expansions.hasOwnProperty(node.nodeId)) {
          return expansions[node.nodeId];
        } else {
          return clone(node);
        }
      }).call(this);
      (function() {
        if (node__QUERY(mappedNode)) {
          return mappedNode.contents = mapNodeForQuoteExpansion(mappedNode.contents, expansions);
        }
      }).call(this);
      mappedNode = spliceDots(mappedNode);
      return mappedNode;
    } else if ((node && "object" === typeof node && "Array" === node.constructor.name)) {
      return map(node, (function() {
        /* src/helpers.sibilant:105:27 */
      
        return mapNodeForQuoteExpansion(arguments[0], expansions);
      }));
    } else {
      return node;
    }
  }).call(this);
});
var dotsAndAt = (function dotsAndAt$(content) {
  /* dots-and-at src/helpers.sibilant:109:0 */

  return (node__QUERY(content, "dots") && 3 === content.token.length && node__QUERY(content.contents[0], "at"));
});
var replace__BANG = (function replace__BANG$(content) {
  /* replace! src/helpers.sibilant:114:0 */

  return (function() {
    if (dotsAndAt(content)) {
      return mergeWith(content, { contents: [ transpile(content.contents[0]) ] });
    } else if (node__QUERY(content, "at")) {
      return transpile(content.contents[0]);
    } else if (node__QUERY(content, "tick")) {
      return JSON.stringify(content);
    } else if (("object" === typeof content && content !== null && content.constructor.name !== "Array")) {
      return sibilant.macros.namespaces.core.hash.apply(this, Object.keys(content).reduce((function() {
        /* src/helpers.sibilant:123:34 */
      
        return arguments[0].concat([ arguments[1], replace__BANG(content[arguments[1]]) ]);
      }), []));
    } else if ((content && "object" === typeof content && "Array" === content.constructor.name)) {
      return sibilant.macros.namespaces.core.list.apply(this, map(content, replace__BANG));
    } else if (typeof content === "undefined") {
      return "undefined";
    } else if (typeof content === "number") {
      return content.toString();
    } else {
      return JSON.stringify(content);
    }
  }).call(this);
});
var node__QUERY = (function node__QUERY$(thing, type, type2, type3, type4, testArg) {
  /* node? src/helpers.sibilant:132:0 */

  var a = arguments;
  return (thing && thing.type && thing.contents && (function() {
    if (testArg) {
      return Array.prototype.slice.call(a, 1).indexOf(thing.type) !== -1;
    } else if (type) {
      return (thing.type === type || thing.type === type2 || thing.type === type3 || thing.type === type4);
    } else {
      return true;
    }
  }).call(this));
});
var emptyNode__QUERY = (function emptyNode__QUERY$(item) {
  /* empty-node? src/helpers.sibilant:148:0 */

  return (function() {
    if (item === null) {
      return true;
    } else if (typeof item === "undefined") {
      return true;
    } else if (item === false) {
      return true;
    } else if (typeof item === "string") {
      return item.match((new RegExp("^\\s*$", undefined)));
    } else if ((item && "object" === typeof item && "Array" === item.constructor.name)) {
      return all__QUERY(item, emptyNode__QUERY);
    } else if (node__QUERY(item)) {
      return emptyNode__QUERY(item.contents);
    } else {
      return false;
    }
  }).call(this);
});
var compactNode = (function compactNode$(item) {
  /* compact-node src/helpers.sibilant:158:0 */

  return (function() {
    if (node__QUERY(item)) {
      item.contents = compactNode(item.contents);
      return (function() {
        if ((item.contents && item.contents.length)) {
          return item;
        } else {
          return null;
        }
      }).call(this);
    } else if ((item && "object" === typeof item && "Array" === item.constructor.name)) {
      var compacted = compact(map(item, compactNode));
      return (function() {
        if ((compacted && compacted.length)) {
          return compacted;
        } else {
          return null;
        }
      }).call(this);
    } else if ((item === "" || item === false)) {
      return null;
    } else {
      return item;
    }
  }).call(this);
});
var generateSymbol = (function generateSymbol$(clue) {
  /* generate-symbol src/helpers.sibilant:171:0 */

  var state = sibilant.state;
  clue = (typeof clue !== "undefined") ? clue : "temp";
  state.symbolCounts = (typeof state.symbolCounts !== "undefined") ? state.symbolCounts : {  };
  var count = ((state.symbolCounts[clue] || 0) + 1);
  state.symbolCounts[clue] = count;
  return [ ("" + clue + "$" + count) ];
});
var makeSymbolClue = (function makeSymbolClue$(node) {
  /* make-symbol-clue src/helpers.sibilant:182:0 */

  var targetNode = (function() {
    if ((node__QUERY(node, "expression") && node.contents[0].token === "require")) {
      return node.contents[1];
    } else if (node__QUERY(node, "expression")) {
      return node.contents[0];
    } else {
      return node;
    }
  }).call(this);
  return (function() {
    try {
      return outputFormatter(transpile(targetNode));
    } catch (e) {
      return sibilant.prettyPrint(node, false);
    }
  }).call(this).replace((new RegExp("[^a-zA-Z]+", "g")), "_").replace((new RegExp("^_|_$", "g")), "").slice(0, 15);
});
var destructure = (function destructure$(pairs) {
  /* destructure src/helpers.sibilant:193:0 */

  var destructured = [];
  bulkMap(pairs, (function(lhs, rhs) {
    /* src/helpers.sibilant:195:21 */
  
    var transpiledRhs = transpile(rhs);
    return (function() {
      switch(lhs.type) {
      case "bracket":
        var literalRhs__QUERY = outputFormatter(transpiledRhs).match((new RegExp("^[\._a-zA-Z0-9$]+$", undefined))),
            source = (function() {
          if (literalRhs__QUERY) {
            return transpiledRhs;
          } else {
            var symbol = generateSymbol(makeSymbolClue(rhs));
            destructured.push([ symbol, transpiledRhs ]);
            return symbol;
          }
        }).call(this);
        lhs.contents.forEach((function(item, index) {
          /* src/helpers.sibilant:205:32 */
        
          return destructured.push([ transpile(item), {
            file: "src/helpers.sibilant",
            token: "(",
            type: "expression",
            line: 206,
            col: 76,
            contents: [ {
              file: "src/helpers.sibilant",
              token: "get",
              type: "literal",
              line: 206,
              col: 77,
              contents: [],
              specials: 0,
              precedingIgnored: []
            }, source, index ],
            precedingIgnored: [],
            specials: 0,
            end: undefined,
            closed: true,
            closingIgnored: []
          } ]);
        }));
        return (function() {
          if (!(literalRhs__QUERY)) {
            return destructured.push([ source, "undefined" ]);
          }
        }).call(this);
      
      case "brace":
        var literalRhs__QUERY = outputFormatter(transpiledRhs).match((new RegExp("^[\._a-zA-Z0-9$]+$", undefined))),
            source = (function() {
          if (literalRhs__QUERY) {
            return transpiledRhs;
          } else if (1 === lhs.contents.length) {
            return [ "(", rhs, ")" ];
          } else {
            var symbol = generateSymbol(makeSymbolClue(rhs));
            destructured.push([ symbol, transpiledRhs ]);
            return symbol;
          }
        }).call(this);
        lhs.contents.forEach((function(item, index) {
          /* src/helpers.sibilant:218:32 */
        
          var trItem = transpile(item);
          return destructured.push([ trItem, {
            file: "src/helpers.sibilant",
            token: "(",
            type: "expression",
            line: 220,
            col: 67,
            contents: [ {
              file: "src/helpers.sibilant",
              token: "get",
              type: "literal",
              line: 220,
              col: 68,
              contents: [],
              specials: 0,
              precedingIgnored: []
            }, source, [ "\"", trItem, "\"" ] ],
            precedingIgnored: [],
            specials: 0,
            end: undefined,
            closed: true,
            closingIgnored: []
          } ]);
        }));
        return (function() {
          if (!((literalRhs__QUERY || 1 === lhs.contents.length))) {
            return destructured.push([ source, "undefined" ]);
          }
        }).call(this);
      
      default:
        return destructured.push([ transpile(lhs), (function() {
          if (rhs) {
            return transpiledRhs;
          } else {
            return "undefined";
          }
        }).call(this) ]);
      }
    }).call(this);
  }));
  return destructured;
});