var {
    Interface
} = require("kit-interface");
var {
    TreeMap
} = require("./contrib"), {
    OrderedMap
} = require("./ordered-map");
var BucketedTree = TreeMap.define("BucketedTree", {
    init(value = [], parent = this.parent, _children = create(OrderedMap)()) {

        this.value = value;
        this.parent = parent;
        this._children = _children;
        return this;

    }
});
exports.BucketedTree = BucketedTree;