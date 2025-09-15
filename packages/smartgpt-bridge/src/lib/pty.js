"use strict";
// Lazy/optional node-pty wrapper so tests and unsupported runtimes don't explode.
// If NODE_PTY_DISABLED=1, this returns null or throws a typed error via helpers.
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b)
            if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError(
          "Class extends value " + String(b) + " is not a constructor or null",
        );
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PtyUnavailableError = void 0;
exports.getPty = getPty;
exports.spawnPty = spawnPty;
var _pty; // undefined: not loaded
function getPty() {
  if (process.env.NODE_PTY_DISABLED === "1") return Promise.resolve(null);
  if (_pty) return _pty;
  _pty = import("node-pty")
    .then(function (mod) {
      return mod.default || mod;
    })
    .catch(function () {
      return null;
    });
  return _pty;
}
var PtyUnavailableError = /** @class */ (function (_super) {
  __extends(PtyUnavailableError, _super);
  function PtyUnavailableError() {
    var _this = _super.call(this, "PTY_UNAVAILABLE") || this;
    _this.name = "PTY_UNAVAILABLE";
    return _this;
  }
  return PtyUnavailableError;
})(Error);
exports.PtyUnavailableError = PtyUnavailableError;
function spawnPty(file, args, opts) {
  if (opts === void 0) {
    opts = {};
  }
  return getPty().then(function (pty) {
    if (!pty) throw new PtyUnavailableError();
    return pty.spawn(file, args, opts);
  });
}
