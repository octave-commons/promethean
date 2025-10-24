/**
 * Tests for healing strategies
 */

import test from 'ava';
import { FilenameHealer } from '../core/healers/filename-healer.js';
import { ContentHealer } from '../core/healers/content-healer.js';
import { StructureHealer } from '../core/healers/structure-healer.js';
import { EncodingHealer } from '../core/healers/encoding-healer.js';
import { MetadataHealer } from '../core/healers/metadata-healer.js';
import { ScarType, ScarSeverity } from '../types/index.js';

test('FilenameHealer fixes double extensions', async (t) => {
  const healer = new FilenameHealer();
  const corruption = {
    type: ScarType.FILENAME_CORRUPTION,
    severity: ScarSeverity.HIGH,
    description: 'Double extension detected',
    filePath: '/path/to/test.md.md',
    detectedAt: new Date(),
    autoHealable: true,
  };

  t.true(healer.canHeal(corruption));

  const result = await healer.heal(corruption, 'content');
  t.true(result.success);
  t.true(result.changesMade!.includes('Fixed double extension'));
});

test('ContentHealer fixes repeated slash patterns', async (t) => {
  const healer = new ContentHealer();
  const corruption = {
    type: ScarType.CONTENT_CORRUPTION,
    severity: ScarSeverity.MEDIUM,
    description: 'Repeated slash patterns',
    filePath: '/path/to/test.md',
    detectedAt: new Date(),
    autoHealable: true,
  };

  t.true(healer.canHeal(corruption));

  const result = await healer.heal(corruption, '//* this is a comment');
  t.true(result.success);
  t.true(result.changesMade!.includes('Fixed repeated slash patterns'));
  t.is(result.healedContent, '// this is a comment');
});

test('StructureHealer adds missing frontmatter', async (t) => {
  const healer = new StructureHealer();
  const corruption = {
    type: ScarType.STRUCTURE_CORRUPTION,
    severity: ScarSeverity.MEDIUM,
    description: 'Missing frontmatter',
    filePath: '/path/to/test.md',
    detectedAt: new Date(),
    autoHealable: true,
  };

  t.true(healer.canHeal(corruption));

  const result = await healer.heal(corruption, '# Test Title\n\nContent here');
  t.true(result.success);
  t.true(result.changesMade!.includes('Added missing frontmatter'));
  t.true(result.healedContent!.startsWith('---'));
});

test('EncodingHealer fixes smart quotes', async (t) => {
  const healer = new EncodingHealer();
  const corruption = {
    type: ScarType.ENCODING_CORRUPTION,
    severity: ScarSeverity.LOW,
    description: 'Smart quotes detected',
    filePath: '/path/to/test.md',
    detectedAt: new Date(),
    autoHealable: true,
  };

  t.true(healer.canHeal(corruption));

  const result = await healer.heal(corruption, 'This is â€smartâ€ text');
  t.true(result.success);
  t.true(result.changesMade!.includes('Fixed smart quotes and dashes encoding'));
  t.is(result.healedContent, 'This is "smart" text');
});

test('MetadataHealer fixes frontmatter structure', async (t) => {
  const healer = new MetadataHealer();
  const corruption = {
    type: ScarType.METADATA_CORRUPTION,
    severity: ScarSeverity.MEDIUM,
    description: 'Malformed frontmatter',
    filePath: '/path/to/test.md',
    detectedAt: new Date(),
    autoHealable: true,
  };

  t.true(healer.canHeal(corruption));

  const content = '---\ntitle: Untitled Task\n---\n\nContent';
  const result = await healer.heal(corruption, content);
  t.true(result.success);
  t.true(result.healedContent!.includes('title: "Untitled Task"'));
});
