import test from 'ava';
import { getMongoClient, getChromaClient } from '@promethean-os/persistence';

import { installInMemoryPersistence } from '../persistence.js';

test('installInMemoryPersistence wires fake clients and dispose resets', async (t) => {
    const a = installInMemoryPersistence();
    const mongo1 = await getMongoClient();
    const chroma1 = await getChromaClient();

    // Use the fake mongo: insert and read via its in-memory API surface
    const coll = mongo1.db('db').collection('c');
    await coll.insertOne({ id: 'x', v: 1 });
    t.is(await coll.countDocuments({}), 1);

    a.dispose();

    // Reinstall and ensure new instances are created
    const b = installInMemoryPersistence();
    const mongo2 = await getMongoClient();
    const chroma2 = await getChromaClient();
    t.not(mongo1, mongo2);
    t.not(chroma1, chroma2);

    b.dispose();
});
