import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { reindexAll, reindexSubset, search, indexerManager } from './indexer.js';
import { grep } from './grep.js';
import { viewFile, locateStacktrace, listDirectory } from './files.js';
import { symbolsIndex, symbolsFind } from './symbols.js';
import { supervisor, ptySupervisor, restoreAgentsFromStore } from './agent.js';
import { logger } from './logger.js';
import { runCommand } from './exec.js';
import { createAuth } from './auth.js';

import { configDotenv } from 'dotenv';
// Avoid loading local .env during tests to prevent auth/test conflicts
if ((process.env.NODE_ENV || '').toLowerCase() !== 'test') {
    try {
        configDotenv();
    } catch {}
}

export function spec() {
    const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3210}`;
    const authEnabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';
    const authMode = (process.env.AUTH_MODE || 'static').toLowerCase();
    const bearerFormat = authMode === 'jwt' ? 'JWT' : 'Opaque';
    const security = authEnabled ? [{ bearerAuth: [] }] : [];
    const securitySchemes = authEnabled
        ? {
              bearerAuth: {
                  type: 'http',
                  scheme: 'bearer',
                  bearerFormat,
                  description:
                      authMode === 'jwt'
                          ? 'Send JWT via Authorization: Bearer <token>'
                          : 'Send static token via Authorization: Bearer <token>',
              },
          }
        : undefined;
    return {
        openapi: '3.1.0',
        info: {
            title: 'Promethean SmartGPT Bridge',
            version: '1.0.0',
            description:
                'HTTP bridge: file utilities, grep, stacktrace, TS symbols, and agent supervisor.',
        },
        jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
        servers: [{ url: baseUrl }],
        security,
        tags: [
            { name: 'files' },
            { name: 'grep' },
            { name: 'stacktrace' },
            { name: 'symbols' },
            { name: 'agent' },
            { name: 'exec' },
            { name: 'index' },
            { name: 'search' },
            { name: 'auth' },
        ],
        paths: {
            '/files/list': {
                get: {
                    operationId: 'filesList',
                    tags: ['files'],
                    summary: 'List directory contents (one level)',
                    parameters: [
                        { name: 'path', in: 'query', required: false, schema: { type: 'string' } },
                        {
                            name: 'hidden',
                            in: 'query',
                            required: false,
                            schema: { type: 'boolean' },
                        },
                        {
                            name: 'type',
                            in: 'query',
                            required: false,
                            schema: { type: 'string', enum: ['file', 'dir'] },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            ok: { type: 'boolean' },
                                            base: { type: 'string' },
                                            entries: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        name: { type: 'string' },
                                                        path: { type: 'string' },
                                                        type: {
                                                            type: 'string',
                                                            enum: ['file', 'dir', 'other'],
                                                        },
                                                        size: { type: ['integer', 'null'] },
                                                        mtimeMs: { type: ['number', 'null'] },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        400: {
                            description: 'Bad Request',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/auth/me': {
                get: {
                    operationId: 'authMe',
                    tags: ['auth'],
                    summary: 'Auth status check',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            ok: { type: 'boolean' },
                                            auth: { type: 'boolean' },
                                        },
                                    },
                                },
                            },
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/exec/run': {
                post: {
                    operationId: 'execRun',
                    tags: ['exec'],
                    summary: 'Run a command and return output',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ExecRunRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ExecRunResponse' },
                                },
                            },
                        },
                        400: {
                            description: 'Bad Request',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                        500: {
                            description: 'Error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/reindex': {
                post: {
                    operationId: 'reindex',
                    tags: ['index'],
                    summary: 'Reindex entire ROOT_PATH into embeddings',
                    requestBody: {
                        required: false,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: { limit: { type: 'integer', minimum: 0 } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ReindexResponse' },
                                },
                            },
                        },
                        500: {
                            description: 'Error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/indexer/status': {
                get: {
                    operationId: 'indexerStatus',
                    tags: ['index'],
                    summary: 'Get indexer status (mode, queue, progress)',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            ok: { type: 'boolean' },
                                            status: { type: 'object' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/files/reindex': {
                post: {
                    operationId: 'filesReindex',
                    tags: ['index'],
                    summary: 'Reindex subset by glob(s)',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['path'],
                                    properties: {
                                        path: {
                                            oneOf: [
                                                { type: 'string' },
                                                { type: 'array', items: { type: 'string' } },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ReindexResponse' },
                                },
                            },
                        },
                        400: {
                            description: 'Bad Request',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                        500: {
                            description: 'Error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/indexer/index': {
                post: {
                    operationId: 'indexerIndexFile',
                    tags: ['index'],
                    summary: 'Schedule single file for indexing',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['path'],
                                    properties: { path: { type: 'string' } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': { schema: { $ref: '#/components/schemas/Ok' } },
                            },
                        },
                    },
                },
            },
            '/indexer/remove': {
                post: {
                    operationId: 'indexerRemoveFile',
                    tags: ['index'],
                    summary: 'Remove file entries from index',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['path'],
                                    properties: { path: { type: 'string' } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': { schema: { $ref: '#/components/schemas/Ok' } },
                            },
                        },
                    },
                },
            },
            '/indexer/reset': {
                post: {
                    operationId: 'indexerReset',
                    tags: ['index'],
                    summary: 'Reset indexer state and restart bootstrap (if idle)',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': { schema: { $ref: '#/components/schemas/Ok' } },
                            },
                        },
                        409: {
                            description: 'Conflict (busy)',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/search': {
                post: {
                    operationId: 'search',
                    tags: ['search'],
                    summary: 'Semantic search via Chroma',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/SearchRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SearchResponse' },
                                },
                            },
                        },
                        400: {
                            description: 'Bad Request',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                        500: {
                            description: 'Error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/grep': {
                post: {
                    operationId: 'grep',
                    tags: ['grep'],
                    summary: 'Regex search across files',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/GrepRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/GrepResponse' },
                                },
                            },
                        },
                        400: {
                            description: 'Bad Request (invalid regex or params)',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/files/view': {
                get: {
                    operationId: 'filesView',
                    tags: ['files'],
                    summary: 'View file snippet around a line',
                    parameters: [
                        { name: 'path', in: 'query', required: true, schema: { type: 'string' } },
                        {
                            name: 'line',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer', minimum: 1 },
                            default: 1,
                        },
                        {
                            name: 'context',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer', minimum: 0 },
                            default: 25,
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ViewFileResponse' },
                                },
                            },
                        },
                        404: {
                            description: 'Not Found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/stacktrace/locate': {
                post: {
                    operationId: 'stacktraceLocate',
                    tags: ['stacktrace'],
                    summary: 'Parse stacktrace to snippets',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StacktraceLocateRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/StacktraceLocateResponse',
                                    },
                                },
                            },
                        },
                        400: {
                            description: 'Bad Request',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/symbols/index': {
                post: {
                    operationId: 'symbolsIndex',
                    tags: ['symbols'],
                    summary: 'Index TS/JS symbols',
                    requestBody: {
                        required: false,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/SymbolsIndexRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SymbolsIndexResponse' },
                                },
                            },
                        },
                        500: {
                            description: 'Error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/symbols/find': {
                post: {
                    operationId: 'symbolsFind',
                    tags: ['symbols'],
                    summary: 'Find symbols',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/SymbolsFindRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SymbolsFindResponse' },
                                },
                            },
                        },
                        400: {
                            description: 'Bad Request',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/start': {
                post: {
                    operationId: 'agentStart',
                    tags: ['agent'],
                    summary: 'Start codex agent',
                    requestBody: {
                        required: false,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AgentStartRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentStartResponse' },
                                },
                            },
                        },
                        500: {
                            description: 'Error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/status': {
                get: {
                    operationId: 'agentStatus',
                    tags: ['agent'],
                    summary: 'Get agent status',
                    parameters: [
                        { name: 'id', in: 'query', required: true, schema: { type: 'string' } },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentStatusResponse' },
                                },
                            },
                        },
                        404: {
                            description: 'Not Found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/list': {
                get: {
                    operationId: 'agentList',
                    tags: ['agent'],
                    summary: 'List agents',
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentListResponse' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/logs': {
                get: {
                    operationId: 'agentLogs',
                    tags: ['agent'],
                    summary: 'Get logs',
                    parameters: [
                        { name: 'id', in: 'query', required: true, schema: { type: 'string' } },
                        {
                            name: 'since',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer', minimum: 0 },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentLogsResponse' },
                                },
                            },
                        },
                        404: {
                            description: 'Not Found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/tail': {
                get: {
                    operationId: 'agentTail',
                    tags: ['agent'],
                    summary: 'Tail logs (last N bytes)',
                    parameters: [
                        { name: 'id', in: 'query', required: true, schema: { type: 'string' } },
                        {
                            name: 'bytes',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer', minimum: 1 },
                            default: 8192,
                        },
                    ],
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/AgentLogsResponse' },
                                },
                            },
                        },
                        404: {
                            description: 'Not Found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' },
                                },
                            },
                        },
                    },
                },
            },
            '/agent/stream': {
                get: {
                    operationId: 'agentStream',
                    tags: ['agent'],
                    summary: 'SSE live logs',
                    parameters: [
                        { name: 'id', in: 'query', required: true, schema: { type: 'string' } },
                    ],
                    responses: { 200: { description: 'OK (text/event-stream)' } },
                },
            },
            '/agent/send': {
                post: {
                    operationId: 'agentSend',
                    tags: ['agent'],
                    summary: 'Send input to stdin',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AgentSendRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': { schema: { $ref: '#/components/schemas/Ok' } },
                            },
                        },
                    },
                },
            },
            '/agent/interrupt': {
                post: {
                    operationId: 'agentInterrupt',
                    tags: ['agent'],
                    summary: 'SIGINT',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AgentIdRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': { schema: { $ref: '#/components/schemas/Ok' } },
                            },
                        },
                    },
                },
            },
            '/agent/kill': {
                post: {
                    operationId: 'agentKill',
                    tags: ['agent'],
                    summary: 'SIGTERM/SIGKILL',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AgentKillRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': { schema: { $ref: '#/components/schemas/Ok' } },
                            },
                        },
                    },
                },
            },
            '/agent/resume': {
                post: {
                    operationId: 'agentResume',
                    tags: ['agent'],
                    summary: 'Resume after guard pause',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AgentIdRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'OK',
                            content: {
                                'application/json': { schema: { $ref: '#/components/schemas/Ok' } },
                            },
                        },
                    },
                },
            },
        },
        components: {
            securitySchemes,
            schemas: {
                Ok: { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'] },
                Error: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean', default: false },
                        error: { type: 'string' },
                    },
                    required: ['ok', 'error'],
                },
                ReindexResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        family: { type: 'string' },
                        version: { type: 'string' },
                        processed: { type: 'integer' },
                    },
                },
                SearchRequest: {
                    type: 'object',
                    required: ['q'],
                    properties: {
                        q: { type: 'string' },
                        n: { type: 'integer', minimum: 1, default: 8 },
                    },
                },
                SearchHit: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        path: { type: 'string' },
                        chunkIndex: { type: 'integer' },
                        startLine: { type: 'integer' },
                        endLine: { type: 'integer' },
                        score: { type: 'number' },
                        text: { type: 'string' },
                    },
                },
                SearchResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        results: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/SearchHit' },
                        },
                    },
                },
                GrepRequest: {
                    type: 'object',
                    required: ['pattern'],
                    properties: {
                        pattern: { type: 'string' },
                        flags: { type: 'string', default: 'g' },
                        paths: {
                            oneOf: [
                                { type: 'array', items: { type: 'string' } },
                                { type: 'string' },
                            ],
                        },
                        maxMatches: { type: 'integer', default: 200 },
                        context: { type: 'integer', default: 2 },
                    },
                },
                GrepMatch: {
                    type: 'object',
                    properties: {
                        path: { type: 'string' },
                        line: { type: 'integer' },
                        column: { type: 'integer' },
                        lineText: { type: 'string' },
                        snippet: { type: 'string' },
                        startLine: { type: 'integer' },
                        endLine: { type: 'integer' },
                    },
                },
                GrepResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        results: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/GrepMatch' },
                        },
                    },
                },
                ViewFileResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        path: { type: 'string' },
                        totalLines: { type: 'integer' },
                        startLine: { type: 'integer' },
                        endLine: { type: 'integer' },
                        focusLine: { type: 'integer' },
                        snippet: { type: 'string' },
                    },
                },
                StacktraceLocateRequest: {
                    type: 'object',
                    required: ['text'],
                    properties: {
                        text: { type: 'string' },
                        context: { type: 'integer', default: 25 },
                    },
                },
                StacktraceLocateItem: {
                    type: 'object',
                    properties: {
                        path: { type: 'string' },
                        line: { type: 'integer' },
                        column: { type: 'integer', nullable: true },
                        resolved: { type: 'boolean' },
                        relPath: { type: 'string' },
                        startLine: { type: 'integer' },
                        endLine: { type: 'integer' },
                        focusLine: { type: 'integer' },
                        snippet: { type: 'string' },
                    },
                },
                StacktraceLocateResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        results: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/StacktraceLocateItem' },
                        },
                    },
                },
                SymbolsIndexRequest: {
                    type: 'object',
                    properties: {
                        paths: {
                            oneOf: [
                                { type: 'array', items: { type: 'string' } },
                                { type: 'string' },
                            ],
                        },
                        exclude: {
                            oneOf: [
                                { type: 'array', items: { type: 'string' } },
                                { type: 'string' },
                            ],
                        },
                    },
                },
                SymbolsIndexResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        indexed: {
                            type: 'object',
                            properties: {
                                files: { type: 'integer' },
                                symbols: { type: 'integer' },
                                builtAt: { type: 'integer' },
                            },
                        },
                        info: { type: 'object' },
                    },
                },
                SymbolsFindRequest: {
                    type: 'object',
                    properties: {
                        query: { type: 'string' },
                        kind: { type: 'string' },
                        path: { type: 'string' },
                        limit: { type: 'integer' },
                    },
                },
                SymbolItem: {
                    type: 'object',
                    properties: {
                        path: { type: 'string' },
                        name: { type: 'string' },
                        kind: { type: 'string' },
                        startLine: { type: 'integer' },
                        endLine: { type: 'integer' },
                        signature: { type: 'string' },
                    },
                },
                SymbolsFindResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        results: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/SymbolItem' },
                        },
                    },
                },
                AgentStartRequest: {
                    type: 'object',
                    properties: {
                        prompt: { type: 'string' },
                        args: { type: 'array', items: { type: 'string' } },
                        cwd: { type: 'string' },
                        env: { type: 'object', additionalProperties: { type: 'string' } },
                        auto: { type: 'boolean' },
                        tty: { type: 'boolean' },
                    },
                },
                AgentStartResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        id: { type: 'string' },
                        pid: { type: 'integer' },
                    },
                },
                AgentIdRequest: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'string' } },
                },
                AgentKillRequest: {
                    type: 'object',
                    required: ['id'],
                    properties: { id: { type: 'string' }, force: { type: 'boolean' } },
                },

                AgentSendRequest: {
                    type: 'object',
                    required: ['id', 'input'],
                    properties: { id: { type: 'string' }, input: { type: 'string' } },
                },
                AgentStatus: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        cmd: { type: 'string' },
                        args: { type: 'array', items: { type: 'string' } },
                        cwd: { type: 'string' },
                        startedAt: { type: 'integer' },
                        exited: { type: 'boolean' },
                        code: { type: 'integer', nullable: true },
                        signal: { type: 'string', nullable: true },
                        paused_by_guard: { type: 'boolean' },
                        bytes: { type: 'integer' },
                    },
                },
                AgentStatusResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { $ref: '#/components/schemas/AgentStatus' },
                    },
                },
                AgentListResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        agents: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/AgentStatus' },
                        },
                    },
                },
                AgentLogsResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        total: { type: 'integer' },
                        chunk: { type: 'string' },
                    },
                },
                ExecRunRequest: {
                    type: 'object',
                    required: ['command'],
                    properties: {
                        command: { type: 'string' },
                        cwd: { type: 'string' },
                        env: { type: 'object', additionalProperties: { type: 'string' } },
                        timeoutMs: { type: 'integer', minimum: 1000, default: 600000 },
                        tty: { type: 'boolean' },
                    },
                },
                ExecRunResponse: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        exitCode: { type: 'integer', nullable: true },
                        signal: { type: 'string', nullable: true },
                        stdout: { type: 'string' },
                        stderr: { type: 'string' },
                        durationMs: { type: 'integer' },
                        truncated: { type: 'boolean' },
                        error: { type: 'string' },
                    },
                },
            },
        },
    };
}

export function buildApp(ROOT_PATH) {
    const app = express();
    app.use(express.json({ limit: '10mb' }));

    // Basic request logging
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            logger.info(
                `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`,
            );
        });
        next();
    });

    app.get('/openapi.json', (_req, res) => res.json(spec()));

    // Serve static dashboard assets under /dashboard
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const publicDir = path.join(__dirname, '../public');
        app.use('/dashboard', express.static(publicDir));
    } catch {}

    // Auth: mount endpoints and, if enabled, protect subsequent routes
    const auth = createAuth();
    auth.mount(app);
    if (auth.enabled) app.use(auth.requireAuth);

    // Initialize bootstrap indexer state for this ROOT_PATH
    // Skip during tests or when explicitly disabled to avoid hanging open handles
    // const bootstrapAllowed = (process.env.NODE_ENV || '').toLowerCase() !== 'test';
    // if (bootstrapAllowed) {
    //     indexerManager
    //         .ensureBootstrap(ROOT_PATH)
    //         .catch((e) => logger.error('bootstrap init failed', { err: e }));
    // }

    // Restore agent history from disk so we don't lose track across restarts
    // const restoreAllowed =
    //     (process.env.NODE_ENV || '').toLowerCase() !== 'test' &&
    //     String(process.env.AGENT_RESTORE_ON_START || 'true') !== 'false';
    // if (restoreAllowed) {
    //     restoreAgentsFromStore().catch((e) => logger.error('agent restore failed', { err: e }));
    // }

    // Indexing / Search
    app.post('/reindex', async (req, res) => {
        try {
            const r = await indexerManager.scheduleReindexAll();
            res.json(r);
        } catch (e) {
            logger.error('reindex error', { err: e });
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.post('/files/reindex', async (req, res) => {
        try {
            const globs = req.body?.path ?? req.query?.path;
            if (!globs) return res.status(400).json({ ok: false, error: "Missing 'path'" });
            const r = await indexerManager.scheduleReindexSubset(globs);
            res.json(r);
        } catch (e) {
            logger.error('files/reindex error', { err: e });
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.get('/indexer/status', (_req, res) => {
        try {
            res.json({ ok: true, status: indexerManager.status() });
        } catch (e) {
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.post('/indexer/index', async (req, res) => {
        try {
            const p = req.body?.path;
            if (!p) return res.status(400).json({ ok: false, error: 'Missing path' });
            const r = await indexerManager.scheduleIndexFile(String(p));
            res.json(r);
        } catch (e) {
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.post('/indexer/remove', async (req, res) => {
        try {
            const p = req.body?.path;
            if (!p) return res.status(400).json({ ok: false, error: 'Missing path' });
            const rel = String(p);
            const out = await indexerManager.removeFile(rel);
            res.json(out);
        } catch (e) {
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.post('/indexer/reset', async (_req, res) => {
        try {
            if (indexerManager.isBusy())
                return res.status(409).json({ ok: false, error: 'Indexer busy' });
            await indexerManager.resetAndBootstrap(ROOT_PATH);
            res.json({ ok: true });
        } catch (e) {
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.post('/search', async (req, res) => {
        try {
            const { q, n } = req.body || {};
            if (!q) return res.status(400).json({ ok: false, error: "Missing 'q'" });
            const results = await search(ROOT_PATH, q, n ?? 8);
            res.json({ ok: true, results });
        } catch (e) {
            logger.error('search error', { err: e });
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });

    // Grep
    app.post('/grep', async (req, res) => {
        try {
            const body = req.body || {};
            const results = await grep(ROOT_PATH, {
                pattern: body.pattern,
                flags: body.flags || 'g',
                paths: body.paths || ['**/*.{ts,tsx,js,jsx,py,go,rs,md,txt,json,yml,yaml,sh}'],
                maxMatches: body.maxMatches ?? 200,
                context: body.context ?? 2,
            });
            res.json({ ok: true, results });
        } catch (e) {
            logger.warn('grep bad request', { err: e });
            res.status(400).json({ ok: false, error: String(e?.message || e) });
        }
    });

    // Files / Stacktrace
    app.get('/files/list', async (req, res) => {
        try {
            const rel = String(req.query?.path || '.');
            const includeHidden = String(req.query?.hidden || 'false').toLowerCase() === 'true';
            const type = req.query?.type ? String(req.query.type) : undefined; // 'file' | 'dir'
            const out = await listDirectory(ROOT_PATH, rel, { includeHidden, type });
            res.json(out);
        } catch (e) {
            logger.warn('files/list error', { err: e });
            res.status(400).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.get('/files/view', async (req, res) => {
        try {
            const p = req.query?.path;
            const line = Number(req.query?.line || 1);
            const context = Number(req.query?.context || 25);
            const out = await viewFile(ROOT_PATH, String(p || ''), line, context);
            res.json({ ok: true, ...out });
        } catch (e) {
            logger.warn('files/view not found', { err: e });
            res.status(404).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.post('/stacktrace/locate', async (req, res) => {
        try {
            const { text, context } = req.body || {};
            const out = await locateStacktrace(
                ROOT_PATH,
                String(text || ''),
                Number(context || 25),
            );
            res.json({ ok: true, results: out });
        } catch (e) {
            logger.warn('stacktrace/locate bad request', { err: e });
            res.status(400).json({ ok: false, error: String(e?.message || e) });
        }
    });

    // Symbols
    app.post('/symbols/index', async (req, res) => {
        try {
            const { paths, exclude } = req.body || {};
            const info = await symbolsIndex(ROOT_PATH, { paths, exclude });
            res.json({ ok: true, indexed: info, info });
        } catch (e) {
            logger.error('symbols/index error', { err: e });
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.post('/symbols/find', async (req, res) => {
        try {
            const { query, kind, path: p, limit } = req.body || {};
            const out = await symbolsFind(query, { kind, path: p, limit });
            res.json({ ok: true, results: out });
        } catch (e) {
            logger.warn('symbols/find bad request', { err: e });
            res.status(400).json({ ok: false, error: String(e?.message || e) });
        }
    });

    // Agent
    app.post('/agent/start', (req, res) => {
        try {
            const { prompt, args, cwd, env, auto, tty } = req.body || {};
            const out = supervisor.start({ prompt, args, cwd, env, auto, tty });
            res.json({ ok: true, ...out });
        } catch (e) {
            logger.error('agent/start error', { err: e });
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.get('/agent/status', (req, res) => {
        const id = String(req.query?.id || '');
        const st = supervisor.status(id);
        if (!st) return res.status(404).json({ ok: false, error: 'not found' });
        res.json({ ok: true, status: st });
    });
    app.get('/agent/list', (_req, res) => res.json({ ok: true, agents: supervisor.list() }));
    app.get('/agent/logs', (req, res) => {
        const id = String(req.query?.id || '');
        const since = Number(req.query?.since || 0);
        const logs = supervisor.logs(id, since);
        if (!logs) return res.status(404).json({ ok: false, error: 'not found' });
        res.json({ ok: true, total: logs.total, chunk: logs.chunk });
    });
    app.get('/agent/tail', (req, res) => {
        const id = String(req.query?.id || '');
        const bytes = Number(req.query?.bytes || 8192);
        const logs = supervisor.tail(id, bytes);
        if (!logs) return res.status(404).json({ ok: false, error: 'not found' });
        res.json({ ok: true, total: logs.total, chunk: logs.chunk });
    });
    app.get('/agent/stream', (req, res) => {
        const id = String(req.query?.id || '');
        if (!id) return res.status(400).end();
        supervisor.stream(id, res);
    });
    app.post('/agent/send', (req, res) => {
        const { id, input } = req.body || {};
        if (!id) return res.status(400).json({ ok: false, error: 'missing id' });
        const ok = supervisor.send(String(id), String(input ?? ''));
        res.json({ ok });
    });
    app.post('/agent/interrupt', (req, res) => {
        const { id } = req.body || {};
        const ok = supervisor.interrupt(String(id || ''));
        res.json({ ok });
    });
    app.post('/agent/kill', (req, res) => {
        const { id, force } = req.body || {};
        const ok = supervisor.kill(String(id || ''), Boolean(force));
        res.json({ ok });
    });
    app.post('/agent/resume', (req, res) => {
        const { id } = req.body || {};
        const ok = supervisor.resume(String(id || ''));
        res.json({ ok });
    });

    // PTY Agent
    app.post('/pty/start', async (req, res) => {
        try {
            const { prompt, cwd, env, cols, rows } = req.body || {};
            const out = await ptySupervisor.start({ prompt, cwd, env, cols, rows });
            res.json({ ok: true, ...out });
        } catch (e) {
            logger.error('pty/start error', { err: e });
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });
    app.get('/pty/status', (req, res) => {
        const id = String(req.query?.id || '');
        const st = ptySupervisor.status(id);
        if (!st) return res.status(404).json({ ok: false, error: 'not found' });
        res.json({ ok: true, status: st });
    });
    app.get('/pty/list', (_req, res) => res.json({ ok: true, agents: ptySupervisor.list() }));
    app.get('/pty/logs', (req, res) => {
        const id = String(req.query?.id || '');
        const since = Number(req.query?.since || 0);
        const logs = ptySupervisor.logs(id, since);
        if (!logs) return res.status(404).json({ ok: false, error: 'not found' });
        res.json({ ok: true, total: logs.total, chunk: logs.chunk });
    });
    app.get('/pty/tail', (req, res) => {
        const id = String(req.query?.id || '');
        const bytes = Number(req.query?.bytes || 8192);
        const logs = ptySupervisor.tail(id, bytes);
        if (!logs) return res.status(404).json({ ok: false, error: 'not found' });
        res.json({ ok: true, total: logs.total, chunk: logs.chunk });
    });
    app.get('/pty/stream', (req, res) => {
        const id = String(req.query?.id || '');
        if (!id) return res.status(400).end();
        ptySupervisor.stream(id, res);
    });
    app.post('/pty/send', (req, res) => {
        const { id, input } = req.body || {};
        if (!id) return res.status(400).json({ ok: false, error: 'missing id' });
        const ok = ptySupervisor.send(String(id), String(input ?? ''));
        res.json({ ok });
    });
    app.post('/pty/write', (req, res) => {
        const { id, input } = req.body || {};
        if (!id) return res.status(400).json({ ok: false, error: 'missing id' });
        const ok = ptySupervisor.write(String(id), String(input ?? ''));
        res.json({ ok });
    });
    app.post('/pty/resize', (req, res) => {
        const { id, cols, rows } = req.body || {};
        if (!id) return res.status(400).json({ ok: false, error: 'missing id' });
        const ok = ptySupervisor.resize(String(id), Number(cols || 0), Number(rows || 0));
        res.json({ ok });
    });
    app.post('/pty/interrupt', (req, res) => {
        const { id } = req.body || {};
        const ok = ptySupervisor.interrupt(String(id || ''));
        res.json({ ok });
    });
    app.post('/pty/kill', (req, res) => {
        const { id, force } = req.body || {};
        const ok = ptySupervisor.kill(String(id || ''), Boolean(force));
        res.json({ ok });
    });
    app.post('/pty/resume', (req, res) => {
        const { id } = req.body || {};
        const ok = ptySupervisor.resume(String(id || ''));
        res.json({ ok });
    });

    app.post('/exec/run', async (req, res) => {
        try {
            const execEnabled =
                String(process.env.EXEC_ENABLED || 'false').toLowerCase() === 'true';
            if (!execEnabled) {
                return res.status(403).json({ ok: false, error: 'exec disabled' });
            }

            const { command, cwd, env, timeoutMs, tty } = req.body || {};
            console.log({ command, cwd, env, timeoutMs, tty });
            if (!command) return res.status(400).json({ ok: false, error: "Missing 'command'" });
            const out = await runCommand({
                command: String(command),
                cwd: cwd ? String(cwd) : ROOT_PATH,
                env,
                timeoutMs: Number(timeoutMs || 600000),
                tty: Boolean(tty),
            });
            res.json(out.ok ? out : { ok: false, ...out });
        } catch (e) {
            logger.error('exec/run error', { err: e });
            res.status(500).json({ ok: false, error: String(e?.message || e) });
        }
    });

    return app;
}

// CLI entry: start when run directly, or when NODE_ENV indicates a runtime env
const isDirect = (() => {
    try {
        const thisFile = fileURLToPath(import.meta.url);
        const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
        return thisFile === argv1;
    } catch {
        return false;
    }
})();
const shouldStart =
    isDirect || ['development', 'production'].includes((process.env.NODE_ENV || '').toLowerCase());

if (shouldStart) {
    const ROOT_PATH = process.env.ROOT_PATH;
    if (!ROOT_PATH) {
        console.error('Set ROOT_PATH to your repo/docs root.');
        process.exit(1);
    }
    const app = buildApp(ROOT_PATH);
    const PORT = Number(process.env.PORT || 3210);
    const HOST = process.env.HOST || '0.0.0.0';
    app.listen(PORT, HOST, () => {
        logger.info(`Bridge listening`, {
            host: HOST,
            port: PORT,
            ROOT_PATH,
            PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
        });
    }).on('error', (err) => {
        logger.error('Failed to start server', { err });
        process.exit(1);
    });

    process.on('unhandledRejection', (err) => logger.error('unhandledRejection', { err }));
    process.on('uncaughtException', (err) => logger.error('uncaughtException', { err }));
}
// Exec
