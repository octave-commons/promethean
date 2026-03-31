// GPL-3.0-only
import { Client } from '@elastic/elasticsearch';
import { readFile } from 'node:fs/promises';

export type ElasticSearchConfig = {
  url: string;
  index: string;
  fields?: string[];
  sourceFields?: string[];
  size?: number;
  apiKey?: string;
  username?: string;
  password?: string;
  caPath?: string;
};

export type SemanticHit = {
  path: string;
  title?: string;
  frontmatter?: Record<string, unknown>;
  score?: number;
  highlights?: string[];
};

async function loadCa(caPath?: string): Promise<Buffer | undefined> {
  if (!caPath) return undefined;
  return readFile(caPath);
}

export async function semanticSearchElastic(
  query: string,
  config: ElasticSearchConfig,
): Promise<SemanticHit[]> {
  const ca = await loadCa(config.caPath);
  const client = new Client({
    node: config.url,
    auth: config.apiKey
      ? { apiKey: config.apiKey }
      : config.username
        ? { username: config.username, password: config.password ?? '' }
        : undefined,
    tls: ca ? { ca } : undefined,
  });

  const fields = config.fields?.length
    ? config.fields
    : ['title^2', 'content^1', 'body^1', 'text^1', 'path^0.5'];
  const sourceFields = config.sourceFields?.length
    ? config.sourceFields
    : ['path', 'title', 'frontmatter'];
  const size = config.size ?? 20;

  const highlightFields = Object.fromEntries(fields.map((f) => [f.replace(/\^.+$/, ''), {}]));

  const response = await client.search<{
    path?: string;
    title?: string;
    frontmatter?: Record<string, unknown>;
  }>({
    index: config.index,
    size,
    query: {
      multi_match: {
        query,
        fields,
        type: 'most_fields',
        fuzziness: 'AUTO',
      },
    },
    _source: sourceFields,
    highlight: {
      fields: highlightFields,
      pre_tags: ['<mark>'],
      post_tags: ['</mark>'],
    },
  });

  return (response.hits.hits ?? []).map((hit) => {
    const src = hit._source ?? {};
    const highlights = hit.highlight
      ? Object.values(hit.highlight).flatMap((arr) => arr)
      : undefined;
    return {
      path: src.path ?? String(hit._id),
      title: src.title,
      frontmatter: src.frontmatter,
      score: hit._score ?? undefined,
      highlights,
    };
  });
}
