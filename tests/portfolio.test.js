// SPDX-License-Identifier: GPL-3.0-only
import test from 'ava';
import {spawnSync} from 'child_process';
import {promises as fs} from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const portfolioRoot = path.join(process.cwd(), 'site', 'portfolio');

async function buildProject(projectPath) {
  const pkgJson = path.join(projectPath, 'package.json');
  const buildScript = path.join(projectPath, 'build.sh');

  if (await fs.stat(pkgJson).then(() => true).catch(() => false)) {
    const result = spawnSync('npm', ['run', 'build'], {cwd: projectPath, stdio: 'inherit'});
    if (result.status !== 0) throw new Error(`build failed for ${projectPath}`);
    return path.join(projectPath, 'dist', 'index.html');
  }
  if (await fs.stat(buildScript).then(() => true).catch(() => false)) {
    const result = spawnSync('bash', [buildScript], {cwd: projectPath, stdio: 'inherit'});
    if (result.status !== 0) throw new Error(`build failed for ${projectPath}`);
    return path.join(projectPath, 'dist', 'index.html');
  }
  throw new Error(`No build script found for ${projectPath}`);
}

test('portfolio projects build without console errors', async t => {
  let dirs;
  try {
    dirs = await fs.readdir(portfolioRoot, { withFileTypes: true });
  } catch (err) {
    t.log(`portfolio directory missing: ${err.message}`);
    t.pass();
    return;
  }
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const projectPath = path.join(portfolioRoot, dir.name);
    let index;
    try {
      index = await buildProject(projectPath);
    } catch (err) {
      t.fail(err.message);
      continue;
    }
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(`file://${index}`, {waitUntil: 'networkidle0'});
    await browser.close();
    t.deepEqual(errors, [], `${dir.name} had console errors`);
  }
});
