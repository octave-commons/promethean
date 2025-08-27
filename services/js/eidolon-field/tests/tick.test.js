import test from 'ava';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { VectorN, FieldNode, VectorFieldService } from '../index.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (process.env.SKIP_NETWORK_TESTS === '1') {
    test('eidolon-field network tests skipped in sandbox', (t) => t.pass());
} else {
    test('service ticks on interval and persists field', async (t) => {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        process.env.MONGO_URL = uri;
        const svc = new VectorFieldService(8, 10);
        svc.addNode(new FieldNode(VectorN.zero(8), 1.0, 1));
        await svc.start();
        await sleep(35);
        const client = new MongoClient(uri);
        await client.connect();
        const docs = await client.db('eidolon_field').collection('fields').find().toArray();
        t.true(docs.length >= 2);
        await client.close();
        await svc.stop();
        await mongod.stop();
        t.true(svc.tickCount >= 2);
        t.true(svc.field.grid.size > 0);
    });
}
