import test from 'ava';
import { execa } from 'execa';
import { temporaryDirectory } from 'tempy';
import { commit } from '../git.js';

test('commit function throws specific error for "nothing to commit"', async (t) => {
  const tempDir = temporaryDirectory();

  // Initialize git repo
  await execa('git', ['init'], { cwd: tempDir });
  await execa('git', ['config', 'user.name', 'test'], { cwd: tempDir });
  await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

  try {
    await commit(tempDir, 'test message', false);
    t.fail('Should have thrown an error');
  } catch (error) {
    if (error instanceof Error) {
      t.true(error.message.includes('nothing to commit'));
    } else {
      t.fail('Should have thrown an Error instance');
    }
  }
});
