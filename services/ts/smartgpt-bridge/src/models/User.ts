// @ts-nocheck
import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    apiKey: { type: String, unique: true, required: true },
    roles: { type: [String], default: ['user'] },
    createdAt: { type: Date, default: Date.now },
});

export const User = model('User', UserSchema, 'users');
