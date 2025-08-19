export type Unsubscribe = () => void;
export type Listener<E> = (event: E) => void | Promise<void>;

export function createStore<S, E>(initial: S, reducer: (s: S, e: E) => S) {
    let state = initial;
    const listeners = new Set<Listener<E>>();

    function getState() {
        return state;
    }
    function subscribe(l: Listener<E>): Unsubscribe {
        listeners.add(l);
        return () => listeners.delete(l);
    }
    async function dispatch(e: E) {
        state = reducer(state, e);
        for (const l of listeners) await l(e);
    }

    return { getState, subscribe, dispatch };
}
