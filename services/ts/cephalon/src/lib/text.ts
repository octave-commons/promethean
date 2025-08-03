import tokenizer from 'sbd';

export const splitterOptions = {
	newline_boundaries: false, // If true, \n is treated like a sentence boundary
	html_boundaries: false, // If true, <p>, <br> and similar tags become boundaries
	sanitize: true, // Strips non-breaking spaces and normalizes whitespace
	abbreviations: ['Mr', 'Mrs', 'Dr', 'Ms', 'e.g', 'i.e', 'etc', 'vs', 'Prof', 'Sr', 'Jr', 'U.S', 'U.K', 'Duck', 'AI'],
};

export function mergeShortFragments(sentences: string[], minLength = 20) {
	const merged: string[] = [];
	let buffer = '';

	for (const s of sentences) {
		if ((buffer + ' ' + s).length < minLength) {
			buffer += ' ' + s;
		} else {
			if (buffer) merged.push(buffer.trim());
			buffer = s;
		}
	}
	if (buffer) merged.push(buffer.trim());
	return merged;
}

export function splitSentences(text: string) {
	const sentences: string[] = tokenizer.sentences(text, splitterOptions);
	const cleaned = sentences.map((s) => s.trim()).filter((s) => s.length > 0);
	return mergeShortFragments(cleaned);
}
