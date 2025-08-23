import mongoose from 'mongoose';

let connected = false;
export async function initMongo() {
    const uri = process.env.MONGODB_URI;
    console.log('initializing mongo', uri);
    if (!uri) throw new Error('No mongo URI provided');
    if (!connected) {
        try {
            await mongoose.connect(uri);
            connected = true;
        } catch {
            throw new Error('could not connect to mongo');
        }
    }
    return mongoose;
}
