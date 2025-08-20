import request from 'supertest';
import { buildApp } from '../../src/server.js';

export const withServer = (root, fn) => {
    const app = buildApp(root);
    return fn(request(app));
};
