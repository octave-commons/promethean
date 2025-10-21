const path = require('path');
const fs = require('fs/promises');

// Simulate the grep function test
async function reproduceGrepTest() {
  const ROOT = path.join(process.cwd(), 'packages/smartgpt-bridge/tests/fixtures');
  
  console.log('ROOT:', ROOT);
  
  // Check if fixtures exist
  try {
    const files = await fs.readdir(ROOT);
    console.log('Files in fixtures:', files);
  } catch (err) {
    console.error('Cannot read fixtures directory:', err.message);
    return;
  }
  
  // Read the readme.md file to see content
  try {
    const readmeContent = await fs.readFile(path.join(ROOT, 'readme.md'), 'utf8');
    console.log('readme.md content:');
    console.log(readmeContent);
  } catch (err) {
    console.error('Cannot read readme.md:', err.message);
  }
  
  // Try to run rg command
  const { execa } = require('execa');
  
  const args = [
    '--json',
    '--max-count', '200',
    '-C', '1',
    '-i',
    'heading',
    '**/*.md'
  ];
  
  console.log('Running rg with args:', args);
  console.log('CWD:', ROOT);
  
  try {
    const { stdout } = await execa('rg', args, { cwd: ROOT });
    console.log('RG Success - output length:', stdout.length);
    const lines = stdout.split(/\r?\n/).filter(Boolean);
    console.log('Number of lines:', lines.length);
    console.log('First few lines:');
    lines.slice(0, 3).forEach((line, i) => {
      console.log(`${i}:`, line);
    });
  } catch (err) {
    console.error('RG Error:', err.exitCode, err.message);
    if (err.exitCode === 1 && typeof err.stdout === 'string') {
      console.log('Using stdout from error, length:', err.stdout.length);
      const lines = err.stdout.split(/\r?\n/).filter(Boolean);
      console.log('Number of lines:', lines.length);
      lines.slice(0, 3).forEach((line, i) => {
        console.log(`${i}:`, line);
      });
    } else {
      console.error('No stdout available');
    }
  }
}

reproduceGrepTest().catch(console.error);