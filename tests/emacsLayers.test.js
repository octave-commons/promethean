import test from 'ava';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const layersDir = path.join(repoRoot, '.emacs', 'layers');

async function getLayerEntries() {
  const entries = await fs.readdir(layersDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory());
}

test('each Emacs layer defines a packages.el manifest', async (t) => {
  const layers = await getLayerEntries();

  t.true(layers.length > 0, 'expected at least one Emacs layer to exist');

  await Promise.all(
    layers.map(async (layer) => {
      const manifestPath = path.join(layersDir, layer.name, 'packages.el');
      try {
        await fs.access(manifestPath);
        t.pass(`${layer.name} exposes packages.el`);
      } catch (error) {
        t.fail(`${layer.name} is missing packages.el: ${error.message}`);
        throw error;
      }
    }),
  );
});

test('Emacs layer manifests opt into lexical binding and terminate with sentinel', async (t) => {
  const layers = await getLayerEntries();

  await Promise.all(
    layers.map(async (layer) => {
      const manifestPath = path.join(layersDir, layer.name, 'packages.el');
      const contents = await fs.readFile(manifestPath, 'utf8');
      const lines = contents.split(/\r?\n/);
      const header = lines[0] ?? '';

      t.regex(
        header,
        /lexical-binding:\s*t/,
        `${layer.name}/packages.el should enable lexical-binding in the file header`,
      );

      const trimmed = contents.trimEnd();
      t.true(
        trimmed.endsWith(';;; packages.el ends here'),
        `${layer.name}/packages.el should finish with the standard footer comment`,
      );
    }),
  );
});
