"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
var symbols_js_1 = require("./symbols.js");
var ROOT_PATH = process.env.ROOT_PATH;
if (!ROOT_PATH) {
  console.error("Set ROOT_PATH");
  process.exit(1);
}
var info = await (0, symbols_js_1.symbolsIndex)(ROOT_PATH, {});
console.log(JSON.stringify({ ok: true, info: info }, null, 2));
