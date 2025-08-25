// @ts-nocheck
import { Schema, model } from 'mongoose';

const PolicySchema = new Schema({
    role: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    effect: { type: String, enum: ['allow', 'deny'], default: 'allow' },
});

export const Policy = model('Policy', PolicySchema, 'policies');
