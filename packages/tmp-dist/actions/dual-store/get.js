import { fromMongoDocument } from './utils.js';
export const get = async (inputs, dependencies) => {
    const { id } = inputs;
    const { mongo, state } = dependencies;
    const collection = await mongo.getCollection();
    const filter = { id };
    const document = await collection.findOne(filter);
    if (!document) {
        return null;
    }
    return fromMongoDocument(document, state);
};
