import { getAllRelatedDocuments } from './getAllRelatedDocuments.js';
import { getLatestDocuments } from './getLatestDocuments.js';
import { dedupeByText, limitByCollectionCount, sortByTimestamp, toMessage, } from './utils.js';
const DEFAULT_COMPILE_OPTIONS = {
    texts: [],
    recentLimit: 10,
    queryLimit: 5,
    limit: 20,
    formatAssistantMessages: false,
};
const sanitiseOptions = (inputs) => ({
    ...DEFAULT_COMPILE_OPTIONS,
    ...(inputs ?? {}),
    texts: [...(inputs?.texts ?? DEFAULT_COMPILE_OPTIONS.texts)],
});
const filterValidEntries = (entries) => entries.filter((entry) => Boolean(entry.metadata) && typeof entry.text === 'string');
export const compileContext = async (inputs, dependencies) => {
    const options = sanitiseOptions(inputs);
    const state = dependencies.state;
    const latest = await getLatestDocuments({ limit: options.recentLimit }, dependencies);
    const queryTexts = [...options.texts, ...latest.map((doc) => doc.text)].slice(-options.queryLimit);
    const [relatedDocs, imageDocs] = await Promise.all([
        getAllRelatedDocuments({ queries: queryTexts, limit: options.limit }, dependencies),
        getAllRelatedDocuments({ queries: queryTexts, limit: options.limit, where: { type: 'image' } }, dependencies),
    ]);
    const combined = [
        ...relatedDocs.filter((entry) => entry.metadata?.type !== 'image'),
        ...latest,
        ...imageDocs,
    ];
    const filtered = filterValidEntries(combined);
    const deduped = dedupeByText(filtered);
    const sorted = sortByTimestamp(deduped);
    const limited = limitByCollectionCount(sorted, options.limit, state.collections.size);
    return limited.map((entry) => toMessage(entry, options.formatAssistantMessages, state));
};
//# sourceMappingURL=compileContext.js.map