import mongoose from 'mongoose';

let connected = false;
export async function initMongo() {
    const uri = process.env.MONGODB_URI;
    if (!uri) return null;
    if (!connected) {
        try {
            await mongoose.connect(uri);
            connected = true;
        } catch {
            return null;
        }
    }
    return mongoose;
}
