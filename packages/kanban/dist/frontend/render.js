/**
 * Frontend rendering utilities for the kanban UI
 */
export const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char] || char);
};
//# sourceMappingURL=render.js.map