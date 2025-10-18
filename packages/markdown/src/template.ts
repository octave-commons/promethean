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
 * Template processing options
 */
export interface TemplateOptions {
    readonly variablePattern?: RegExp;
    readonly conditionalPattern?: RegExp;
    readonly loopPattern?: RegExp;
    readonly strictMode?: boolean;
    readonly preserveWhitespace?: boolean;
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
 * Default template patterns
 */
const DEFAULT_PATTERNS = {
    variable: /\{\{(\w+(?:\.\w+)*)\}\}/g,
    conditional: /\{\{\#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs,
    loop: /\{\{\#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs,
} as const;

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
 * Convert value to string for template substitution
 */
const valueToString = (value: unknown): string => {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
};

/**
 * Process template variables in text content
 */
const processVariables = (
    text: string,
    context: TemplateContext,
    pattern: RegExp,
    strictMode: boolean,
): { processed: string; variablesUsed: Set<string>; errors: string[] } => {
    const variablesUsed = new Set<string>();
    const errors: string[] = [];
    let processed = text;

    pattern.lastIndex = 0;
    const matches = [...text.matchAll(pattern)];

    for (const match of matches) {
        const [fullMatch, variablePath] = match;
        const path = extractVariablePath(variablePath);
        const value = getContextValue(context, path);

        variablesUsed.add(variablePath);

        if (value === undefined && strictMode) {
            errors.push(`Undefined variable: ${variablePath}`);
            continue;
        }

        const replacement = valueToString(value);
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
                    const result = processVariables(blockContent, loopContext, DEFAULT_PATTERNS.variable, strictMode);
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

                    const result = processVariables(blockContent, loopContext, DEFAULT_PATTERNS.variable, strictMode);
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

    let processed = text;

    // Process conditionals first (they may contain loops and variables)
    const conditionalResult = processConditionals(
        processed,
        context,
        options.conditionalPattern || DEFAULT_PATTERNS.conditional,
        options.strictMode ?? false,
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

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
};
