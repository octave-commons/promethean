/**
 * Unit tests for GitUtils
 */
import test from 'ava';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { GitUtils } from '../lib/heal/utils/git-utils.js';
// Mock execSync to avoid actual git operations during tests
const mockExecSync = test.macro({
    exec: (t, command, output, shouldFail = false) => {
        const { execSync } = await import('node:child_process');
        if (shouldFail) {
            t.throws(() => execSync(command));
        }
        else {
            const result = execSync(command);
            t.is(result.toString().trim(), output);
        }
    },
});
test.before(async (t) => {
    // Create a temporary directory for testing
    const testDir = path.join(process.cwd(), 'test-git-utils-temp');
    await fs.mkdir(testDir, { recursive: true });
    // Initialize a git repository
    const { execSync } = await import('node:child_process');
    execSync('git init', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    // Create initial commit
    await fs.writeFile(path.join(testDir, 'test.txt'), 'test content');
    execSync('git add test.txt', { cwd: testDir });
    execSync('git commit -m "Initial commit"', { cwd: testDir });
    t.context.testDir = testDir;
});
test.after.always(async (t) => {
    // Clean up test directory
    const testDir = t.context.testDir;
    try {
        await fs.rm(testDir, { recursive: true, force: true });
    }
    catch (error) {
        // Ignore cleanup errors
    }
});
test('GitUtils constructor initializes correctly', (t) => {
    const gitUtils = new GitUtils('/test/path');
    t.is(gitUtils['repoPath'], '/test/path');
});
test('getCurrentState returns repository state', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    const state = await gitUtils.getCurrentState();
    t.true(typeof state.headSha === 'string');
    t.true(state.headSha.length > 0);
    t.true(typeof state.branch === 'string');
    t.true(typeof state.isClean === 'boolean');
    t.true(Array.isArray(state.modifiedFiles));
    t.true(Array.isArray(state.untrackedFiles));
});
test('addFiles successfully adds files', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    // Create a new file
    const newFile = path.join(testDir, 'new-file.txt');
    await fs.writeFile(newFile, 'new content');
    const result = await gitUtils.addFiles(['new-file.txt']);
    t.true(result.success);
    t.true(typeof result.data === 'string');
});
test('addFiles handles empty file list', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    const result = await gitUtils.addFiles([]);
    t.true(result.success);
    t.is(result.data, 'No files to add');
});
test('commit creates commit with message', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    // First add a file
    const testFile = path.join(testDir, 'commit-test.txt');
    await fs.writeFile(testFile, 'commit test content');
    await gitUtils.addFiles(['commit-test.txt']);
    const result = await gitUtils.commit('Test commit message');
    t.true(result.success);
    t.true(typeof result.data?.sha === 'string');
    t.true(result.data.sha.length > 0);
});
test('commit creates empty commit when allowEmpty is true', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    const result = await gitUtils.commit('Empty commit', true);
    t.true(result.success);
    t.true(typeof result.data?.sha === 'string');
});
test('createTag creates git tag', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    const result = await gitUtils.createTag('test-tag', 'HEAD', 'Test tag message');
    t.true(result.success);
    t.true(typeof result.data === 'string');
});
test('deleteTag removes git tag', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    // First create a tag
    await gitUtils.createTag('delete-test-tag');
    const result = await gitUtils.deleteTag('delete-test-tag');
    t.true(result.success);
    t.true(typeof result.data === 'string');
});
test('getCommitSha returns SHA for valid ref', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    const sha = await gitUtils.getCommitSha('HEAD');
    t.true(typeof sha === 'string');
    t.true(sha.length > 0);
});
test('getCommitSha returns null for invalid ref', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    const sha = await gitUtils.getCommitSha('invalid-ref-name');
    t.is(sha, null);
});
test('getDiff returns diff between commits', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    // Create a commit with changes
    const testFile = path.join(testDir, 'diff-test.txt');
    await fs.writeFile(testFile, 'original content');
    await gitUtils.addFiles(['diff-test.txt']);
    const commitResult = await gitUtils.commit('Add diff test file');
    const fromSha = commitResult.data?.sha;
    // Modify the file
    await fs.writeFile(testFile, 'modified content');
    await gitUtils.addFiles(['diff-test.txt']);
    await gitUtils.commit('Modify diff test file');
    if (fromSha) {
        const diff = await gitUtils.getDiff(fromSha);
        t.true(typeof diff === 'string');
    }
});
test('getChangedFiles returns list of changed files', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    // Create a commit with changes
    const testFile = path.join(testDir, 'changed-files-test.txt');
    await fs.writeFile(testFile, 'test content');
    await gitUtils.addFiles(['changed-files-test.txt']);
    const commitResult = await gitUtils.commit('Add changed files test');
    const fromSha = commitResult.data?.sha;
    // Modify the file
    await fs.writeFile(testFile, 'modified content');
    await gitUtils.addFiles(['changed-files-test.txt']);
    await gitUtils.commit('Modify changed files test');
    if (fromSha) {
        const changedFiles = await gitUtils.getChangedFiles(fromSha);
        t.true(Array.isArray(changedFiles));
        t.true(changedFiles.includes('changed-files-test.txt'));
    }
});
test('getCommitHistory returns commit history', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    const history = await gitUtils.getCommitHistory();
    t.true(Array.isArray(history));
    t.true(history.length > 0);
    if (history.length > 0) {
        const commit = history[0];
        t.true(typeof commit.sha === 'string');
        t.true(typeof commit.message === 'string');
        t.true(typeof commit.author === 'string');
        t.true(commit.date instanceof Date);
    }
});
test('getCommitHistory with limit returns limited history', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    const limitedHistory = await gitUtils.getCommitHistory(undefined, 'HEAD', 2);
    const fullHistory = await gitUtils.getCommitHistory();
    t.true(limitedHistory.length <= 2);
    t.true(fullHistory.length >= limitedHistory.length);
});
test('refExists returns true for existing ref', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    const exists = await gitUtils.refExists('HEAD');
    t.true(exists);
});
test('refExists returns false for non-existing ref', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    const exists = await gitUtils.refExists('non-existing-ref');
    t.false(exists);
});
test('reset performs git reset', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    // Get current HEAD
    const currentHead = await gitUtils.getCommitSha('HEAD');
    if (currentHead) {
        const result = await gitUtils.reset(currentHead, 'soft');
        t.true(result.success);
        t.true(typeof result.data === 'string');
    }
});
test('stash creates stash', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    // Create a dirty working directory
    const testFile = path.join(testDir, 'stash-test.txt');
    await fs.writeFile(testFile, 'stashed content');
    const result = await gitUtils.stash('Test stash');
    t.true(result.success);
    t.true(typeof result.data === 'string');
});
test('stashPop applies stashed changes', async (t) => {
    const testDir = t.context.testDir;
    const gitUtils = new GitUtils(testDir);
    // First create a stash
    const testFile = path.join(testDir, 'stash-pop-test.txt');
    await fs.writeFile(testFile, 'stashed content for pop');
    await gitUtils.stash('Test stash for pop');
    const result = await gitUtils.stashPop();
    t.true(result.success);
    t.true(typeof result.data === 'string');
});
test('createGitUtils factory function creates instance', (t) => {
    const gitUtils = GitUtils.createGitUtils('/test/path');
    t.true(gitUtils instanceof GitUtils);
    t.is(gitUtils['repoPath'], '/test/path');
});
//# sourceMappingURL=git-utils.test.js.map