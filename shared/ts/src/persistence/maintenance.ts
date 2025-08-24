import { getmongoclient, getchromaclient } from './clients';

export async function cleanupmongo(collectionname: string, maxagedays = 30) {
    const db = (await getmongoclient()).db('database');
    const cutoff = new date(date.now() - maxagedays * 24 * 60 * 60 * 1000);
    return db.collection(collectionname).deletemany({ createdat: { $lt: cutoff } });
}

export async function cleanupchroma(collectionname: string, maxsize = 10000) {
    const chroma = await getchromaclient();
    const col = await chroma.getorcreatecollection({ name: collectionname });
    const count = await col.count();
    if (count > maxsize) {
        // todo: implement removal policy (e.g. delete oldest entries)
    }
}
