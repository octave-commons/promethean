import test from 'ava';
import { convert } from '../src/converter';

const sample = Buffer.from('sample');

// simple test to ensure convert returns a Buffer with same contents

test('convert ogg stream to wav stream', (t) => {
	const result = convert(sample);
	t.true(result.equals(sample));
});
