import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import type {
    Content,
    Heading,
    List,
    ListItem,
    Paragraph,
    PhrasingContent,
    Root,
    Table,
    TableCell,
} from 'mdast';

export type SystemSectionKind = 'daemon' | 'conditions' | 'events' | 'actions' | 'schedules' | 'triggers';

export type SystemParseIssue = {
    readonly section: 'document' | SystemSectionKind;
    readonly message: string;
};

export type DaemonSpec = {
    readonly id: string;
    readonly description?: string;
    readonly command?: string;
    readonly args: readonly string[];
    readonly cwd?: string;
    readonly env: Readonly<Record<string, string>>;
    readonly restartPolicy?: string;
    readonly notes: Readonly<Record<string, string>>;
    readonly extra: Readonly<Record<string, string>>;
};

export type ConditionSpec = {
    readonly id: string;
    readonly description?: string;
    readonly expression?: string;
    readonly tags: readonly string[];
};

export type EventSpec = {
    readonly id: string;
    readonly when: readonly string[];
    readonly description?: string;
    readonly tags: readonly string[];
};

export type ActionSpec = {
    readonly id: string;
    readonly type: string;
    readonly target?: string;
    readonly parameters: Readonly<Record<string, string>>;
    readonly description?: string;
};

export type ScheduleSpec = {
    readonly id: string;
    readonly cron: string;
    readonly timezone?: string;
    readonly description?: string;
};

export type TriggerSpec = {
    readonly id: string;
    readonly when: readonly string[];
    readonly actions: readonly string[];
    readonly description?: string;
};

export type SystemDocument = {
    readonly metadata: Readonly<Record<string, unknown>>;
    readonly title: string;
    readonly daemon?: DaemonSpec;
    readonly conditions: readonly ConditionSpec[];
    readonly events: readonly EventSpec[];
    readonly actions: readonly ActionSpec[];
    readonly schedules: readonly ScheduleSpec[];
    readonly triggers: readonly TriggerSpec[];
};

export type SystemParseResult = {
    readonly document: SystemDocument;
    readonly issues: readonly SystemParseIssue[];
};

type SectionNodeMap = Record<SystemSectionKind, readonly Content[]>;

type SectionAccumulator = {
    readonly title: string | undefined;
    readonly current: SystemSectionKind | undefined;
    readonly sections: SectionNodeMap;
    readonly issues: readonly SystemParseIssue[];
};

type TableMatrix = {
    readonly headers: readonly string[];
    readonly rows: readonly (readonly string[])[];
};

type ParseOutcome<T> = {
    readonly value: T;
    readonly issues: readonly SystemParseIssue[];
};

const SECTION_ORDER: readonly SystemSectionKind[] = [
    'daemon',
    'conditions',
    'events',
    'actions',
    'schedules',
    'triggers',
];

const EMPTY_SECTION_MAP: SectionNodeMap = {
    daemon: [],
    conditions: [],
    events: [],
    actions: [],
    schedules: [],
    triggers: [],
};

const normalizedSectionName = (text: string): SystemSectionKind | undefined => {
    const normalized = text.trim().toLowerCase();
    return SECTION_ORDER.find((section) => section === normalized);
};

const createIssue = (section: 'document' | SystemSectionKind, message: string): SystemParseIssue => ({
    section,
    message,
});

const toHeadingText = (heading: Heading): string => toPhrasingText(heading.children);

const hasPhrasingChildren = (node: PhrasingContent): node is PhrasingContent & { readonly children: readonly PhrasingContent[] } =>
    'children' in node && Array.isArray((node as { readonly children?: readonly PhrasingContent[] }).children);

const toPhrasingText = (nodes: readonly PhrasingContent[]): string =>
    nodes
        .map((node) => {
            if (node.type === 'text' || node.type === 'inlineCode') {
                return node.value ?? '';
            }
            if (node.type === 'break') {
                return ' ';
            }
            if (node.type === 'html') {
                return '';
            }
            if (node.type === 'image' || node.type === 'imageReference') {
                return node.alt ?? '';
            }
            if (hasPhrasingChildren(node)) {
                return toPhrasingText(node.children);
            }
            return '';
        })
        .join(' ')
        .replace(/\s+/gu, ' ')
        .trim();

