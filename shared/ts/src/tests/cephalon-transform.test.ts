import test from 'ava';
import fs from 'fs';
import path from 'path';
import { makeTransformer, applyTransformer } from '../compiler/transform/transformer';

function runFixtureTransform(t: any, name: string, file: string) {
    const before = fs.readFileSync(path.join(__dirname, `fixtures/${file}.before.ts`), 'utf8');
    const after = fs.readFileSync(path.join(__dirname, `fixtures/${file}.after.ts`), 'utf8');

    const transformer = makeTransformer(before, after);
    const output = applyTransformer(before, transformer);

    t.is(output.trim(), after.trim());
}

test('Cephalon voice-synth ffmpeg hardened', (t) => {
    runFixtureTransform(t, 'voice-synth', 'cephalon');
});

test('Cephalon desktopAudioCapture ffmpeg hardened', (t) => {
    runFixtureTransform(t, 'desktopAudioCapture', 'desktopAudioCapture');
});

test('Cephalon spectrogram ffmpeg hardened', (t) => {
    runFixtureTransform(t, 'spectrogram', 'spectrogram');
});
