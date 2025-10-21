import test from 'ava';
import { readFileSync } from 'fs';
import { join } from 'path';

test('package.json exists and is valid', (t) => {
  const packagePath = join(__dirname, '../../package.json');
  const packageContent = readFileSync(packagePath, 'utf-8');
  const packageJson = JSON.parse(packageContent);

  t.is(packageJson.name, '@promethean/opencode-unified');
  t.is(packageJson.version, '1.0.0');
  t.true(packageJson.description.includes('Unified OpenCode'));
  t.truthy(packageJson.scripts);
  t.truthy(packageJson.dependencies);
  t.truthy(packageJson.devDependencies);
});

test('tsconfig.json exists and has correct structure', (t) => {
  const tsconfigPath = join(__dirname, '../../tsconfig.json');
  const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');
  const tsconfig = JSON.parse(tsconfigContent);

  t.is(tsconfig.compilerOptions.outDir, './dist');
  t.is(tsconfig.compilerOptions.rootDir, './src');
  t.true(Array.isArray(tsconfig.include));
  t.true(Array.isArray(tsconfig.exclude));
});

test('shadow-cljs.edn exists', (t) => {
  const shadowPath = join(__dirname, '../../shadow-cljs.edn');
  const shadowContent = readFileSync(shadowPath, 'utf-8');

  t.true(shadowContent.includes(':source-paths'));
  t.true(shadowContent.includes(':dependencies'));
  t.true(shadowContent.includes(':builds'));
});

test('electron-builder.json exists', (t) => {
  const electronPath = join(__dirname, '../../electron-builder.json');
  const electronContent = readFileSync(electronPath, 'utf-8');
  const electronConfig = JSON.parse(electronContent);

  t.is(electronConfig.appId, 'ai.promethean.opencode-unified');
  t.is(electronConfig.productName, 'Promethean OpenCode');
  t.true(Array.isArray(electronConfig.files));
  t.truthy(electronConfig.mac);
  t.truthy(electronConfig.win);
  t.truthy(electronConfig.linux);
});