const isHeading = (node: Content): node is Heading => node.type === 'heading';

const isTable = (node: Content): node is Table => node.type === 'table';

const isParagraph = (node: Content): node is Paragraph => node.type === 'paragraph';

const toContentText = (node: Content): string => {
    if (node.type === 'paragraph' || node.type === 'heading') {
        return toPhrasingText(node.children ?? []);
    }
    if (node.type === 'blockquote') {
        return node.children.map(toContentText).join(' ');
    }
    if (node.type === 'code') {
        return node.value ?? '';
    }
    if (node.type === 'list') {
        return toListText(node);
    }
    if (node.type === 'listItem') {
        return toListItemText(node);
    }
    return '';
};

const toListText = (list: List): string =>
    list.children
        .map((item) => toListItemText(item))
        .filter((value) => value.length > 0)
        .join('; ');

const toListItemText = (item: ListItem): string =>
    item.children
        .map((child) =>
            child.type === 'paragraph'
                ? toPhrasingText(child.children ?? [])
                : child.type === 'list'
                  ? toListText(child)
                  : toContentText(child),
        )
        .filter((value) => value.length > 0)
        .join(' ');

const trimWhitespace = (value: string): string => value.replace(/\s+/gu, ' ').trim();

const normalizeHeader = (header: string): string => header.trim().toLowerCase().replace(/[^a-z0-9]+/gu, '_').replace(/^_+|_+$/gu, '');

const splitList = (value: string | undefined): readonly string[] =>
    value
        ? value
              .split(/[,;\n]/gu)
              .map((part) => part.trim())
              .filter((part) => part.length > 0)
        : [];

const parseKeyValuePairs = (
    section: SystemSectionKind,
    raw: string | undefined,
    context: string,
): ParseOutcome<Readonly<Record<string, string>>> => {
    if (!raw) return { value: {}, issues: [] };
    const tokens = splitList(raw);
    const outcome = tokens.reduce<ParseOutcome<Readonly<Record<string, string>>>>(
        (state, token) => {
            const [key, ...rest] = token.split('=');
            if (!key || rest.length === 0) {
                return {
                    value: state.value,
                    issues: [...state.issues, createIssue(section, `Invalid ${context} entry: "${token}"`)],
                };
            }
            const normalizedKey = key.trim();
            const normalizedValue = rest.join('=').trim();
            if (normalizedKey.length === 0 || normalizedValue.length === 0) {
                return {
                    value: state.value,
                    issues: [...state.issues, createIssue(section, `Invalid ${context} entry: "${token}"`)],
                };
            }
            return {
                value: { ...state.value, [normalizedKey]: normalizedValue },
                issues: state.issues,
            };
        },
        { value: {}, issues: [] },
    );
    return outcome;
};

const tableToMatrix = (table: Table): TableMatrix => {
    if (table.children.length === 0) {
        return { headers: [], rows: [] };
    }
    const [headerRow, ...bodyRows] = table.children;
    const headers = headerRow.children.map((cell) => normalizeHeader(extractCellText(cell)));
    const rows = bodyRows.map((row) => row.children.map((cell) => trimWhitespace(extractCellText(cell))));
    return { headers, rows };
};

const extractCellText = (cell: TableCell): string => trimWhitespace(toPhrasingText(cell.children ?? []));

const collectSections = (root: Root): SectionAccumulator => {
    const initial: SectionAccumulator = {
        title: undefined,
        current: undefined,
        sections: EMPTY_SECTION_MAP,
        issues: [],
    };
    return root.children.reduce<SectionAccumulator>((state, node) => {
        if (isHeading(node) && node.depth === 1) {
            const title = toHeadingText(node);
            return { ...state, title: title.length > 0 ? title : state.title, current: undefined };
        }
        if (isHeading(node) && node.depth === 2) {
            const headingName = toHeadingText(node);
            const section = normalizedSectionName(headingName);
            if (!section) {
                return {
                    ...state,
                    current: undefined,
                    issues: [...state.issues, createIssue('document', `Unsupported section heading: "${headingName}"`)],
                };
            }
            return {
                ...state,
                current: section,
                sections: { ...state.sections, [section]: [] },
            };
        }
        if (!state.current) return state;
        const sectionNodes = state.sections[state.current] ?? [];
        return {
            ...state,
            sections: { ...state.sections, [state.current]: [...sectionNodes, node] },
        };
    }, initial);
};

