import runPing from '../../actions/ping.js';
import { buildPingScope } from '../../actions/ping.scope.js';
import type { Event } from '../events.js';

export function registerPingEffects(store: {
    subscribe: (l: (e: Event) => void) => () => void;
    dispatch: (e: Event) => Promise<void>;
}) {
    store.subscribe(async (e) => {
        if (e.type === 'PING/TRIGGERED') {
            const scope = await buildPingScope();
            const { message } = await runPing(scope, { userId: e.by });
            await store.dispatch({ type: 'PING/PONG', by: e.by, message });
        }
    });
}
