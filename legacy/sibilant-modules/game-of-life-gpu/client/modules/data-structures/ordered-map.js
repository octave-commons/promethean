var {
    Interface
} = require("kit-interface");
var OrderedMap = Interface.define("OrderedMap", {
    init(_members = (new Map()), _keyPointers = (new Map()), _keys = [], _values = []) {

        this._members = _members;
        this._keyPointers = _keyPointers;
        this._keys = _keys;
        this._values = _values;
        return this;

    },
    has(key = this.key, [_members] = [this._members]) {

        return _members.has(key);

    },
    get(key = this.key, [_members, _, _keys] = [this._members, this._, this._keys]) {

        return _members.get(key);

    },
    each(callback = this.callback, _values = this._values) {

        _values.each(callback);
        return this;

    },
    map(callback = this.callback, [_members, _, _keys, _values] = [this._members, this._, this._keys, this._values]) {

        return (function(r) {
            /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

            _keys.each(((k) => {

                return r.set(k, f(_members[k], k, r));

            }));
            return r;
        })(create(OrderedMap)());

    },
    delete(key = this.key, [_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        var i = _keyPointers[key];
        _members.delete(key);
        _keyPointers.delete(key);
        delete _keys;
        delete i;
        delete _values;
        return delete i;

    },
    push([key, value] = [this.key, this.value], [_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        return (function() {
            if (_members.has(key)) {
                return _members.get(key);
            } else {
                return (function(value) {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                    _members.set(key, value);
                    return value;
                })((function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/macros.sibilant:30:25 */

                    _keys.push(key);
                    _keyPointers.set(_values.push(value));
                    return value;
                }).call(this));
            }
        }).call(this);

    },
    pop([_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        var key = _keys.pop(),
            value = _values.pop();
        _keyPointers.pop();
        members.delete(key);
        return value;

    },
    shift([_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        var key = _keys.shift(),
            value = _values.shift();
        _keyPointers.shift();
        _members.delete(key);
        return value;

    },
    unshift([key, value] = [this.key, this.value], [_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        return (function() {
            if (_members.has(key)) {
                return _members.get(key);
            } else {
                return (function(value) {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                    _members.set(key, value);
                    return value;
                })((function() {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/macros.sibilant:30:25 */

                    _keys.unshift(key);
                    _keyPointers.set(_values.unshift(value));
                    return value;
                }).call(this));
            }
        }).call(this);

    },
    set(key = this.key, value = this.value, [_members, _keyPointers, _keys, _values] = [this._members, this._keyPointers, this._keys, this._values]) {

        return (function() {
            if (_members.has(key)) {
                return (function(i) {
                    /* ../../kit-lang/shell-utils/shell/node_modules/kit/inc/scope.sibilant:12:9 */

                    _values[i] = value;
                    return _members.set(key, value);
                })(_keyPointers[key]);
            } else {
                _keys.push(key);
                _keyPointers.set(_values.push(value));
                _members.set(key, value);
                return value;
            }
        }).call(this);

    }
});
exports.OrderedMap = OrderedMap;