/**
 * Tests for corruption detection
 */

import test from 'ava';
import { CorruptionDetector } from '../core/corruption-detector.js';
import { ScarType, ScarSeverity } from '../types/index.js';

test('CorruptionDetector detects double extensions', async (t) => {
  const detector = new CorruptionDetector();
  const corruptions = await detector.detectTaskFileCorruptions('test.md.md');

  t.is(corruptions.length, 1);
  t.is(corruptions[0].type, ScarType.FILENAME_CORRUPTION);
  t.is(corruptions[0].severity, ScarSeverity.HIGH);
  t.true(corruptions[0].autoHealable);
});

test('CorruptionDetector detects spaces and numbers in extensions', async (t) => {
  const detector = new CorruptionDetector();
  const corruptions = await detector.detectTaskFileCorruptions('test 2.md');

  t.is(corruptions.length, 1);
  t.is(corruptions[0].type, ScarType.FILENAME_CORRUPTION);
  t.is(corruptions[0].severity, ScarSeverity.HIGH);
  t.true(corruptions[0].autoHealable);
});

test('CorruptionDetector detects command line args in filenames', async (t) => {
  const detector = new CorruptionDetector();
  const corruptions = await detector.detectTaskFileCorruptions('test --fix.md');

  t.is(corruptions.length, 1);
  t.is(corruptions[0].type, ScarType.FILENAME_CORRUPTION);
  t.is(corruptions[0].severity, ScarSeverity.HIGH);
  t.true(corruptions[0].autoHealable);
});

test('CorruptionDetector detects unusual characters', async (t) => {
  const detector = new CorruptionDetector();
  const corruptions = await detector.detectTaskFileCorruptions('test@#$%.md');

  t.is(corruptions.length, 1);
  t.is(corruptions[0].type, ScarType.FILENAME_CORRUPTION);
  t.is(corruptions[0].severity, ScarSeverity.MEDIUM);
  t.true(corruptions[0].autoHealable);
});

test('CorruptionDetector passes clean filenames', async (t) => {
  const detector = new CorruptionDetector();
  const corruptions = await detector.detectTaskFileCorruptions('clean-filename.md');

  t.is(corruptions.length, 0);
});
