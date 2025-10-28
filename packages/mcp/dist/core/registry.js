import { applyAuthorization } from './authorization.js';
export const buildRegistry = (factories, ctx, toolNames) => {
    const list = () => tools;
    const ctxWithRegistry = {
        ...ctx,
        listTools: list,
    };
    // Apply authorization if tool names are provided
    const authorizedFactories = toolNames ? applyAuthorization(factories, toolNames) : factories;
    const tools = authorizedFactories.map((f) => f(ctxWithRegistry));
    const byName = new Map(tools.map((t) => [t.spec.name, t]));
    return Object.freeze({
        list,
        get: (name) => byName.get(name),
    });
};
//# sourceMappingURL=registry.js.map