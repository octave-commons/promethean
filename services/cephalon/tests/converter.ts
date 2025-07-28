import test from 'ava';
import { PassThrough } from 'node:stream';
import { convert } from '../src/converter.ts';

// Basic sanity test: ensure convert returns a stream

test('convert ogg stream to wav stream', t => {
    const input = new PassThrough();
    const output = convert(input);
    t.truthy(output.readable);
});
