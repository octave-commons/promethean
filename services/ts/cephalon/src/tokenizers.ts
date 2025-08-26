import tokenizer from 'sbd';
export function mergeShortFragments(sentences: string[], minLength = 20) {
    const merged = [];
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
const splitterOptions = {
    newline_boundaries: false, // If true, \n is treated like a sentence boundary
    html_boundaries: false, // If true, <p>, <br> and similar tags become boundaries
    sanitize: true, // Strips non-breaking spaces and normalizes whitespace
    abbreviations: ['Mr', 'Mrs', 'Dr', 'Ms', 'e.g', 'i.e', 'etc', 'vs', 'Prof', 'Sr', 'Jr', 'U.S', 'U.K', 'Duck', 'AI'],
};
export function splitSentances(text: string) {
    const sentences: string[] = tokenizer.sentences(text, splitterOptions);
    const cleaned = sentences.map((s) => s.trim()).filter((s) => s.length > 0);
    return mergeShortFragments(cleaned);
}

export function classifyPause(phrase: string): 'silence' | 'ambient' | 'introspective' | 'narrative' | 'unknown' {
    const lc = phrase.toLowerCase();
    if (lc.includes('silence') || lc.includes('pause')) return 'silence';
    if (lc.includes('hum') || lc.includes('fan') || lc.includes('noise') || lc.includes('background')) return 'ambient';
    if (lc.includes('thought') || lc.includes('introspective') || lc.includes('considering')) return 'introspective';
    if (lc.includes('sigh') || lc.includes('murmur') || lc.includes('drawn') || lc.includes('drift'))
        return 'narrative';
    return 'unknown';
}

export function estimatePauseDuration(phrase: string): number {
    const base = 1000; // base duration in ms
    const len = phrase.length;
    return base + Math.min(len * 40, 8000); // caps around 8s
}
export function extractParentheticals(text: string): string[] {
    const results: string[] = [];
    let depth = 0;
    let buffer = '';
    let inParen = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (ch === '(') {
            if (depth === 0) {
                inParen = true;
                buffer = '';
            } else {
                buffer += ch;
            }
            depth++;
        } else if (ch === ')') {
            depth--;
            if (depth === 0 && inParen) {
                results.push(buffer.trim());
                inParen = false;
            } else if (depth > 0) {
                buffer += ch;
            }
        } else if (inParen) {
            buffer += ch;
        }
    }

    return results;
}
export function seperateSpeechFromThought(str: string) {
    const thoughts = extractParentheticals(str);
    let temp: string[] = [str];
    for (var p of thoughts) {
        temp = [...temp.flatMap((s) => s.split(`(${p})`))];
    }
    return [
        ...thoughts.map((text) => ({ text: `(${text})`, type: 'thought' })),
        ...temp.map((text) => ({ text, type: 'speech' })),
    ];
}
const test =
    "I have a lot to say. (Some of it in parentheticals, some of it not. Most of this is for me to hold onto as compressed representations of image data I saw. How string). But I am not sure how to say it... I am hearing this strange sound... and I don't know where it's coming from.";
console.log(seperateSpeechFromThought(test));
