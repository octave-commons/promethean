// @ts-nocheck
import { Policy } from '../../models/Policy.js';

export function registerPolicyRoutes(app) {
    app.get('/policies/list', {
        preHandler: [app.authUser, app.requirePolicy('read', 'policies')],
        schema: { operationId: 'listPolicies', tags: ['Admin'] },
        handler: async () => {
            const policies = await Policy.find().lean();
            return { policies };
        },
    });

    app.post('/policies/create', {
        preHandler: [app.authUser, app.requirePolicy('write', 'policies')],
        schema: {
            operationId: 'createPolicy',
            tags: ['Admin'],
            body: {
                type: 'object',
                required: ['role', 'action', 'resource'],
                properties: {
                    role: { type: 'string' },
                    action: { type: 'string' },
                    resource: { type: 'string' },
                    effect: { type: 'string', enum: ['allow', 'deny'], default: 'allow' },
                },
            },
        },
        handler: async (req) => {
            const { role, action, resource, effect } = req.body || {};
            const policy = await Policy.create({
                role,
                action,
                resource,
                effect: effect || 'allow',
            });
            return { ok: true, policy };
        },
    });

    app.post('/policies/delete', {
        preHandler: [app.authUser, app.requirePolicy('write', 'policies')],
        schema: {
            operationId: 'deletePolicy',
            tags: ['Admin'],
            body: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string' } },
            },
        },
        handler: async (req) => {
            const { id } = req.body || {};
            await Policy.findByIdAndDelete(id);
            return { ok: true };
        },
    });
}
