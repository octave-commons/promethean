import test from 'ava';
import request from 'supertest';
import app from '../src/index.js';

const client = request(app);

test('provides suggestion for file errors', async (t) => {
    const res = await client.post('/resolve').send({ error: 'ENOENT: no such file' });
    t.is(res.status, 200);
    t.true(res.body.resolution.includes('file path'));
});

test('rejects invalid payload', async (t) => {
    const res = await client.post('/resolve').send({ error: 123 });
    t.is(res.status, 400);
});
