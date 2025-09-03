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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
var utils_js_1 = require("./utils.js");
var args = (0, utils_js_1.parseArgs)({
    "--project": (_a = process.env.SONAR_PROJECT_KEY) !== null && _a !== void 0 ? _a : "",
    "--out": ".cache/sonar/issues.json",
    "--statuses": "OPEN,REOPENED,CONFIRMED",
    "--types": "BUG,VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT",
    "--severities": "BLOCKER,CRITICAL,MAJOR,MINOR,INFO",
    "--pageSize": "500"
});
function sonarGet(pathname, params) {
    return __awaiter(this, void 0, void 0, function () {
        var qs, url, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qs = new URLSearchParams(params).toString();
                    url = "".concat(utils_js_1.SONAR_URL).concat(pathname, "?").concat(qs);
                    return [4 /*yield*/, fetch(url, { headers: __assign({}, (0, utils_js_1.authHeader)()) })];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("Sonar API ".concat(res.status, " ").concat(pathname));
                    return [2 /*return*/, res.json()];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var project, pageSize, issues, page, total, data, _i, _a, it_1, payload;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    project = args["--project"];
                    if (!project)
                        throw new Error("Provide --project or SONAR_PROJECT_KEY");
                    pageSize = Number(args["--pageSize"]);
                    issues = [];
                    page = 1, total = 0;
                    _b.label = 1;
                case 1: return [4 /*yield*/, sonarGet("/api/issues/search", {
                        projectKeys: project,
                        statuses: args["--statuses"],
                        types: args["--types"],
                        severities: args["--severities"],
                        p: page, ps: pageSize, additionalFields: "_all"
                    })];
                case 2:
                    data = _b.sent();
                    total = data.total;
                    for (_i = 0, _a = data.issues; _i < _a.length; _i++) {
                        it_1 = _a[_i];
                        issues.push({
                            key: it_1.key,
                            rule: it_1.rule,
                            severity: it_1.severity,
                            type: it_1.type,
                            component: it_1.component, // usually "<project>:path/to/file.ts"
                            project: it_1.project,
                            line: it_1.line,
                            message: it_1.message,
                            debt: it_1.debt,
                            tags: it_1.tags
                        });
                    }
                    page++;
                    _b.label = 3;
                case 3:
                    if ((page - 1) * pageSize < total) return [3 /*break*/, 1];
                    _b.label = 4;
                case 4:
                    payload = {
                        issues: issues,
                        fetchedAt: new Date().toISOString(),
                        project: project
                    };
                    return [4 /*yield*/, (0, utils_js_1.writeJSON)(args["--out"], payload)];
                case 5:
                    _b.sent();
                    console.log("sonarflow: fetched ".concat(issues.length, " issues for ").concat(project, " \u2192 ").concat(args["--out"]));
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (e) { console.error(e); process.exit(1); });
