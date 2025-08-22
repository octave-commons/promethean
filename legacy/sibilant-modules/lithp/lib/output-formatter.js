var outputFormatter = (function outputFormatter$(node) {
  /* output-formatter src/output-formatter.sibilant:1:0 */

  return (function() {
    if ((node && "object" === typeof node && "Array" === node.constructor.name)) {
      return map(node, outputFormatter).join("");
    } else if (node__QUERY(node, "output")) {
      return outputFormatter(node.contents);
    } else if ((typeof node === "string" || typeof node === "number")) {
      return node;
    } else if (!((typeof node !== "undefined" && node !== null))) {
      return "";
    } else if (node__QUERY(node)) {
      console.log(("warning: We ran into an unexpected node that never got transpiled at " + node.file + ":" + node.line + ":" + node.col + "."));
      return outputFormatter(transpile(node));
    }
  }).call(this);
});
sibilant.outputFormatter = outputFormatter;