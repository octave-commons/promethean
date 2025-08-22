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

const LogSchema = new mongoose.Schema({
    requestId: { type: String, required: true },
    method: String,
    path: String,
    statusCode: Number,
    request: Object,
    response: Object,
    error: String,
    createdAt: { type: Date, default: Date.now, index: true },
    latencyMs: Number,
    service: String,
    operationId: String,
});

LogSchema.index({ path: 1, createdAt: -1 });
LogSchema.index({ statusCode: 1 });
LogSchema.index({ operationId: 1 });

const ttlDays = Number(process.env.LOG_TTL_DAYS || 30);
LogSchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlDays * 86400 });

export const Log = mongoose.models.Log || mongoose.model('Log', LogSchema, 'bridge_logs');
