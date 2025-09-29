import test from 'ava';

import { InMemoryCollection } from '../persistence.js';

type Doc = { id: string; user?: { age?: number; name?: string }; tags?: string[]; body?: string };

test('insertOne and find by equality', async (t) => {
    const c = new InMemoryCollection<Doc>('docs');
    await c.insertOne({ id: '1', user: { age: 30 }, tags: ['a'] });
    await c.insertOne({ id: '2', user: { age: 40 }, tags: ['b'] });
    const all = await c.find({}).toArray();
    t.is(all.length, 2);
    const forty = await c.find({ 'user.age': 40 }).toArray();
    t.deepEqual(
        forty.map((d) => d.id),
        ['2'],
    );
});

test('deleteMany removes matching docs', async (t) => {
    const c = new InMemoryCollection<Doc>('docs');
    await c.insertOne({ id: '1', user: { age: 30 } });
    await c.insertOne({ id: '2', user: { age: 40 } });
    await c.deleteMany({ 'user.age': 30 });
    const left = await c.find({}).toArray();
    t.deepEqual(
        left.map((d) => d.id),
        ['2'],
    );
});

test('countDocuments respects filters and operators', async (t) => {
    const c = new InMemoryCollection<Doc>('docs');
    await c.insertOne({ id: '1', user: { age: 25 }, body: 'hi' });
    await c.insertOne({ id: '2', user: { age: 35 }, body: 'hello' });
    await c.insertOne({ id: '3', user: { age: 45 } });

    t.is(await c.countDocuments({ 'user.age': { $gte: 30 } }), 2);
    t.is(await c.countDocuments({ 'user.age': { $lt: 30 } }), 1);
    t.is(await c.countDocuments({ body: { $exists: true } }), 2);
    t.is(await c.countDocuments({ body: { $exists: false } }), 1);
    t.is(await c.countDocuments({ body: { $not: /hello/ } }), 2);
    t.is(await c.countDocuments({ 'user.age': { $nin: [45] } }), 2);
});

test('updateOne with $set and $unset; upsert creates when not found', async (t) => {
    const c = new InMemoryCollection<Doc>('docs');
    await c.insertOne({ id: '1', user: { age: 30, name: 'A' } });

    await c.updateOne({ id: '1' }, { $set: { 'user.name': 'B' }, $unset: { body: '' } });
    const one = (await c.find({ id: '1' }).toArray())[0]!;
    t.is(one.user?.name, 'B');
    t.is(one.body, undefined);

    await c.updateOne({ id: '2' }, { $set: { body: 'new' } }, { upsert: true });
    // Upsert creates a new doc that may not match the original filter; verify via the set field
    t.is(await c.countDocuments({ body: 'new' }), 1);
});

test('updateMany applies to all matching documents', async (t) => {
    const c = new InMemoryCollection<Doc>('docs');
    await c.insertOne({ id: '1', user: { age: 30 } });
    await c.insertOne({ id: '2', user: { age: 30 } });
    await c.insertOne({ id: '3', user: { age: 40 } });

    await c.updateMany({ 'user.age': 30 }, { $set: { body: 'x' } });
    const all = await c.find({}).toArray();
    const bodies = Object.fromEntries(all.map((d) => [d.id, d.body]));
    t.deepEqual(bodies, { '1': 'x', '2': 'x', '3': undefined });
});
