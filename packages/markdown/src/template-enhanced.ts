import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import type { Root } from 'mdast';

/**
 * Template variable context interface
 */
export interface TemplateContext {
    readonly [key: string]: string | number | boolean | undefined | null | Record<string, any> | any[];
}

/**
 * Template filter interface
 */
export interface TemplateFilter {
    readonly name: string;
    readonly fn: (value: unknown, ...args: string[]) => string;
}

/**
 * Template processing options
 */
export interface TemplateOptions {
    readonly variablePattern?: RegExp;
    readonly conditionalPattern?: RegExp;
    readonly loopPattern?: RegExp;
    readonly strictMode?: boolean;
    readonly preserveWhitespace?: boolean;
    readonly filters?: Record<string, TemplateFilter['fn']>;
}

/**
 * Template processing result
 */
export interface TemplateResult {
    readonly processed: string;
    readonly variablesUsed: readonly string[];
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
}

/**
 * Built-in template filters
 */
const BUILTIN_FILTERS: Record<string, TemplateFilter['fn']> = {
    // String filters
    upper: (value: unknown) => String(value || '').toUpperCase(),
    lower: (value: unknown) => String(value || '').toLowerCase(),
    title: (value: unknown) => String(value || '').replace(/\b\w/g, (char) => char.toUpperCase()),
    trim: (value: unknown) => String(value || '').trim(),
    capitalize: (value: unknown) => {
        const str = String(value || '');
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Number filters
    number: (value: unknown) => {
        const num = Number(value);
        return isNaN(num) ? '0' : String(num);
    },
    round: (value: unknown, digits: string = '0') => {
        const num = Number(value);
        if (isNaN(num)) return '0';
        const decimalPlaces = parseInt(digits, 10);
        return String(num.toFixed(decimalPlaces));
    },

    // Date filters
    date: (value: unknown) => {
        const date = value instanceof Date ? value : new Date(String(value || ''));
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    },
    'date-format': (value: unknown, format: string = 'YYYY-MM-DD') => {
        const date = value instanceof Date ? value : new Date(String(value || ''));
        if (isNaN(date.getTime())) return '';

        return format
            .replace('YYYY', String(date.getFullYear()))
            .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
            .replace('DD', String(date.getDate()).padStart(2, '0'))
            .replace('HH', String(date.getHours()).padStart(2, '0'))
            .replace('mm', String(date.getMinutes()).padStart(2, '0'))
            .replace('ss', String(date.getSeconds()).padStart(2, '0'));
    },

    // JSON filters
    json: (value: unknown, indent: string = '0') => {
        try {
            const spaces = indent === '0' ? 0 : parseInt(indent, 10) || 2;
            return JSON.stringify(value, null, spaces);
        } catch {
            return String(value || '');
        }
    },

    // Utility filters
    default: (value: unknown, defaultValue: string) => {
        return value === null || value === undefined || value === '' ? defaultValue : String(value);
    },
    length: (value: unknown) => {
        if (Array.isArray(value)) return String(value.length);
        if (typeof value === 'string') return String(value.length);
        if (typeof value === 'object' && value !== null) return String(Object.keys(value).length);
        return '0';
    },
    join: (value: unknown, separator: string = ', ') => {
        if (Array.isArray(value)) return value.join(separator);
        return String(value || '');
    },
};

/**
 * Default template patterns (enhanced to support filters and defaults)
 */
const DEFAULT_PATTERNS = {
    variable: /\{\{(\w+(?:\.\w+)*)(?:\s*\|\s*([^}]+))?\}\}/g,
    conditional: /\{\{\#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs,
    loop: /\{\{\#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs,
} as const;

/**
 * Parse filter chain from filter string
 */
const parseFilterChain = (filterString: string): Array<{ name: string; args: string[] }> => {
    if (!filterString || filterString.trim() === '') {
        return [];
    }

    return filterString.split('|').map((filter) => {
        const trimmed = filter.trim();
        const match = trimmed.match(/^(\w+)(?:\s*:\s*(.+))?$/);
        if (!match) {
            return { name: trimmed.trim(), args: [] };
        }

        const name = match[1]!.trim();
        const argsString = match[2];
        if (!argsString) {
            return { name, args: [] };
        }

        // Parse arguments, handling quoted strings
        const args: string[] = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < argsString.length; i++) {
            const char = argsString[i];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            } else if (char === ',' && !inQuotes) {
                args.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            args.push(current.trim());
        }

        return {
            name,
            args: args.map((arg) => {
                // Remove quotes from quoted arguments
                if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
                    return arg.slice(1, -1);
                }
                return arg;
            }),
        };
    });
};

/**
 * Apply filters to a value
 */
const applyFilters = (
    value: unknown,
    filters: Array<{ name: string; args: string[] }>,
    customFilters: Record<string, TemplateFilter['fn']> = {},
): { result: string; errors: string[] } => {
    const errors: string[] = [];
    let currentValue = value;

    for (const filter of filters) {
        const allFilters = { ...BUILTIN_FILTERS, ...customFilters };
        const filterFn = allFilters[filter.name];

        if (!filterFn) {
            errors.push(`Unknown filter: ${filter.name}`);
            continue;
        }

        try {
            currentValue = filterFn(currentValue, ...filter.args);
        } catch (error) {
            errors.push(
                `Error applying filter ${filter.name}: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    return {
        result: String(currentValue || ''),
        errors,
    };
};

/**
 * Extract variable path from template syntax
 */
const extractVariablePath = (match: string): string[] => match.split('.');

/**
 * Get value from context using dot notation
 */
const getContextValue = (context: TemplateContext, path: string[]): unknown => {
    let current: unknown = context;

    for (const key of path) {
        if (typeof current === 'object' && current !== null && key in current) {
            current = (current as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }

    return current;
};

/**
 * Process template variables in text content with filter support
 */
const processVariables = (
    text: string,
    context: TemplateContext,
    pattern: RegExp,
    strictMode: boolean,
    customFilters: Record<string, TemplateFilter['fn']> = {},
): { processed: string; variablesUsed: Set<string>; errors: string[] } => {
    const variablesUsed = new Set<string>();
    const errors: string[] = [];
    let processed = text;

    pattern.lastIndex = 0;
    const matches = [...text.matchAll(pattern)];

    for (const match of matches) {
        const [fullMatch, variablePath, filterString] = match;
        const path = extractVariablePath(variablePath);
        const value = getContextValue(context, path);
        const filters = parseFilterChain(filterString || '');

        variablesUsed.add(variablePath);

        if (value === undefined && strictMode && !filters.some((f) => f.name === 'default')) {
            errors.push(`Undefined variable: ${variablePath}`);
            continue;
        }

        const { result: replacement, errors: filterErrors } = applyFilters(value, filters, customFilters);
        errors.push(...filterErrors);

        processed = processed.replace(fullMatch, replacement);
    }

    return { processed, variablesUsed, errors };
};

/**
 * Process conditional blocks
 */
const processConditionals = (
    content: string,
    context: TemplateContext,
    pattern: RegExp,
    strictMode: boolean,
    customFilters: Record<string, TemplateFilter['fn']> = {},
): { processed: string; variablesUsed: Set<string>; errors: string[] } => {
    const variablesUsed = new Set<string>();
    const errors: string[] = [];
    let processed = content;

    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(content)) !== null) {
        const [fullMatch, variable, blockContent] = match;
        const value = getContextValue(context, [variable]);

        variablesUsed.add(variable);

        let shouldInclude = false;
        if (value === undefined && strictMode) {
            errors.push(`Undefined conditional variable: ${variable}`);
        } else {
            shouldInclude = Boolean(value);
        }

        const replacement = shouldInclude ? blockContent : '';
        processed = processed.replace(fullMatch, replacement);

        // Reset lastIndex to handle overlapping matches
        pattern.lastIndex = 0;
    }

    return { processed, variablesUsed, errors };
};

/**
 * Process loop blocks
 */
const processLoops = (
    content: string,
    context: TemplateContext,
    pattern: RegExp,
    strictMode: boolean,
    customFilters: Record<string, TemplateFilter['fn']> = {},
): { processed: string; variablesUsed: Set<string>; errors: string[] } => {
    const variablesUsed = new Set<string>();
    const errors: string[] = [];
    let processed = content;

    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(content)) !== null) {
        const [fullMatch, variable, blockContent] = match;
        const value = getContextValue(context, [variable]);

        variablesUsed.add(variable);

        let replacement = '';

        if (value === undefined && strictMode) {
            errors.push(`Undefined loop variable: ${variable}`);
        } else if (Array.isArray(value)) {
            replacement = value
                .map((item, index) => {
                    const loopContext: TemplateContext = {
                        ...context,
                        [variable]: item,
                        [`${variable}_index`]: index,
                        [`${variable}_first`]: index === 0,
                        [`${variable}_last`]: index === value.length - 1,
                    };

                    // Process variables within the loop block
                    const result = processVariables(
                        blockContent,
                        loopContext,
                        DEFAULT_PATTERNS.variable,
                        strictMode,
                        customFilters,
                    );
                    errors.push(...result.errors);
                    return result.processed;
                })
                .join('');
        } else if (typeof value === 'object' && value !== null) {
            // Handle object iteration
            const entries = Object.entries(value as Record<string, unknown>);
            replacement = entries
                .map(([key, item], index) => {
                    const loopContext: TemplateContext = {
                        ...context,
                        [variable]:
                            typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
                                ? item
                                : String(item),
                        [`${variable}_key`]: key,
                        [`${variable}_index`]: index,
                        [`${variable}_first`]: index === 0,
                        [`${variable}_last`]: index === entries.length - 1,
                    };

                    const result = processVariables(
                        blockContent,
                        loopContext,
                        DEFAULT_PATTERNS.variable,
                        strictMode,
                        customFilters,
                    );
                    errors.push(...result.errors);
                    return result.processed;
                })
                .join('');
        }

        processed = processed.replace(fullMatch, replacement);

        // Reset lastIndex to handle overlapping matches
        pattern.lastIndex = 0;
    }

    return { processed, variablesUsed, errors };
};

/**
 * Process template text with context variables
 */
const processTemplateText = (
    text: string,
    context: TemplateContext,
    options: TemplateOptions,
): { processed: string; variablesUsed: Set<string>; errors: string[]; warnings: string[] } => {
    const warnings: string[] = [];
    const allVariablesUsed = new Set<string>();
    const allErrors: string[] = [];
    const customFilters = options.filters || {};

    let processed = text;

    // Process conditionals first (they may contain loops and variables)
    const conditionalResult = processConditionals(
        processed,
        context,
        options.conditionalPattern || DEFAULT_PATTERNS.conditional,
        options.strictMode ?? false,
        customFilters,
    );

    processed = conditionalResult.processed;
    conditionalResult.variablesUsed.forEach((v) => allVariablesUsed.add(v));
    allErrors.push(...conditionalResult.errors);

    // Process loops
    const loopResult = processLoops(
        processed,
        context,
        options.loopPattern || DEFAULT_PATTERNS.loop,
        options.strictMode ?? false,
        customFilters,
    );

    processed = loopResult.processed;
    loopResult.variablesUsed.forEach((v) => allVariablesUsed.add(v));
    allErrors.push(...loopResult.errors);

    // Process variables
    const variableResult = processVariables(
        processed,
        context,
        options.variablePattern || DEFAULT_PATTERNS.variable,
        options.strictMode ?? false,
        customFilters,
    );

    processed = variableResult.processed;
    variableResult.variablesUsed.forEach((v) => allVariablesUsed.add(v));
    allErrors.push(...variableResult.errors);

    return {
        processed,
        variablesUsed: allVariablesUsed,
        errors: allErrors,
        warnings,
    };
};

/**
 * Process text nodes in markdown AST
 */
const processTextNodes = (
    node: any, // Using any for AST nodes to avoid complex type issues
    context: TemplateContext,
    options: TemplateOptions,
): { processed: any; variablesUsed: Set<string>; errors: string[]; warnings: string[] } => {
    const allVariablesUsed = new Set<string>();
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    const processNode = (node: any): any => {
        if (node.type === 'text') {
            const result = processTemplateText(node.value, context, options);
            result.variablesUsed.forEach((v) => allVariablesUsed.add(v));
            allErrors.push(...result.errors);
            allWarnings.push(...result.warnings);

            return { ...node, value: result.processed };
        }

        if (node.type === 'paragraph' || node.type === 'code' || node.type === 'inlineCode') {
            if ('value' in node && typeof node.value === 'string') {
                const result = processTemplateText(node.value, context, options);
                result.variablesUsed.forEach((v) => allVariablesUsed.add(v));
                allErrors.push(...result.errors);
                allWarnings.push(...result.warnings);

                return { ...node, value: result.processed };
            }
        }

        // Process children recursively
        if ('children' in node && Array.isArray(node.children)) {
            const processedChildren = node.children.map(processNode);
            return { ...node, children: processedChildren };
        }

        return node;
    };

    const processedNode = processNode(node);

    return {
        processed: processedNode,
        variablesUsed: allVariablesUsed,
        errors: allErrors,
        warnings: allWarnings,
    };
};

/**
 * Main template processor function
 */
export const processMarkdownTemplate = (
    markdown: string,
    context: TemplateContext = {},
    options: TemplateOptions = {},
): TemplateResult => {
    const allVariablesUsed = new Set<string>();
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    try {
        // Parse markdown to AST
        const ast = unified().use(remarkParse).parse(markdown) as Root;

        // Process each node in the AST
        const processedChildren = ast.children.map((node) => {
            const result = processTextNodes(node, context, options);
            result.variablesUsed.forEach((v) => allVariablesUsed.add(v));
            allErrors.push(...result.errors);
            allWarnings.push(...result.warnings);
            return result.processed;
        });

        // Convert back to markdown
        const processedAst = { ...ast, children: processedChildren };
        const processed = unified().use(remarkStringify).stringify(processedAst);

        return {
            processed,
            variablesUsed: Array.from(allVariablesUsed),
            errors: allErrors,
            warnings: allWarnings,
        };
    } catch (error) {
        return {
            processed: markdown,
            variablesUsed: [],
            errors: [`Template processing failed: ${error instanceof Error ? error.message : String(error)}`],
            warnings: [],
        };
    }
};

/**
 * Simple template processor for plain text (no markdown parsing)
 */
export const processTextTemplate = (
    text: string,
    context: TemplateContext = {},
    options: TemplateOptions = {},
): TemplateResult => {
    const result = processTemplateText(text, context, options);

    return {
        processed: result.processed,
        variablesUsed: Array.from(result.variablesUsed),
        errors: result.errors,
        warnings: result.warnings,
    };
};

/**
 * Validate template syntax without processing
 */
export const validateTemplate = (
    markdown: string,
    options: TemplateOptions = {},
): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const patterns = {
        variable: options.variablePattern || DEFAULT_PATTERNS.variable,
        conditional: options.conditionalPattern || DEFAULT_PATTERNS.conditional,
        loop: options.loopPattern || DEFAULT_PATTERNS.loop,
    };

    // Check for malformed conditionals
    const conditionalMatches = markdown.match(patterns.conditional);
    if (conditionalMatches) {
        const openConditionals = markdown.match(/\{\{\#if\s+\w+\}\}/g) || [];
        const closeConditionals = markdown.match(/\{\{\/if\}\}/g) || [];

        if (openConditionals.length !== closeConditionals.length) {
            errors.push(
                `Mismatched conditional tags: ${openConditionals.length} open, ${closeConditionals.length} close`,
            );
        }
    }

    // Check for malformed loops
    const loopMatches = markdown.match(patterns.loop);
    if (loopMatches) {
        const openLoops = markdown.match(/\{\{\#each\s+\w+\}\}/g) || [];
        const closeLoops = markdown.match(/\{\{\/each\}\}/g) || [];

        if (openLoops.length !== closeLoops.length) {
            errors.push(`Mismatched loop tags: ${openLoops.length} open, ${closeLoops.length} close`);
        }
    }

    // Check for nested conditionals/loops (warning)
    const nestedPatterns = /\{\{#(if|each)[^}]*\}\s*.*\{\{#(if|each)/g;
    if (nestedPatterns.test(markdown)) {
        warnings.push('Nested conditionals or loops detected - ensure proper closing order');
    }

    // Check for filter syntax errors
    const variableMatches = markdown.match(patterns.variable);
    if (variableMatches) {
        for (const match of variableMatches) {
            const filterMatch = match.match(/\{\{\w+(?:\.\w+)*\s*\|\s*([^}]+)\}\}/);
            if (filterMatch) {
                const filterString = filterMatch[1];
                const filters = filterString.split('|');

                for (const filter of filters) {
                    const trimmed = filter.trim();
                    if (trimmed && !trimmed.match(/^\w+(?:\s*:\s*.+)?$/)) {
                        errors.push(`Invalid filter syntax: ${trimmed} in ${match}`);
                    }
                }
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
};

/**
 * Get all available built-in filters
 */
export const getBuiltinFilters = (): Record<string, TemplateFilter['fn']> => {
    return { ...BUILTIN_FILTERS };
};

/**
 * Register a custom filter
 */
export const registerFilter = (name: string, fn: TemplateFilter['fn']): TemplateFilter => {
    return { name, fn };
};
