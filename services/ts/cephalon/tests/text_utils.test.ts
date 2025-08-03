import test from 'ava';
import { splitSentences, mergeShortFragments } from '../src/lib/text.js';

test('splitSentences splits text into sentences', (t) => {
	const result = splitSentences('Hello world. This is a test.');
	t.deepEqual(result, ['Hello world.', 'This is a test.']);
});

test('mergeShortFragments merges short segments', (t) => {
	const result = mergeShortFragments(['Hi', 'there friend', 'This is a long sentence'], 10);
	t.deepEqual(result, ['Hi there friend', 'This is a long sentence']);
});
