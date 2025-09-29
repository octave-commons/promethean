import type { MachineSnapshot } from "./types.js";

export const freezeArray = <Item>(
  items: ReadonlyArray<Item>,
): ReadonlyArray<Item> => Object.freeze([...items]);

export const freezeSnapshot = <State extends string, Context>(
  state: State,
  context: Context,
): MachineSnapshot<State, Context> =>
  Object.freeze({ state, context }) as MachineSnapshot<State, Context>;
