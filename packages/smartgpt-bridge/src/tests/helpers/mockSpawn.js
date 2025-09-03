// SPDX-License-Identifier: GPL-3.0-only
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSpawnFactory = mockSpawnFactory;
// @ts-nocheck
var node_events_1 = require("node:events");
function mockSpawnFactory(script) {
  if (script === void 0) {
    script = [];
  }
  return function mockSpawn(cmd, _args, _opts) {
    var ee = new node_events_1.EventEmitter();
    var proc = {
      pid: 4242,
      stdout: new node_events_1.EventEmitter(),
      stderr: new node_events_1.EventEmitter(),
      stdin: { write: function () {} },
      on: function (ev, cb) {
        return ee.on(ev, cb);
      },
    };
    // Drive the script: [{ type:'stdout'|'stderr'|'exit', data:'...', code:0 }]
    setImmediate(function () {
      var _a;
      for (var _i = 0, script_1 = script; _i < script_1.length; _i++) {
        var step = script_1[_i];
        if (step.type === "stdout")
          proc.stdout.emit("data", Buffer.from(step.data));
        if (step.type === "stderr")
          proc.stderr.emit("data", Buffer.from(step.data));
        if (step.type === "exit")
          ee.emit(
            "exit",
            (_a = step.code) !== null && _a !== void 0 ? _a : 0,
            null,
          );
      }
    });
    return proc;
  };
}
