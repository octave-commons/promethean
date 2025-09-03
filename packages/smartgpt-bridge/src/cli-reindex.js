// SPDX-License-Identifier: GPL-3.0-only
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
// @ts-nocheck
var indexer_js_1 = require("./indexer.js");
var ROOT_PATH = process.env.ROOT_PATH;
if (!ROOT_PATH) {
  console.error("Set ROOT_PATH");
  process.exit(1);
}
var limit = Number(process.env.LIMIT || 0);
var r = await (0, indexer_js_1.reindexAll)(ROOT_PATH, { limit: limit });
console.log(JSON.stringify(__assign({ ok: true }, r), null, 2));
