const CAMEL_SEGMENT = /([a-z0-9])([A-Z])/g;
const ACRONYM_BOUNDARY = /([A-Z]+)([A-Z][a-z])/g;

const collapseUnderscores = (value: string): string => value.replace(/__+/g, '_');

/**
 * Normalize tool identifiers so configuration may use dotted, kebab-case, or camelCase forms.
 */
export const normalizeToolId = (id: string): string => {
  if (!id) return '';

  const replaced = id
    .replace(/[.]/g, '_')
    .replace(/-/g, '_')
    .replace(ACRONYM_BOUNDARY, '$1_$2')
    .replace(CAMEL_SEGMENT, '$1_$2');

  const collapsed = collapseUnderscores(replaced);
  return collapsed.toLowerCase();
};

export const normalizeToolIds = (ids: readonly string[]): readonly string[] =>
  Array.from(
    new Set(ids.map(normalizeToolId).filter((value): value is string => value.length > 0)),
  );
