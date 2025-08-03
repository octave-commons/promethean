var acceptablePairs = {
  "(": ")",
  "[": "]",
  "{": "}"
},
    bracketTypes = {
  "(": "expression",
  "[": "bracket",
  "{": "brace"
};
var restructure = (function restructure$(input) {
  /* restructure src/restructurer.sibilant:6:0 */

  var output = {
    type: "root",
    contents: [],
    file: sibilant.file,
    col: 0,
    line: 1
  },
      context = {
    parseStack: [ output ],
    output: output,
    input: input,
    ignoredNodes: [],
    specials: 0
  };
  inject(context, input, restructurers);
  (function() {
    if (!(1 === context.parseStack.length)) {
      var unclosedNode = context.parseStack[0];
      throw (new Error(("unclosed node at " + unclosedNode.file + ":" + unclosedNode.line + ":" + unclosedNode.col + "\n  " + prettify(unclosedNode, false).slice(0, 100))))
    }
  }).call(this);
  return output;
});
var restructurers = (function restructurers$(context, node) {
  /* restructurers src/restructurer.sibilant:29:0 */

  var restructurer = (restructurers[node.type] || restructurers.default);
  return restructurer(node, context);
});
sibilant.restructure = restructure;
restructurers.head = (function restructurers$head$(node, context) {
  /* restructurers.head src/restructurer.sibilant:35:0 */

  var head = mergeWith(node, {
    token: node.token.slice(0, -1),
    type: "literal"
  }),
      expression = mergeWith(node, {
    token: "(",
    type: "openExpression"
  });
  return restructurers(restructurers(context, expression), head);
});
restructurers.openExpression = (function restructurers$openExpression$(node, context) {
  /* restructurers.open-expression src/restructurer.sibilant:45:0 */

  var first = context.parseStack[0];
  node.contents = [];
  node.type = bracketTypes[node.token];
  acceptIgnoredNodes(node, context);
  acceptSpecials(node, context);
  first.contents.push(node);
  context.parseStack.unshift(node);
  return context;
});
restructurers.closeExpression = (function restructurers$closeExpression$(node, context) {
  /* restructurers.close-expression src/restructurer.sibilant:57:0 */

  var first = context.parseStack[0];
  (function() {
    if (node__QUERY(first, "root")) {
      throw (new Error(("unexpected " + node.token + " on " + node.file + ":" + node.line + ":" + node.col)))
    }
  }).call(this);
  (function() {
    if (acceptablePairs[first.token] !== node.token) {
      throw (new Error(("trying to close " + yellow(sibilant.prettyPrint(first)) + "\n   on " + first.file + ":" + first.line + ":" + first.col + "\n   with " + sibilant.prettyPrint(node) + "\n   on " + node.file + ":" + node.line + ":" + node.col + "\n")))
    }
  }).call(this);
  first.end = node.end;
  first.closed = true;
  first.closingIgnored = context.ignoredNodes;
  context.ignoredNodes = [];
  context.parseStack.shift();
  closeSpecials(first, context);
  (function() {
    if (context.parseStack.length === 0) {
      throw (new Error(("unbalanced parens:\n" + inspect(parseStack))))
    }
  }).call(this);
  return context;
});
var openSpecial = (function openSpecial$(node, context) {
  /* open-special src/restructurer.sibilant:82:0 */

  ((context.specials)++);
  acceptIgnoredNodes(node, context);
  var first = context.parseStack[0];
  node.contents = [];
  first.contents.push(node);
  context.parseStack.unshift(node);
  return context;
});
var acceptSpecials = (function acceptSpecials$(node, context) {
  /* accept-specials src/restructurer.sibilant:95:0 */

  node.specials = context.specials;
  context.specials = 0;
  return context;
});
var acceptIgnoredNodes = (function acceptIgnoredNodes$(node, context) {
  /* accept-ignored-nodes src/restructurer.sibilant:100:0 */

  node.precedingIgnored = context.ignoredNodes;
  context.ignoredNodes = [];
  return context;
});
var closeSpecials = (function closeSpecials$(node, context) {
  /* close-specials src/restructurer.sibilant:105:0 */

  (function() {
    if (node.specials > 0) {
      ((node.specials)--);
      context.parseStack.shift();
      return closeSpecials(node, context);
    }
  }).call(this);
  return context;
});
var accumulateIgnoredNode = (function accumulateIgnoredNode$(node, context) {
  /* accumulate-ignored-node src/restructurer.sibilant:113:0 */

  context.ignoredNodes.push(node);
  return context;
});
[ "hat", "dots", "tick", "at" ].forEach((function(special) {
  /* src/restructurer.sibilant:117:0 */

  return restructurers[special] = openSpecial;
}));
[ "whitespace", "newline", "ignored", "comment" ].forEach((function(ignored) {
  /* src/restructurer.sibilant:120:0 */

  return restructurers[ignored] = accumulateIgnoredNode;
}));
restructurers.default = (function restructurers$default$(node, context) {
  /* restructurers.default src/restructurer.sibilant:123:0 */

  acceptSpecials(node, context);
  acceptIgnoredNodes(node, context);
  context.parseStack[0].contents.push(node);
  return closeSpecials(node, context);
});