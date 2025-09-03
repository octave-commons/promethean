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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexerManager = void 0;
exports.setChromaClient = setChromaClient;
exports.setEmbeddingFactory = setEmbeddingFactory;
exports.resetChroma = resetChroma;
exports.resetEmbeddingCache = resetEmbeddingCache;
exports.getChroma = getChroma;
exports.buildEmbeddingFn = buildEmbeddingFn;
exports.embeddingEnvConfig = embeddingEnvConfig;
exports.indexFile = indexFile;
exports.removeFileFromIndex = removeFileFromIndex;
exports.collectionForFamily = collectionForFamily;
exports.reindexAll = reindexAll;
exports.reindexSubset = reindexSubset;
exports.search = search;
// @ts-nocheck
var promises_1 = require("fs/promises");
var path_1 = require("path");
var fast_glob_1 = require("fast-glob");
var chromadb_1 = require("chromadb");
var remoteEmbedding_js_1 = require("./remoteEmbedding.js");
var logger_js_1 = require("./logger.js");
var indexerState_js_1 = require("./indexerState.js");
var CHROMA = null; // lazily created to avoid holding open handles during import
var EMBEDDING_FACTORY = null; // optional override for tests
var EMBEDDING_INSTANCE = null; // cached default embedding fn
var EMBEDDING_INSTANCE_KEY = null; // cache key for default embedding fn
function setChromaClient(client) {
  CHROMA = client;
}
function setEmbeddingFactory(factory) {
  EMBEDDING_FACTORY = factory;
}
function resetChroma() {
  CHROMA = null;
}
function resetEmbeddingCache() {
  var _a;
  try {
    (_a =
      EMBEDDING_INSTANCE === null || EMBEDDING_INSTANCE === void 0
        ? void 0
        : EMBEDDING_INSTANCE.dispose) === null || _a === void 0
      ? void 0
      : _a.call(EMBEDDING_INSTANCE);
  } catch (_b) {}
  EMBEDDING_INSTANCE = null;
  EMBEDDING_INSTANCE_KEY = null;
}
function getChroma() {
  if (!CHROMA) CHROMA = new chromadb_1.ChromaClient();
  return CHROMA;
}
function splitCSV(s) {
  return (s || "")
    .split(",")
    .map(function (x) {
      return x.trim();
    })
    .filter(Boolean);
}
function defaultExcludes() {
  var env = splitCSV(process.env.EXCLUDE_GLOBS);
  return env.length
    ? env
    : ["node_modules/**", ".git/**", "dist/**", "build/**", ".obsidian/**"];
}
// Enumerate files + capture quick stats used for incremental comparisons
function scanFiles(rootPath) {
  return __awaiter(this, void 0, void 0, function () {
    var include, files, fileInfo, _i, files_1, rel, st, _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          include = ["**/*.{md,txt,js,ts,jsx,tsx,py,go,rs,json,yml,yaml,sh}"];
          return [
            4 /*yield*/,
            (0, fast_glob_1.default)(include, {
              cwd: rootPath,
              ignore: defaultExcludes(),
              onlyFiles: true,
              dot: false,
            }),
          ];
        case 1:
          files = _b.sent();
          fileInfo = {};
          (_i = 0), (files_1 = files);
          _b.label = 2;
        case 2:
          if (!(_i < files_1.length)) return [3 /*break*/, 7];
          rel = files_1[_i];
          _b.label = 3;
        case 3:
          _b.trys.push([3, 5, , 6]);
          return [
            4 /*yield*/,
            promises_1.default.stat(path_1.default.join(rootPath, rel)),
          ];
        case 4:
          st = _b.sent();
          fileInfo[rel] = {
            size: Number(st.size),
            mtimeMs: Number(st.mtimeMs),
          };
          return [3 /*break*/, 6];
        case 5:
          _a = _b.sent();
          return [3 /*break*/, 6];
        case 6:
          _i++;
          return [3 /*break*/, 2];
        case 7:
          return [2 /*return*/, { files: files, fileInfo: fileInfo }];
      }
    });
  });
}
// Chunk by ~2000 chars with 200 overlap; track line numbers.
function makeChunks(text, maxLen, overlap) {
  if (maxLen === void 0) {
    maxLen = 2000;
  }
  if (overlap === void 0) {
    overlap = 200;
  }
  var chunks = [];
  var i = 0;
  var start = 0;
  while (start < text.length) {
    var end = Math.min(text.length, start + maxLen);
    var chunk = text.slice(start, end);
    var startLine = text.slice(0, start).split("\n").length;
    var endLine = text.slice(0, end).split("\n").length;
    chunks.push({
      index: i++,
      start: start,
      end: end,
      startLine: startLine,
      endLine: endLine,
      text: chunk,
    });
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks;
}
function buildEmbeddingFn() {
  return __awaiter(this, void 0, void 0, function () {
    var driver, fn, key;
    var _a;
    return __generator(this, function (_b) {
      driver = process.env.EMBEDDING_DRIVER || "ollama";
      fn = process.env.EMBEDDING_FUNCTION || "nomic-embed-text";
      key = ""
        .concat(driver, "::")
        .concat(fn, "::")
        .concat(process.env.BROKER_URL || "");
      if (EMBEDDING_INSTANCE && EMBEDDING_INSTANCE_KEY === key)
        return [2 /*return*/, EMBEDDING_INSTANCE];
      try {
        (_a =
          EMBEDDING_INSTANCE === null || EMBEDDING_INSTANCE === void 0
            ? void 0
            : EMBEDDING_INSTANCE.dispose) === null || _a === void 0
          ? void 0
          : _a.call(EMBEDDING_INSTANCE);
      } catch (_c) {}
      EMBEDDING_INSTANCE =
        remoteEmbedding_js_1.RemoteEmbeddingFunction.fromConfig({
          driver: driver,
          fn: fn,
        });
      EMBEDDING_INSTANCE_KEY = key;
      return [2 /*return*/, EMBEDDING_INSTANCE];
    });
  });
}
function embeddingEnvConfig() {
  return {
    driver: process.env.EMBEDDING_DRIVER || "ollama",
    fn: process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
  };
}
// Index a single file (helper used by queue/manager and tests)
function indexFile(rootPath_1, rel_1) {
  return __awaiter(this, arguments, void 0, function (rootPath, rel, options) {
    var family,
      version,
      cfg,
      col,
      abs,
      raw,
      e_1,
      chunks,
      processed,
      _i,
      chunks_1,
      c,
      id;
    if (options === void 0) {
      options = {};
    }
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          family = process.env.COLLECTION_FAMILY || "repo_files";
          version = process.env.EMBED_VERSION || "dev";
          cfg = {
            driver: process.env.EMBEDDING_DRIVER || "ollama",
            fn: process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
            dims: Number(process.env.EMBED_DIMS || 768),
          };
          return [4 /*yield*/, collectionForFamily(family, version, cfg)];
        case 1:
          col = _a.sent();
          abs = path_1.default.join(rootPath, rel);
          raw = "";
          _a.label = 2;
        case 2:
          _a.trys.push([2, 4, , 5]);
          return [4 /*yield*/, promises_1.default.readFile(abs, "utf8")];
        case 3:
          raw = _a.sent();
          return [3 /*break*/, 5];
        case 4:
          e_1 = _a.sent();
          logger_js_1.logger.warn("indexFile read failed", {
            path: rel,
            err: e_1,
          });
          return [
            2 /*return*/,
            {
              ok: false,
              error: String(
                (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1,
              ),
            },
          ];
        case 5:
          chunks = makeChunks(raw);
          processed = 0;
          (_i = 0), (chunks_1 = chunks);
          _a.label = 6;
        case 6:
          if (!(_i < chunks_1.length)) return [3 /*break*/, 9];
          c = chunks_1[_i];
          id = "".concat(rel, "#").concat(c.index);
          return [
            4 /*yield*/,
            col.upsert({
              ids: [id],
              documents: [c.text],
              metadatas: [
                {
                  path: rel,
                  chunkIndex: c.index,
                  startLine: c.startLine,
                  endLine: c.endLine,
                  bytesStart: c.start,
                  bytesEnd: c.end,
                  version: version,
                  driver: cfg.driver,
                  fn: cfg.fn,
                },
              ],
            }),
          ];
        case 7:
          _a.sent();
          processed++;
          _a.label = 8;
        case 8:
          _i++;
          return [3 /*break*/, 6];
        case 9:
          return [2 /*return*/, { ok: true, path: rel, processed: processed }];
      }
    });
  });
}
function removeFileFromIndex(rootPath, rel) {
  return __awaiter(this, void 0, void 0, function () {
    var family, version, cfg, col, e_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          family = process.env.COLLECTION_FAMILY || "repo_files";
          version = process.env.EMBED_VERSION || "dev";
          cfg = {
            driver: process.env.EMBEDDING_DRIVER || "ollama",
            fn: process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
          };
          return [4 /*yield*/, collectionForFamily(family, version, cfg)];
        case 1:
          col = _a.sent();
          _a.label = 2;
        case 2:
          _a.trys.push([2, 4, , 5]);
          return [4 /*yield*/, col.delete({ where: { path: rel } })];
        case 3:
          _a.sent();
          return [2 /*return*/, { ok: true }];
        case 4:
          e_2 = _a.sent();
          logger_js_1.logger.error("removeFileFromIndex failed", {
            path: rel,
            err: e_2,
          });
          return [
            2 /*return*/,
            {
              ok: false,
              error: String(
                (e_2 === null || e_2 === void 0 ? void 0 : e_2.message) || e_2,
              ),
            },
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// Simple in-memory queue manager with delay between files and bootstrap mode
var IndexerManager = /** @class */ (function () {
  function IndexerManager() {
    this.mode = "bootstrap"; // 'bootstrap' | 'indexed'
    this.queue = [];
    this.active = false;
    this.startedAt = null;
    this.finishedAt = null;
    this.processedFiles = 0;
    this.errors = [];
    this.rootPath = null;
    this._draining = false;
    this.bootstrap = null; // { fileList: string[], cursor: number }
    this.state = null; // last persisted state
  }
  IndexerManager.prototype.status = function () {
    return {
      mode: this.mode,
      active: this.active,
      queuedFiles: this.queue.length,
      processedFiles: this.processedFiles,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      lastError: this.errors[this.errors.length - 1] || null,
      bootstrap: this.bootstrap
        ? {
            total: this.bootstrap.fileList.length,
            cursor: this.bootstrap.cursor,
            remaining: Math.max(
              0,
              this.bootstrap.fileList.length - this.bootstrap.cursor,
            ),
          }
        : null,
    };
  };
  IndexerManager.prototype.isBusy = function () {
    return this.active || this._draining || this.queue.length > 0;
  };
  IndexerManager.prototype.resetAndBootstrap = function (rootPath) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isBusy()) throw new Error("Indexer is busy");
            this.mode = "bootstrap";
            this.queue = [];
            this.active = false;
            this.startedAt = null;
            this.finishedAt = null;
            this.processedFiles = 0;
            this.errors = [];
            this.rootPath = null;
            this._draining = false;
            this.bootstrap = null;
            this.state = null;
            return [
              4 /*yield*/,
              (0, indexerState_js_1.deleteBootstrapState)(rootPath),
            ];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.ensureBootstrap(rootPath)];
          case 2:
            _a.sent();
            return [2 /*return*/, { ok: true }];
        }
      });
    });
  };
  IndexerManager.prototype.ensureBootstrap = function (rootPath) {
    return __awaiter(this, void 0, void 0, function () {
      var prev, now, known_1, add, _a, remaining, _b, files, fileInfo;
      var _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            if (this.rootPath) return [2 /*return*/]; // already initialized
            this.rootPath = rootPath;
            this.startedAt = Date.now();
            return [
              4 /*yield*/,
              (0, indexerState_js_1.loadBootstrapState)(rootPath),
            ];
          case 1:
            prev = _d.sent();
            this.state = prev;
            if (
              !(
                prev &&
                prev.mode === "bootstrap" &&
                Array.isArray(prev.fileList)
              )
            )
              return [3 /*break*/, 8];
            this.mode = "bootstrap";
            this.bootstrap = {
              fileList: prev.fileList,
              cursor: Number(prev.cursor || 0),
            };
            _d.label = 2;
          case 2:
            _d.trys.push([2, 6, , 7]);
            return [4 /*yield*/, scanFiles(rootPath)];
          case 3:
            now = _d.sent().files;
            known_1 = new Set(this.bootstrap.fileList);
            add = now.filter(function (f) {
              return !known_1.has(f);
            });
            if (!add.length) return [3 /*break*/, 5];
            (_c = this.bootstrap.fileList).push.apply(_c, add);
            return [
              4 /*yield*/,
              (0, indexerState_js_1.saveBootstrapState)(this.rootPath, {
                mode: "bootstrap",
                cursor: this.bootstrap.cursor,
                fileList: this.bootstrap.fileList,
                startedAt: this.startedAt,
                fileInfo: prev.fileInfo || {},
              }),
            ];
          case 4:
            _d.sent();
            _d.label = 5;
          case 5:
            return [3 /*break*/, 7];
          case 6:
            _a = _d.sent();
            return [3 /*break*/, 7];
          case 7:
            remaining = this.bootstrap.fileList.slice(this.bootstrap.cursor);
            logger_js_1.logger.info("indexer bootstrap resumed", {
              total: this.bootstrap.fileList.length,
              cursor: this.bootstrap.cursor,
              remaining: remaining.length,
              rootPath: rootPath,
            });
            this.enqueueFiles(remaining);
            this._drain();
            return [2 /*return*/];
          case 8:
            if (!(prev && prev.mode === "indexed")) return [3 /*break*/, 10];
            // Completed previously; run incremental scan and enqueue changes
            this.mode = "indexed";
            this.bootstrap = null;
            this.finishedAt = prev.finishedAt || null;
            logger_js_1.logger.info("indexer incremental scan starting", {
              rootPath: rootPath,
            });
            return [4 /*yield*/, this._scheduleIncremental(prev)];
          case 9:
            _d.sent();
            return [2 /*return*/];
          case 10:
            return [4 /*yield*/, scanFiles(rootPath)];
          case 11:
            (_b = _d.sent()), (files = _b.files), (fileInfo = _b.fileInfo);
            logger_js_1.logger.info("indexer bootstrap discovered files", {
              count: files.length,
              rootPath: rootPath,
            });
            this.mode = "bootstrap";
            this.bootstrap = { fileList: files, cursor: 0 };
            return [
              4 /*yield*/,
              (0, indexerState_js_1.saveBootstrapState)(rootPath, {
                mode: "bootstrap",
                cursor: 0,
                fileList: files,
                startedAt: this.startedAt,
                fileInfo: fileInfo,
              }),
            ];
          case 12:
            _d.sent();
            this.enqueueFiles(files);
            this._drain();
            return [2 /*return*/];
        }
      });
    });
  };
  IndexerManager.prototype.enqueueFiles = function (rels) {
    var set = new Set(this.queue);
    for (var _i = 0, rels_1 = rels; _i < rels_1.length; _i++) {
      var r = rels_1[_i];
      if (!set.has(r)) {
        set.add(r);
        this.queue.push(r);
      }
    }
  };
  IndexerManager.prototype._drain = function () {
    return __awaiter(this, void 0, void 0, function () {
      var delayMs, rel, e_3, _a, files, fileInfo;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (this._draining) return [2 /*return*/];
            this._draining = true;
            delayMs = Number(process.env.INDEXER_FILE_DELAY_MS || 250);
            _b.label = 1;
          case 1:
            if (!this.queue.length) return [3 /*break*/, 12];
            this.active = true;
            rel = this.queue.shift();
            logger_js_1.logger.info("indexer processing file", {
              path: rel,
              remaining: this.queue.length,
            });
            _b.label = 2;
          case 2:
            _b.trys.push([2, 6, , 9]);
            return [4 /*yield*/, indexFile(this.rootPath, rel)];
          case 3:
            _b.sent();
            this.processedFiles++;
            if (
              !(
                this.mode === "bootstrap" &&
                this.bootstrap &&
                this.bootstrap.fileList[this.bootstrap.cursor] === rel
              )
            )
              return [3 /*break*/, 5];
            this.bootstrap.cursor++;
            return [
              4 /*yield*/,
              (0, indexerState_js_1.saveBootstrapState)(this.rootPath, {
                mode: "bootstrap",
                cursor: this.bootstrap.cursor,
                fileList: this.bootstrap.fileList,
                startedAt: this.startedAt,
              }),
            ];
          case 4:
            _b.sent();
            _b.label = 5;
          case 5:
            return [3 /*break*/, 9];
          case 6:
            e_3 = _b.sent();
            this.errors.push(
              String(
                (e_3 === null || e_3 === void 0 ? void 0 : e_3.message) || e_3,
              ),
            );
            logger_js_1.logger.error("index queue error", {
              err: e_3,
              path: rel,
            });
            if (
              !(
                this.mode === "bootstrap" &&
                this.bootstrap &&
                this.bootstrap.fileList[this.bootstrap.cursor] === rel
              )
            )
              return [3 /*break*/, 8];
            this.bootstrap.cursor++;
            return [
              4 /*yield*/,
              (0, indexerState_js_1.saveBootstrapState)(this.rootPath, {
                mode: "bootstrap",
                cursor: this.bootstrap.cursor,
                fileList: this.bootstrap.fileList,
                startedAt: this.startedAt,
              }),
            ];
          case 7:
            _b.sent();
            _b.label = 8;
          case 8:
            return [3 /*break*/, 9];
          case 9:
            if (!this.queue.length) return [3 /*break*/, 11];
            return [
              4 /*yield*/,
              new Promise(function (r) {
                return setTimeout(r, delayMs);
              }),
            ];
          case 10:
            _b.sent();
            _b.label = 11;
          case 11:
            return [3 /*break*/, 1];
          case 12:
            this.active = false;
            this.finishedAt = Date.now();
            this._draining = false;
            if (!(this.mode === "bootstrap")) return [3 /*break*/, 15];
            if (
              !(
                this.bootstrap &&
                this.bootstrap.cursor >= this.bootstrap.fileList.length
              )
            )
              return [3 /*break*/, 15];
            this.mode = "indexed";
            return [4 /*yield*/, scanFiles(this.rootPath)];
          case 13:
            (_a = _b.sent()), (files = _a.files), (fileInfo = _a.fileInfo);
            return [
              4 /*yield*/,
              (0, indexerState_js_1.saveBootstrapState)(this.rootPath, {
                mode: "indexed",
                cursor: this.bootstrap.cursor,
                fileList: files,
                fileInfo: fileInfo,
                startedAt: this.startedAt,
                finishedAt: this.finishedAt,
              }),
            ];
          case 14:
            _b.sent();
            _b.label = 15;
          case 15:
            logger_js_1.logger.info("indexer drain complete", {
              processedFiles: this.processedFiles,
              errors: this.errors.length,
              mode: this.mode,
            });
            return [2 /*return*/];
        }
      });
    });
  };
  IndexerManager.prototype.scheduleReindexAll = function () {
    return __awaiter(this, void 0, void 0, function () {
      var include, files;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.mode === "bootstrap")
              return [
                2 /*return*/,
                { ok: true, ignored: true, mode: this.mode },
              ];
            include = ["**/*.{md,txt,js,ts,jsx,tsx,py,go,rs,json,yml,yaml,sh}"];
            return [
              4 /*yield*/,
              (0, fast_glob_1.default)(include, {
                cwd: this.rootPath,
                ignore: defaultExcludes(),
                onlyFiles: true,
                dot: false,
              }),
            ];
          case 1:
            files = _a.sent();
            this.enqueueFiles(files);
            this._drain();
            return [2 /*return*/, { ok: true, queued: files.length }];
        }
      });
    });
  };
  IndexerManager.prototype.scheduleReindexSubset = function (globs) {
    return __awaiter(this, void 0, void 0, function () {
      var include, files;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.mode === "bootstrap")
              return [
                2 /*return*/,
                { ok: true, ignored: true, mode: this.mode },
              ];
            include = Array.isArray(globs) ? globs : [String(globs)];
            return [
              4 /*yield*/,
              (0, fast_glob_1.default)(include, {
                cwd: this.rootPath,
                ignore: defaultExcludes(),
                onlyFiles: true,
                dot: false,
              }),
            ];
          case 1:
            files = _a.sent();
            this.enqueueFiles(files);
            this._drain();
            return [2 /*return*/, { ok: true, queued: files.length }];
        }
      });
    });
  };
  IndexerManager.prototype.scheduleIndexFile = function (rel) {
    return __awaiter(this, void 0, void 0, function () {
      var fileRel;
      return __generator(this, function (_a) {
        fileRel = path_1.default.isAbsolute(rel)
          ? path_1.default.relative(this.rootPath, rel)
          : rel;
        this.enqueueFiles([fileRel]);
        this._drain();
        return [2 /*return*/, { ok: true, queued: 1 }];
      });
    });
  };
  IndexerManager.prototype.removeFile = function (rel) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, removeFileFromIndex(this.rootPath, rel)];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  IndexerManager.prototype._scheduleIncremental = function (prev) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        currentFiles,
        currentInfo,
        prevInfo,
        prevSet,
        curSet,
        toIndex,
        _i,
        currentFiles_1,
        f,
        cur,
        p,
        toRemove,
        _b,
        prevSet_1,
        f,
        _c,
        toRemove_1,
        rel,
        e_4;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            return [4 /*yield*/, scanFiles(this.rootPath)];
          case 1:
            (_a = _d.sent()),
              (currentFiles = _a.files),
              (currentInfo = _a.fileInfo);
            prevInfo =
              (prev === null || prev === void 0 ? void 0 : prev.fileInfo) || {};
            prevSet = new Set(Object.keys(prevInfo));
            curSet = new Set(currentFiles);
            toIndex = [];
            for (
              _i = 0, currentFiles_1 = currentFiles;
              _i < currentFiles_1.length;
              _i++
            ) {
              f = currentFiles_1[_i];
              cur = currentInfo[f];
              p = prevInfo[f];
              if (!p) {
                toIndex.push(f);
              } else if (p.size !== cur.size || p.mtimeMs !== cur.mtimeMs) {
                toIndex.push(f);
              }
            }
            toRemove = [];
            for (_b = 0, prevSet_1 = prevSet; _b < prevSet_1.length; _b++) {
              f = prevSet_1[_b];
              if (!curSet.has(f)) toRemove.push(f);
            }
            if (!toRemove.length) return [3 /*break*/, 7];
            (_c = 0), (toRemove_1 = toRemove);
            _d.label = 2;
          case 2:
            if (!(_c < toRemove_1.length)) return [3 /*break*/, 7];
            rel = toRemove_1[_c];
            _d.label = 3;
          case 3:
            _d.trys.push([3, 5, , 6]);
            return [4 /*yield*/, this.removeFile(rel)];
          case 4:
            _d.sent();
            return [3 /*break*/, 6];
          case 5:
            e_4 = _d.sent();
            logger_js_1.logger.warn("incremental remove failed", {
              path: rel,
              err: e_4,
            });
            return [3 /*break*/, 6];
          case 6:
            _c++;
            return [3 /*break*/, 2];
          case 7:
            if (toIndex.length) {
              logger_js_1.logger.info("indexer incremental changes", {
                new_or_changed: toIndex.length,
                removed: toRemove.length,
              });
              this.enqueueFiles(toIndex);
              this._drain();
            } else if (toRemove.length) {
              logger_js_1.logger.info("indexer incremental removed only", {
                removed: toRemove.length,
              });
            } else {
              logger_js_1.logger.info("indexer incremental no changes");
            }
            return [
              4 /*yield*/,
              (0, indexerState_js_1.saveBootstrapState)(this.rootPath, {
                mode: "indexed",
                cursor:
                  (prev === null || prev === void 0 ? void 0 : prev.cursor) ||
                  0,
                fileList: currentFiles,
                fileInfo: currentInfo,
                startedAt:
                  (prev === null || prev === void 0
                    ? void 0
                    : prev.startedAt) || this.startedAt,
                finishedAt: Date.now(),
              }),
            ];
          case 8:
            _d.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  return IndexerManager;
})();
exports.indexerManager = new IndexerManager();
function collectionForFamily(family, version, cfg) {
  return __awaiter(this, void 0, void 0, function () {
    var embeddingFunction, _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          if (!EMBEDDING_FACTORY) return [3 /*break*/, 2];
          return [4 /*yield*/, EMBEDDING_FACTORY()];
        case 1:
          _a = _b.sent();
          return [3 /*break*/, 4];
        case 2:
          return [4 /*yield*/, buildEmbeddingFn()];
        case 3:
          _a = _b.sent();
          _b.label = 4;
        case 4:
          embeddingFunction = _a;
          return [
            4 /*yield*/,
            getChroma().getOrCreateCollection({
              name: ""
                .concat(family, "__")
                .concat(version, "__")
                .concat(cfg.driver, "__")
                .concat(cfg.fn),
              embeddingFunction: embeddingFunction,
              metadata: __assign({ family: family, version: version }, cfg),
            }),
          ];
        case 5:
          return [2 /*return*/, _b.sent()];
      }
    });
  });
}
function reindexAll(rootPath_1) {
  return __awaiter(this, arguments, void 0, function (rootPath, options) {
    var family,
      version,
      include,
      exclude,
      limit,
      cfg,
      col,
      files,
      max,
      processed,
      i,
      rel,
      abs,
      raw,
      chunks,
      _i,
      chunks_2,
      c,
      id;
    if (options === void 0) {
      options = {};
    }
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          family = process.env.COLLECTION_FAMILY || "repo_files";
          version = process.env.EMBED_VERSION || "dev";
          include = options.include || [
            "**/*.{md,txt,js,ts,jsx,tsx,py,go,rs,json,yml,yaml,sh}",
          ];
          exclude = options.exclude || defaultExcludes();
          limit = options.limit || 0;
          cfg = {
            driver: process.env.EMBEDDING_DRIVER || "ollama",
            fn: process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
            dims: Number(process.env.EMBED_DIMS || 768),
          };
          return [4 /*yield*/, collectionForFamily(family, version, cfg)];
        case 1:
          col = _a.sent();
          return [
            4 /*yield*/,
            (0, fast_glob_1.default)(include, {
              cwd: rootPath,
              ignore: exclude,
              onlyFiles: true,
              dot: false,
            }),
          ];
        case 2:
          files = _a.sent();
          max = limit > 0 ? Math.min(limit, files.length) : files.length;
          processed = 0;
          i = 0;
          _a.label = 3;
        case 3:
          if (!(i < max)) return [3 /*break*/, 9];
          rel = files[i];
          abs = path_1.default.join(rootPath, rel);
          return [4 /*yield*/, promises_1.default.readFile(abs, "utf8")];
        case 4:
          raw = _a.sent();
          chunks = makeChunks(raw);
          (_i = 0), (chunks_2 = chunks);
          _a.label = 5;
        case 5:
          if (!(_i < chunks_2.length)) return [3 /*break*/, 8];
          c = chunks_2[_i];
          id = "".concat(rel, "#").concat(c.index);
          return [
            4 /*yield*/,
            col.upsert({
              ids: [id],
              documents: [c.text],
              metadatas: [
                {
                  path: rel,
                  chunkIndex: c.index,
                  startLine: c.startLine,
                  endLine: c.endLine,
                  bytesStart: c.start,
                  bytesEnd: c.end,
                  version: version,
                  driver: cfg.driver,
                  fn: cfg.fn,
                },
              ],
            }),
          ];
        case 6:
          _a.sent();
          processed++;
          _a.label = 7;
        case 7:
          _i++;
          return [3 /*break*/, 5];
        case 8:
          i++;
          return [3 /*break*/, 3];
        case 9:
          return [
            2 /*return*/,
            { family: family, version: version, processed: processed },
          ];
      }
    });
  });
}
function reindexSubset(rootPath_1, globs_1) {
  return __awaiter(
    this,
    arguments,
    void 0,
    function (rootPath, globs, options) {
      var include, merged;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        include = Array.isArray(globs) ? globs : [String(globs)];
        merged = __assign(__assign({}, options), { include: include });
        return [2 /*return*/, reindexAll(rootPath, merged)];
      });
    },
  );
}
function search(rootPath_1, q_1) {
  return __awaiter(this, arguments, void 0, function (rootPath, q, n) {
    var family, version, cfg, col, r, ids, docs, metas, dists, out, i, m;
    var _a, _b, _c, _d;
    if (n === void 0) {
      n = 8;
    }
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          family = process.env.COLLECTION_FAMILY || "repo_files";
          version = process.env.EMBED_VERSION || "dev";
          cfg = {
            driver: process.env.EMBEDDING_DRIVER || "ollama",
            fn: process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
          };
          return [4 /*yield*/, collectionForFamily(family, version, cfg)];
        case 1:
          col = _e.sent();
          return [4 /*yield*/, col.query({ queryTexts: [q], nResults: n })];
        case 2:
          r = _e.sent();
          ids =
            ((_a = r.ids) === null || _a === void 0 ? void 0 : _a.flat(2)) ||
            [];
          docs =
            ((_b = r.documents) === null || _b === void 0
              ? void 0
              : _b.flat(2)) || [];
          metas =
            ((_c = r.metadatas) === null || _c === void 0
              ? void 0
              : _c.flat(2)) || [];
          dists =
            ((_d = r.distances) === null || _d === void 0
              ? void 0
              : _d.flat(2)) || [];
          out = [];
          for (i = 0; i < docs.length; i++) {
            m = metas[i] || {};
            out.push({
              id: ids[i],
              path: m.path,
              chunkIndex: m.chunkIndex,
              startLine: m.startLine,
              endLine: m.endLine,
              score: typeof dists[i] === "number" ? dists[i] : undefined,
              text: docs[i],
            });
          }
          return [2 /*return*/, out];
      }
    });
  });
}
