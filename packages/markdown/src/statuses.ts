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

const TRAILING_WHITESPACE = /\s+$/;

function stripTrailingParenthetical(value: string): string {
    const trimmedEnd = value.replace(TRAILING_WHITESPACE, '');

    if (!trimmedEnd.endsWith(')')) {
        return trimmedEnd;
    }

    const openingIndex = findBalancedOpeningIndex(trimmedEnd);

    if (openingIndex < 0) {
        return trimmedEnd;
    }

    const beforeParenthetical = trimmedEnd.slice(0, openingIndex);
    return beforeParenthetical.replace(TRAILING_WHITESPACE, '');
}

type ParentheticalState = {
    readonly depth: number;
    readonly openingIndex: number;
};

function findBalancedOpeningIndex(text: string): number {
    const initialState: ParentheticalState = { depth: 0, openingIndex: -1 };

    const result = Array.from(text).reduceRight<ParentheticalState>((state, char, index) => {
        if (state.openingIndex !== -1) {
            return state;
        }

        if (char === ')') {
            return {
                depth: state.depth + 1,
                openingIndex: -1,
            };
        }

        if (char === '(') {
            if (state.depth <= 0) {
                return state;
            }

            if (state.depth === 1) {
                return {
                    depth: 0,
                    openingIndex: index,
                };
            }

            return {
                depth: state.depth - 1,
                openingIndex: -1,
            };
        }

        return state;
    }, initialState);

    return result.openingIndex;
}

export function headerToStatus(header: string): string {
    const withoutParenthetical = stripTrailingParenthetical(header);
    const trimmed = withoutParenthetical.trim();
    const withoutLeading = trimmed.replace(/^[^A-Za-z0-9]+/, '');
    const norm = withoutLeading.replace(/\s+/g, '-').toLowerCase();
    return norm ? `#${norm}` : '';
}
