import { freezeArray } from "./immutability.js";
import { transition } from "./machine.js";
import type {
  MachineDefinition,
  MachineEvent,
  MachineSnapshot,
  TransitionManyParams,
  TransitionManyResult,
  TransitionResult,
} from "./types.js";

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types --
   Tuple and reducer parameters use readonly inputs, but the rule does not
   detect the immutability guarantees from our aliases. */

type SequenceAccumulator<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
> = Readonly<{
  readonly snapshot: MachineSnapshot<State, Context>;
  readonly results: ReadonlyArray<TransitionResult<State, Events, Context>>;
  readonly halted: boolean;
}>;

type SequenceEvaluation<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
> = Readonly<{
  readonly finalSnapshot: MachineSnapshot<State, Context>;
  readonly results: ReadonlyArray<TransitionResult<State, Events, Context>>;
  readonly halted: boolean;
}>;

type TransitionManyArgs<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
> = readonly [
  definition: MachineDefinition<State, Events, Context>,
  snapshot: MachineSnapshot<State, Context>,
  events: ReadonlyArray<MachineEvent<Events>>,
];

const evaluateSequence = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
>(
  definition: MachineDefinition<State, Events, Context>,
  snapshot: MachineSnapshot<State, Context>,
  events: ReadonlyArray<MachineEvent<Events>>,
): SequenceEvaluation<State, Events, Context> => {
  const initialAccumulator: SequenceAccumulator<State, Events, Context> = {
    snapshot,
    results: [],
    halted: false,
  };

  const finalAccumulator = events.reduce<
    SequenceAccumulator<State, Events, Context>
  >(
    (
      current: Readonly<SequenceAccumulator<State, Events, Context>>,
      event: Readonly<MachineEvent<Events>>,
    ) => {
      if (current.halted) {
        return current;
      }

      const result = transition(definition, current.snapshot, event);
      const nextSnapshot =
        result.status === "transitioned" ? result.snapshot : current.snapshot;

      return {
        snapshot: nextSnapshot,
        results: [...current.results, result],
        halted: result.status !== "transitioned",
      };
    },
    initialAccumulator,
  );

  return {
    finalSnapshot: finalAccumulator.snapshot,
    results: finalAccumulator.results,
    halted: finalAccumulator.halted,
  };
};

const summariseSequence = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
>(
  events: ReadonlyArray<MachineEvent<Events>>,
  evaluation: SequenceEvaluation<State, Events, Context>,
): TransitionManyResult<State, Events, Context> => {
  const status: TransitionManyResult<State, Events, Context>["status"] =
    events.length === 0
      ? "no-events"
      : evaluation.halted
        ? "halted"
        : "complete";

  return {
    status,
    snapshot: evaluation.finalSnapshot,
    results: freezeArray(evaluation.results),
  };
};

const runSequence = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
>(
  definition: MachineDefinition<State, Events, Context>,
  snapshot: MachineSnapshot<State, Context>,
  events: ReadonlyArray<MachineEvent<Events>>,
): TransitionManyResult<State, Events, Context> =>
  summariseSequence(events, evaluateSequence(definition, snapshot, events));

export function transitionMany<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
>(
  ...[definition, snapshot, events]: TransitionManyArgs<State, Events, Context>
): TransitionManyResult<State, Events, Context> {
  return runSequence(definition, snapshot, events);
}

export const transitionManyFromParams = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
>({
  definition,
  snapshot,
  events,
}: TransitionManyParams<State, Events, Context>): TransitionManyResult<
  State,
  Events,
  Context
> => runSequence(definition, snapshot, events);
