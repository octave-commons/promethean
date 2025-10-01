"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSpawnFactory = mockSpawnFactory;
var node_events_1 = require("node:events");
function mockSpawnFactory(script) {
  if (script === void 0) {
    script = [];
  }
  return function mockSpawn(_cmd, _args, _opts) {
    var ee = new node_events_1.EventEmitter();
    var proc = {
      pid: 4242,
      stdout: {
        on: function (ev, cb) {
          return ee.on("stdout:".concat(ev), cb);
        },
      },
      stderr: {
        on: function (ev, cb) {
          return ee.on("stderr:".concat(ev), cb);
        },
      },
      stdin: {
        write: function () {
          return true;
        },
      },
      on: function (ev, cb) {
        return ee.on(ev, cb);
      },
    };
    setImmediate(function () {
      var _a;
      for (var _i = 0, script_1 = script; _i < script_1.length; _i++) {
        var step = script_1[_i];
        if (step.type === "stdout")
          ee.emit("stdout:data", Buffer.from(step.data));
        if (step.type === "stderr")
          ee.emit("stderr:data", Buffer.from(step.data));
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
