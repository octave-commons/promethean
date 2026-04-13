function countChar(value, needle) {
  let count = 0;
  for (const char of value) {
    if (char === needle) count += 1;
  }
  return count;
}

export function parseDockerPsLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .map((row) => ({
      id: typeof row.ID === 'string' ? row.ID : 'unknown',
      name: typeof row.Names === 'string' ? row.Names : 'unknown',
      image: typeof row.Image === 'string' ? row.Image : 'unknown',
      state: typeof row.State === 'string' ? row.State : 'unknown',
      status: typeof row.Status === 'string' ? row.Status : 'unknown',
      ports: typeof row.Ports === 'string' && row.Ports.trim().length > 0
        ? row.Ports.split(/,\s*/).filter(Boolean)
        : [],
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function parseCaddyRoutes(source) {
  const lines = source.split(/\r?\n/);
  const routes = [];
  let currentHosts = [];
  let depth = 0;
  let matchers = new Map();

  for (const rawLine of lines) {
    const withoutComment = rawLine.replace(/\s+#.*$/, '');
    const line = withoutComment.trim();
    if (!line) continue;

    if (depth <= 0) {
      const siteMatch = line.match(/^([^@][^{]+?)\s*\{$/);
      if (!siteMatch) continue;
      currentHosts = [...new Set(siteMatch[1].split(/[\s,]+/).map((entry) => entry.trim()).filter(Boolean))];
      depth = 1;
      matchers = new Map();
      continue;
    }

    if (line.startsWith('@')) {
      const parts = line.split(/\s+/);
      if (parts.length >= 3 && parts[1] === 'path') {
        matchers.set(parts[0], parts.slice(2));
      }
    } else if (line.startsWith('reverse_proxy')) {
      const parts = line.split(/\s+/).slice(1);
      const matcher = parts[0] && parts[0].startsWith('@') ? parts[0] : undefined;
      const upstreams = matcher ? parts.slice(1) : parts;
      for (const host of currentHosts) {
        routes.push({
          host,
          matcher,
          matchPaths: matcher ? (matchers.get(matcher) ?? []) : [],
          upstreams: [...new Set(upstreams.filter(Boolean))],
        });
      }
    }

    depth += countChar(line, '{') - countChar(line, '}');
    if (depth <= 0) {
      currentHosts = [];
      matchers = new Map();
      depth = 0;
    }
  }

  return routes.sort((left, right) => {
    if (left.host !== right.host) return left.host.localeCompare(right.host);
    return left.upstreams.join(',').localeCompare(right.upstreams.join(','));
  });
}
