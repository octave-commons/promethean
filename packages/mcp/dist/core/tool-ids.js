const CAMEL_SEGMENT = /([a-z0-9])([A-Z])/g;
const ACRONYM_BOUNDARY = /([A-Z]+)([A-Z][a-z])/g;
const collapseUnderscores = (value) => value.replace(/__+/g, '_');
/**
 * Normalize tool identifiers so configuration may use dotted, kebab-case, or camelCase forms.
 */
export const normalizeToolId = (id) => {
    if (!id)
        return '';
    const replaced = id
        .replace(/[.]/g, '_')
        .replace(/-/g, '_')
        .replace(ACRONYM_BOUNDARY, '$1_$2')
        .replace(CAMEL_SEGMENT, '$1_$2');
    const collapsed = collapseUnderscores(replaced);
    return collapsed.toLowerCase();
};
export const normalizeToolIds = (ids) => Array.from(new Set(ids.map(normalizeToolId).filter((value) => value.length > 0)));
//# sourceMappingURL=tool-ids.js.map