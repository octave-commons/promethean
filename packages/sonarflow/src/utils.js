// SPDX-License-Identifier: GPL-3.0-only
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SONAR_TOKEN = exports.SONAR_URL = void 0;
exports.parseArgs = parseArgs;
exports.sha1 = sha1;
exports.writeJSON = writeJSON;
exports.readJSON = readJSON;
exports.authHeader = authHeader;
exports.severityToPriority = severityToPriority;
exports.pathPrefix = pathPrefix;
var fs_1 = require("fs");
var path = require("path");
var crypto = require("crypto");
function parseArgs(defaults) {
    var out = __assign({}, defaults);
    var a = process.argv.slice(2);
    for (var i = 0; i < a.length; i++) {
        var k = a[i];
        if (!k.startsWith("--"))
            continue;
        var v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
        out[k] = v;
    }
    return out;
}
function sha1(s) {
    return crypto.createHash("sha1").update(s).digest("hex");
}
function writeJSON(p, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.mkdir(path.dirname(p), { recursive: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.writeFile(p, JSON.stringify(data, null, 2), "utf-8")];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function readJSON(p) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile(p, "utf-8")];
                case 1: return [2 /*return*/, _b.apply(_a, [_d.sent()])];
                case 2:
                    _c = _d.sent();
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.SONAR_URL = (_a = process.env.SONAR_HOST_URL) !== null && _a !== void 0 ? _a : "http://localhost:9000";
exports.SONAR_TOKEN = (_b = process.env.SONAR_TOKEN) !== null && _b !== void 0 ? _b : "";
function authHeader() {
    if (!exports.SONAR_TOKEN)
        throw new Error("SONAR_TOKEN env is required");
    var b = Buffer.from("".concat(exports.SONAR_TOKEN, ":")).toString("base64");
    return { Authorization: "Basic ".concat(b) };
}
function severityToPriority(s) {
    switch (s) {
        case "BLOCKER": return "P0";
        case "CRITICAL": return "P1";
        case "MAJOR": return "P2";
        case "MINOR": return "P3";
        default: return "P4";
    }
}
function pathPrefix(file, depth) {
    if (depth === void 0) { depth = 2; }
    var parts = file.split("/");
    return parts.slice(0, Math.min(parts.length, depth)).join("/");
}
