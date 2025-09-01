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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
var fs_1 = require("fs");
var path = require("path");
var gray_matter_1 = require("gray-matter");
var utils_js_1 = require("./utils.js");
var args = (0, utils_js_1.parseArgs)({
    "--in": ".cache/sonar/plans.json",
    "--out": "docs/agile/tasks/sonar",
    "--status": "todo",
    "--assignee": "",
    "--label": "sonarqube,quality,remediation"
});
var START = "<!-- SONARFLOW:BEGIN -->";
var END = "<!-- SONARFLOW:END -->";
function slug(s) {
    return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function stripGenerated(text) {
    var si = text.indexOf(START), ei = text.indexOf(END);
    if (si >= 0 && ei > si)
        return (text.slice(0, si).trimEnd() + "\n").trimEnd();
    return text.trimEnd();
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, tasks, project, _b, _c, index, _i, tasks_1, t, fname, outPath, fm, refsTable, body, existing, gm, preserved, final;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _c = (_b = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile(path.resolve(args["--in"]), "utf-8")];
                case 1:
                    _a = _c.apply(_b, [_e.sent()]), tasks = _a.tasks, project = _a.project;
                    return [4 /*yield*/, fs_1.promises.mkdir(path.resolve(args["--out"]), { recursive: true })];
                case 2:
                    _e.sent();
                    index = ["# SonarQube remediation tasks", "", "Project: `".concat(project, "`"), ""];
                    _i = 0, tasks_1 = tasks;
                    _e.label = 3;
                case 3:
                    if (!(_i < tasks_1.length)) return [3 /*break*/, 7];
                    t = tasks_1[_i];
                    fname = "".concat(slug(t.title), ".md");
                    outPath = path.join(args["--out"], fname);
                    fm = {
                        uuid: cryptoRandomUUID(),
                        title: t.title,
                        project: project,
                        priority: t.priority,
                        status: args["--status"],
                        labels: Array.from(new Set(__spreadArray(__spreadArray([], (args["--label"].split(",").map(function (s) { return s.trim(); }).filter(Boolean)), true), ((_d = t.labels) !== null && _d !== void 0 ? _d : []), true))),
                        created_at: new Date().toISOString()
                    };
                    refsTable = __spreadArray([
                        "| Issue key | File |",
                        "|---|---|"
                    ], t.refs.map(function (r) { return "| `".concat(r.key, "` | `").concat(r.file).concat(r.line ? ":" + r.line : "", "` |"); }), true).join("\n");
                    body = __spreadArray(__spreadArray(__spreadArray(__spreadArray([
                        START,
                        "# ".concat(t.title),
                        "",
                        t.summary,
                        "",
                        "## Steps",
                        ""
                    ], t.steps.map(function (s, i) { return "".concat(i + 1, ". ").concat(s); }), true), [
                        "",
                        "## Acceptance criteria",
                        ""
                    ], false), t.acceptance.map(function (a) { return "- [ ] ".concat(a); }), true), [
                        "",
                        "## References",
                        "",
                        refsTable,
                        "",
                        END,
                        ""
                    ], false).join("\n");
                    return [4 /*yield*/, readMaybe(outPath)];
                case 4:
                    existing = _e.sent();
                    gm = existing ? (0, gray_matter_1.default)(existing) : { content: "", data: {} };
                    preserved = stripGenerated(gm.content);
                    final = gray_matter_1.default.stringify((preserved ? preserved + "\n\n" : "") + body, __assign(__assign({}, gm.data), fm), { language: "yaml" });
                    return [4 /*yield*/, fs_1.promises.writeFile(outPath, final, "utf-8")];
                case 5:
                    _e.sent();
                    index.push("- [".concat(t.title, "](").concat(path.basename(outPath), ") \u2014 ").concat(t.priority));
                    _e.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7: return [4 /*yield*/, fs_1.promises.writeFile(path.join(args["--out"], "README.md"), index.join("\n") + "\n", "utf-8")];
                case 8:
                    _e.sent();
                    console.log("sonarflow: wrote ".concat(tasks.length, " task files \u2192 ").concat(args["--out"]));
                    return [2 /*return*/];
            }
        });
    });
}
function cryptoRandomUUID() {
    var _a, _b, _c;
    // Node 18+
    // @ts-ignore
    return (_c = (_b = (_a = globalThis.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : require("crypto").randomUUID();
}
function readMaybe(p) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs_1.promises.readFile(p, "utf-8")];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (e) { console.error(e); process.exit(1); });
