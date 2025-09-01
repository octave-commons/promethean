"use strict";
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
var zod_1 = require("zod");
var utils_js_1 = require("./utils.js");
var args = (0, utils_js_1.parseArgs)({
    "--in": ".cache/sonar/issues.json",
    "--out": ".cache/sonar/plans.json",
    "--group-by": "rule+prefix", // "rule" | "prefix" | "rule+prefix"
    "--prefix-depth": "2",
    "--min-group": "2",
    "--model": "qwen3:4b"
});
function ollamaJSON(model, prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var url, res, data, raw;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    url = "".concat((_a = process.env.OLLAMA_URL) !== null && _a !== void 0 ? _a : "http://localhost:11434", "/api/generate");
                    return [4 /*yield*/, fetch(url, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ model: model, prompt: prompt, stream: false, options: { temperature: 0 }, format: "json" })
                        })];
                case 1:
                    res = _b.sent();
                    if (!res.ok)
                        throw new Error("ollama ".concat(res.status));
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _b.sent();
                    raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
                    return [2 /*return*/, JSON.parse(raw.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim())];
            }
        });
    });
}
var TaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    summary: zod_1.z.string().min(1),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    steps: zod_1.z.array(zod_1.z.string()).min(1),
    acceptance: zod_1.z.array(zod_1.z.string()).min(1)
});
function bundleKey(i, mode, depth) {
    var comp = i.component.includes(":") ? i.component.split(":")[1] : i.component;
    var pref = (0, utils_js_1.pathPrefix)(comp, depth);
    if (mode === "rule")
        return "rule:".concat(i.rule);
    if (mode === "prefix")
        return "prefix:".concat(pref);
    return "rule:".concat(i.rule, "|prefix:").concat(pref);
}
function bundleTitle(k) {
    var parts = k.split("|").map(function (p) { return p.replace(/^rule:/, "Rule ").replace(/^prefix:/, "Path "); });
    return parts.join(" • ");
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, issues, project, _b, _c, depth, mode, groups, _i, issues_1, it_1, k, min, bundles, _loop_1, _d, groups_1, _e, k, arr, tasks, _f, bundles_1, b, bullets, sys, user, obj, parsed, _g, refs, out;
        var _h, _j, _k, _l, _m, _o;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    _c = (_b = JSON).parse;
                    return [4 /*yield*/, fetch("file://" + process.cwd() + "/" + args["--in"])];
                case 1: return [4 /*yield*/, (_p.sent()).text()];
                case 2:
                    _a = _c.apply(_b, [_p.sent()]), issues = _a.issues, project = _a.project;
                    depth = Number(args["--prefix-depth"]);
                    mode = args["--group-by"];
                    groups = new Map();
                    for (_i = 0, issues_1 = issues; _i < issues_1.length; _i++) {
                        it_1 = issues_1[_i];
                        k = bundleKey(it_1, mode, depth);
                        ((_h = groups.get(k)) !== null && _h !== void 0 ? _h : groups.set(k, []).get(k)).push(it_1);
                    }
                    min = Number(args["--min-group"]);
                    bundles = [];
                    _loop_1 = function (k, arr) {
                        if (arr.length < min)
                            return "continue";
                        var sev = ["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "INFO"].find(function (s) { return arr.some(function (it) { return it.severity === s; }); });
                        bundles.push({
                            id: (0, utils_js_1.sha1)(k),
                            title: bundleTitle(k),
                            issues: arr,
                            severityTop: sev,
                            types: Array.from(new Set(arr.map(function (a) { return a.type; }))),
                            rule: k.includes("rule:") ? (_j = k.split("|").find(function (x) { return x.startsWith("rule:"); })) === null || _j === void 0 ? void 0 : _j.slice(5) : undefined,
                            prefix: k.includes("prefix:") ? (_k = k.split("|").find(function (x) { return x.startsWith("prefix:"); })) === null || _k === void 0 ? void 0 : _k.slice(7) : undefined
                        });
                    };
                    for (_d = 0, groups_1 = groups; _d < groups_1.length; _d++) {
                        _e = groups_1[_d], k = _e[0], arr = _e[1];
                        _loop_1(k, arr);
                    }
                    tasks = [];
                    _f = 0, bundles_1 = bundles;
                    _p.label = 3;
                case 3:
                    if (!(_f < bundles_1.length)) return [3 /*break*/, 9];
                    b = bundles_1[_f];
                    bullets = b.issues.slice(0, 30).map(function (i) {
                        var file = i.component.includes(":") ? i.component.split(":")[1] : i.component;
                        return "- [".concat(i.severity, "] ").concat(i.type, " ").concat(i.rule, " \u2014 ").concat(file).concat(i.line ? ":" + i.line : "", " \u2014 ").concat(i.message);
                    }).join("\n");
                    sys = [
                        "You are a senior tech lead creating a short, actionable engineering task from static analysis results.",
                        "Return ONLY JSON with: title, summary, labels[], steps[], acceptance[]",
                        "Keep the title crisp; steps 3-7 items; acceptance 3-7 bullets.",
                        "Prefer consolidation tasks (shared fix patterns) over per-issue tasks."
                    ].join("\n");
                    user = [
                        "PROJECT: ".concat(project),
                        "BUNDLE: ".concat(b.title, "  (severity=").concat(b.severityTop, ", types=").concat(b.types.join(","), ")"),
                        b.rule ? "RULE: ".concat(b.rule) : "",
                        b.prefix ? "PATH: ".concat(b.prefix) : "",
                        "",
                        "ISSUES:",
                        bullets
                    ].filter(Boolean).join("\n");
                    obj = void 0;
                    _p.label = 4;
                case 4:
                    _p.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, ollamaJSON(args["--model"], "SYSTEM:\n".concat(sys, "\n\nUSER:\n").concat(user))];
                case 5:
                    obj = _p.sent();
                    parsed = TaskSchema.safeParse(obj);
                    if (!parsed.success)
                        throw new Error("invalid LLM JSON");
                    return [3 /*break*/, 7];
                case 6:
                    _g = _p.sent();
                    // Fallback
                    obj = {
                        title: "[".concat(b.severityTop, "] ").concat(b.title),
                        summary: "Address ".concat(b.issues.length, " SonarQube finding(s) related to ").concat((_l = b.rule) !== null && _l !== void 0 ? _l : b.types.join("/"), "."),
                        labels: ["sonarqube", "quality", "refactor", ((_m = b.rule) !== null && _m !== void 0 ? _m : "misc").toLowerCase()],
                        steps: [
                            "Identify a shared remediation pattern.",
                            "Implement fix in smallest path slice (feature flag if risky).",
                            "Add/adjust unit tests for affected files.",
                            "Run Sonar scan locally and verify issues resolved."
                        ],
                        acceptance: [
                            "SonarQube shows 0 remaining issues for this bundle.",
                            "All unit tests pass.",
                            "No increase in code smells elsewhere."
                        ]
                    };
                    return [3 /*break*/, 7];
                case 7:
                    refs = b.issues.map(function (i) {
                        var file = i.component.includes(":") ? i.component.split(":")[1] : i.component;
                        return { key: i.key, file: file, line: i.line };
                    });
                    tasks.push({
                        id: b.id,
                        title: obj.title,
                        summary: obj.summary,
                        labels: Array.from(new Set(__spreadArray(__spreadArray([], ((_o = obj.labels) !== null && _o !== void 0 ? _o : []), true), ["sonarqube"], false))),
                        steps: obj.steps,
                        acceptance: obj.acceptance,
                        priority: (0, utils_js_1.severityToPriority)(b.severityTop),
                        refs: refs
                    });
                    _p.label = 8;
                case 8:
                    _f++;
                    return [3 /*break*/, 3];
                case 9:
                    out = { tasks: tasks, plannedAt: new Date().toISOString(), project: project };
                    return [4 /*yield*/, (0, utils_js_1.writeJSON)(args["--out"], out)];
                case 10:
                    _p.sent();
                    console.log("sonarflow: planned ".concat(tasks.length, " tasks \u2192 ").concat(args["--out"]));
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (e) { console.error(e); process.exit(1); });
