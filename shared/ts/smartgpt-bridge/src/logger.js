"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// @ts-nocheck
var fs_1 = require("fs");
var path_1 = require("path");
var LEVELS = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
var LOG_LEVEL = (process.env.LOG_LEVEL || "info").toLowerCase();
var LOG_JSON = /^true$/i.test(process.env.LOG_JSON || "false");
var LOG_FILE = process.env.LOG_FILE || "";
var stream = null;
if (LOG_FILE) {
  try {
    var dir = path_1.default.dirname(LOG_FILE);
    fs_1.default.mkdirSync(dir, { recursive: true });
    stream = fs_1.default.createWriteStream(LOG_FILE, { flags: "a" });
  } catch (e) {
    // fall back to console only
  }
}
function should(level) {
  var _a, _b;
  return (
    ((_a = LEVELS[level]) !== null && _a !== void 0 ? _a : 2) <=
    ((_b = LEVELS[LOG_LEVEL]) !== null && _b !== void 0 ? _b : 2)
  );
}
function format(level, msg, meta) {
  var ts = new Date().toISOString();
  if (LOG_JSON) {
    return JSON.stringify(__assign({ ts: ts, level: level, msg: msg }, meta));
  }
  var line = "[".concat(ts, "] ").concat(level.toUpperCase(), " ").concat(msg);
  if (meta && (meta.err || meta.error)) {
    var err = meta.err || meta.error;
    var details =
      (err === null || err === void 0 ? void 0 : err.stack) ||
      (err === null || err === void 0 ? void 0 : err.message) ||
      String(err);
    line += "\n".concat(details);
  }
  return line;
}
function doWrite(line) {
  if (stream) {
    try {
      stream.write(line + "\n");
    } catch (_a) {}
  }
  try {
    console.log(line);
  } catch (_b) {}
}
function write(level, msg, meta) {
  if (meta === void 0) {
    meta = {};
  }
  if (!should(level)) return;
  var line = format(level, msg, meta) + "\n";
  if (stream) {
    try {
      stream.write(line);
    } catch (_a) {}
  }
  var fn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;
  try {
    fn(line.trimEnd());
  } catch (_b) {}
}
exports.logger = {
  level: LOG_LEVEL,
  info: function (msg, meta) {
    return write("info", msg, meta);
  },
  warn: function (msg, meta) {
    return write("warn", msg, meta);
  },
  error: function (msg, meta) {
    return write("error", msg, meta);
  },
  debug: function (msg, meta) {
    return write("debug", msg, meta);
  },
  trace: function (msg, meta) {
    return write("trace", msg, meta);
  },
  // Always-on audit logs (bypass level filtering). Use for security events.
  audit: function (msg, meta) {
    if (meta === void 0) {
      meta = {};
    }
    var line = format("audit", msg, meta);
    doWrite(line);
  },
};
