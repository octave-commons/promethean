var create = require('kit/js/util').create;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Node = {
    list: null,
    next: null,
    prev: null,
    item: null,

    init(list, item, next, prev) {
        [this.list, this.item, this.next, this.prev] = [list, item, next, prev];
    },
    get isHead() {
        return this === this.list.head
    },
    get isTail() {
        return this === this.list.tail
    },

    bind(list, next, prev) {
        this.list = list;
        this.next = next;
        this.prev = prev;
        return this;
    },
    set(item) {
        this.item = item;
        return this;
    }

};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var item = (node) => (node ? node.item : null);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var List = {
    length: 0,
    head: null,
    tail: null,

    init(...items) {
        [this.length, this.head, this.tail] = [0, null, null];

        if (items && items.length > 0) {
            items.forEach((v) => (this.push(v)));
        }
    },

    get count() {
        return this.length;
    },
    get size() {
        return this.length;
    },
    get empty() {
        return this.length === 0;
    },
    from(arrayLike, fn = (a) => a) {

        var list = create(this)();
        arrayLike.each((e, i) => {
            list.push(fn(e));
        })
        return list
    },
    of (...items) {
        return create(this)(...items);
    },

    // item based operations //////////////////////////////////////////////////
    push(item) {
        return this.pushNode(create(Node)(this, item, null, null)).item;
    },
    unshift(item) {
        return this.unshiftNode(create(Node)(this, item, null, null)).item;
    },
    pop() {
        return this.popNode().item;
    },
    shift() {
        return this.shiftNode().item;
    },
    insert(item, predicate) {
        return this.insertNode(create(Node)(this, item, null, null), predicate).item;
    },
    remove(item) {
        let node = this.head;
        while (node) {
            if (node.item !== item) {
                node = node.next;
                continue
            };
            return this.removeNode(node).item;
        }
        return false;
    },

    // Node based operations //////////////////////////////////////////////////
    node(item) {
        return create(Node)(this, item, null, null);
    },
    pushNode(node) {
        if (!this.empty) this.tail = this.tail.next = node.bind(this, null, this.tail);
        else this.head = this.tail = node.bind(this, null, null);
        this.length++;
        return node;
    },
    unshiftNode(node) {
        if (!this.empty) this.head = this.head.prev = node.bind(this, this.head, null);
        else this.head = this.tail = node.bind(this, null, null);
        this.length++;
        return node;
    },
    popNode() {
        return this.empty ? null : this.removeNode(this.tail);
    },
    shiftNode() {
        return (this.empty) ? null : this.removeNode(this.head);
    },
    insertNode(n, predicate) {
        let node = this.head;
        while (node) {
            if (!predicate(item(node), item(node.next), item(node.prev))) {
                node = node.next;
                continue
            };
            this.spliceNode(node, n, node.next);
            return n;
        }
        return this.pushNode(n);
    },
    removeNode(node) {
        if (node.list !== this) return false;

        if (node === this.head) this.head = node.next;
        if (node === this.tail) this.tail = node.prev;

        if (node.next) node.next.prev = node.prev;
        if (node.prev) node.prev.next = node.next;

        this.length--;
        return node;
    },

    // helpers ////////////////////////////////////////////////////////////////

    spliceNode(prev, node, next) {
        node.bind(next, prev);
        if (prev) prev.bind(this, node, prev.prev);
        if (next) next.bind(this, next.next, node);
    },
    rotateNode(node, next = node.next, prev = node.prev) {
        [node.prev, node.next, next.prev, next.next] = [next.prev, next.next, node.prev, node.next];
        if (node === this.head) this.head = next;
        if (next === this.tail) this.tail = node;
    },

    // operations on whole collection /////////////////////////////////////////
    sort(predicate) {
        if (this.length === 1) return this;
        let node = this.head;
        while (node) {
            if (predicate(item(node), item(node.next), item(node.prev))) this.rotateNode(node);
        }
    },
    each(f) {
        let node = this.head;
        while (node) {
            f(node.item, node.prev, node.next);
            node = node.next;
        }
        return this;
    },
    map(f) {
        let result = create(List)();
        let node = this.head;
        while (node) {
            result.push(f(item(node), item(node.next), item(node.prev)));
            node = node.next;
        }
        return result;
    },
    toArray() {
        let result = new Array(this.length);
        let node = this.head;
        let i = 0;
        while (node) {
            result[i++] = node.item;
            node = node.next;
        }
        return result;
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

;
List.reduce = (function List$reduce$(f, r) {
    /* List.reduce eval.sibilant:200:0 */

    this.each(((e, i, l) => {

        return r = f(r, e, i, l);

    }));
    return r;
});
List.findNode = (function List$findNode$(f = this.f, node = this.head) {
    /* List.find-node ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/function-expressions.sibilant:29:8 */

    return (function() {
        if (f(node)) {
            return node;
        } else if (!(node === this.tail)) {
            return List.find(f, node.next);
        } else {
            return false;
        }
    }).call(this);
});
List.find = (function List$find$(f = this.f, node = this.head) {
    /* List.find ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/function-expressions.sibilant:29:8 */

    var r = List.findNode(f, node);
    return (function() {
        if (r) {
            return r.value;
        } else {
            return false;
        }
    }).call(this);
});
List.rotate = (function List$rotate$() {
    /* List.rotate eval.sibilant:212:0 */

    return (function() {
        /* inc/misc.sibilant:8:27 */

        return this.push(this.shift());
    }).call(this);
});
List.rotateUntil = (function List$rotateUntil$(predicate = this.predicate, t = 0) {
    /* List.rotate-until ../../kit-lang/shell-utils/shell/node_modules/kit/inc/core/function-expressions.sibilant:29:8 */

    return (function() {
        if (predicate(this.head.item)) {
            return this.head.item;
        } else if (!(t > this.size)) {
            return this.rotate().rotateUntil(predicate, ++(t));
        } else {
            return false;
        }
    }).call(this);
});
exports.List = List;