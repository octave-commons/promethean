var Descriptions = {};
var R = require("ramda");

var fmap = R.curry((f, a) => {return a.map(f);});

var is = {string(v) {return typeof v === "string";}};

is.empty__QUERY =
    (function is$empty__QUERY$(value)
     {/* is.empty? ../../node_modules/kit/inc/core/fp.sibilant:12:0 */
        return 0 === value.length;});

var athrow = (function athrow$(errType, message) {/* athrow ../../node_modules/kit/inc/core/fp.sibilant:14:0 */
    return () => {return (new errType(message));};});

var getValueOf = (function getValueOf$(o) {/* get-value-of ../../node_modules/kit/inc/core/fp.sibilant:17:0 */
    return o.getValue();});

var {create, extend, mixin, conditional, cond, partiallyApplyAfter} = require("kit/js/util");

var Interface = {}; mixin
({_symbols: {},
  _types: {},
  init
  (name = this.name,
   _obj = this._obj,
   _types = {},
   _symbols = {})

  {this.name = name;
   this._obj = _obj;
   this._types = _types;
   this._symbols = _symbols;
   return this;},

  define
  (name = this.name,
   _obj = this._obj,
   _types = this._types,
   _symbols = this._symbols,
   _shares = (_obj.borrows || _obj.shares || []),
   _ext = (_obj.extend || {}),
   _build = _obj.build)

  {return (function() {
      if (name in _symbols)
      {return mixin(_obj, _types[_symbols[name]]);}
      else {return this.create(name, _obj);}}).call(this);},

  create
  (name = this.name,
   _obj = this._obj,
   _types = this._types,
   _symbols = this._symbols,
   _shares = (_obj.borrows || _obj.shares || []),
   _ext = (_obj.extend || {}),
   _build = _obj.build,
   _symbol = Symbol(name))

  {return (function(m) {/* ../../node_modules/kit/inc/macros.sibilant:162:9 */

      _symbols[name] = _symbol;
      _types[_symbol] = m;
      (function() {if (_build) {return m.build();}}).call(this);
      return m;})

   (extend(_ext, mixin ([{name, symbol: _symbol}, ..._shares], _obj)));}}, Interface);

exports.Interface = Interface;
