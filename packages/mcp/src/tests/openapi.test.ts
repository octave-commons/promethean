import test from 'ava';
import { z } from 'zod';

import {
  createEndpointOpenApiDocument,
  encodeActionPathSegment,
  toolToActionDefinition,
} from '../core/openapi.js';
import type { EndpointDefinition } from '../core/resolve-config.js';
import type { Tool } from '../core/types.js';

test('createEndpointOpenApiDocument describes tool actions', (t) => {
  const Schema = z.object({ value: z.string() }).strict();
  const tool: Tool = {
    spec: {
      name: 'test.echo',
      description: 'Echo a provided value.',
      inputSchema: Schema.shape,
      stability: 'stable',
      since: '1.0.0',
      examples: [{ args: { value: 'demo' }, comment: 'Echo a demo value' }],
      notes: 'Returns the provided value under the echoed key.',
      outputSchema: { result: { type: 'string' } },
    },
    invoke: (raw) => {
      const { value } = Schema.parse(raw ?? {});
      return Promise.resolve({ echoed: value });
    },
  };

  const endpoint: EndpointDefinition = {
    path: '/custom',
    tools: [tool.spec.name],
    meta: {
      title: 'Custom Endpoint',
      description: 'Example endpoint for GPT actions.',
      workflow: ['Send value', 'Receive echo'],
      expectations: { usage: ['Provide value'], pitfalls: ['Empty payload'] },
    },
  };

  const actions = [toolToActionDefinition(tool)];
  const doc = createEndpointOpenApiDocument(endpoint, actions, 'https://example.com/custom');

  t.is(doc.openapi, '3.1.0');
  t.is(doc.info.title, 'Custom Endpoint');
  t.true(typeof doc.info.description === 'string');
  t.is(doc.servers[0]?.url, 'https://example.com/custom');

  t.truthy(doc.paths['/actions']);
  t.truthy(doc.paths['/actions/test.echo']);

  const action = doc.paths['/actions/test.echo'] as {
    post: {
      operationId: string;
      requestBody: {
        required: boolean;
        content: {
          'application/json': {
            schema: { type: string; properties?: Record<string, unknown> };
            examples?: Record<string, { value: Record<string, unknown> }>;
          };
        };
      };
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: { type: string; properties?: Record<string, unknown> };
              example?: Record<string, unknown>;
            };
          };
        };
        '400': {
          content: {
            'application/json': {
              schema: { type?: string; required?: string[]; properties?: Record<string, unknown> };
            };
          };
        };
        '500': {
          content: {
            'application/json': { schema: Record<string, unknown> };
          };
        };
      };
    };
  } | null;

  t.truthy(action);
  if (!action) {
    t.fail('expected action path definition');
    return;
  }

  t.is(action.post.operationId, 'test_echo_action');
  t.true(action.post.requestBody.required);
  const requestSchema = action.post.requestBody.content['application/json'].schema;
  t.is(requestSchema.type, 'object');
  t.truthy(requestSchema.properties);

  const successResponse = action.post.responses['200'].content['application/json'].schema;
  t.is(successResponse.type, 'object');
  t.truthy(successResponse.properties);

  const errorResponse = action.post.responses['400'].content['application/json'].schema;
  t.true(!errorResponse.required || errorResponse.required.length >= 0);
  t.truthy(errorResponse.properties);
});

test('encodeActionPathSegment preserves safe characters', (t) => {
  t.is(encodeActionPathSegment('files.list-directory'), 'files.list-directory');
  t.is(encodeActionPathSegment('space value'), 'space%20value');
});
