var coreNamespace = {  },
    macroNamespaces = { core: coreNamespace };
sibilant.state = {
  symbolCount: 0,
  functionComments: true
};
sibilant.macros = {
  "namespaces": macroNamespaces,
  "defaultSearchPath": [ "core" ],
  "searchPath": [ "core" ],
  "namespace": coreNamespace
};
var namespace = sibilant.macros.namespace,
    macros = sibilant.macros.namespace;
sibilant.macros.currentNamespace = (function sibilant$macros$currentNamespace$() {
  /* sibilant.macros.current-namespace src/precompiled-macros.sibilant:15:0 */

  return sibilant.macros.namespaces[sibilant.macros.searchPath[0]];
});
sibilant.resolveMacro = (function sibilant$resolveMacro$(macroName) {
  /* sibilant.resolve-macro src/precompiled-macros.sibilant:18:0 */

  return (function() {
    if ((macroName.indexOf("/") !== -1 && 1 < macroName.length && !(macroName.indexOf("\n") !== -1))) {
      var pathComponents = macroName.split("/"),
          macro = (sibilant.macros.namespaces.hasOwnProperty(pathComponents[0]) && sibilant.macros.namespaces[pathComponents[0]][pathComponents.slice(1).join("/")]);
      return (function() {
        if (macro) {
          return macro;
        } else {
          return error(("called namespaced macro " + macroName + " but could not find namespace " + pathComponents[0] + ". you might need to include the file that defines it first."));
        }
      }).call(this);
    } else {
      var namespace = detect(sibilant.macros.searchPath, (function(namespace) {
        /* src/precompiled-macros.sibilant:30:33 */
      
        return sibilant.macros.namespaces[namespace].hasOwnProperty(macroName);
      }));
      return (function() {
        if (namespace) {
          return sibilant.macros.namespaces[namespace][macroName];
        }
      }).call(this);
    }
  }).call(this);
});
sibilant.withDefaultSearchPath = (function sibilant$withDefaultSearchPath$(fn) {
  /* sibilant.with-default-search-path src/precompiled-macros.sibilant:35:0 */

  var searchPathBefore = sibilant.macros.searchPath;
  sibilant.macros.searchPath = sibilant.macros.defaultSearchPath;
  var returnValue = fn();
  sibilant.macros.searchPath = searchPathBefore;
  return returnValue;
});
sibilant.macros.namespaces.core.case = (function case$(subject, cases) {
  /* case src/macros/case.sibilant:1:0 */

  var cases = Array.prototype.slice.call(arguments, 1);

  return {
    file: "src/macros/case.sibilant",
    token: "(",
    type: "expression",
    line: 2,
    col: 8,
    contents: [ {
      file: "src/macros/case.sibilant",
      token: "if",
      type: "literal",
      line: 2,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(flatten(bulkMap(cases, (function(predicate, body) {
      /* src/macros/case.sibilant:3:30 */
    
      return (function() {
        if (body) {
          return [ {
            file: "src/macros/case.sibilant",
            token: "(",
            type: "expression",
            line: 5,
            col: 38,
            contents: [ {
              file: "src/macros/case.sibilant",
              token: "|>",
              type: "otherChar",
              line: 5,
              col: 39,
              contents: [],
              specials: 0,
              precedingIgnored: []
            }, subject, predicate ],
            precedingIgnored: [],
            specials: 0,
            end: undefined,
            closed: true,
            closingIgnored: []
          }, body ];
        } else {
          return predicate;
        }
      }).call(this);
    })))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core[">"] = (function $$(args) {
  /* > src/macros/comparison.sibilant:3:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  var jsComparator = ">";
  return {
    file: "src/macros/comparison.sibilant",
    token: "(",
    type: "expression",
    line: 5,
    col: 8,
    contents: [ {
      file: "src/macros/comparison.sibilant",
      token: "and",
      type: "literal",
      line: 5,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(args.slice(0, -1), (function(item, index) {
      /* src/macros/comparison.sibilant:6:22 */
    
      return [ item, " ", jsComparator, " ", args[(1 + index)] ];
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core["<"] = (function $$(args) {
  /* < src/macros/comparison.sibilant:10:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  var jsComparator = "<";
  return {
    file: "src/macros/comparison.sibilant",
    token: "(",
    type: "expression",
    line: 12,
    col: 8,
    contents: [ {
      file: "src/macros/comparison.sibilant",
      token: "and",
      type: "literal",
      line: 12,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(args.slice(0, -1), (function(item, index) {
      /* src/macros/comparison.sibilant:13:22 */
    
      return [ item, " ", jsComparator, " ", args[(1 + index)] ];
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core["<="] = (function $$(args) {
  /* <= src/macros/comparison.sibilant:16:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  var jsComparator = "<=";
  return {
    file: "src/macros/comparison.sibilant",
    token: "(",
    type: "expression",
    line: 18,
    col: 8,
    contents: [ {
      file: "src/macros/comparison.sibilant",
      token: "and",
      type: "literal",
      line: 18,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(args.slice(0, -1), (function(item, index) {
      /* src/macros/comparison.sibilant:19:22 */
    
      return [ item, " ", jsComparator, " ", args[(1 + index)] ];
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core[">="] = (function $$(args) {
  /* >= src/macros/comparison.sibilant:22:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  var jsComparator = ">=";
  return {
    file: "src/macros/comparison.sibilant",
    token: "(",
    type: "expression",
    line: 24,
    col: 8,
    contents: [ {
      file: "src/macros/comparison.sibilant",
      token: "and",
      type: "literal",
      line: 24,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(args.slice(0, -1), (function(item, index) {
      /* src/macros/comparison.sibilant:25:22 */
    
      return [ item, " ", jsComparator, " ", args[(1 + index)] ];
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core["!="] = (function $$(args) {
  /* != src/macros/comparison.sibilant:27:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  var jsComparator = "!==";
  return {
    file: "src/macros/comparison.sibilant",
    token: "(",
    type: "expression",
    line: 29,
    col: 8,
    contents: [ {
      file: "src/macros/comparison.sibilant",
      token: "and",
      type: "literal",
      line: 29,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(args.slice(0, -1), (function(item, index) {
      /* src/macros/comparison.sibilant:30:22 */
    
      return [ item, " ", jsComparator, " ", args[(1 + index)] ];
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core["="] = (function $$(args) {
  /* = src/macros/comparison.sibilant:33:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  var jsComparator = "===";
  return {
    file: "src/macros/comparison.sibilant",
    token: "(",
    type: "expression",
    line: 35,
    col: 8,
    contents: [ {
      file: "src/macros/comparison.sibilant",
      token: "and",
      type: "literal",
      line: 35,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(args.slice(0, -1), (function(item, index) {
      /* src/macros/comparison.sibilant:36:22 */
    
      return [ item, " ", jsComparator, " ", args[(1 + index)] ];
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.ternary = (function ternary$(cond, ifTrue, ifFalse) {
  /* ternary src/macros/flow-control.sibilant:9:0 */

  return [ "(", transpile(cond), ") ? ", transpile(ifTrue), " : ", transpile(ifFalse) ];
});
sibilant.macros.namespaces.core.when = (function when$(condition, body) {
  /* when src/macros/flow-control.sibilant:21:0 */

  var body = Array.prototype.slice.call(arguments, 1);

  return sibilant.macros.namespaces.core._scopedWithoutReturn("if (", condition, ") {", indent({
    file: "src/macros/flow-control.sibilant",
    token: "(",
    type: "expression",
    line: 24,
    col: 18,
    contents: [ {
      file: "src/macros/flow-control.sibilant",
      token: "do",
      type: "literal",
      line: 24,
      col: 19,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(body),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  }), "}");
});
sibilant.macros.namespaces.core.unless = (function unless$(condition, body) {
  /* unless src/macros/flow-control.sibilant:33:0 */

  var body = Array.prototype.slice.call(arguments, 1);

  return [ "(function() {", indent([ "if (", {
    file: "src/macros/flow-control.sibilant",
    token: "(",
    type: "expression",
    line: 35,
    col: 25,
    contents: [ {
      file: "src/macros/flow-control.sibilant",
      token: "not",
      type: "literal",
      line: 35,
      col: 26,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, condition ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  }, ") {", indent({
    file: "src/macros/flow-control.sibilant",
    token: "(",
    type: "expression",
    line: 36,
    col: 33,
    contents: [ {
      file: "src/macros/flow-control.sibilant",
      token: "do",
      type: "literal",
      line: 36,
      col: 34,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(body),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  }), "}" ]), "}).call(this)" ];
});
sibilant.macros.namespaces.core.if = (function if$(alternatingConditionsAndBranches) {
  /* if src/macros/flow-control.sibilant:58:0 */

  var alternatingConditionsAndBranches = Array.prototype.slice.call(arguments, 0);

  return [ "(function() {", indent(interleave(" else ", bulkMap(alternatingConditionsAndBranches, (function(cond, val) {
    /* src/macros/flow-control.sibilant:63:25 */
  
    return (function() {
      if (typeof val !== "undefined") {
        return [ "if (", transpile(cond), ") {", indent({
          file: "src/macros/flow-control.sibilant",
          token: "(",
          type: "expression",
          line: 66,
          col: 44,
          contents: [ {
            file: "src/macros/flow-control.sibilant",
            token: "do",
            type: "literal",
            line: 66,
            col: 45,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, val ],
          precedingIgnored: [],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        }), "}" ];
      } else {
        return [ "{", indent({
          file: "src/macros/flow-control.sibilant",
          token: "(",
          type: "expression",
          line: 68,
          col: 47,
          contents: [ {
            file: "src/macros/flow-control.sibilant",
            token: "do",
            type: "literal",
            line: 68,
            col: 48,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, cond ],
          precedingIgnored: [],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        }), "}" ];
      }
    }).call(this);
  })))), "}).call(this)" ];
});
sibilant.macros.namespaces.core.quotedHash = (function quotedHash$(pairs) {
  /* quoted-hash src/macros/hash.sibilant:3:0 */

  var pairs = Array.prototype.slice.call(arguments, 0);

  var cachedQuoteValue = sibilant.quoteHashKeys;
  sibilant.quoteHashKeys = true;
  var value = sibilant.macros.namespaces.core.hash.apply(this, pairs);
  sibilant.quoteHashKeys = cachedQuoteValue;
  return value;
});
sibilant.macros.namespaces.core.hash = (function hash$(pairs) {
  /* hash src/macros/hash.sibilant:18:7 */

  var pairs = Array.prototype.slice.call(arguments, 0);

  pairs = pairs.map((function(p, i) {
    /* src/macros/hash.sibilant:19:32 */
  
    return (function() {
      if ((p.token === "&" && node__QUERY(p, "special"))) {
        var double = pairs[(function() {
          if (0 === (i % 2)) {
            return (1 + i);
          } else {
            return (i - 1);
          }
        }).call(this)];
        return (function() {
          if ((node__QUERY(double, "tick") && double.token === "`")) {
            return double.contents[0];
          } else {
            return double;
          }
        }).call(this);
      } else {
        return p;
      }
    }).call(this);
  }));
  (function() {
    if (1 === (pairs.length % 2)) {
      return error(("odd number of key-value pairs in hash: " + inspect(pairs)));
    }
  }).call(this);
  var pairs_reduce$3 = pairs.reduce((function(o, item, i) {
    /* src/macros/hash.sibilant:32:26 */
  
    return (function() {
      if ((0 === (i % 2) && node__QUERY(item, "tick") && item.token === "`")) {
        return Object.assign({  }, o, { dynamicKeys: o.dynamicKeys.concat([ item.contents[0] ]) });
      } else if ((1 === (o.dynamicKeys.length % 2) && 1 === (i % 2))) {
        return Object.assign({  }, o, { dynamicKeys: o.dynamicKeys.concat([ item ]) });
      } else {
        return Object.assign({  }, o, { staticKeys: o.staticKeys.concat([ item ]) });
      }
    }).call(this);
  }), {
    dynamicKeys: [],
    staticKeys: []
  }),
      dynamicKeys = pairs_reduce$3.dynamicKeys,
      staticKeys = pairs_reduce$3.staticKeys,
      pairs_reduce$3 = undefined;
  var quoteKeys = sibilant.quoteHashKeys,
      pairStrings = bulkMap(staticKeys, (function(key, value) {
    /* src/macros/hash.sibilant:43:47 */
  
    return [ (function() {
      if ((quoteKeys && !(node__QUERY(key, "string")))) {
        return [ "\"", transpile(key), "\"" ];
      } else {
        return transpile(key);
      }
    }).call(this), ": ", transpile(value) ];
  }));
  return (function() {
    if (dynamicKeys.length) {
      var symbol = generateSymbol("hash");
      return {
        file: "src/macros/hash.sibilant",
        token: "(",
        type: "expression",
        line: 53,
        col: 13,
        contents: [ {
          file: "src/macros/hash.sibilant",
          token: "*scoped-without-source",
          type: "literal",
          line: 53,
          col: 14,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          file: "src/macros/hash.sibilant",
          token: "(",
          type: "expression",
          line: 54,
          col: 14,
          contents: [ {
            file: "src/macros/hash.sibilant",
            token: "var",
            type: "literal",
            line: 54,
            col: 15,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, symbol, {
            file: "src/macros/hash.sibilant",
            token: "(",
            type: "expression",
            line: 54,
            col: 27,
            contents: [ {
              file: "src/macros/hash.sibilant",
              token: "hash",
              type: "literal",
              line: 54,
              col: 28,
              contents: [],
              specials: 0,
              precedingIgnored: []
            } ].concat(staticKeys),
            precedingIgnored: [ {
              file: "src/macros/hash.sibilant",
              token: " ",
              type: "whitespace",
              line: 54,
              col: 26,
              contents: []
            } ],
            specials: 0,
            end: undefined,
            closed: true,
            closingIgnored: []
          } ],
          precedingIgnored: [ {
            file: "src/macros/hash.sibilant",
            token: "\n",
            type: "newline",
            line: 53,
            col: 36,
            contents: []
          }, {
            file: "src/macros/hash.sibilant",
            token: "              ",
            type: "whitespace",
            line: 54,
            col: 0,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        }, {
          file: "src/macros/hash.sibilant",
          token: "(",
          type: "expression",
          line: 55,
          col: 14,
          contents: [ {
            file: "src/macros/hash.sibilant",
            token: "set",
            type: "literal",
            line: 55,
            col: 15,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, symbol ].concat(dynamicKeys),
          precedingIgnored: [ {
            file: "src/macros/hash.sibilant",
            token: "\n",
            type: "newline",
            line: 54,
            col: 50,
            contents: []
          }, {
            file: "src/macros/hash.sibilant",
            token: "              ",
            type: "whitespace",
            line: 55,
            col: 0,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        }, symbol ],
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      };
    } else if (1 >= pairStrings.length) {
      return [ "{ ", interleave(", ", pairStrings), " }" ];
    } else {
      return [ "{", indent(interleave(",\n", pairStrings)), "}" ];
    }
  }).call(this);
});
sibilant.macros.namespaces.core.get = (function get$(obj, keys) {
  /* get src/macros/hash.sibilant:76:0 */

  var keys = Array.prototype.slice.call(arguments, 1);

  return [ transpile(obj), map(keys, (function(key) {
    /* src/macros/hash.sibilant:78:19 */
  
    var transpiled = transpile(key),
        output = outputFormatter(transpiled);
    return (function() {
      if (output.match((new RegExp("^\"[a-zA-Z0-9_]+\"$", undefined)))) {
        return [ ".", output.replace((new RegExp("\"", "g")), "") ];
      } else {
        return [ "[", transpiled, "]" ];
      }
    }).call(this);
  })) ];
});
sibilant.macros.namespaces.core.set = (function set$(arr, kvPairs) {
  /* set src/macros/hash.sibilant:96:0 */

  var kvPairs = Array.prototype.slice.call(arguments, 1);

  return interleave("\n", bulkMap(kvPairs, (function(k, v) {
    /* src/macros/hash.sibilant:97:43 */
  
    return {
      file: "src/macros/hash.sibilant",
      token: "(",
      type: "expression",
      line: 97,
      col: 52,
      contents: [ {
        file: "src/macros/hash.sibilant",
        token: "assign",
        type: "literal",
        line: 97,
        col: 53,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros/hash.sibilant",
        token: "(",
        type: "expression",
        line: 97,
        col: 60,
        contents: [ {
          file: "src/macros/hash.sibilant",
          token: "get",
          type: "literal",
          line: 97,
          col: 61,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, arr, k ],
        precedingIgnored: [ {
          file: "src/macros/hash.sibilant",
          token: " ",
          type: "whitespace",
          line: 97,
          col: 59,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      }, v ],
      precedingIgnored: [],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    };
  })));
});
sibilant.macros.namespaces.core.keys = (function keys$(obj) {
  /* keys src/macros/hash.sibilant:105:0 */

  return {
    file: "src/macros/hash.sibilant",
    token: "(",
    type: "expression",
    line: 106,
    col: 8,
    contents: [ {
      file: "src/macros/hash.sibilant",
      token: "Object.keys",
      type: "literal",
      line: 106,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, obj ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.delete = (function delete$(objects) {
  /* delete src/macros/hash.sibilant:114:0 */

  var objects = Array.prototype.slice.call(arguments, 0);

  return interleave("\n", map(objects, (function(obj) {
    /* src/macros/hash.sibilant:115:37 */
  
    return asStatement([ "delete ", transpile(obj) ]);
  })));
});
sibilant.macros.namespaces.core.eachKey = (function eachKey$(as, obj, body) {
  /* each-key src/macros/hash.sibilant:122:0 */

  var body = Array.prototype.slice.call(arguments, 2);

  return {
    file: "src/macros/hash.sibilant",
    token: "(",
    type: "expression",
    line: 123,
    col: 8,
    contents: [ {
      file: "src/macros/hash.sibilant",
      token: "pipe",
      type: "literal",
      line: 123,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, obj, {
      file: "src/macros/hash.sibilant",
      token: "(",
      type: "expression",
      line: 123,
      col: 19,
      contents: [ {
        file: "src/macros/hash.sibilant",
        token: "keys",
        type: "literal",
        line: 123,
        col: 20,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ],
      precedingIgnored: [ {
        file: "src/macros/hash.sibilant",
        token: " ",
        type: "whitespace",
        line: 123,
        col: 18,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/hash.sibilant",
      token: "(",
      type: "expression",
      line: 124,
      col: 14,
      contents: [ {
        file: "src/macros/hash.sibilant",
        token: ".",
        type: "dots",
        line: 124,
        col: 15,
        contents: [ {
          file: "src/macros/hash.sibilant",
          token: "for-each",
          type: "literal",
          line: 124,
          col: 16,
          contents: [],
          specials: 0,
          precedingIgnored: []
        } ],
        precedingIgnored: []
      }, {
        file: "src/macros/hash.sibilant",
        token: "(",
        type: "expression",
        line: 124,
        col: 25,
        contents: [ {
          file: "src/macros/hash.sibilant",
          token: "lambda",
          type: "literal",
          line: 124,
          col: 26,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          args: (function() {
            if (node__QUERY(as, "expression")) {
              return as;
            } else {
              return [ as ];
            }
          }).call(this),
          node: this
        } ].concat(body),
        precedingIgnored: [ {
          file: "src/macros/hash.sibilant",
          token: " ",
          type: "whitespace",
          line: 124,
          col: 24,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      } ],
      precedingIgnored: [ {
        file: "src/macros/hash.sibilant",
        token: "\n",
        type: "newline",
        line: 123,
        col: 25,
        contents: []
      }, {
        file: "src/macros/hash.sibilant",
        token: "              ",
        type: "whitespace",
        line: 124,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.lambda = (function lambda$(argsOrOptions, body) {
  /* lambda src/macros/lambda.sibilant:21:8 */

  var body = Array.prototype.slice.call(arguments, 1);

  debug__BANG(3, argsOrOptions);
  var args = (argsOrOptions.args || argsOrOptions),
      body = (argsOrOptions.body || body),
      node = (argsOrOptions.node || this),
      args = (function() {
    if (node__QUERY(args, "expression", "bracket")) {
      return args.contents;
    } else if ((node__QUERY(args) && 0 === body.length)) {
      body = [ args ];
      return [];
    } else if (node__QUERY(args, "brace")) {
      return [ args ];
    } else {
      return args;
    }
  }).call(this),
      name = (function() {
    if (argsOrOptions.name) {
      return outputFormatter(transpile(argsOrOptions.name)).replace((new RegExp("\\W+", "g")), "$").concat("$");
    }
  }).call(this),
      rest = detect(args, (function() {
    /* src/macros/lambda.sibilant:36:30 */
  
    return node__QUERY(arguments[0], "dots");
  })),
      destructuredArgs = map(args, (function(arg) {
    /* src/macros/lambda.sibilant:38:40 */
  
    return (function() {
      if (node__QUERY(arg, "bracket", "brace")) {
        var argName = generateSymbol(makeSymbolClue(arg));
        return {
          argName: argName,
          destructuredPair: [ arg, argName ]
        };
      } else {
        return { argName: arg };
      }
    }).call(this);
  })),
      destructuredStatements = flatCompact([ (function() {
    if ((typeof rest !== "undefined" && rest !== null)) {
      return [ rest, {
        file: "src/macros/lambda.sibilant",
        token: "(",
        type: "expression",
        line: 45,
        col: 71,
        contents: [ {
          file: "src/macros/lambda.sibilant",
          token: "Array.prototype.slice.call",
          type: "literal",
          line: 45,
          col: 72,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          file: "src/macros/lambda.sibilant",
          token: "arguments",
          type: "literal",
          line: 45,
          col: 99,
          contents: [],
          specials: 0,
          precedingIgnored: [ {
            file: "src/macros/lambda.sibilant",
            token: " ",
            type: "whitespace",
            line: 45,
            col: 98,
            contents: []
          } ]
        }, (args.length - 1) ],
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      } ];
    }
  }).call(this) ].concat(map(destructuredArgs, (function() {
    /* src/macros/lambda.sibilant:46:68 */
  
    return arguments[0].destructuredPair;
  }))));
  node = detect([ node, argsOrOptions.name, args, body[0] ], (function(n) {
    /* src/macros/lambda.sibilant:51:21 */
  
    return (node__QUERY(n) && n.file);
  }));
  return [ "(function", (function() {
    if (name) {
      return (" " + name);
    } else {
      return "";
    }
  }).call(this), "(", interleave(", ", map(destructuredArgs, (function() {
    /* src/macros/lambda.sibilant:55:49 */
  
    return arguments[0].argName;
  }))), ") {", (function() {
    if ((sibilant.state.functionComments && (name || node))) {
      return indent([ "/*", (function() {
        if (name) {
          return (" " + sibilant.prettyPrint(argsOrOptions.name, false));
        }
      }).call(this), (function() {
        if (node) {
          return (" " + node.file + ":" + node.line + ":" + node.col);
        }
      }).call(this), " */" ]);
    }
  }).call(this), (function() {
    if (destructuredStatements.length) {
      return indent({
        file: "src/macros/lambda.sibilant",
        token: "(",
        type: "expression",
        line: 61,
        col: 55,
        contents: [ {
          file: "src/macros/lambda.sibilant",
          token: "var",
          type: "literal",
          line: 61,
          col: 56,
          contents: [],
          specials: 0,
          precedingIgnored: []
        } ].concat(destructuredStatements),
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      });
    }
  }).call(this), indent(sibilant.macros.namespaces.core.do.apply(this, body)), "})" ];
});
sibilant.macros.namespaces.core["#"] = sibilant.macros.namespaces.core.lambda;
sibilant.macros.namespaces.core.thunk = (function thunk$(body) {
  /* thunk src/macros/lambda.sibilant:72:0 */

  var body = Array.prototype.slice.call(arguments, 0);

  var node = this,
      lambdaOptions = {
    node: node,
    args: []
  };
  (function() {
    if (!(node__QUERY(body[0]))) {
      mergeInto(lambdaOptions, body[0]);
      return body = body.slice(1);
    }
  }).call(this);
  return {
    file: "src/macros/lambda.sibilant",
    token: "(",
    type: "expression",
    line: 80,
    col: 8,
    contents: [ {
      file: "src/macros/lambda.sibilant",
      token: "lambda",
      type: "literal",
      line: 80,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, lambdaOptions ].concat(mapNode(body, (function(node) {
      /* src/macros/lambda.sibilant:82:17 */
    
      return (function() {
        if (node__QUERY(node, "argPlaceholder")) {
          return {
            file: "src/macros/lambda.sibilant",
            token: "(",
            type: "expression",
            line: 84,
            col: 24,
            contents: [ {
              file: "src/macros/lambda.sibilant",
              token: "argument",
              type: "literal",
              line: 84,
              col: 25,
              contents: [],
              specials: 0,
              precedingIgnored: []
            }, node.token.replace((new RegExp("^#", undefined)), "") ],
            precedingIgnored: [],
            specials: 0,
            end: undefined,
            closed: true,
            closingIgnored: []
          };
        } else {
          return node;
        }
      }).call(this);
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core["#>"] = sibilant.macros.namespaces.core.thunk;
sibilant.macros.namespaces.core.return = (function return$(token) {
  /* return src/macros/lambda.sibilant:88:0 */

  (function() {
    if (sibilant.debug) {
      return console.log("returning ", prettify(token));
    }
  }).call(this);
  var defaultReturn = asStatement([ "return ", transpile(token) ]);
  return (function() {
    if ((token && token.contents && token.contents.length)) {
      return (function() {
        switch(token.contents[0].token) {
        case "return":
        case "throw":
        case "do":
          return transpile(token);
        
        case "delete":
          var deleteMacro = macros.delete;
          return (function() {
            if (token.contents.length < 3) {
              return defaultReturn;
            } else {
              return [ asStatement(deleteMacro.apply(this, token.contents.slice(1, -1))), "\nreturn ", asStatement(deleteMacro(token.contents.slice(-1)[0])) ];
            }
          }).call(this);
        
        case "def":
          return [ transpile(token), "\n", sibilant.macros.namespaces.core.return(token.contents[1]) ];
        
        case "assign":
          return (function() {
            if (token.contents.length < 4) {
              return defaultReturn;
            } else {
              var result = clone(transpile(token));
              result.contents = result.contents.slice(0, -4).concat([ "return " ], result.contents.slice(-4));
              return result;
            }
          }).call(this);
        
        case "var":
          return [ transpile(token), "\n", sibilant.macros.namespaces.core.return((function() {
            if (0 === (token.contents.length % 2)) {
              return token.contents.slice(-1)[0];
            } else {
              return token.contents.slice(-2)[0];
            }
          }).call(this)) ];
        
        case "set":
          return (function() {
            if (token.contents.length < 5) {
              return defaultReturn;
            } else {
              var obj = token.contents[1],
                  nonReturnPart = token.contents.slice(2, (token.contents.length - 2)),
                  returnPart = token.contents.slice(-2);
              nonReturnPart.unshift(obj);
              returnPart.unshift(obj);
              return [ sibilant.macros.namespaces.core.set.apply(this, nonReturnPart), "\nreturn ", sibilant.macros.namespaces.core.set.apply(this, returnPart) ];
            }
          }).call(this);
        
        default:
          return defaultReturn;
        }
      }).call(this);
    } else {
      return defaultReturn;
    }
  }).call(this);
});
sibilant.macros.namespaces.core.do = (function do$(body) {
  /* do src/macros/lambda.sibilant:135:0 */

  var body = Array.prototype.slice.call(arguments, 0);

  return (function() {
    if (1 === body.length) {
      return sibilant.macros.namespaces.core.return(body[0]);
    } else if (body.length) {
      return [ interleave(map(body.slice(0, -1), (function() {
        /* src/macros/lambda.sibilant:143:19 */
      
        return asStatement(arguments[0]);
      })), "\n"), "\n", sibilant.macros.namespaces.core.return(body.slice(-1)[0]) ];
    } else {
      return "";
    }
  }).call(this);
});
sibilant.macros.namespaces.core.def = (function def$(name, args, body) {
  /* def src/macros/lambda.sibilant:160:0 */

  var body = Array.prototype.slice.call(arguments, 2);

  var node = this;
  (function() {
    if (node__QUERY(name, "expression")) {
      body = [ args ].concat(body);
      args = mergeWith(name, { contents: name.contents.slice(1) });
      return name = name.contents[0];
    }
  }).call(this);
  (function() {
    if (typeof name === "undefined") {
      return error("invalid function definition. missing name.");
    } else if (typeof args === "undefined") {
      return error("invalid function definition. missing arguments or return value.");
    }
  }).call(this);
  sibilant.docs.record("function", sibilant.macros.searchPath[0], name, node);
  return (function() {
    if (outputFormatter(transpile(name)).match((new RegExp("\\.", undefined)))) {
      return {
        file: "src/macros/lambda.sibilant",
        token: "(",
        type: "expression",
        line: 173,
        col: 10,
        contents: [ {
          file: "src/macros/lambda.sibilant",
          token: "assign",
          type: "literal",
          line: 173,
          col: 11,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, name, {
          file: "src/macros/lambda.sibilant",
          token: "(",
          type: "expression",
          line: 173,
          col: 24,
          contents: [ {
            file: "src/macros/lambda.sibilant",
            token: "lambda",
            type: "literal",
            line: 173,
            col: 25,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, {
            name: name,
            args: args,
            node: node,
            body: body
          } ],
          precedingIgnored: [ {
            file: "src/macros/lambda.sibilant",
            token: " ",
            type: "whitespace",
            line: 173,
            col: 23,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        } ],
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      };
    } else {
      return {
        file: "src/macros/lambda.sibilant",
        token: "(",
        type: "expression",
        line: 174,
        col: 10,
        contents: [ {
          file: "src/macros/lambda.sibilant",
          token: "var",
          type: "literal",
          line: 174,
          col: 11,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, name, {
          file: "src/macros/lambda.sibilant",
          token: "(",
          type: "expression",
          line: 174,
          col: 21,
          contents: [ {
            file: "src/macros/lambda.sibilant",
            token: "lambda",
            type: "literal",
            line: 174,
            col: 22,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, {
            name: name,
            args: args,
            node: node,
            body: body
          } ],
          precedingIgnored: [ {
            file: "src/macros/lambda.sibilant",
            token: " ",
            type: "whitespace",
            line: 174,
            col: 20,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        } ],
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      };
    }
  }).call(this);
});
sibilant.macros.namespaces.core.call = (function call$(fnName, args) {
  /* call src/macros/lambda.sibilant:185:0 */

  var args = Array.prototype.slice.call(arguments, 1);

  return (function() {
    if (any__QUERY(args, (function() {
      /* src/macros/lambda.sibilant:186:20 */
    
      return node__QUERY(arguments[0], "dots");
    }))) {
      return macros.apply(fnName, macros.list.apply(this, args));
    } else {
      return [ transpile(fnName), "(", interleave(", ", map(args, transpile)), ")" ];
    }
  }).call(this);
});
sibilant.macros.namespaces.core.send = (function send$(object, method, args) {
  /* send src/macros/lambda.sibilant:194:0 */

  var args = Array.prototype.slice.call(arguments, 2);

  return [ transpile(object), ".", transpile(method), "(", interleave(", ", map(args, transpile)), ")" ];
});
sibilant.macros.namespaces.core.apply = (function apply$(fn, arglist) {
  /* apply src/macros/lambda.sibilant:206:0 */

  return {
    file: "src/macros/lambda.sibilant",
    token: "(",
    type: "expression",
    line: 207,
    col: 8,
    contents: [ {
      file: "src/macros/lambda.sibilant",
      token: ".",
      type: "dots",
      line: 207,
      col: 9,
      contents: [ {
        file: "src/macros/lambda.sibilant",
        token: "apply",
        type: "literal",
        line: 207,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ],
      precedingIgnored: []
    }, fn, {
      file: "src/macros/lambda.sibilant",
      token: "this",
      type: "literal",
      line: 207,
      col: 20,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/lambda.sibilant",
        token: " ",
        type: "whitespace",
        line: 207,
        col: 19,
        contents: []
      } ]
    }, arglist ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.scoped = (function scoped$(body) {
  /* scoped src/macros/lambda.sibilant:213:0 */

  var body = Array.prototype.slice.call(arguments, 0);

  return {
    file: "src/macros/lambda.sibilant",
    token: "(",
    type: "expression",
    line: 214,
    col: 8,
    contents: [ {
      file: "src/macros/lambda.sibilant",
      token: ".",
      type: "dots",
      line: 214,
      col: 9,
      contents: [ {
        file: "src/macros/lambda.sibilant",
        token: "call",
        type: "literal",
        line: 214,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ],
      precedingIgnored: []
    }, {
      file: "src/macros/lambda.sibilant",
      token: "(",
      type: "expression",
      line: 214,
      col: 15,
      contents: [ {
        file: "src/macros/lambda.sibilant",
        token: "lambda",
        type: "literal",
        line: 214,
        col: 16,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        node: this,
        args: []
      } ].concat(body),
      precedingIgnored: [ {
        file: "src/macros/lambda.sibilant",
        token: " ",
        type: "whitespace",
        line: 214,
        col: 14,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/lambda.sibilant",
      token: "this",
      type: "literal",
      line: 214,
      col: 54,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/lambda.sibilant",
        token: " ",
        type: "whitespace",
        line: 214,
        col: 53,
        contents: []
      } ]
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core._scopedWithoutReturn = (function _scopedWithoutReturn$(body) {
  /* *scoped-without-return src/macros/lambda.sibilant:217:0 */

  var body = Array.prototype.slice.call(arguments, 0);

  return [ "(function() {", indent.apply(this, body), "}).call(this)" ];
});
sibilant.macros.namespaces.core._scopedWithoutSource = (function _scopedWithoutSource$(body) {
  /* *scoped-without-source src/macros/lambda.sibilant:221:0 */

  var body = Array.prototype.slice.call(arguments, 0);

  return {
    file: "src/macros/lambda.sibilant",
    token: "(",
    type: "expression",
    line: 222,
    col: 8,
    contents: [ {
      file: "src/macros/lambda.sibilant",
      token: "*scoped-without-return",
      type: "literal",
      line: 222,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/lambda.sibilant",
      token: "(",
      type: "expression",
      line: 222,
      col: 32,
      contents: [ {
        file: "src/macros/lambda.sibilant",
        token: "do",
        type: "literal",
        line: 222,
        col: 33,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ].concat(body),
      precedingIgnored: [ {
        file: "src/macros/lambda.sibilant",
        token: " ",
        type: "whitespace",
        line: 222,
        col: 31,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.arguments = (function arguments$(args) {
  /* arguments src/macros/lambda.sibilant:227:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return {
    file: "src/macros/lambda.sibilant",
    token: "(",
    type: "expression",
    line: 228,
    col: 8,
    contents: [ {
      file: "src/macros/lambda.sibilant",
      token: "Array.prototype.slice.call",
      type: "literal",
      line: 228,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/lambda.sibilant",
      token: "arguments",
      type: "literal",
      line: 228,
      col: 36,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/lambda.sibilant",
        token: " ",
        type: "whitespace",
        line: 228,
        col: 35,
        contents: []
      } ]
    } ].concat(args),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.argument = (function argument$(index) {
  /* argument src/macros/lambda.sibilant:234:0 */

  return {
    file: "src/macros/lambda.sibilant",
    token: "(",
    type: "expression",
    line: 235,
    col: 8,
    contents: [ {
      file: "src/macros/lambda.sibilant",
      token: "get",
      type: "literal",
      line: 235,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/lambda.sibilant",
      token: "arguments",
      type: "literal",
      line: 235,
      col: 13,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/lambda.sibilant",
        token: " ",
        type: "whitespace",
        line: 235,
        col: 12,
        contents: []
      } ]
    }, index ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.list = (function list$(args) {
  /* list src/macros/lists.sibilant:11:7 */

  var args = Array.prototype.slice.call(arguments, 0);

  var argSegments = [];
  return (function() {
    if (0 === args.length) {
      return "[]";
    } else {
      var simpleList = (function simpleList$(args) {
        /* simple-list src/macros/lists.sibilant:15:12 */
      
        return [ "[ ", interleave(", ", map(args, (function(arg) {
          /* src/macros/lists.sibilant:16:50 */
        
          return arg.transpiled;
        }))), " ]" ];
      });
      args.forEach((function(arg) {
        /* src/macros/lists.sibilant:18:27 */
      
        return (function() {
          if (node__QUERY(arg, "dots")) {
            return argSegments.push({ transpiled: transpile(arg) });
          } else if ((argSegments.slice(-1)[0] && "object" === typeof argSegments.slice(-1)[0] && "Array" === argSegments.slice(-1)[0].constructor.name)) {
            return argSegments.slice(-1)[0].push({ transpiled: transpile(arg) });
          } else {
            return argSegments.push([ { transpiled: transpile(arg) } ]);
          }
        }).call(this);
      }));
      argSegments = map(argSegments, (function(segment) {
        /* src/macros/lists.sibilant:24:38 */
      
        return (function() {
          if ((segment && "object" === typeof segment && "Array" === segment.constructor.name)) {
            return simpleList(segment);
          } else {
            return segment.transpiled;
          }
        }).call(this);
      }));
      return (function() {
        if (1 === argSegments.length) {
          return argSegments[0];
        } else {
          return [ argSegments[0], ".concat(", interleave(", ", argSegments.slice(1)), ")" ];
        }
      }).call(this);
    }
  }).call(this);
});
sibilant.macros.namespaces.core.length = (function length$(arr) {
  /* length src/macros/lists.sibilant:36:0 */

  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 37,
    col: 8,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: "get",
      type: "literal",
      line: 37,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, arr, {"file":"src/macros/lists.sibilant","token":"'","type":"tick","line":37,"col":18,"contents":[{"file":"src/macros/lists.sibilant","token":"length","type":"literal","line":37,"col":19,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/lists.sibilant","token":" ","type":"whitespace","line":37,"col":17,"contents":[]}]} ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.first = (function first$(arr) {
  /* first src/macros/lists.sibilant:43:0 */

  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 43,
    col: 20,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: "get",
      type: "literal",
      line: 43,
      col: 21,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, arr, {
      file: "src/macros/lists.sibilant",
      token: "0",
      type: "number",
      line: 43,
      col: 30,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: " ",
        type: "whitespace",
        line: 43,
        col: 29,
        contents: []
      } ]
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.second = (function second$(arr) {
  /* second src/macros/lists.sibilant:48:0 */

  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 48,
    col: 21,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: "get",
      type: "literal",
      line: 48,
      col: 22,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, arr, {
      file: "src/macros/lists.sibilant",
      token: "1",
      type: "number",
      line: 48,
      col: 31,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: " ",
        type: "whitespace",
        line: 48,
        col: 30,
        contents: []
      } ]
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.third = (function third$(arr) {
  /* third src/macros/lists.sibilant:53:0 */

  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 53,
    col: 20,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: "get",
      type: "literal",
      line: 53,
      col: 21,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, arr, {
      file: "src/macros/lists.sibilant",
      token: "2",
      type: "number",
      line: 53,
      col: 30,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: " ",
        type: "whitespace",
        line: 53,
        col: 29,
        contents: []
      } ]
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.rest = (function rest$(arr) {
  /* rest src/macros/lists.sibilant:59:0 */

  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 59,
    col: 19,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: ".",
      type: "dots",
      line: 59,
      col: 20,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: "slice",
        type: "literal",
        line: 59,
        col: 21,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ],
      precedingIgnored: []
    }, arr, {
      file: "src/macros/lists.sibilant",
      token: "1",
      type: "number",
      line: 59,
      col: 32,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: " ",
        type: "whitespace",
        line: 59,
        col: 31,
        contents: []
      } ]
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.last = (function last$(arr) {
  /* last src/macros/lists.sibilant:64:0 */

  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 64,
    col: 19,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: "first",
      type: "literal",
      line: 64,
      col: 20,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/lists.sibilant",
      token: "(",
      type: "expression",
      line: 64,
      col: 26,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: ".",
        type: "dots",
        line: 64,
        col: 27,
        contents: [ {
          file: "src/macros/lists.sibilant",
          token: "slice",
          type: "literal",
          line: 64,
          col: 28,
          contents: [],
          specials: 0,
          precedingIgnored: []
        } ],
        precedingIgnored: []
      }, arr, {
        file: "src/macros/lists.sibilant",
        token: "-1",
        type: "number",
        line: 64,
        col: 39,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/lists.sibilant",
          token: " ",
          type: "whitespace",
          line: 64,
          col: 38,
          contents: []
        } ]
      } ],
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: " ",
        type: "whitespace",
        line: 64,
        col: 25,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.cons = (function cons$(first, rest) {
  /* cons src/macros/lists.sibilant:74:0 */

  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 75,
    col: 8,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: "pipe",
      type: "literal",
      line: 75,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/lists.sibilant",
      token: "(",
      type: "expression",
      line: 76,
      col: 9,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: "list",
        type: "literal",
        line: 76,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, first ],
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: "\n",
        type: "newline",
        line: 75,
        col: 13,
        contents: []
      }, {
        file: "src/macros/lists.sibilant",
        token: "         ",
        type: "whitespace",
        line: 76,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/lists.sibilant",
      token: "(",
      type: "expression",
      line: 77,
      col: 9,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: ".",
        type: "dots",
        line: 77,
        col: 10,
        contents: [ {
          file: "src/macros/lists.sibilant",
          token: "concat",
          type: "literal",
          line: 77,
          col: 11,
          contents: [],
          specials: 0,
          precedingIgnored: []
        } ],
        precedingIgnored: []
      }, rest ],
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: "\n",
        type: "newline",
        line: 76,
        col: 22,
        contents: []
      }, {
        file: "src/macros/lists.sibilant",
        token: "         ",
        type: "whitespace",
        line: 77,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.append = (function append$(list, additional) {
  /* append src/macros/lists.sibilant:83:0 */

  var additional = Array.prototype.slice.call(arguments, 1);

  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 84,
    col: 8,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: ".",
      type: "dots",
      line: 84,
      col: 9,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: "concat",
        type: "literal",
        line: 84,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ],
      precedingIgnored: []
    }, list, {
      file: "src/macros/lists.sibilant",
      token: "(",
      type: "expression",
      line: 84,
      col: 23,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: "list",
        type: "literal",
        line: 84,
        col: 24,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ].concat(additional),
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: " ",
        type: "whitespace",
        line: 84,
        col: 22,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.each = (function each$(item, array, body) {
  /* each src/macros/lists.sibilant:97:0 */

  var body = Array.prototype.slice.call(arguments, 2);

  var node = this,
      args = (function() {
    if (node__QUERY(item, "expression")) {
      return item;
    } else {
      return [ item ];
    }
  }).call(this);
  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 100,
    col: 8,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: "|>",
      type: "otherChar",
      line: 100,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, array, {
      file: "src/macros/lists.sibilant",
      token: "(",
      type: "expression",
      line: 101,
      col: 12,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: ".",
        type: "dots",
        line: 101,
        col: 13,
        contents: [ {
          file: "src/macros/lists.sibilant",
          token: "for-each",
          type: "literal",
          line: 101,
          col: 14,
          contents: [],
          specials: 0,
          precedingIgnored: []
        } ],
        precedingIgnored: []
      }, {
        file: "src/macros/lists.sibilant",
        token: "(",
        type: "expression",
        line: 101,
        col: 23,
        contents: [ {
          file: "src/macros/lists.sibilant",
          token: "lambda",
          type: "literal",
          line: 101,
          col: 24,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          node: node,
          args: args,
          body: body
        } ],
        precedingIgnored: [ {
          file: "src/macros/lists.sibilant",
          token: " ",
          type: "whitespace",
          line: 101,
          col: 22,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      } ],
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: "\n",
        type: "newline",
        line: 100,
        col: 18,
        contents: []
      }, {
        file: "src/macros/lists.sibilant",
        token: "            ",
        type: "whitespace",
        line: 101,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.includes__QUERY = (function includes__QUERY$(haystack, needle) {
  /* includes? src/macros/lists.sibilant:107:0 */

  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 108,
    col: 8,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: "pipe",
      type: "literal",
      line: 108,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, haystack, {
      file: "src/macros/lists.sibilant",
      token: "(",
      type: "expression",
      line: 108,
      col: 24,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: ".",
        type: "dots",
        line: 108,
        col: 25,
        contents: [ {
          file: "src/macros/lists.sibilant",
          token: "index-of",
          type: "literal",
          line: 108,
          col: 26,
          contents: [],
          specials: 0,
          precedingIgnored: []
        } ],
        precedingIgnored: []
      }, needle ],
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: " ",
        type: "whitespace",
        line: 108,
        col: 23,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/lists.sibilant",
      token: "(",
      type: "expression",
      line: 108,
      col: 44,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: "!=",
        type: "otherChar",
        line: 108,
        col: 45,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros/lists.sibilant",
        token: "-1",
        type: "number",
        line: 108,
        col: 48,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/lists.sibilant",
          token: " ",
          type: "whitespace",
          line: 108,
          col: 47,
          contents: []
        } ]
      } ],
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: " ",
        type: "whitespace",
        line: 108,
        col: 43,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.excludes__QUERY = (function excludes__QUERY$(haystack, needle) {
  /* excludes? src/macros/lists.sibilant:114:0 */

  return {
    file: "src/macros/lists.sibilant",
    token: "(",
    type: "expression",
    line: 115,
    col: 8,
    contents: [ {
      file: "src/macros/lists.sibilant",
      token: "pipe",
      type: "literal",
      line: 115,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, haystack, {
      file: "src/macros/lists.sibilant",
      token: "(",
      type: "expression",
      line: 115,
      col: 24,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: ".",
        type: "dots",
        line: 115,
        col: 25,
        contents: [ {
          file: "src/macros/lists.sibilant",
          token: "index-of",
          type: "literal",
          line: 115,
          col: 26,
          contents: [],
          specials: 0,
          precedingIgnored: []
        } ],
        precedingIgnored: []
      }, needle ],
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: " ",
        type: "whitespace",
        line: 115,
        col: 23,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/lists.sibilant",
      token: "(",
      type: "expression",
      line: 115,
      col: 44,
      contents: [ {
        file: "src/macros/lists.sibilant",
        token: "=",
        type: "otherChar",
        line: 115,
        col: 45,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros/lists.sibilant",
        token: "-1",
        type: "number",
        line: 115,
        col: 47,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/lists.sibilant",
          token: " ",
          type: "whitespace",
          line: 115,
          col: 46,
          contents: []
        } ]
      } ],
      precedingIgnored: [ {
        file: "src/macros/lists.sibilant",
        token: " ",
        type: "whitespace",
        line: 115,
        col: 43,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.while = (function while$(condition, body) {
  /* while src/macros/loops.sibilant:8:0 */

  var body = Array.prototype.slice.call(arguments, 1);

  var symbol = generateSymbol("while");
  return {
    file: "src/macros/loops.sibilant",
    token: "(",
    type: "expression",
    line: 10,
    col: 8,
    contents: [ {
      file: "src/macros/loops.sibilant",
      token: "*scoped-without-source",
      type: "literal",
      line: 10,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/loops.sibilant",
      token: "(",
      type: "expression",
      line: 11,
      col: 9,
      contents: [ {
        file: "src/macros/loops.sibilant",
        token: "var",
        type: "literal",
        line: 11,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, symbol ],
      precedingIgnored: [ {
        file: "src/macros/loops.sibilant",
        token: "\n",
        type: "newline",
        line: 10,
        col: 31,
        contents: []
      }, {
        file: "src/macros/loops.sibilant",
        token: "         ",
        type: "whitespace",
        line: 11,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      type: "output",
      contents: [ "while (", transpile(condition), ") {", indent({
        file: "src/macros/loops.sibilant",
        token: "(",
        type: "expression",
        line: 14,
        col: 35,
        contents: [ {
          file: "src/macros/loops.sibilant",
          token: "assign",
          type: "literal",
          line: 14,
          col: 36,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, symbol, {
          file: "src/macros/loops.sibilant",
          token: "(",
          type: "expression",
          line: 14,
          col: 51,
          contents: [ {
            file: "src/macros/loops.sibilant",
            token: "*scoped-without-source",
            type: "literal",
            line: 14,
            col: 52,
            contents: [],
            specials: 0,
            precedingIgnored: []
          } ].concat(body),
          precedingIgnored: [ {
            file: "src/macros/loops.sibilant",
            token: " ",
            type: "whitespace",
            line: 14,
            col: 50,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        } ],
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      }), "}" ]
    }, symbol ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.until = (function until$(condition, body) {
  /* until src/macros/loops.sibilant:27:0 */

  var body = Array.prototype.slice.call(arguments, 1);

  return {
    file: "src/macros/loops.sibilant",
    token: "(",
    type: "expression",
    line: 28,
    col: 8,
    contents: [ {
      file: "src/macros/loops.sibilant",
      token: "while",
      type: "literal",
      line: 28,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/loops.sibilant",
      token: "(",
      type: "expression",
      line: 28,
      col: 15,
      contents: [ {
        file: "src/macros/loops.sibilant",
        token: "not",
        type: "literal",
        line: 28,
        col: 16,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, condition ],
      precedingIgnored: [ {
        file: "src/macros/loops.sibilant",
        token: " ",
        type: "whitespace",
        line: 28,
        col: 14,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ].concat(body),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.macro = (function macro$(name, args, body) {
  /* macro src/macros/macros.sibilant:12:0 */

  var body = Array.prototype.slice.call(arguments, 2);

  var nameTr = outputFormatter(transpile(name)),
      options = {
    name: name,
    args: args,
    node: this
  },
      js = outputFormatter(transpile({
    file: "src/macros/macros.sibilant",
    token: "(",
    type: "expression",
    line: 15,
    col: 20,
    contents: [ {
      file: "src/macros/macros.sibilant",
      token: "lambda",
      type: "literal",
      line: 15,
      col: 21,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, options ].concat(body),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  }));
  debug__BANG(2, js);
  sibilant.docs.record("macro", sibilant.macros.searchPath[0], name, this);
  var evaledJs = (function() {
    try {
      return eval(js);
    } catch (e) {
      console.log(e.message);
      console.log(red(e.stack.split("\n")[1]));
      return console.log(("error in parsing macro " + sibilant.prettyPrint(name) + ":\n" + js));
    }
  }).call(this);
  sibilant.macros.namespace[nameTr] = evaledJs;
  return undefined;
});
sibilant.macros.namespaces.core.meta = (function meta$(body) {
  /* meta src/macros/macros.sibilant:42:0 */

  var body = Array.prototype.slice.call(arguments, 0);

  var js = outputFormatter(transpile(sibilant.macros.namespaces.core.scoped.apply(this, body)));
  (function() {
    if (sibilant.debug) {
      return console.log(js);
    }
  }).call(this);
  return outputFormatter(eval(js));
});
sibilant.macros.namespaces.core.aliasMacro = (function aliasMacro$(currentMacroName, newMacroName) {
  /* alias-macro src/macros/macros.sibilant:50:0 */

  var currentMacroName = outputFormatter(transpile(currentMacroName)),
      newMacroName = outputFormatter(transpile(newMacroName));
  sibilant.macros.namespace[newMacroName] = sibilant.macros.namespace[currentMacroName];
  return null;
});
sibilant.macros.namespaces.core.deleteMacro = (function deleteMacro$(macroNames) {
  /* delete-macro src/macros/macros.sibilant:61:0 */

  var macroNames = Array.prototype.slice.call(arguments, 0);

  macroNames.forEach((function(macroName) {
    /* src/macros/macros.sibilant:62:7 */
  
    return delete sibilant.macros.namespace[outputFormatter(transpile(macroName))];
  }));
  return null;
});
sibilant.macros.namespaces.core.delmacro = sibilant.macros.namespaces.core.deleteMacro;
sibilant.macros.namespaces.core.renameMacro = (function renameMacro$(currentMacroName, newMacroName) {
  /* rename-macro src/macros/macros.sibilant:74:0 */

  sibilant.macros.namespaces.core.aliasMacro(currentMacroName, newMacroName);
  sibilant.macros.namespaces.core.deleteMacro(currentMacroName);
  return null;
});
sibilant.macros.namespaces.core.importNamespace = (function importNamespace$(namespace) {
  /* import-namespace src/macros/macros.sibilant:80:0 */

  var namespaceAsString = outputFormatter(transpile(namespace));
  (function() {
    if (!(sibilant.macros.namespaces.hasOwnProperty(namespaceAsString))) {
      return sibilant.macros.namespaces[namespaceAsString] = {  };
    }
  }).call(this);
  sibilant.macros.searchPath.unshift(namespaceAsString);
  return undefined;
});
sibilant.macros.namespaces.core.namespace = (function namespace$(namespace) {
  /* namespace src/macros/macros.sibilant:88:0 */

  sibilant.macros.namespaces.core.importNamespace(namespace);
  sibilant.macros.namespace = sibilant.macros.namespaces[outputFormatter(transpile(namespace))];
  return undefined;
});
sibilant.macros.namespaces.core.quote = (function quote$(content) {
  /* quote src/macros/macros.sibilant:95:0 */

  var unquotes = findUnquotes(content);
  return (function() {
    if (typeof content === "string") {
      return ("\"" + qescape(content) + "\"");
    } else if (typeof content === "number") {
      return sibilant.macros.namespaces.core.quote(content.toString());
    } else if (node__QUERY(content, "literal", "otherChar")) {
      return [ "\"", transpile(content), "\"" ];
    } else if (Object.keys(unquotes).length) {
      return replace__BANG(content, unquotes);
    } else if (node__QUERY(content, "expression")) {
      return [ "\"", mapNode(transpile(content), qescape), "\"" ];
    } else if (node__QUERY(content, "bracket")) {
      return sibilant.macros.namespaces.core.list.apply(this, map(content.contents, sibilant.macros.namespaces.core.quote));
    } else if (node__QUERY(content, "brace")) {
      return sibilant.macros.namespaces.core.hash.apply(this, map(content.contents, sibilant.macros.namespaces.core.quote));
    } else {
      return content;
    }
  }).call(this);
});
sibilant.macros.namespaces.core.docs = (function docs$(options) {
  /* docs src/macros/macros.sibilant:115:0 */

  var options = Array.prototype.slice.call(arguments, 0);

  var optionsString = undefined,
      optionsHash = {  };
  (function() {
    if (1 === (options.length % 2)) {
      return (function() {
        if ((node__QUERY(options[0], "string") || typeof options[0] === "string")) {
          return optionsString = options.shift();
        } else if ((node__QUERY(options.slice(-1)[0], "string") || typeof options.slice(-1)[0] === "string")) {
          return optionsString = options.pop();
        }
      }).call(this);
    }
  }).call(this);
  bulkMap(options, (function(key, value) {
    /* src/macros/macros.sibilant:126:23 */
  
    return optionsHash[outputFormatter(transpile(key))] = value;
  }));
  [ "examples", "references" ].forEach((function(listAttribute) {
    /* src/macros/macros.sibilant:129:5 */
  
    return (function() {
      if ((optionsHash.hasOwnProperty(listAttribute) && node__QUERY(optionsHash[listAttribute], "bracket"))) {
        return optionsHash[listAttribute] = optionsHash[listAttribute].contents;
      }
    }).call(this);
  }));
  (function() {
    if (optionsHash.hasOwnProperty("example")) {
      (function() {
        if (optionsHash.hasOwnProperty("examples")) {
          return error("please provide example OR examples, not both");
        }
      }).call(this);
      optionsHash.examples = [ optionsHash.example ];
      return delete optionsHash.example;
    }
  }).call(this);
  (function() {
    if (optionsHash.hasOwnProperty("tags")) {
      return optionsHash.tags = eval(outputFormatter(transpile(sibilant.macros.namespaces.core.quote(optionsHash.tags))));
    }
  }).call(this);
  (function() {
    if (node__QUERY(optionsString, "string")) {
      return optionsHash.docString = eval(outputFormatter(transpile(optionsString)));
    } else if (typeof optionsString === "string") {
      return optionsHash.docString = optionsString;
    }
  }).call(this);
  sibilant.docs.lastDoc = optionsHash;
  return null;
});
sibilant.macros.namespaces.core["+"] = (function $$(args) {
  /* + src/macros/math.sibilant:8:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return [ "(", interleave(" + ", map(args, transpile)), ")" ];
});
sibilant.macros.namespaces.core.concat = sibilant.macros.namespaces.core["+"];
sibilant.macros.namespaces.core["-"] = (function $$(args) {
  /* - src/macros/math.sibilant:16:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return [ "(", interleave(" - ", map(args, transpile)), ")" ];
});
sibilant.macros.namespaces.core._ = (function _$(args) {
  /* * src/macros/math.sibilant:22:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return [ "(", interleave(" * ", map(args, transpile)), ")" ];
});
sibilant.macros.namespaces.core["/"] = (function $$(args) {
  /* / src/macros/math.sibilant:29:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return [ "(", interleave(" / ", map(args, transpile)), ")" ];
});
sibilant.macros.namespaces.core.mod = (function mod$(args) {
  /* mod src/macros/math.sibilant:35:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return [ "(", interleave(" % ", map(args, transpile)), ")" ];
});
sibilant.macros.namespaces.core.incrBy = (function incrBy$(item, increment) {
  /* incr-by src/macros/math.sibilant:42:0 */

  return [ transpile(item), " += ", transpile(increment) ];
});
sibilant.macros.namespaces.core.incr = (function incr$(item) {
  /* incr src/macros/math.sibilant:48:0 */

  return [ "((", transpile(item), ")++)" ];
});
sibilant.macros.namespaces.core.decr = (function decr$(item) {
  /* decr src/macros/math.sibilant:55:0 */

  return [ "((", transpile(item), ")--)" ];
});
sibilant.macros.namespaces.core.or = (function or$(args) {
  /* or src/macros/math.sibilant:61:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return [ "(", interleave(" || ", map(args, transpile)), ")" ];
});
sibilant.macros.namespaces.core.and = (function and$(args) {
  /* and src/macros/math.sibilant:69:0 */

  var args = Array.prototype.slice.call(arguments, 0);

  return (function() {
    if (1 === args.length) {
      return transpile(args[0]);
    } else {
      return {
        file: "src/macros/math.sibilant",
        token: "(",
        type: "expression",
        line: 72,
        col: 12,
        contents: [ {
          file: "src/macros/math.sibilant",
          token: "parens",
          type: "literal",
          line: 72,
          col: 13,
          contents: [],
          specials: 0,
          precedingIgnored: []
        } ].concat(interleave(" && ", map(args, transpile))),
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      };
    }
  }).call(this);
});
sibilant.macros.namespaces.core.not = (function not$(exp) {
  /* not src/macros/math.sibilant:79:0 */

  return [ "!", {
    file: "src/macros/math.sibilant",
    token: "(",
    type: "expression",
    line: 80,
    col: 13,
    contents: [ {
      file: "src/macros/math.sibilant",
      token: "parens",
      type: "literal",
      line: 80,
      col: 14,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, exp ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  } ];
});
sibilant.macros.namespaces.core.asBoolean = (function asBoolean$(expr) {
  /* as-boolean src/macros/math.sibilant:88:0 */

  return {
    file: "src/macros/math.sibilant",
    token: "(",
    type: "expression",
    line: 89,
    col: 8,
    contents: [ {
      file: "src/macros/math.sibilant",
      token: "parens",
      type: "literal",
      line: 89,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, "!!", {
      file: "src/macros/math.sibilant",
      token: "(",
      type: "expression",
      line: 89,
      col: 22,
      contents: [ {
        file: "src/macros/math.sibilant",
        token: "parens",
        type: "literal",
        line: 89,
        col: 23,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, expr ],
      precedingIgnored: [ {
        file: "src/macros/math.sibilant",
        token: " ",
        type: "whitespace",
        line: 89,
        col: 21,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.asNumber = (function asNumber$(expr) {
  /* as-number src/macros/math.sibilant:96:0 */

  return {
    file: "src/macros/math.sibilant",
    token: "(",
    type: "expression",
    line: 96,
    col: 25,
    contents: [ {
      file: "src/macros/math.sibilant",
      token: "Number",
      type: "literal",
      line: 96,
      col: 26,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, expr ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.statement__BANG = (function statement__BANG$(node) {
  /* statement! src/macros/misc.sibilant:3:0 */

  return (function() {
    if (emptyNode__QUERY(transpiled)) {
      return undefined;
    } else {
      return [ node, ";" ];
    }
  }).call(this);
});
sibilant.macros.namespaces.core.new = (function new$(constructor, args) {
  /* new src/macros/misc.sibilant:13:0 */

  var args = Array.prototype.slice.call(arguments, 1);

  return [ "(new ", {
    file: "src/macros/misc.sibilant",
    token: "(",
    type: "expression",
    line: 14,
    col: 17,
    contents: [ {
      file: "src/macros/misc.sibilant",
      token: "call",
      type: "literal",
      line: 14,
      col: 18,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, constructor ].concat(args),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  }, ")" ];
});
sibilant.macros.namespaces.core.typeof = (function typeof$(thing) {
  /* typeof src/macros/misc.sibilant:20:0 */

  return [ "typeof ", transpile(thing) ];
});
sibilant.macros.namespaces.core.comment = (function comment$(contents) {
  /* comment src/macros/misc.sibilant:26:0 */

  var contents = Array.prototype.slice.call(arguments, 0);

  return map(contents, (function(content) {
    /* src/macros/misc.sibilant:27:21 */
  
    return [ "// ", recurseMap(transpile(content), (function(item) {
      /* src/macros/misc.sibilant:29:36 */
    
      return (item) ? outputFormatter(transpile(item)).replace((new RegExp("\n", "g")), "\n// ") : null;
    })) ];
  }));
});
sibilant.macros.namespaces.core.logPretty = (function logPretty$(label, arg) {
  /* log-pretty src/macros/misc.sibilant:42:0 */

  var node = this;
  (function() {
    if (typeof arg === "undefined") {
      arg = label;
      return label = [ "\"", prettify(label, false), "\"" ];
    }
  }).call(this);
  return {
    file: "src/macros/misc.sibilant",
    token: "(",
    type: "expression",
    line: 47,
    col: 8,
    contents: [ {
      file: "src/macros/misc.sibilant",
      token: "console.log",
      type: "literal",
      line: 47,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/misc.sibilant",
      token: "(",
      type: "expression",
      line: 47,
      col: 21,
      contents: [ {
        file: "src/macros/misc.sibilant",
        token: "concat",
        type: "literal",
        line: 47,
        col: 22,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, [ "\"", node.file, ":", node.line, "\"" ], {
        file: "src/macros/misc.sibilant",
        token: "\" \"",
        type: "string",
        line: 47,
        col: 66,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/misc.sibilant",
          token: " ",
          type: "whitespace",
          line: 47,
          col: 65,
          contents: []
        } ]
      }, label, {
        file: "src/macros/misc.sibilant",
        token: "\" = \"",
        type: "string",
        line: 47,
        col: 77,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/misc.sibilant",
          token: " ",
          type: "whitespace",
          line: 47,
          col: 76,
          contents: []
        } ]
      }, {
        file: "src/macros/misc.sibilant",
        token: "(",
        type: "expression",
        line: 47,
        col: 83,
        contents: [ {
          file: "src/macros/misc.sibilant",
          token: "prettify",
          type: "literal",
          line: 47,
          col: 84,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, arg ],
        precedingIgnored: [ {
          file: "src/macros/misc.sibilant",
          token: " ",
          type: "whitespace",
          line: 47,
          col: 82,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      } ],
      precedingIgnored: [ {
        file: "src/macros/misc.sibilant",
        token: " ",
        type: "whitespace",
        line: 47,
        col: 20,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.prettyLog = sibilant.macros.namespaces.core.logPretty;
sibilant.macros.namespaces.core.throw = (function throw$(error) {
  /* throw src/macros/misc.sibilant:55:0 */

  return [ "throw ", transpile(error) ];
});
sibilant.macros.namespaces.core.try = (function try$(tryblock, catchblock) {
  /* try src/macros/misc.sibilant:60:0 */

  return [ "(function() {", indent([ "try {", indent({
    file: "src/macros/misc.sibilant",
    token: "(",
    type: "expression",
    line: 63,
    col: 26,
    contents: [ {
      file: "src/macros/misc.sibilant",
      token: "do",
      type: "literal",
      line: 63,
      col: 27,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, tryblock ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  }), "} catch (e) {", indent({
    file: "src/macros/misc.sibilant",
    token: "(",
    type: "expression",
    line: 65,
    col: 26,
    contents: [ {
      file: "src/macros/misc.sibilant",
      token: "do",
      type: "literal",
      line: 65,
      col: 27,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, catchblock ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  }), "}" ]), "}).call(this)" ];
});
sibilant.macros.namespaces.core.withState = (function withState$(k, v, body) {
  /* with-state src/macros/misc.sibilant:69:0 */

  var body = Array.prototype.slice.call(arguments, 2);

  var state = sibilant.state,
      pipe$3 = map([ k, v ], (function() {
    /* src/macros/misc.sibilant:71:43 */
  
    return outputFormatter(transpile(arguments[0]));
  })),
      key = pipe$3[0],
      value = pipe$3[1],
      pipe$3 = undefined,
      before = state[key];
  state[key] = value;
  var returnValue = interleave("\n", map(body, transpile));
  state[key] = before;
  return returnValue;
});
sibilant.macros.namespaces.core.join = (function join$(arr, glue) {
  /* join src/macros/misc.sibilant:87:0 */

  (function() {
    if ((typeof glue !== "undefined" && typeof arr === "undefined")) {
      arr = glue;
      return glue = undefined;
    }
  }).call(this);
  return {
    file: "src/macros/misc.sibilant",
    token: "(",
    type: "expression",
    line: 90,
    col: 8,
    contents: [ {
      file: "src/macros/misc.sibilant",
      token: ".",
      type: "dots",
      line: 90,
      col: 9,
      contents: [ {
        file: "src/macros/misc.sibilant",
        token: "join",
        type: "literal",
        line: 90,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ],
      precedingIgnored: []
    }, arr, (glue || "\"\"") ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.parens = (function parens$(contents) {
  /* parens src/macros/misc.sibilant:92:0 */

  var contents = Array.prototype.slice.call(arguments, 0);

  return [ "(" ].concat(contents, [ ")" ]);
});
sibilant.macros.namespaces.core.sourceMappingUrl = (function sourceMappingUrl$(url) {
  /* source-mapping-url src/macros/misc.sibilant:99:0 */

  return [ "//# sourceMappingURL=", eval(outputFormatter(transpile(url))), "\n" ];
});
sibilant.macros.namespaces.core.require__BANG = (function require__BANG$(requires) {
  /* require! src/macros/misc.sibilant:102:0 */

  var requires = Array.prototype.slice.call(arguments, 0);

  return {
    file: "src/macros/misc.sibilant",
    token: "(",
    type: "expression",
    line: 103,
    col: 8,
    contents: [ {
      file: "src/macros/misc.sibilant",
      token: "var",
      type: "literal",
      line: 103,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(inject([], requires, (function(pairs, node) {
      /* src/macros/misc.sibilant:104:25 */
    
      return pairs.concat((function() {
        if ((0 === (pairs.length % 2) && node__QUERY(node, "tick", "string"))) {
          return [ mergeInto(clone(node), {
            token: outputFormatter(transpile(node)).slice(1, -1),
            contents: [],
            type: "literal"
          }), {
            file: "src/macros/misc.sibilant",
            token: "(",
            type: "expression",
            line: 114,
            col: 33,
            contents: [ {
              file: "src/macros/misc.sibilant",
              token: "require",
              type: "literal",
              line: 114,
              col: 34,
              contents: [],
              specials: 0,
              precedingIgnored: []
            }, node ],
            precedingIgnored: [],
            specials: 0,
            end: undefined,
            closed: true,
            closingIgnored: []
          } ];
        } else if (1 === (pairs.length % 2)) {
          return [ {
            file: "src/macros/misc.sibilant",
            token: "(",
            type: "expression",
            line: 117,
            col: 36,
            contents: [ {
              file: "src/macros/misc.sibilant",
              token: "require",
              type: "literal",
              line: 117,
              col: 37,
              contents: [],
              specials: 0,
              precedingIgnored: []
            }, node ],
            precedingIgnored: [],
            specials: 0,
            end: undefined,
            closed: true,
            closingIgnored: []
          } ];
        } else {
          return [ node ];
        }
      }).call(this));
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.export = (function export$(localVars) {
  /* export src/macros/misc.sibilant:122:0 */

  var localVars = Array.prototype.slice.call(arguments, 0);

  var pairs = localVars.reduce((function(acc, value) {
    /* src/macros/misc.sibilant:124:19 */
  
    return acc.concat([ sibilant.macros.namespaces.core.quote(value), value ]);
  }), []);
  return {
    file: "src/macros/misc.sibilant",
    token: "(",
    type: "expression",
    line: 126,
    col: 8,
    contents: [ {
      file: "src/macros/misc.sibilant",
      token: "set",
      type: "literal",
      line: 126,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/misc.sibilant",
      token: "exports",
      type: "literal",
      line: 126,
      col: 13,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/misc.sibilant",
        token: " ",
        type: "whitespace",
        line: 126,
        col: 12,
        contents: []
      } ]
    } ].concat(pairs),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.emptyList = (function emptyList$() {
  /* empty-list src/macros/misc.sibilant:128:0 */

  return "null";
});
sibilant.macros.namespaces.core.debug = (function debug$(val) {
  /* debug src/macros/misc.sibilant:131:0 */

  sibilant.debug = eval(outputFormatter(transpile(val)));
  return null;
});
sibilant.macros.namespaces.core.dots = (function dots$(contents) {
  /* dots src/macros/misc.sibilant:135:0 */

  var contents = Array.prototype.slice.call(arguments, 0);

  return transpile(contents);
});
sibilant.macros.namespaces.core.include = (function include$(files) {
  /* include src/macros/misc.sibilant:150:0 */

  var files = Array.prototype.slice.call(arguments, 0);

  return interleave(files.map((function(file) {
    /* src/macros/misc.sibilant:152:17 */
  
    return sibilant.withDefaultSearchPath((function() {
      /* src/macros/misc.sibilant:154:20 */
    
      return sibilant.include(eval(outputFormatter(transpile(file))));
    }));
  })), "\n");
});
sibilant.macros.namespaces.core.pipe = (function pipe$(calls) {
  /* pipe src/macros/pipe.sibilant:25:0 */

  var calls = Array.prototype.slice.call(arguments, 0);

  return inject(undefined, calls, (function(value, item) {
    /* src/macros/pipe.sibilant:27:15 */
  
    return (function() {
      if (typeof value === "undefined") {
        return item;
      } else {
        return (function() {
          /* src/macros/pipe.sibilant:29:21 */
        
          var cloned = (function() {
            if (node__QUERY(item, "literal", "dots")) {
              return {
                file: "src/macros/pipe.sibilant",
                token: "(",
                type: "expression",
                line: 31,
                col: 39,
                contents: [ item ],
                precedingIgnored: [],
                specials: 0,
                end: undefined,
                closed: true,
                closingIgnored: []
              };
            } else {
              return clone(item);
            }
          }).call(this);
          var placeholder = detect(cloned.contents, (function(node) {
            /* src/macros/pipe.sibilant:35:47 */
          
            return (node__QUERY(node, "otherChar") && "#" === node.token);
          })),
              placeholderIndex = cloned.contents.indexOf(placeholder),
              placeholderBoundaries = (function() {
            if (placeholder) {
              return [ placeholderIndex, (1 + placeholderIndex) ];
            } else {
              return [ 1, 1 ];
            }
          }).call(this);
          return mergeInto(cloned, { contents: cloned.contents.slice(0, placeholderBoundaries[0]).concat([ value ], cloned.contents.slice(placeholderBoundaries[1])) });
        }).call(this);
      }
    }).call(this);
  }));
});
sibilant.macros.namespaces.core["|>"] = sibilant.macros.namespaces.core.pipe;
sibilant.macros.namespaces.core.pipeThunk = (function pipeThunk$(calls) {
  /* pipe-thunk src/macros/pipe.sibilant:55:0 */

  var calls = Array.prototype.slice.call(arguments, 0);

  return {
    file: "src/macros/pipe.sibilant",
    token: "(",
    type: "expression",
    line: 55,
    col: 30,
    contents: [ {
      file: "src/macros/pipe.sibilant",
      token: "thunk",
      type: "literal",
      line: 55,
      col: 31,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, { node: this }, {
      file: "src/macros/pipe.sibilant",
      token: "(",
      type: "expression",
      line: 55,
      col: 52,
      contents: [ {
        file: "src/macros/pipe.sibilant",
        token: "pipe",
        type: "literal",
        line: 55,
        col: 53,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros/pipe.sibilant",
        token: "#0",
        type: "argPlaceholder",
        line: 55,
        col: 58,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/pipe.sibilant",
          token: " ",
          type: "whitespace",
          line: 55,
          col: 57,
          contents: []
        } ]
      } ].concat(calls),
      precedingIgnored: [ {
        file: "src/macros/pipe.sibilant",
        token: " ",
        type: "whitespace",
        line: 55,
        col: 51,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core["#->"] = sibilant.macros.namespaces.core.pipeThunk;
sibilant.macros.namespaces.core.tap = (function tap$(thing, body) {
  /* tap src/macros/pipe.sibilant:65:0 */

  var body = Array.prototype.slice.call(arguments, 1);

  return {
    file: "src/macros/pipe.sibilant",
    token: "(",
    type: "expression",
    line: 66,
    col: 8,
    contents: [ {
      file: "src/macros/pipe.sibilant",
      token: "(",
      type: "expression",
      line: 66,
      col: 9,
      contents: [ {
        file: "src/macros/pipe.sibilant",
        token: "#>",
        type: "otherChar",
        line: 66,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros/pipe.sibilant",
        token: "(",
        type: "expression",
        line: 66,
        col: 13,
        contents: [ {
          file: "src/macros/pipe.sibilant",
          token: "|>",
          type: "otherChar",
          line: 66,
          col: 14,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          file: "src/macros/pipe.sibilant",
          token: "#0",
          type: "argPlaceholder",
          line: 66,
          col: 17,
          contents: [],
          specials: 0,
          precedingIgnored: [ {
            file: "src/macros/pipe.sibilant",
            token: " ",
            type: "whitespace",
            line: 66,
            col: 16,
            contents: []
          } ]
        } ].concat(body),
        precedingIgnored: [ {
          file: "src/macros/pipe.sibilant",
          token: " ",
          type: "whitespace",
          line: 66,
          col: 12,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      }, {
        file: "src/macros/pipe.sibilant",
        token: "#0",
        type: "argPlaceholder",
        line: 66,
        col: 30,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/pipe.sibilant",
          token: " ",
          type: "whitespace",
          line: 66,
          col: 29,
          contents: []
        } ]
      } ],
      precedingIgnored: [],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, thing ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.distribute = (function distribute$(thing, macro, alternatives) {
  /* distribute src/macros/pipe.sibilant:69:0 */

  var alternatives = Array.prototype.slice.call(arguments, 2);

  return {
    file: "src/macros/pipe.sibilant",
    token: "(",
    type: "expression",
    line: 70,
    col: 8,
    contents: [ macro ].concat(map(alternatives, (function(alt) {
      /* src/macros/pipe.sibilant:70:38 */
    
      return (function() {
        if (node__QUERY(alt, "expression")) {
          return {
            file: "src/macros/pipe.sibilant",
            token: "(",
            type: "expression",
            line: 72,
            col: 45,
            contents: [ {
              file: "src/macros/pipe.sibilant",
              token: "|>",
              type: "otherChar",
              line: 72,
              col: 46,
              contents: [],
              specials: 0,
              precedingIgnored: []
            }, thing, alt ],
            precedingIgnored: [],
            specials: 0,
            end: undefined,
            closed: true,
            closingIgnored: []
          };
        } else {
          return {
            file: "src/macros/pipe.sibilant",
            token: "(",
            type: "expression",
            line: 73,
            col: 45,
            contents: [ {
              file: "src/macros/pipe.sibilant",
              token: "|>",
              type: "otherChar",
              line: 73,
              col: 46,
              contents: [],
              specials: 0,
              precedingIgnored: []
            }, thing ].concat(alt),
            precedingIgnored: [],
            specials: 0,
            end: undefined,
            closed: true,
            closingIgnored: []
          };
        }
      }).call(this);
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.zero__QUERY = (function zero__QUERY$(item) {
  /* zero? src/macros/predicates.sibilant:5:0 */

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 5,
    col: 21,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "=",
      type: "otherChar",
      line: 5,
      col: 22,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, item, {
      file: "src/macros/predicates.sibilant",
      token: "0",
      type: "number",
      line: 5,
      col: 30,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: " ",
        type: "whitespace",
        line: 5,
        col: 29,
        contents: []
      } ]
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.empty__QUERY = (function empty__QUERY$(arr) {
  /* empty? src/macros/predicates.sibilant:11:0 */

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 12,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "=",
      type: "otherChar",
      line: 12,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "0",
      type: "number",
      line: 12,
      col: 11,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: " ",
        type: "whitespace",
        line: 12,
        col: 10,
        contents: []
      } ]
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 12,
      col: 13,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "length",
        type: "literal",
        line: 12,
        col: 14,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, arr ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: " ",
        type: "whitespace",
        line: 12,
        col: 12,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.odd__QUERY = (function odd__QUERY$(number) {
  /* odd? src/macros/predicates.sibilant:18:0 */

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 19,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "=",
      type: "otherChar",
      line: 19,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "1",
      type: "number",
      line: 19,
      col: 11,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: " ",
        type: "whitespace",
        line: 19,
        col: 10,
        contents: []
      } ]
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 19,
      col: 13,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "mod",
        type: "literal",
        line: 19,
        col: 14,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, number, {
        file: "src/macros/predicates.sibilant",
        token: "2",
        type: "number",
        line: 19,
        col: 26,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 19,
          col: 25,
          contents: []
        } ]
      } ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: " ",
        type: "whitespace",
        line: 19,
        col: 12,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.even__QUERY = (function even__QUERY$(number) {
  /* even? src/macros/predicates.sibilant:25:0 */

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 26,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "=",
      type: "otherChar",
      line: 26,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "0",
      type: "number",
      line: 26,
      col: 11,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: " ",
        type: "whitespace",
        line: 26,
        col: 10,
        contents: []
      } ]
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 26,
      col: 13,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "mod",
        type: "literal",
        line: 26,
        col: 14,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, number, {
        file: "src/macros/predicates.sibilant",
        token: "2",
        type: "number",
        line: 26,
        col: 26,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 26,
          col: 25,
          contents: []
        } ]
      } ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: " ",
        type: "whitespace",
        line: 26,
        col: 12,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.string__QUERY = (function string__QUERY$(things) {
  /* string? src/macros/predicates.sibilant:30:0 */

  var things = Array.prototype.slice.call(arguments, 0);

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 31,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "and",
      type: "literal",
      line: 31,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(things, (function(thing) {
      /* src/macros/predicates.sibilant:31:29 */
    
      return {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 31,
        col: 40,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: "=",
          type: "otherChar",
          line: 31,
          col: 41,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          file: "src/macros/predicates.sibilant",
          token: "(",
          type: "expression",
          line: 31,
          col: 43,
          contents: [ {
            file: "src/macros/predicates.sibilant",
            token: "typeof",
            type: "literal",
            line: 31,
            col: 44,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, thing ],
          precedingIgnored: [ {
            file: "src/macros/predicates.sibilant",
            token: " ",
            type: "whitespace",
            line: 31,
            col: 42,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        }, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":31,"col":59,"contents":[{"file":"src/macros/predicates.sibilant","token":"string","type":"literal","line":31,"col":60,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":31,"col":58,"contents":[]}]} ],
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      };
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.function__QUERY = (function function__QUERY$(things) {
  /* function? src/macros/predicates.sibilant:37:0 */

  var things = Array.prototype.slice.call(arguments, 0);

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 38,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "and",
      type: "literal",
      line: 38,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(things, (function(thing) {
      /* src/macros/predicates.sibilant:38:29 */
    
      return {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 38,
        col: 40,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: "=",
          type: "otherChar",
          line: 38,
          col: 41,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          file: "src/macros/predicates.sibilant",
          token: "(",
          type: "expression",
          line: 38,
          col: 43,
          contents: [ {
            file: "src/macros/predicates.sibilant",
            token: "typeof",
            type: "literal",
            line: 38,
            col: 44,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, thing ],
          precedingIgnored: [ {
            file: "src/macros/predicates.sibilant",
            token: " ",
            type: "whitespace",
            line: 38,
            col: 42,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        }, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":38,"col":59,"contents":[{"file":"src/macros/predicates.sibilant","token":"function","type":"literal","line":38,"col":60,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":38,"col":58,"contents":[]}]} ],
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      };
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.undefined__QUERY = (function undefined__QUERY$(things) {
  /* undefined? src/macros/predicates.sibilant:45:0 */

  var things = Array.prototype.slice.call(arguments, 0);

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 46,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "and",
      type: "literal",
      line: 46,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(things, (function(thing) {
      /* src/macros/predicates.sibilant:46:29 */
    
      return {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 46,
        col: 40,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: "=",
          type: "otherChar",
          line: 46,
          col: 41,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          file: "src/macros/predicates.sibilant",
          token: "(",
          type: "expression",
          line: 46,
          col: 43,
          contents: [ {
            file: "src/macros/predicates.sibilant",
            token: "typeof",
            type: "literal",
            line: 46,
            col: 44,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, thing ],
          precedingIgnored: [ {
            file: "src/macros/predicates.sibilant",
            token: " ",
            type: "whitespace",
            line: 46,
            col: 42,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        }, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":46,"col":59,"contents":[{"file":"src/macros/predicates.sibilant","token":"undefined","type":"literal","line":46,"col":60,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":46,"col":58,"contents":[]}]} ],
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      };
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.defined__QUERY = (function defined__QUERY$(things) {
  /* defined? src/macros/predicates.sibilant:53:0 */

  var things = Array.prototype.slice.call(arguments, 0);

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 54,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "and",
      type: "literal",
      line: 54,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(things, (function(thing) {
      /* src/macros/predicates.sibilant:54:29 */
    
      return {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 54,
        col: 40,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: "!=",
          type: "otherChar",
          line: 54,
          col: 41,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          file: "src/macros/predicates.sibilant",
          token: "(",
          type: "expression",
          line: 54,
          col: 44,
          contents: [ {
            file: "src/macros/predicates.sibilant",
            token: "typeof",
            type: "literal",
            line: 54,
            col: 45,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, thing ],
          precedingIgnored: [ {
            file: "src/macros/predicates.sibilant",
            token: " ",
            type: "whitespace",
            line: 54,
            col: 43,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        }, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":54,"col":60,"contents":[{"file":"src/macros/predicates.sibilant","token":"undefined","type":"literal","line":54,"col":61,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":54,"col":59,"contents":[]}]} ],
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      };
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.number__QUERY = (function number__QUERY$(things) {
  /* number? src/macros/predicates.sibilant:61:0 */

  var things = Array.prototype.slice.call(arguments, 0);

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 62,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "and",
      type: "literal",
      line: 62,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    } ].concat(map(things, (function(thing) {
      /* src/macros/predicates.sibilant:62:29 */
    
      return {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 62,
        col: 40,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: "=",
          type: "otherChar",
          line: 62,
          col: 41,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          file: "src/macros/predicates.sibilant",
          token: "(",
          type: "expression",
          line: 62,
          col: 43,
          contents: [ {
            file: "src/macros/predicates.sibilant",
            token: "typeof",
            type: "literal",
            line: 62,
            col: 44,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, thing ],
          precedingIgnored: [ {
            file: "src/macros/predicates.sibilant",
            token: " ",
            type: "whitespace",
            line: 62,
            col: 42,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        }, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":62,"col":59,"contents":[{"file":"src/macros/predicates.sibilant","token":"number","type":"literal","line":62,"col":60,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":62,"col":58,"contents":[]}]} ],
        precedingIgnored: [],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      };
    }))),
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.array__QUERY = (function array__QUERY$(thing) {
  /* array? src/macros/predicates.sibilant:70:0 */

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 71,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "and",
      type: "literal",
      line: 71,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, thing, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 73,
      col: 9,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "=",
        type: "otherChar",
        line: 73,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":73,"col":12,"contents":[{"file":"src/macros/predicates.sibilant","token":"object","type":"literal","line":73,"col":13,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":73,"col":11,"contents":[]}]}, {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 73,
        col: 20,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: "typeof",
          type: "literal",
          line: 73,
          col: 21,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, thing ],
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 73,
          col: 19,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      } ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: "\n",
        type: "newline",
        line: 72,
        col: 15,
        contents: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "         ",
        type: "whitespace",
        line: 73,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 74,
      col: 9,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "=",
        type: "otherChar",
        line: 74,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":74,"col":12,"contents":[{"file":"src/macros/predicates.sibilant","token":"Array","type":"literal","line":74,"col":13,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":74,"col":11,"contents":[]}]}, {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 74,
        col: 19,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: "get",
          type: "literal",
          line: 74,
          col: 20,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, thing, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":74,"col":31,"contents":[{"file":"src/macros/predicates.sibilant","token":"constructor","type":"literal","line":74,"col":32,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":74,"col":30,"contents":[]}]}, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":74,"col":44,"contents":[{"file":"src/macros/predicates.sibilant","token":"name","type":"literal","line":74,"col":45,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":74,"col":43,"contents":[]}]} ],
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 74,
          col: 18,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      } ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: "\n",
        type: "newline",
        line: 73,
        col: 36,
        contents: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "         ",
        type: "whitespace",
        line: 74,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.list__QUERY = sibilant.macros.namespaces.core.array__QUERY;
sibilant.macros.namespaces.core.hash__QUERY = (function hash__QUERY$(thing) {
  /* hash? src/macros/predicates.sibilant:83:0 */

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 84,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "and",
      type: "literal",
      line: 84,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 84,
      col: 13,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "=",
        type: "otherChar",
        line: 84,
        col: 14,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":84,"col":16,"contents":[{"file":"src/macros/predicates.sibilant","token":"object","type":"literal","line":84,"col":17,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":84,"col":15,"contents":[]}]}, {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 84,
        col: 24,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: "typeof",
          type: "literal",
          line: 84,
          col: 25,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, thing ],
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 84,
          col: 23,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      } ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: " ",
        type: "whitespace",
        line: 84,
        col: 12,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 85,
      col: 13,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "!=",
        type: "otherChar",
        line: 85,
        col: 14,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, thing, {
        file: "src/macros/predicates.sibilant",
        token: "null",
        type: "literal",
        line: 85,
        col: 24,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 85,
          col: 23,
          contents: []
        } ]
      } ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: "\n",
        type: "newline",
        line: 84,
        col: 40,
        contents: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "             ",
        type: "whitespace",
        line: 85,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 86,
      col: 13,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "!=",
        type: "otherChar",
        line: 86,
        col: 14,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 86,
        col: 17,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: "get",
          type: "literal",
          line: 86,
          col: 18,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, thing, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":86,"col":29,"contents":[{"file":"src/macros/predicates.sibilant","token":"constructor","type":"literal","line":86,"col":30,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":86,"col":28,"contents":[]}]}, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":86,"col":42,"contents":[{"file":"src/macros/predicates.sibilant","token":"name","type":"literal","line":86,"col":43,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":86,"col":41,"contents":[]}]} ],
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 86,
          col: 16,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      }, {"file":"src/macros/predicates.sibilant","token":"'","type":"tick","line":86,"col":49,"contents":[{"file":"src/macros/predicates.sibilant","token":"Array","type":"literal","line":86,"col":50,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/predicates.sibilant","token":" ","type":"whitespace","line":86,"col":48,"contents":[]}]} ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: "\n",
        type: "newline",
        line: 85,
        col: 29,
        contents: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "             ",
        type: "whitespace",
        line: 86,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.object__QUERY = sibilant.macros.namespaces.core.hash__QUERY;
sibilant.macros.namespaces.core.instanceOf__QUERY = (function instanceOf__QUERY$(item, type) {
  /* instance-of? src/macros/predicates.sibilant:93:0 */

  return "(transpile(item)\" instanceof \"transpile(type))";
});
sibilant.macros.namespaces.core.exists__QUERY = (function exists__QUERY$(thing) {
  /* exists? src/macros/predicates.sibilant:101:0 */

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 102,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "and",
      type: "literal",
      line: 102,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 102,
      col: 13,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "defined?",
        type: "literal",
        line: 102,
        col: 14,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, thing ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: " ",
        type: "whitespace",
        line: 102,
        col: 12,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 102,
      col: 31,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "!=",
        type: "otherChar",
        line: 102,
        col: 32,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, thing, {
        file: "src/macros/predicates.sibilant",
        token: "null",
        type: "literal",
        line: 102,
        col: 42,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 102,
          col: 41,
          contents: []
        } ]
      } ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: " ",
        type: "whitespace",
        line: 102,
        col: 30,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.hasKey__QUERY = (function hasKey__QUERY$(object, key) {
  /* has-key? src/macros/predicates.sibilant:109:0 */

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 110,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: ".",
      type: "dots",
      line: 110,
      col: 9,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "has-own-property",
        type: "literal",
        line: 110,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ],
      precedingIgnored: []
    }, object, key ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.lowerCase__QUERY = (function lowerCase__QUERY$(str) {
  /* lower-case? src/macros/predicates.sibilant:115:0 */

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 116,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "and",
      type: "literal",
      line: 116,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 117,
      col: 9,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "!=",
        type: "otherChar",
        line: 117,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 117,
        col: 13,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: ".",
          type: "dots",
          line: 117,
          col: 14,
          contents: [ {
            file: "src/macros/predicates.sibilant",
            token: "to-upper-case",
            type: "literal",
            line: 117,
            col: 15,
            contents: [],
            specials: 0,
            precedingIgnored: []
          } ],
          precedingIgnored: []
        }, str ],
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 117,
          col: 12,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      }, str ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: "\n",
        type: "newline",
        line: 116,
        col: 12,
        contents: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "         ",
        type: "whitespace",
        line: 117,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 118,
      col: 9,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "=",
        type: "otherChar",
        line: 118,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 118,
        col: 12,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: ".",
          type: "dots",
          line: 118,
          col: 13,
          contents: [ {
            file: "src/macros/predicates.sibilant",
            token: "to-lower-case",
            type: "literal",
            line: 118,
            col: 14,
            contents: [],
            specials: 0,
            precedingIgnored: []
          } ],
          precedingIgnored: []
        }, str ],
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 118,
          col: 11,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      }, str ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: "\n",
        type: "newline",
        line: 117,
        col: 40,
        contents: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "         ",
        type: "whitespace",
        line: 118,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.upperCase__QUERY = (function upperCase__QUERY$(str) {
  /* upper-case? src/macros/predicates.sibilant:125:0 */

  return {
    file: "src/macros/predicates.sibilant",
    token: "(",
    type: "expression",
    line: 126,
    col: 8,
    contents: [ {
      file: "src/macros/predicates.sibilant",
      token: "and",
      type: "literal",
      line: 126,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 127,
      col: 9,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "!=",
        type: "otherChar",
        line: 127,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 127,
        col: 13,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: ".",
          type: "dots",
          line: 127,
          col: 14,
          contents: [ {
            file: "src/macros/predicates.sibilant",
            token: "to-lower-case",
            type: "literal",
            line: 127,
            col: 15,
            contents: [],
            specials: 0,
            precedingIgnored: []
          } ],
          precedingIgnored: []
        }, str ],
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 127,
          col: 12,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      }, str ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: "\n",
        type: "newline",
        line: 126,
        col: 12,
        contents: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "         ",
        type: "whitespace",
        line: 127,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros/predicates.sibilant",
      token: "(",
      type: "expression",
      line: 128,
      col: 9,
      contents: [ {
        file: "src/macros/predicates.sibilant",
        token: "=",
        type: "otherChar",
        line: 128,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "(",
        type: "expression",
        line: 128,
        col: 12,
        contents: [ {
          file: "src/macros/predicates.sibilant",
          token: ".",
          type: "dots",
          line: 128,
          col: 13,
          contents: [ {
            file: "src/macros/predicates.sibilant",
            token: "to-upper-case",
            type: "literal",
            line: 128,
            col: 14,
            contents: [],
            specials: 0,
            precedingIgnored: []
          } ],
          precedingIgnored: []
        }, str ],
        precedingIgnored: [ {
          file: "src/macros/predicates.sibilant",
          token: " ",
          type: "whitespace",
          line: 128,
          col: 11,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      }, str ],
      precedingIgnored: [ {
        file: "src/macros/predicates.sibilant",
        token: "\n",
        type: "newline",
        line: 127,
        col: 40,
        contents: []
      }, {
        file: "src/macros/predicates.sibilant",
        token: "         ",
        type: "whitespace",
        line: 128,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.match__QUERY = (function match__QUERY$(regexp, string) {
  /* match? src/macros/regex.sibilant:6:0 */

  return {
    file: "src/macros/regex.sibilant",
    token: "(",
    type: "expression",
    line: 7,
    col: 8,
    contents: [ {
      file: "src/macros/regex.sibilant",
      token: ".",
      type: "dots",
      line: 7,
      col: 9,
      contents: [ {
        file: "src/macros/regex.sibilant",
        token: "match",
        type: "literal",
        line: 7,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ],
      precedingIgnored: []
    }, string, regexp ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.matchRegex__QUERY = (function matchRegex__QUERY$(string, pattern, flags) {
  /* match-regex? src/macros/regex.sibilant:12:0 */

  return {
    file: "src/macros/regex.sibilant",
    token: "(",
    type: "expression",
    line: 13,
    col: 8,
    contents: [ {
      file: "src/macros/regex.sibilant",
      token: "match?",
      type: "literal",
      line: 13,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/regex.sibilant",
      token: "(",
      type: "expression",
      line: 13,
      col: 16,
      contents: [ {
        file: "src/macros/regex.sibilant",
        token: "regex",
        type: "literal",
        line: 13,
        col: 17,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, pattern, flags ],
      precedingIgnored: [ {
        file: "src/macros/regex.sibilant",
        token: " ",
        type: "whitespace",
        line: 13,
        col: 15,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, string ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.replace = (function replace$(string, pattern, replacement) {
  /* replace src/macros/regex.sibilant:19:0 */

  return {
    file: "src/macros/regex.sibilant",
    token: "(",
    type: "expression",
    line: 20,
    col: 8,
    contents: [ {
      file: "src/macros/regex.sibilant",
      token: ".",
      type: "dots",
      line: 20,
      col: 9,
      contents: [ {
        file: "src/macros/regex.sibilant",
        token: "replace",
        type: "literal",
        line: 20,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ],
      precedingIgnored: []
    }, string, {
      file: "src/macros/regex.sibilant",
      token: "(",
      type: "expression",
      line: 21,
      col: 14,
      contents: [ {
        file: "src/macros/regex.sibilant",
        token: "regex",
        type: "literal",
        line: 21,
        col: 15,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, pattern ],
      precedingIgnored: [ {
        file: "src/macros/regex.sibilant",
        token: "\n",
        type: "newline",
        line: 20,
        col: 25,
        contents: []
      }, {
        file: "src/macros/regex.sibilant",
        token: "              ",
        type: "whitespace",
        line: 21,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, replacement ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.replaceAll = (function replaceAll$(string, pattern, replacement) {
  /* replace-all src/macros/regex.sibilant:27:0 */

  return {
    file: "src/macros/regex.sibilant",
    token: "(",
    type: "expression",
    line: 28,
    col: 8,
    contents: [ {
      file: "src/macros/regex.sibilant",
      token: ".",
      type: "dots",
      line: 28,
      col: 9,
      contents: [ {
        file: "src/macros/regex.sibilant",
        token: "replace",
        type: "literal",
        line: 28,
        col: 10,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ],
      precedingIgnored: []
    }, string, {
      file: "src/macros/regex.sibilant",
      token: "(",
      type: "expression",
      line: 28,
      col: 26,
      contents: [ {
        file: "src/macros/regex.sibilant",
        token: "regex",
        type: "literal",
        line: 28,
        col: 27,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, pattern, {"file":"src/macros/regex.sibilant","token":"'","type":"tick","line":28,"col":42,"contents":[{"file":"src/macros/regex.sibilant","token":"g","type":"literal","line":28,"col":43,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros/regex.sibilant","token":" ","type":"whitespace","line":28,"col":41,"contents":[]}]} ],
      precedingIgnored: [ {
        file: "src/macros/regex.sibilant",
        token: " ",
        type: "whitespace",
        line: 28,
        col: 25,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, replacement ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.regex = (function regex$(pattern, flags) {
  /* regex src/macros/regex.sibilant:33:0 */

  return {
    file: "src/macros/regex.sibilant",
    token: "(",
    type: "expression",
    line: 34,
    col: 8,
    contents: [ {
      file: "src/macros/regex.sibilant",
      token: "new",
      type: "literal",
      line: 34,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros/regex.sibilant",
      token: "RegExp",
      type: "literal",
      line: 34,
      col: 13,
      contents: [],
      specials: 0,
      precedingIgnored: [ {
        file: "src/macros/regex.sibilant",
        token: " ",
        type: "whitespace",
        line: 34,
        col: 12,
        contents: []
      } ]
    }, pattern, (flags || "undefined") ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});
sibilant.macros.namespaces.core.switch = (function switch$(obj, cases) {
  /* switch src/macros/switch.sibilant:13:0 */

  var cases = Array.prototype.slice.call(arguments, 1);

  return [ "(function() {", indent([ "switch(", transpile(obj), ") {", map(cases, (function(caseDef) {
    /* src/macros/switch.sibilant:16:30 */
  
    var caseNameNode = caseDef.contents[0],
        caseLabels = (function() {
      if (node__QUERY(caseNameNode, "expression", "bracket")) {
        return caseNameNode.contents;
      } else {
        return [ caseNameNode ];
      }
    }).call(this),
        caseString = interleave("\n", map(caseLabels, (function(c) {
      /* src/macros/switch.sibilant:22:78 */
    
      return (function() {
        if ("default" === c.token) {
          return "default:";
        } else {
          return [ "case ", transpile(c), ":" ];
        }
      }).call(this);
    })));
    return [ "\n", caseString, indent({
      file: "src/macros/switch.sibilant",
      token: "(",
      type: "expression",
      line: 26,
      col: 59,
      contents: [ {
        file: "src/macros/switch.sibilant",
        token: "do",
        type: "literal",
        line: 26,
        col: 60,
        contents: [],
        specials: 0,
        precedingIgnored: []
      } ].concat(caseDef.contents.slice(1)),
      precedingIgnored: [],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }) ];
  })), "}" ]), "}).call(this)" ];
});
sibilant.macros.namespaces.core.var = (function var$(pairs) {
  /* var src/macros/variables.sibilant:15:0 */

  var pairs = Array.prototype.slice.call(arguments, 0);

  return asStatement([ "var ", interleave(map(destructure(pairs), (function(pair) {
    /* src/macros/variables.sibilant:19:25 */
  
    return [ pair[0], " = ", pair[1] ];
  })), ",\n    ") ]);
});
sibilant.macros.namespaces.core.assign = (function assign$(pairs) {
  /* assign src/macros/variables.sibilant:38:0 */

  var pairs = Array.prototype.slice.call(arguments, 0);

  return interleave(map(destructure(pairs), (function(pair) {
    /* src/macros/variables.sibilant:41:17 */
  
    return asStatement([ pair[0], " = ", pair[1] ]);
  })), "\n");
});
sibilant.macros.namespaces.core.default = (function default$(pairs) {
  /* default src/macros/variables.sibilant:49:0 */

  var pairs = Array.prototype.slice.call(arguments, 0);

  return interleave("\n", bulkMap(pairs, (function(name, value) {
    /* src/macros/variables.sibilant:50:40 */
  
    return {
      file: "src/macros/variables.sibilant",
      token: "(",
      type: "expression",
      line: 51,
      col: 35,
      contents: [ {
        file: "src/macros/variables.sibilant",
        token: "assign",
        type: "literal",
        line: 51,
        col: 36,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, name, {
        file: "src/macros/variables.sibilant",
        token: "(",
        type: "expression",
        line: 51,
        col: 49,
        contents: [ {
          file: "src/macros/variables.sibilant",
          token: "ternary",
          type: "literal",
          line: 51,
          col: 50,
          contents: [],
          specials: 0,
          precedingIgnored: []
        }, {
          file: "src/macros/variables.sibilant",
          token: "(",
          type: "expression",
          line: 51,
          col: 58,
          contents: [ {
            file: "src/macros/variables.sibilant",
            token: "defined?",
            type: "literal",
            line: 51,
            col: 59,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, name ],
          precedingIgnored: [ {
            file: "src/macros/variables.sibilant",
            token: " ",
            type: "whitespace",
            line: 51,
            col: 57,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        }, name, value ],
        precedingIgnored: [ {
          file: "src/macros/variables.sibilant",
          token: " ",
          type: "whitespace",
          line: 51,
          col: 48,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: []
      } ],
      precedingIgnored: [],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    };
  })));
});
sibilant.macros.namespaces.core.addToModuleLookup = (function addToModuleLookup$(path) {
  /* add-to-module-lookup src/macros.sibilant:18:0 */

  return {
    file: "src/macros.sibilant",
    token: "(",
    type: "expression",
    line: 19,
    col: 8,
    contents: [ {
      file: "src/macros.sibilant",
      token: "scoped",
      type: "literal",
      line: 19,
      col: 9,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "src/macros.sibilant",
      token: "(",
      type: "expression",
      line: 19,
      col: 16,
      contents: [ {
        file: "src/macros.sibilant",
        token: "require!",
        type: "literal",
        line: 19,
        col: 17,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {"file":"src/macros.sibilant","token":"'","type":"tick","line":19,"col":26,"contents":[{"file":"src/macros.sibilant","token":"path","type":"literal","line":19,"col":27,"contents":[],"specials":0,"precedingIgnored":[]}],"precedingIgnored":[{"file":"src/macros.sibilant","token":" ","type":"whitespace","line":19,"col":25,"contents":[]}]} ],
      precedingIgnored: [ {
        file: "src/macros.sibilant",
        token: " ",
        type: "whitespace",
        line: 19,
        col: 15,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros.sibilant",
      token: "(",
      type: "expression",
      line: 20,
      col: 16,
      contents: [ {
        file: "src/macros.sibilant",
        token: "var",
        type: "literal",
        line: 20,
        col: 17,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros.sibilant",
        token: "p",
        type: "literal",
        line: 20,
        col: 21,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros.sibilant",
          token: " ",
          type: "whitespace",
          line: 20,
          col: 20,
          contents: []
        } ]
      }, {
        file: "src/macros.sibilant",
        token: "\"/\"",
        type: "string",
        line: 20,
        col: 23,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros.sibilant",
          token: " ",
          type: "whitespace",
          line: 20,
          col: 22,
          contents: []
        } ]
      }, {
        file: "src/macros.sibilant",
        token: "inc",
        type: "literal",
        line: 21,
        col: 21,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros.sibilant",
          token: "\n",
          type: "newline",
          line: 20,
          col: 26,
          contents: []
        }, {
          file: "src/macros.sibilant",
          token: "                     ",
          type: "whitespace",
          line: 21,
          col: 0,
          contents: []
        } ]
      }, (path || process.cwd()) ],
      precedingIgnored: [ {
        file: "src/macros.sibilant",
        token: "\n",
        type: "newline",
        line: 19,
        col: 32,
        contents: []
      }, {
        file: "src/macros.sibilant",
        token: "                ",
        type: "whitespace",
        line: 20,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }, {
      file: "src/macros.sibilant",
      token: "(",
      type: "expression",
      line: 22,
      col: 16,
      contents: [ {
        file: "src/macros.sibilant",
        token: "assign",
        type: "literal",
        line: 22,
        col: 17,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, {
        file: "src/macros.sibilant",
        token: "module.paths",
        type: "literal",
        line: 22,
        col: 24,
        contents: [],
        specials: 0,
        precedingIgnored: [ {
          file: "src/macros.sibilant",
          token: " ",
          type: "whitespace",
          line: 22,
          col: 23,
          contents: []
        } ]
      }, {
        file: "src/macros.sibilant",
        token: "[",
        type: "bracket",
        line: 22,
        col: 37,
        contents: [ {
          file: "src/macros.sibilant",
          token: "...",
          type: "dots",
          line: 23,
          col: 24,
          contents: [ {
            file: "src/macros.sibilant",
            token: "module.paths",
            type: "literal",
            line: 23,
            col: 27,
            contents: [],
            specials: 0,
            precedingIgnored: []
          } ],
          precedingIgnored: [ {
            file: "src/macros.sibilant",
            token: "\n",
            type: "newline",
            line: 22,
            col: 38,
            contents: []
          }, {
            file: "src/macros.sibilant",
            token: "                        ",
            type: "whitespace",
            line: 23,
            col: 0,
            contents: []
          } ]
        }, {
          file: "src/macros.sibilant",
          token: "...",
          type: "dots",
          line: 24,
          col: 24,
          contents: [ {
            file: "src/macros.sibilant",
            token: "(",
            type: "expression",
            line: 24,
            col: 27,
            contents: [ {
              file: "src/macros.sibilant",
              token: ".",
              type: "dots",
              line: 24,
              col: 28,
              contents: [ {
                file: "src/macros.sibilant",
                token: "map",
                type: "literal",
                line: 24,
                col: 29,
                contents: [],
                specials: 0,
                precedingIgnored: []
              } ],
              precedingIgnored: []
            }, {
              file: "src/macros.sibilant",
              token: "(",
              type: "expression",
              line: 24,
              col: 33,
              contents: [ {
                file: "src/macros.sibilant",
                token: ".",
                type: "dots",
                line: 24,
                col: 34,
                contents: [ {
                  file: "src/macros.sibilant",
                  token: "split",
                  type: "literal",
                  line: 24,
                  col: 35,
                  contents: [],
                  specials: 0,
                  precedingIgnored: []
                } ],
                precedingIgnored: []
              }, {
                file: "src/macros.sibilant",
                token: "inc",
                type: "literal",
                line: 24,
                col: 41,
                contents: [],
                specials: 0,
                precedingIgnored: [ {
                  file: "src/macros.sibilant",
                  token: " ",
                  type: "whitespace",
                  line: 24,
                  col: 40,
                  contents: []
                } ]
              }, {
                file: "src/macros.sibilant",
                token: "path.sep",
                type: "literal",
                line: 24,
                col: 45,
                contents: [],
                specials: 0,
                precedingIgnored: [ {
                  file: "src/macros.sibilant",
                  token: " ",
                  type: "whitespace",
                  line: 24,
                  col: 44,
                  contents: []
                } ]
              } ],
              precedingIgnored: [ {
                file: "src/macros.sibilant",
                token: " ",
                type: "whitespace",
                line: 24,
                col: 32,
                contents: []
              } ],
              specials: 0,
              end: undefined,
              closed: true,
              closingIgnored: []
            }, {
              file: "src/macros.sibilant",
              token: "(",
              type: "expression",
              line: 25,
              col: 33,
              contents: [ {
                file: "src/macros.sibilant",
                token: "lambda",
                type: "literal",
                line: 25,
                col: 34,
                contents: [],
                specials: 0,
                precedingIgnored: []
              }, {
                file: "src/macros.sibilant",
                token: "(",
                type: "expression",
                line: 25,
                col: 41,
                contents: [ {
                  file: "src/macros.sibilant",
                  token: "el",
                  type: "literal",
                  line: 25,
                  col: 42,
                  contents: [],
                  specials: 0,
                  precedingIgnored: []
                } ],
                precedingIgnored: [ {
                  file: "src/macros.sibilant",
                  token: " ",
                  type: "whitespace",
                  line: 25,
                  col: 40,
                  contents: []
                } ],
                specials: 0,
                end: undefined,
                closed: true,
                closingIgnored: []
              }, {
                file: "src/macros.sibilant",
                token: "(",
                type: "expression",
                line: 26,
                col: 35,
                contents: [ {
                  file: "src/macros.sibilant",
                  token: "var",
                  type: "literal",
                  line: 26,
                  col: 36,
                  contents: [],
                  specials: 0,
                  precedingIgnored: []
                }, {
                  file: "src/macros.sibilant",
                  token: "r",
                  type: "literal",
                  line: 26,
                  col: 40,
                  contents: [],
                  specials: 0,
                  precedingIgnored: [ {
                    file: "src/macros.sibilant",
                    token: " ",
                    type: "whitespace",
                    line: 26,
                    col: 39,
                    contents: []
                  } ]
                }, {
                  file: "src/macros.sibilant",
                  token: "(",
                  type: "expression",
                  line: 26,
                  col: 42,
                  contents: [ {
                    file: "src/macros.sibilant",
                    token: "path.join",
                    type: "literal",
                    line: 26,
                    col: 43,
                    contents: [],
                    specials: 0,
                    precedingIgnored: []
                  }, {
                    file: "src/macros.sibilant",
                    token: "p",
                    type: "literal",
                    line: 26,
                    col: 53,
                    contents: [],
                    specials: 0,
                    precedingIgnored: [ {
                      file: "src/macros.sibilant",
                      token: " ",
                      type: "whitespace",
                      line: 26,
                      col: 52,
                      contents: []
                    } ]
                  }, {
                    file: "src/macros.sibilant",
                    token: "\"node_modules\"",
                    type: "string",
                    line: 26,
                    col: 55,
                    contents: [],
                    specials: 0,
                    precedingIgnored: [ {
                      file: "src/macros.sibilant",
                      token: " ",
                      type: "whitespace",
                      line: 26,
                      col: 54,
                      contents: []
                    } ]
                  } ],
                  precedingIgnored: [ {
                    file: "src/macros.sibilant",
                    token: " ",
                    type: "whitespace",
                    line: 26,
                    col: 41,
                    contents: []
                  } ],
                  specials: 0,
                  end: undefined,
                  closed: true,
                  closingIgnored: []
                } ],
                precedingIgnored: [ {
                  file: "src/macros.sibilant",
                  token: "\n",
                  type: "newline",
                  line: 25,
                  col: 45,
                  contents: []
                }, {
                  file: "src/macros.sibilant",
                  token: "                                   ",
                  type: "whitespace",
                  line: 26,
                  col: 0,
                  contents: []
                } ],
                specials: 0,
                end: undefined,
                closed: true,
                closingIgnored: []
              }, {
                file: "src/macros.sibilant",
                token: "(",
                type: "expression",
                line: 27,
                col: 35,
                contents: [ {
                  file: "src/macros.sibilant",
                  token: "assign",
                  type: "literal",
                  line: 27,
                  col: 36,
                  contents: [],
                  specials: 0,
                  precedingIgnored: []
                }, {
                  file: "src/macros.sibilant",
                  token: "p",
                  type: "literal",
                  line: 27,
                  col: 43,
                  contents: [],
                  specials: 0,
                  precedingIgnored: [ {
                    file: "src/macros.sibilant",
                    token: " ",
                    type: "whitespace",
                    line: 27,
                    col: 42,
                    contents: []
                  } ]
                }, {
                  file: "src/macros.sibilant",
                  token: "(",
                  type: "expression",
                  line: 27,
                  col: 45,
                  contents: [ {
                    file: "src/macros.sibilant",
                    token: "path.join",
                    type: "literal",
                    line: 27,
                    col: 46,
                    contents: [],
                    specials: 0,
                    precedingIgnored: []
                  }, {
                    file: "src/macros.sibilant",
                    token: "p",
                    type: "literal",
                    line: 27,
                    col: 56,
                    contents: [],
                    specials: 0,
                    precedingIgnored: [ {
                      file: "src/macros.sibilant",
                      token: " ",
                      type: "whitespace",
                      line: 27,
                      col: 55,
                      contents: []
                    } ]
                  }, {
                    file: "src/macros.sibilant",
                    token: "el",
                    type: "literal",
                    line: 27,
                    col: 58,
                    contents: [],
                    specials: 0,
                    precedingIgnored: [ {
                      file: "src/macros.sibilant",
                      token: " ",
                      type: "whitespace",
                      line: 27,
                      col: 57,
                      contents: []
                    } ]
                  } ],
                  precedingIgnored: [ {
                    file: "src/macros.sibilant",
                    token: " ",
                    type: "whitespace",
                    line: 27,
                    col: 44,
                    contents: []
                  } ],
                  specials: 0,
                  end: undefined,
                  closed: true,
                  closingIgnored: []
                } ],
                precedingIgnored: [ {
                  file: "src/macros.sibilant",
                  token: "\n",
                  type: "newline",
                  line: 26,
                  col: 71,
                  contents: []
                }, {
                  file: "src/macros.sibilant",
                  token: "                                   ",
                  type: "whitespace",
                  line: 27,
                  col: 0,
                  contents: []
                } ],
                specials: 0,
                end: undefined,
                closed: true,
                closingIgnored: []
              }, {
                file: "src/macros.sibilant",
                token: "r",
                type: "literal",
                line: 27,
                col: 63,
                contents: [],
                specials: 0,
                precedingIgnored: [ {
                  file: "src/macros.sibilant",
                  token: " ",
                  type: "whitespace",
                  line: 27,
                  col: 62,
                  contents: []
                } ]
              } ],
              precedingIgnored: [ {
                file: "src/macros.sibilant",
                token: "\n",
                type: "newline",
                line: 24,
                col: 54,
                contents: []
              }, {
                file: "src/macros.sibilant",
                token: "                                 ",
                type: "whitespace",
                line: 25,
                col: 0,
                contents: []
              } ],
              specials: 0,
              end: undefined,
              closed: true,
              closingIgnored: []
            } ],
            precedingIgnored: [],
            specials: 0,
            end: undefined,
            closed: true,
            closingIgnored: []
          } ],
          precedingIgnored: [ {
            file: "src/macros.sibilant",
            token: "\n",
            type: "newline",
            line: 23,
            col: 39,
            contents: []
          }, {
            file: "src/macros.sibilant",
            token: "                        ",
            type: "whitespace",
            line: 24,
            col: 0,
            contents: []
          } ]
        }, {
          file: "src/macros.sibilant",
          token: "(",
          type: "expression",
          line: 28,
          col: 24,
          contents: [ {
            file: "src/macros.sibilant",
            token: "path.join",
            type: "literal",
            line: 28,
            col: 25,
            contents: [],
            specials: 0,
            precedingIgnored: []
          }, {
            file: "src/macros.sibilant",
            token: "inc",
            type: "literal",
            line: 28,
            col: 35,
            contents: [],
            specials: 0,
            precedingIgnored: [ {
              file: "src/macros.sibilant",
              token: " ",
              type: "whitespace",
              line: 28,
              col: 34,
              contents: []
            } ]
          }, {
            file: "src/macros.sibilant",
            token: "\"node_modules\"",
            type: "string",
            line: 28,
            col: 39,
            contents: [],
            specials: 0,
            precedingIgnored: [ {
              file: "src/macros.sibilant",
              token: " ",
              type: "whitespace",
              line: 28,
              col: 38,
              contents: []
            } ]
          } ],
          precedingIgnored: [ {
            file: "src/macros.sibilant",
            token: "\n",
            type: "newline",
            line: 27,
            col: 66,
            contents: []
          }, {
            file: "src/macros.sibilant",
            token: "                        ",
            type: "whitespace",
            line: 28,
            col: 0,
            contents: []
          } ],
          specials: 0,
          end: undefined,
          closed: true,
          closingIgnored: []
        } ],
        precedingIgnored: [ {
          file: "src/macros.sibilant",
          token: " ",
          type: "whitespace",
          line: 22,
          col: 36,
          contents: []
        } ],
        specials: 0,
        end: undefined,
        closed: true,
        closingIgnored: [ {
          file: "src/macros.sibilant",
          token: "\n",
          type: "newline",
          line: 28,
          col: 54,
          contents: []
        }, {
          file: "src/macros.sibilant",
          token: "                        ",
          type: "whitespace",
          line: 29,
          col: 0,
          contents: []
        } ]
      } ],
      precedingIgnored: [ {
        file: "src/macros.sibilant",
        token: "\n",
        type: "newline",
        line: 21,
        col: 50,
        contents: []
      }, {
        file: "src/macros.sibilant",
        token: "                ",
        type: "whitespace",
        line: 22,
        col: 0,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  };
});