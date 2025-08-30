"use strict";
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
exports.initMongo = initMongo;
exports.cleanupMongo = cleanupMongo;
// @ts-nocheck
/**
 * @deprecated Persistence now uses @shared/ts/persistence/DualStore.
 */
var mongoose_1 = require("mongoose");
var connected = false;
var _memory = null; // { mms, uri }
function initMongo() {
  return __awaiter(this, void 0, void 0, function () {
    var isTest, wantsMemory, uri, MongoMemoryServer, mms, _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          isTest = String(process.env.NODE_ENV || "").toLowerCase() === "test";
          wantsMemory =
            !process.env.MONGODB_URI || process.env.MONGODB_URI === "memory";
          uri = process.env.MONGODB_URI;
          if (!(isTest && wantsMemory)) return [3 /*break*/, 4];
          if (!!_memory) return [3 /*break*/, 3];
          return [
            4 /*yield*/,
            Promise.resolve().then(function () {
              return require("mongodb-memory-server");
            }),
          ];
        case 1:
          MongoMemoryServer = _b.sent().MongoMemoryServer;
          return [4 /*yield*/, MongoMemoryServer.create()];
        case 2:
          mms = _b.sent();
          _memory = { mms: mms, uri: mms.getUri() };
          _b.label = 3;
        case 3:
          uri = _memory.uri;
          // expose a usable URI for any downstream that reads process.env
          process.env.MONGODB_URI = uri;
          _b.label = 4;
        case 4:
          if (!uri) throw new Error("No mongo URI provided");
          if (!!connected) return [3 /*break*/, 8];
          _b.label = 5;
        case 5:
          _b.trys.push([5, 7, , 8]);
          return [4 /*yield*/, mongoose_1.default.connect(uri)];
        case 6:
          _b.sent();
          connected = true;
          return [3 /*break*/, 8];
        case 7:
          _a = _b.sent();
          throw new Error("could not connect to mongo");
        case 8:
          return [2 /*return*/, mongoose_1.default];
      }
    });
  });
}
function cleanupMongo() {
  return __awaiter(this, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3, , 4]);
          if (!connected) return [3 /*break*/, 2];
          return [4 /*yield*/, mongoose_1.default.disconnect()];
        case 1:
          _c.sent();
          _c.label = 2;
        case 2:
          return [3 /*break*/, 4];
        case 3:
          _a = _c.sent();
          return [3 /*break*/, 4];
        case 4:
          connected = false;
          if (!(_memory === null || _memory === void 0 ? void 0 : _memory.mms))
            return [3 /*break*/, 9];
          _c.label = 5;
        case 5:
          _c.trys.push([5, 7, , 8]);
          return [4 /*yield*/, _memory.mms.stop()];
        case 6:
          _c.sent();
          return [3 /*break*/, 8];
        case 7:
          _b = _c.sent();
          return [3 /*break*/, 8];
        case 8:
          _memory = null;
          _c.label = 9;
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
