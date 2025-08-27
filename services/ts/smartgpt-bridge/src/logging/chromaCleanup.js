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
exports.cleanupChromaLogs = cleanupChromaLogs;
exports.scheduleChromaCleanup = scheduleChromaCleanup;
// @ts-nocheck
var sinks_js_1 = require("../sinks.js");
function cleanupChromaLogs() {
  return __awaiter(this, arguments, void 0, function (days, max) {
    var col,
      deleted,
      cutoff,
      old,
      _a,
      count,
      excess,
      all_1,
      pairs,
      toDelete,
      _b;
    var _c;
    if (days === void 0) {
      days = Number(process.env.LOG_TTL_DAYS || 30);
    }
    if (max === void 0) {
      max = Number(process.env.LOG_MAX_CHROMA || 100000);
    }
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          try {
            col =
              sinks_js_1.contextStore.getCollection(
                "bridge_logs",
              ).chromaCollection;
          } catch (_e) {
            return [2 /*return*/, { deleted: 0 }];
          }
          deleted = 0;
          cutoff = Date.now() - days * 86400 * 1000;
          _d.label = 1;
        case 1:
          _d.trys.push([1, 5, , 6]);
          return [
            4 /*yield*/,
            col.get({
              where: { timestamp: { $lt: cutoff } },
              include: ["ids"],
            }),
          ];
        case 2:
          old = _d.sent();
          if (
            !((_c = old === null || old === void 0 ? void 0 : old.ids) ===
              null || _c === void 0
              ? void 0
              : _c.length)
          )
            return [3 /*break*/, 4];
          return [4 /*yield*/, col.delete({ ids: old.ids })];
        case 3:
          _d.sent();
          deleted += old.ids.length;
          _d.label = 4;
        case 4:
          return [3 /*break*/, 6];
        case 5:
          _a = _d.sent();
          return [3 /*break*/, 6];
        case 6:
          if (!(max > 0)) return [3 /*break*/, 13];
          _d.label = 7;
        case 7:
          _d.trys.push([7, 12, , 13]);
          return [4 /*yield*/, col.count()];
        case 8:
          count = _d.sent();
          if (!(count > max)) return [3 /*break*/, 11];
          excess = count - max;
          return [4 /*yield*/, col.get({ include: ["ids", "metadatas"] })];
        case 9:
          all_1 = _d.sent();
          pairs = (all_1.ids || []).map(function (id, i) {
            var _a, _b;
            return {
              id: id,
              timestamp:
                (_b =
                  (_a = all_1.metadatas) === null || _a === void 0
                    ? void 0
                    : _a[i]) === null || _b === void 0
                  ? void 0
                  : _b.timestamp,
            };
          });
          pairs.sort(function (a, b) {
            return (a.timestamp || 0) - (b.timestamp || 0);
          });
          toDelete = pairs.slice(0, excess).map(function (p) {
            return p.id;
          });
          if (!toDelete.length) return [3 /*break*/, 11];
          return [4 /*yield*/, col.delete({ ids: toDelete })];
        case 10:
          _d.sent();
          deleted += toDelete.length;
          _d.label = 11;
        case 11:
          return [3 /*break*/, 13];
        case 12:
          _b = _d.sent();
          return [3 /*break*/, 13];
        case 13:
          return [2 /*return*/, { deleted: deleted }];
      }
    });
  });
}
function scheduleChromaCleanup() {
  var days = Number(process.env.LOG_TTL_DAYS || 30);
  var max = Number(process.env.LOG_MAX_CHROMA || 100000);
  var run = function () {
    return cleanupChromaLogs(days, max).catch(function () {});
  };
  run();
  setInterval(run, 24 * 60 * 60 * 1000);
}
