import { User } from './models/User.js';
import { checkAccess } from './utils/policyEngine.js';
import { initMongo } from './mongo.js';

export function registerRbac(app) {
    app.decorate('authUser', async (req, reply) => {
        await initMongo();
        const token = req.headers['x-pi-token'];
        if (!token) throw new Error('Missing API token');
        const user = await User.findOne({ apiKey: token });
        if (!user) throw new Error('Invalid token');
        req.user = user;
        return user;
    });

    app.decorate('requirePolicy', (action, resource) => {
        return async (req, reply) => {
            const resName = typeof resource === 'function' ? resource(req) : resource;
            const allowed = await checkAccess(req.user, action, resName);
            if (!allowed) {
                reply.code(403).send({ ok: false, error: 'Forbidden' });
            }
        };
    });
}
