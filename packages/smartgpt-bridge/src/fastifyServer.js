// SPDX-License-Identifier: GPL-3.0-only
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
var dotenv_1 = require("dotenv");
var fastifyApp_js_1 = require("./fastifyApp.js");
var chromaCleanup_js_1 = require("./logging/chromaCleanup.js");
try {
  (0, dotenv_1.configDotenv)();
} catch (_a) {}
var PORT = Number(process.env.PORT || 3210);
var ROOT_PATH = process.env.ROOT_PATH || process.cwd();
var app = await (0, fastifyApp_js_1.buildFastifyApp)(ROOT_PATH);
(0, chromaCleanup_js_1.scheduleChromaCleanup)();
app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(function () {
    console.log(
      "SmartGPT bridge (fastify) listening on http://0.0.0.0:".concat(PORT),
    );
  })
  .catch(function (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
