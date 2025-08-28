import test from 'ava';
import { MarkdownTask } from '../markdown/task';

const TASK_WITH_ID = `# Title\n\nSome text here. #todo #framework-core\n\n id: 1234-aaaa\n`;

const TASK_NO_ID = `# Another Title\n\nDetails here.\n`;

test('MarkdownTask parses id, title, and hashtags', async (t) => {
    const task = await MarkdownTask.load(TASK_WITH_ID);
    t.is(task.getId(), '1234-aaaa');
    t.is(task.getTitle(), 'Title');
    const tags = task.getHashtags();
    t.true(tags.includes('#todo'));
    t.true(tags.includes('#framework-core'));
});

test('ensureId inserts an id when missing', async (t) => {
    const task = await MarkdownTask.load(TASK_NO_ID);
    t.is(task.getId(), '');
    const id = task.ensureId('zzzz');
    t.is(id, 'zzzz');
    t.is(task.getId(), 'zzzz');
    const out = await task.toMarkdown();
    t.true(out.includes('id: zzzz'));
});

test('ensureStatus appends or replaces status at the end', async (t) => {
    const task = await MarkdownTask.load(TASK_WITH_ID);
    task.ensureStatus('#in-progress');
    const out = await task.toMarkdown();
    t.true(out.trimEnd().endsWith('#in-progress'));
    t.false(out.includes(' #todo'));
});

test('setTitle replaces or inserts H1 title', async (t) => {
    const task = await MarkdownTask.load(TASK_NO_ID);
    t.is(task.getTitle(), 'Another Title');
    task.setTitle('New Title');
    t.is(task.getTitle(), 'New Title');
});
