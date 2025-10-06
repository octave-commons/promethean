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
  t.truthy(doc.info.description);
  t.deepEqual(doc.servers, [{ url: 'https://example.com/custom' }]);

  const listPath = doc.paths['/actions'];
  t.truthy(listPath);
  const listExample = (listPath as { get?: { responses?: Record<string, unknown> } }).get
    ?.responses?.['200'] as
    | {
        content?: {
          'application/json'?: { example?: { actions?: Array<Record<string, unknown>> } };
        };
      }
    | undefined;
  t.truthy(listExample?.content?.['application/json']?.example?.actions);

  const actionPath = doc.paths['/actions/test.echo'] as {
    post: {
      operationId: string;
      requestBody: { required: boolean };
      responses: Record<
        string,
        { content: { 'application/json': { schema: Record<string, unknown> } } }
      >;
      tags: string[];
      'x-promethean-tool': { name: string; stability: string; since: string | null };
    };
  };

  t.is(actionPath.post.operationId, 'test_echo_action');
  t.deepEqual(actionPath.post.tags, ['Custom Endpoint']);
  t.true(actionPath.post.requestBody.required);

  const successSchema = actionPath.post.responses['200'].content['application/json'].schema;
  t.is(successSchema.type, 'object');
  t.truthy(successSchema.properties);

  const errorSchema = actionPath.post.responses['400'].content['application/json'].schema;
  t.is(errorSchema.type, 'object');
  t.true(Array.isArray(errorSchema.required));

  t.deepEqual(actionPath.post['x-promethean-tool'], {
    name: 'test.echo',
    stability: 'stable',
    since: '1.0.0',
  });
});

test('encodeActionPathSegment preserves safe characters', (t) => {
  t.is(encodeActionPathSegment('files.list-directory'), 'files.list-directory');
  t.is(encodeActionPathSegment('space value'), 'space%20value');
});
