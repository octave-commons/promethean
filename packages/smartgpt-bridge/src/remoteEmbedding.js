// SPDX-License-Identifier: GPL-3.0-only
"use strict";
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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteEmbeddingFunction = void 0;
// @ts-nocheck
// Adapter to shared RemoteEmbeddingFunction with testable broker injection and timeouts.
var remote_js_1 = require("@shared/ts/dist/embeddings/remote.js");
var RemoteEmbeddingFunction = /** @class */ (function (_super) {
  __extends(RemoteEmbeddingFunction, _super);
  function RemoteEmbeddingFunction(brokerUrl, driver, fn, brokerInstance) {
    if (brokerUrl === void 0) {
      brokerUrl = process.env.BROKER_URL || "ws://localhost:7000";
    }
    if (driver === void 0) {
      driver = process.env.EMBEDDING_DRIVER;
    }
    if (fn === void 0) {
      fn = process.env.EMBEDDING_FUNCTION;
    }
    var _this = this;
    // If a test sets SHARED_IMPORT, dynamically construct a broker and pass it to shared class.
    var prefix = "smartgpt-embed";
    if (brokerInstance) {
      _this =
        _super.call(this, brokerUrl, driver, fn, brokerInstance, prefix) ||
        this;
      _this._injected = true;
    } else if (process.env.SHARED_IMPORT) {
      // Dynamically import the fake broker for tests
      var modPromise_1 = Promise.resolve(
        "".concat(process.env.SHARED_IMPORT),
      ).then(function (s) {
        return require(s);
      });
      // Create a lazy broker instance once module resolves
      var proxy = new Proxy(
        {},
        {
          get: function (_t, p) {
            return function () {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
              }
              return __awaiter(_this, void 0, void 0, function () {
                var Mod, Ctor;
                var _a;
                return __generator(this, function (_b) {
                  switch (_b.label) {
                    case 0:
                      return [4 /*yield*/, modPromise_1];
                    case 1:
                      Mod = _b.sent();
                      Ctor = Mod.default || Mod.BrokerClient || Mod;
                      if (!this.__real)
                        this.__real = new Ctor({
                          url: brokerUrl,
                          id: ""
                            .concat(prefix, "-")
                            .concat(Math.random().toString(16).slice(2)),
                        });
                      return [
                        2 /*return*/,
                        (_a = this.__real)[p].apply(_a, args),
                      ];
                  }
                });
              });
            };
          },
        },
      );
      // Pass proxy to super; methods will delegate once used
      _this = _super.call(this, brokerUrl, driver, fn, proxy, prefix) || this;
    } else {
      _this =
        _super.call(this, brokerUrl, driver, fn, undefined, prefix) || this;
    }
    return _this;
  }
  RemoteEmbeddingFunction.prototype.generate = function (texts) {
    return __awaiter(this, void 0, void 0, function () {
      var timeoutMs;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            timeoutMs = Number(process.env.EMBEDDING_TIMEOUT_MS || 0);
            if (!!timeoutMs) return [3 /*break*/, 2];
            return [4 /*yield*/, _super.prototype.generate.call(this, texts)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            return [
              4 /*yield*/,
              Promise.race([
                _super.prototype.generate.call(this, texts),
                new Promise(function (_, reject) {
                  return setTimeout(function () {
                    return reject(new Error("embedding timeout"));
                  }, timeoutMs);
                }),
              ]),
            ];
          case 3:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  RemoteEmbeddingFunction.prototype.dispose = function () {
    var _a, _b;
    try {
      (_b =
        (_a = this.broker) === null || _a === void 0
          ? void 0
          : _a.disconnect) === null || _b === void 0
        ? void 0
        : _b.call(_a);
    } catch (_c) {}
  };
  return RemoteEmbeddingFunction;
})(remote_js_1.RemoteEmbeddingFunction);
exports.RemoteEmbeddingFunction = RemoteEmbeddingFunction;
