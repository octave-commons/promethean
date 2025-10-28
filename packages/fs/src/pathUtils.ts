import * as path from 'path';

export const normalizeRelative = (rel: string): string => {
    if (!rel) return '';
    return rel.split(path.sep).join('/');
};
