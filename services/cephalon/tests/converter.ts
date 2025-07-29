import test from 'ava';
import { convert } from '../src/converter';

const sample = Buffer.from('sample');

// simple test to ensure convert returns a Buffer with same contents

test('convert ogg stream to wav stream converts to buffer with same contents', (t) => {
	const result = convert(sample);
	t.true(result.equals(sample));
})

// Basic sanity test: ensure convert returns a stream

test('convert ogg stream to wav stream returns a stream', t => {
    const input = new PassThrough();
    const output = convert(input);
    t.truthy(output.readable);
});
