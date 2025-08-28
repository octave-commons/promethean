export const STATUS_ORDER = [
    '#rejected',
    '#ice-box',
    '#incoming',
    '#accepted',
    '#breakdown',
    '#blocked',
    '#ready',
    '#todo',
    '#in-progress',
    '#in-review',
    '#done',
    '#archive',
];

export const STATUS_SET = new Set(STATUS_ORDER);

export function headerToStatus(header: string): string {
    // strip trailing parenthetical (allow trailing spaces) and trim
    let h = header.replace(/\s*\(.*\)\s*$/, '').trim();
    // remove leading non-alphanumerics
    h = h.replace(/^[^A-Za-z0-9]+/, '');
    const norm = h.replace(/\s+/g, '-').toLowerCase();
    return norm ? `#${norm}` : '';
}
