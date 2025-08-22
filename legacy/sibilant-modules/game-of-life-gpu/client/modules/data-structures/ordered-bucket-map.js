var {
    Interface
} = require("kit-interface");
var {
    OrderedMap
} = require("./ordered-map");
var OrderedBucketMap = Interface.define("OrderedBucketMap", {
    init(_buckets = create(OrderedMap)()) {

        this._buckets = _buckets;
        return this;

    },
    set(k = this.k, v = this.v, _buckets = this._buckets) {

        return (function() {
            if (_buckets.has(k)) {
                return _buckets.get(k).push(v);
            } else {
                return _buckets.push([k, [v]]);
            }
        }).call(this);

    },
    get(k = this.k, value = this.value, _buckets = this._buckets) {

        return _buckets.get(k);

    },
    each(f = this.f, _buckets = this._buckets) {

        return _buckets.each(f);

    },
    map(f = this.f, _buckets = this._buckets) {

        return _buckets.map(f);

    },
    delete([k, value] = [this.k, this.value]) {

    }
});
exports.OrderedBucketMap = OrderedBucketMap;