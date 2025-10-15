import type { MachineSnapshot } from "./types.js";

export const freezeArray = <Item>(
  items: ReadonlyArray<Item>,
): ReadonlyArray<Item> => Object.freeze([...items]);

export const freezeSnapshot = <State extends string, Context>(
  state: State,
  context: Context,
): MachineSnapshot<State, Context> => {
  const frozenContext = typeof context === 'object' && context !== null 
    ? Object.freeze(JSON.parse(JSON.stringify(context))) 
    : context;
  return Object.freeze({ state, context: frozenContext }) as MachineSnapshot<State, Context>;
};
