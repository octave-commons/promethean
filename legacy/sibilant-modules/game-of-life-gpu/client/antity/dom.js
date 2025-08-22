var {
    DocumentNode,
    DocumentRoot,
    DocumentBody
} = require("../modules/dom");
var wrap = DocumentNode.wrap;
var stage = createDocumentNode("div", {
    'id': "stage"
}, []);
var container = createDocumentNode("div", {
    'id': "container"
}, [rendering.context.canvas]);
createDocumentNode("div", {
    'id': "frame"
}, [container]).render(DocumentRoot);