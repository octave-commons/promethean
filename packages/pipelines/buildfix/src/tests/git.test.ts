import test from 'ava';
import { sanitizeBranch } from '../iter/git.js';

test('sanitizeBranch removes invalid characters', (t) => {
  t.is(sanitizeBranch('feature/test-branch'), 'feature/test-branch');
  t.is(sanitizeBranch('feature@test_branch'), 'feature-test_branch');
  t.is(sanitizeBranch('feature!!test@@branch##'), 'feature-test-branch');
  t.is(sanitizeBranch('---feature---test---'), 'feature-test');
  t.is(sanitizeBranch('feature/test/branch'), 'feature/test/branch');
  t.is(sanitizeBranch('a'.repeat(130)), 'a'.repeat(120)); // Truncates to 120 chars
});

test('sanitizeBranch handles edge cases', (t) => {
  t.is(sanitizeBranch(''), '');
  t.is(sanitizeBranch('---'), '');
  t.is(sanitizeBranch('test'), 'test');
  t.is(sanitizeBranch('test-branch-123'), 'test-branch-123');
});

test('sanitizeBranch preserves valid characters', (t) => {
  t.is(sanitizeBranch('feature-123-test'), 'feature-123-test');
  t.is(sanitizeBranch('bugfix/issue-456'), 'bugfix/issue-456');
  t.is(sanitizeBranch('release/v1.2.3'), 'release/v1.2.3');
});

test('sanitizeBranch handles special characters', (t) => {
  t.is(sanitizeBranch('feature@test$branch'), 'feature-test-branch');
  t.is(sanitizeBranch('hotfix#critical%bug'), 'hotfix-critical-bug');
  t.is(sanitizeBranch('experimental&prototype'), 'experimental-prototype');
});

test('sanitizeBranch handles consecutive invalid characters', (t) => {
  t.is(sanitizeBranch('feature!!!test###branch'), 'feature-test-branch');
  t.is(sanitizeBranch('---test---branch---'), 'test-branch');
  t.is(sanitizeBranch('test@@@branch'), 'test-branch');
});

test('sanitizeBranch handles leading and trailing invalid characters', (t) => {
  t.is(sanitizeBranch('---feature-test-branch---'), 'feature-test-branch');
  t.is(sanitizeBranch('!!!test-branch!!!'), 'test-branch');
  t.is(sanitizeBranch('@@@branch@@@'), 'branch');
});

test('sanitizeBranch handles mixed valid and invalid characters', (t) => {
  t.is(sanitizeBranch('feature/test-branch@123'), 'feature/test-branch-123');
  t.is(sanitizeBranch('bugfix#issue-456/fix'), 'bugfix-issue-456/fix');
  t.is(sanitizeBranch('release$v1.2.3-beta'), 'release-v1.2.3-beta');
});

test('sanitizeBranch handles unicode and edge cases', (t) => {
  t.is(sanitizeBranch('测试-feature'), 'feature'); // Unicode chars removed
  t.is(sanitizeBranch('feature🚀branch'), 'featurebranch'); // Emoji removed
  t.is(sanitizeBranch('feature   branch'), 'feature-branch'); // Spaces converted to single dash
  t.is(sanitizeBranch('feature--branch'), 'feature-branch'); // Double dashes collapsed
});

test('sanitizeBranch handles length limits correctly', (t) => {
  const longBranch = 'feature/' + 'a'.repeat(150);
  const result = sanitizeBranch(longBranch);
  t.true(result.length <= 120);
  t.true(result.startsWith('feature/'));
});

test('sanitizeBranch handles dots and underscores correctly', (t) => {
  t.is(sanitizeBranch('feature.test_branch'), 'feature.test_branch');
  t.is(sanitizeBranch('feature..test__branch'), 'feature..test__branch');
  t.is(sanitizeBranch('.feature.test.'), 'feature.test');
  t.is(sanitizeBranch('_feature_test_'), 'feature_test');
});

test('sanitizeBranch handles complex real-world scenarios', (t) => {
  t.is(sanitizeBranch('feat/JIRA-123_add-user-auth'), 'feat/JIRA-123_add-user-auth');
  t.is(sanitizeBranch('fix/bug#456@critical'), 'fix/bug-456-critical');
  t.is(sanitizeBranch('chore/update deps & packages'), 'chore/update-deps-packages');
  t.is(sanitizeBranch('docs/readme update!!!'), 'docs/readme-update');
});

test('sanitizeBranch handles version patterns', (t) => {
  t.is(sanitizeBranch('release/v1.0.0'), 'release/v1.0.0');
  t.is(sanitizeBranch('hotfix/2.1.3-fix'), 'hotfix/2.1.3-fix');
  t.is(sanitizeBranch('beta@v3.0.0-alpha'), 'beta-v3.0.0-alpha');
});