const parseDaemon = (nodes: readonly Content[]): ParseOutcome<DaemonSpec | undefined> => {
    const table = nodes.find(isTable);
    if (!table) {
        return {
            value: undefined,
            issues: [createIssue('daemon', 'Daemon section requires a table with field/value rows.')],
        };
    }
    const matrix = tableToMatrix(table);
    const fieldIndex = matrix.headers.findIndex((header) => header === 'field' || header === 'name' || header === 'key');
    const valueIndex = matrix.headers.findIndex((header) => header === 'value');
    const notesIndex = matrix.headers.findIndex((header) => header === 'notes');
    const missingColumns: string[] = [];
    if (fieldIndex < 0) missingColumns.push('field');
    if (valueIndex < 0) missingColumns.push('value');
    if (missingColumns.length > 0) {
        return {
            value: undefined,
            issues: [
                createIssue(
                    'daemon',
                    `Daemon table is missing required column(s): ${missingColumns.map((column) => `"${column}"`).join(', ')}`,
                ),
            ],
        };
    }
    const parsedRows = matrix.rows
        .map((row) => ({
            key: normalizeHeader(row[fieldIndex] ?? ''),
            rawKey: row[fieldIndex] ?? '',
            value: row[valueIndex] ?? '',
            note: notesIndex >= 0 ? row[notesIndex] ?? '' : '',
        }))
        .filter((entry) => entry.key.length > 0);
    const entries = parsedRows.reduce<Readonly<Record<string, string>>>((acc, entry) => ({
        ...acc,
        [entry.key]: entry.value,
    }), {});
    const notes = parsedRows.reduce<Readonly<Record<string, string>>>((acc, entry) => {
        if (!entry.note || entry.note.length === 0) return acc;
        return { ...acc, [entry.key]: entry.note };
    }, {});
    const envResult = parseKeyValuePairs('daemon', entries.env, 'env');
    const args = splitList(entries.args);
    const knownKeys = new Set([
        'id',
        'description',
        'command',
        'args',
        'cwd',
        'env',
        'restart_policy',
    ]);
    const extra = Object.entries(entries)
        .filter(([key]) => !knownKeys.has(key))
        .reduce<Readonly<Record<string, string>>>((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    const id = (entries.id ?? '').trim();
    const daemon: DaemonSpec | undefined = id
        ? {
              id,
              description: entries.description?.trim().length ? entries.description.trim() : undefined,
              command: entries.command?.trim().length ? entries.command.trim() : undefined,
              args,
              cwd: entries.cwd?.trim().length ? entries.cwd.trim() : undefined,
              env: envResult.value,
              restartPolicy: entries.restart_policy?.trim().length ? entries.restart_policy.trim() : undefined,
              notes,
              extra,
          }
        : undefined;
    const issues = [
        ...(daemon ? [] : [createIssue('daemon', 'Daemon id is required.')]),
        ...envResult.issues,
    ];
    return { value: daemon, issues };
};

const parseConditions = (nodes: readonly Content[]): ParseOutcome<readonly ConditionSpec[]> =>
    parseStandardTableSection('conditions', nodes, (
        row,
        indices,
        rowIndex,
        issues,
        seen,
    ) => {
        const idCell = row[indices.id] ?? '';
        const id = idCell.trim();
        if (id.length === 0) {
            return {
                nextIssues: [...issues, createIssue('conditions', `Row ${rowIndex + 1} is missing an id.`)],
                nextSeen: seen,
                nextValue: undefined,
            };
        }
        if (seen.has(id)) {
            return {
                nextIssues: [...issues, createIssue('conditions', `Duplicate condition id: "${id}"`)],
                nextSeen: seen,
                nextValue: undefined,
            };
        }
        const description = indices.description >= 0 ? row[indices.description]?.trim() : undefined;
        const expression = indices.expression >= 0 ? row[indices.expression]?.trim() : undefined;
        const tags = indices.tags >= 0 ? splitList(row[indices.tags]) : [];
        return {
            nextIssues: issues,
            nextSeen: new Set([...Array.from(seen), id]),
            nextValue: {
                id,
                description: description && description.length > 0 ? description : undefined,
                expression: expression && expression.length > 0 ? expression : undefined,
                tags,
            },
        };
    });

type StandardTableIndices = {
    readonly id: number;
    readonly [key: string]: number;
};

type StandardTableReducer<T> = (
    row: readonly string[],
    indices: StandardTableIndices,
    rowIndex: number,
    issues: readonly SystemParseIssue[],
    seen: ReadonlySet<string>,
) => {
    readonly nextIssues: readonly SystemParseIssue[];
    readonly nextSeen: ReadonlySet<string>;
    readonly nextValue: T | undefined;
};

const parseStandardTableSection = <T>(
    section: SystemSectionKind,
    nodes: readonly Content[],
    reducer: StandardTableReducer<T>,
    additionalHeaders: readonly string[] = [],
): ParseOutcome<readonly T[]> => {
    const table = nodes.find(isTable);
    if (!table) {
        return {
            value: [],
            issues: [createIssue(section, `${section[0]?.toUpperCase()}${section.slice(1)} section requires a table.`)],
        };
    }
    const matrix = tableToMatrix(table);
    const headers = matrix.headers;
    const requiredHeaders = ['id', ...additionalHeaders];
    const missing = requiredHeaders.filter((header) => !headers.includes(header));
    if (missing.length > 0) {
        return {
            value: [],
            issues: [
                createIssue(
                    section,
                    `${section[0]?.toUpperCase()}${section.slice(1)} table is missing column(s): ${missing
                        .map((header) => `"${header}"`)
                        .join(', ')}`,
                ),
            ],
        };
    }
    const indices = headers.reduce<StandardTableIndices>((acc, header, index) => ({
        ...acc,
        [header]: index,
    }), { id: headers.indexOf('id') });
    const initialState = {
        values: [] as readonly T[],
        issues: [] as readonly SystemParseIssue[],
        seen: new Set<string>() as ReadonlySet<string>,
    };
    const parsed = matrix.rows.reduce<typeof initialState>((state, row, rowIndex) => {
        if (row.every((cell) => cell.trim().length === 0)) return state;
        const result = reducer(row, indices, rowIndex, state.issues, state.seen);
        const values = result.nextValue ? [...state.values, result.nextValue] : state.values;
        return {
            values,
            issues: result.nextIssues,
            seen: result.nextSeen,
        };
    }, initialState);
    return { value: parsed.values, issues: parsed.issues };
};

const parseEvents = (nodes: readonly Content[]): ParseOutcome<readonly EventSpec[]> =>
    parseStandardTableSection(
        'events',
        nodes,
        (row, indices, rowIndex, issues, seen) => {
            const id = row[indices.id]?.trim() ?? '';
            if (id.length === 0) {
                return {
                    nextIssues: [...issues, createIssue('events', `Row ${rowIndex + 1} is missing an id.`)],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            if (seen.has(id)) {
                return {
                    nextIssues: [...issues, createIssue('events', `Duplicate event id: "${id}"`)],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            const whenColumn = indices.when;
            if (typeof whenColumn !== 'number') {
                return {
                    nextIssues: [...issues, createIssue('events', 'Events table is missing a "when" column.')],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            const description = indices.description >= 0 ? row[indices.description]?.trim() : undefined;
            const tags = indices.tags >= 0 ? splitList(row[indices.tags]) : [];
            const when = splitList(row[whenColumn]);
            if (when.length === 0) {
                return {
                    nextIssues: [...issues, createIssue('events', `Event "${id}" is missing a when reference.`)],
                    nextSeen: new Set([...Array.from(seen), id]),
                    nextValue: {
                        id,
                        when,
                        description: description && description.length > 0 ? description : undefined,
                        tags,
                    },
                };
            }
            return {
                nextIssues: issues,
                nextSeen: new Set([...Array.from(seen), id]),
                nextValue: {
                    id,
                    when,
                    description: description && description.length > 0 ? description : undefined,
                    tags,
                },
            };
        },
        ['when'],
    );

const parseActions = (nodes: readonly Content[]): ParseOutcome<readonly ActionSpec[]> =>
    parseStandardTableSection(
        'actions',
        nodes,
        (row, indices, rowIndex, issues, seen) => {
            const id = row[indices.id]?.trim() ?? '';
            if (id.length === 0) {
                return {
                    nextIssues: [...issues, createIssue('actions', `Row ${rowIndex + 1} is missing an id.`)],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            if (seen.has(id)) {
                return {
                    nextIssues: [...issues, createIssue('actions', `Duplicate action id: "${id}"`)],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            const typeIndex = indices.type;
            if (typeof typeIndex !== 'number') {
                return {
                    nextIssues: [...issues, createIssue('actions', 'Actions table is missing a "type" column.')],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            const parametersResult = parseKeyValuePairs('actions', indices.parameters >= 0 ? row[indices.parameters] : undefined, 'parameters');
            const description = indices.description >= 0 ? row[indices.description]?.trim() : undefined;
            const target = indices.target >= 0 ? row[indices.target]?.trim() : undefined;
            return {
                nextIssues: [...issues, ...parametersResult.issues],
                nextSeen: new Set([...Array.from(seen), id]),
                nextValue: {
                    id,
                    type: (row[typeIndex] ?? '').trim(),
                    target: target && target.length > 0 ? target : undefined,
                    parameters: parametersResult.value,
                    description: description && description.length > 0 ? description : undefined,
                },
            };
        },
        ['type'],
    );

const parseSchedules = (nodes: readonly Content[]): ParseOutcome<readonly ScheduleSpec[]> =>
    parseStandardTableSection(
        'schedules',
        nodes,
        (row, indices, rowIndex, issues, seen) => {
            const id = row[indices.id]?.trim() ?? '';
            if (id.length === 0) {
                return {
                    nextIssues: [...issues, createIssue('schedules', `Row ${rowIndex + 1} is missing an id.`)],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            if (seen.has(id)) {
                return {
                    nextIssues: [...issues, createIssue('schedules', `Duplicate schedule id: "${id}"`)],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            const cronIndex = indices.cron;
            if (typeof cronIndex !== 'number') {
                return {
                    nextIssues: [...issues, createIssue('schedules', 'Schedules table is missing a "cron" column.')],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            const cron = (row[cronIndex] ?? '').trim();
            if (cron.length === 0) {
                return {
                    nextIssues: [...issues, createIssue('schedules', `Schedule "${id}" is missing a cron expression.`)],
                    nextSeen: new Set([...Array.from(seen), id]),
                    nextValue: {
                        id,
                        cron,
                        timezone: indices.timezone >= 0 ? row[indices.timezone]?.trim() || undefined : undefined,
                        description: indices.description >= 0 ? row[indices.description]?.trim() || undefined : undefined,
                    },
                };
            }
            return {
                nextIssues: issues,
                nextSeen: new Set([...Array.from(seen), id]),
                nextValue: {
                    id,
                    cron,
                    timezone: indices.timezone >= 0 ? row[indices.timezone]?.trim() || undefined : undefined,
                    description: indices.description >= 0 ? row[indices.description]?.trim() || undefined : undefined,
                },
            };
        },
        ['cron'],
    );

const parseTriggers = (nodes: readonly Content[]): ParseOutcome<readonly TriggerSpec[]> =>
    parseStandardTableSection(
        'triggers',
        nodes,
        (row, indices, rowIndex, issues, seen) => {
            const id = row[indices.id]?.trim() ?? '';
            if (id.length === 0) {
                return {
                    nextIssues: [...issues, createIssue('triggers', `Row ${rowIndex + 1} is missing an id.`)],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            if (seen.has(id)) {
                return {
                    nextIssues: [...issues, createIssue('triggers', `Duplicate trigger id: "${id}"`)],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            const whenIndex = indices.when;
            const actionsIndex = indices.actions;
            if (typeof whenIndex !== 'number' || typeof actionsIndex !== 'number') {
                return {
                    nextIssues: [...issues, createIssue('triggers', 'Triggers table requires "when" and "actions" columns.')],
                    nextSeen: seen,
                    nextValue: undefined,
                };
            }
            const when = splitList(row[whenIndex]);
            const actions = splitList(row[actionsIndex]);
            const description = indices.description >= 0 ? row[indices.description]?.trim() : undefined;
            if (when.length === 0 || actions.length === 0) {
                return {
                    nextIssues: [...issues, createIssue('triggers', `Trigger "${id}" must specify events and actions.`)],
                    nextSeen: new Set([...Array.from(seen), id]),
                    nextValue: {
                        id,
                        when,
                        actions,
                        description: description && description.length > 0 ? description : undefined,
                    },
                };
            }
            return {
                nextIssues: issues,
                nextSeen: new Set([...Array.from(seen), id]),
                nextValue: {
                    id,
                    when,
                    actions,
                    description: description && description.length > 0 ? description : undefined,
                },
            };
        },
        ['when', 'actions'],
    );

const collectParagraphs = (nodes: readonly Content[]): readonly string[] =>
    nodes.filter(isParagraph).map((paragraph) => toPhrasingText(paragraph.children ?? [])).filter((text) => text.length > 0);

const validateReferences = (document: SystemDocument): readonly SystemParseIssue[] => {
    const conditionIds = new Set(document.conditions.map((condition) => condition.id));
    const eventIds = new Set(document.events.map((event) => event.id));
    const actionIds = new Set(document.actions.map((action) => action.id));
    const eventIssues = document.events.flatMap((event) =>
        event.when
            .filter((reference) => !conditionIds.has(reference))
            .map((reference) => createIssue('events', `Event "${event.id}" references unknown condition "${reference}".`)),
    );
    const triggerEventIssues = document.triggers.flatMap((trigger) =>
        trigger.when
            .filter((reference) => !eventIds.has(reference))
            .map((reference) => createIssue('triggers', `Trigger "${trigger.id}" references unknown event "${reference}".`)),
    );
    const triggerActionIssues = document.triggers.flatMap((trigger) =>
        trigger.actions
            .filter((reference) => !actionIds.has(reference))
            .map((reference) => createIssue('triggers', `Trigger "${trigger.id}" references unknown action "${reference}".`)),
    );
    return [...eventIssues, ...triggerEventIssues, ...triggerActionIssues];
};

export const parseSystemMarkdown = (markdown: string): SystemParseResult => {
    const { content, data } = matter(markdown);
    const metadata = (data ?? {}) as Record<string, unknown>;
    const root = unified().use(remarkParse).use(remarkGfm).parse(content) as Root;
    const sections = collectSections(root);
    const daemon = parseDaemon(sections.sections.daemon);
    const conditions = parseConditions(sections.sections.conditions);
    const events = parseEvents(sections.sections.events);
    const actions = parseActions(sections.sections.actions);
    const schedules = parseSchedules(sections.sections.schedules);
    const triggers = parseTriggers(sections.sections.triggers);
    const document: SystemDocument = {
        metadata,
        title: sections.title ?? '',
        daemon: daemon.value,
        conditions: conditions.value,
        events: events.value,
        actions: actions.value,
        schedules: schedules.value,
        triggers: triggers.value,
    };
    const titleIssues = sections.title ? [] : [createIssue('document', 'Document is missing a level-1 heading for the unit title.')];
    const referenceIssues = validateReferences(document);
    const issues = [
        ...sections.issues,
        ...daemon.issues,
        ...conditions.issues,
        ...events.issues,
        ...actions.issues,
        ...schedules.issues,
        ...triggers.issues,
        ...titleIssues,
        ...referenceIssues,
    ];
    return { document, issues };
};

export type SystemSectionSummary = {
    readonly section: SystemSectionKind;
    readonly paragraphs: readonly string[];
};

export const summarizeSystemSections = (
    markdown: string,
): readonly SystemSectionSummary[] => {
    const root = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
    const sections = collectSections(root);
    return SECTION_ORDER.map((section) => ({
        section,
        paragraphs: collectParagraphs(sections.sections[section]),
    }));
};
