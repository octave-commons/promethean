var renderChildren = R.curry(((_parent, c, i, a) => {

    return (function() {
        if (typeof c === "undefined") {
            return null;
        } else if (c.render) {
            return c.render(_parent);
        } else if ((c && "object" === typeof c && "Array" === c.constructor.name)) {
            return c.each(renderChildren(_parent));
        } else if (typeof c === "string") {
            return _parent._node.appendChild(document.createTextNode(c));
        } else if (typeof c === "number") {
            return _parent._node.appendChild(document.createTextNode(("" + c)));
        } else if (typeof c === "function") {
            return renderChildren(_parent, c(_parent));
        } else if ((transpile(item)
                " instanceof "
                transpile(type))) {
            return (function(node) {
                /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                a[i] = node;
                return renderChildren(_parent, node, i, a);
            })(DocumentNode.wrap(c, _parent._node));
        } else {
            return _parent._node.appendChild(c);
        }
    }).call(this);

}));
looseVar(DocumentNode, Interface.define("DocumentNode", {
    init(tagName = this.tagName, attributes = this.attributes, _children = [], _parent = this._parent, _node = document.createElement(tagName)) {

        this.tagName = tagName;
        this.attributes = attributes;
        this._children = _children;
        this._parent = _parent;
        this._node = _node;
        EventEmitter.call(this);
        return this;

    },
    extend: EventEmitter.prototype,
    get children() {

        return this._children;

    },
    render(_parent = this._parent, attributes = this.attributes, tagName = this.tagName, _node = this._node, children = this.children) {

        _node.innerHTML = "";
        this._parent = _parent;
        _parent._node.appendChild(_node);
        attributes.each(((a, k) => {

            return _node[k] = a;

        }));
        children.each(renderChildren(this));
        this.emit("render");
        return this;

    },
    wrap(_node, _parent) {

        return create(DocumentNode)(_node.tagName, {}, [], _parent, _node);

    },
    append(node = this.node, children = this.children) {

        children.push(node);
        return this;

    },
    prepend(node = this.node, children = this.children) {

        return this.children = [node, children];

    },
    remove(_node = this._node, _parent = this._parent) {

        _node.remove();
        _parent.children.filter(((c) => {

            return !(_node === c);

        }));
        _parent.emit("remove", _node);
        return this;

    }
}));
exports.DocumentNode = DocumentNode;
define(DocumentRoot, DocumentNode, get _parent() {

    return this;

}, tagName("body"), get _node() {

    return document.body;

}, _children([]));
exports.DocumentRoot = DocumentRoot;
var createDocumentNode = create(DocumentNode);
console.log(document.appendChild);