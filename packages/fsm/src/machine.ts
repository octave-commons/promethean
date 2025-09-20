import type {
  InitialContext,
  MachineDefinition,
  MachineEvent,
  MachineSnapshot,
  SnapshotOptions,
  TransitionDefinition,
  TransitionDetails,
  TransitionForEvent,
  TransitionResult,
} from "./types.js";
import { freezeArray, freezeSnapshot } from "./immutability.js";
const resolveInitialContext = <Context>(
  initial: InitialContext<Context>,
): Context =>
  typeof initial === "function" ? (initial as () => Context)() : initial;

export const createMachine = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
>(
  definition: MachineDefinition<State, Events, Context>,
): MachineDefinition<State, Events, Context> => ({
  initialState: definition.initialState,
  initialContext: definition.initialContext,
  transitions: freezeArray(definition.transitions),
});

export const defineTransition = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
>(
  transition: TransitionDefinition<State, Events, Context>,
): TransitionDefinition<State, Events, Context> => transition;

export const createSnapshot = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
>(
  definition: MachineDefinition<State, Events, Context>,
  options?: SnapshotOptions<State, Context>,
): MachineSnapshot<State, Context> => {
  const state = options?.state ?? definition.initialState;
  const context =
    options?.context ?? resolveInitialContext(definition.initialContext);
  return freezeSnapshot(state, context);
};

const isMatchingTransition = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string,
>(
  transition: TransitionDefinition<State, Events, Context>,
  snapshot: MachineSnapshot<State, Context>,
  event: MachineEvent<Events, EventType>,
): transition is TransitionForEvent<State, Events, Context, EventType> =>
  transition.from === snapshot.state && transition.event === event.type;

const findMatchingTransitions = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string,
>(
  definition: MachineDefinition<State, Events, Context>,
  snapshot: MachineSnapshot<State, Context>,
  event: MachineEvent<Events, EventType>,
): ReadonlyArray<TransitionForEvent<State, Events, Context, EventType>> =>
  freezeArray(
    definition.transitions.filter(
      (
        transition,
      ): transition is TransitionForEvent<State, Events, Context, EventType> =>
        isMatchingTransition(transition, snapshot, event),
    ),
  );

const buildDetails = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string,
>(
  snapshot: MachineSnapshot<State, Context>,
  transition: TransitionForEvent<State, Events, Context, EventType>,
  event: MachineEvent<Events, EventType>,
): TransitionDetails<State, Events, Context, EventType> => ({
  from: snapshot.state,
  to: transition.to,
  context: snapshot.context,
  event,
});

type CandidateEvaluation<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string,
> =
  | Readonly<{
      readonly status: "transitioned";
      readonly transition: TransitionForEvent<
        State,
        Events,
        Context,
        EventType
      >;
      readonly details: TransitionDetails<State, Events, Context, EventType>;
      readonly snapshot: MachineSnapshot<State, Context>;
    }>
  | Readonly<{
      readonly status: "guard-rejected";
      readonly transition: TransitionForEvent<
        State,
        Events,
        Context,
        EventType
      >;
      readonly details: TransitionDetails<State, Events, Context, EventType>;
    }>;

const evaluateCandidate = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string,
>(
  candidate: TransitionForEvent<State, Events, Context, EventType>,
  snapshot: MachineSnapshot<State, Context>,
  event: MachineEvent<Events, EventType>,
): CandidateEvaluation<State, Events, Context, EventType> => {
  const details = buildDetails(snapshot, candidate, event);
  const guardPasses = candidate.guard ? candidate.guard(details) : true;

  if (!guardPasses) {
    return {
      status: "guard-rejected",
      transition: candidate,
      details,
    };
  }

  const nextContext = candidate.reducer
    ? candidate.reducer(details)
    : snapshot.context;

  return {
    status: "transitioned",
    transition: candidate,
    details,
    snapshot: freezeSnapshot(candidate.to, nextContext),
  };
};

const resolveCandidates = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string,
>(
  candidates: ReadonlyArray<
    TransitionForEvent<State, Events, Context, EventType>
  >,
  snapshot: MachineSnapshot<State, Context>,
  event: MachineEvent<Events, EventType>,
  firstGuardRejection?: Extract<
    CandidateEvaluation<State, Events, Context, EventType>,
    { readonly status: "guard-rejected" }
  >,
): TransitionResult<State, Events, Context, EventType> => {
  if (candidates.length === 0) {
    return firstGuardRejection
      ? {
          status: "guard-rejected",
          snapshot,
          event,
          transition: firstGuardRejection.transition,
          details: firstGuardRejection.details,
        }
      : { status: "no-transition", snapshot, event };
  }
  const [candidate, ...remaining] = candidates as readonly [
    TransitionForEvent<State, Events, Context, EventType>,
    ...TransitionForEvent<State, Events, Context, EventType>[],
  ];
  const evaluation = evaluateCandidate(candidate, snapshot, event);
  if (evaluation.status === "transitioned") {
    return {
      status: "transitioned",
      snapshot: evaluation.snapshot,
      event,
      transition: evaluation.transition,
      details: evaluation.details,
    };
  }
  return resolveCandidates(
    remaining,
    snapshot,
    event,
    firstGuardRejection ?? evaluation,
  );
};

export const transition = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string,
>(
  definition: MachineDefinition<State, Events, Context>,
  snapshot: MachineSnapshot<State, Context>,
  event: MachineEvent<Events, EventType>,
): TransitionResult<State, Events, Context, EventType> => {
  const candidates = findMatchingTransitions(definition, snapshot, event);
  if (candidates.length === 0) {
    return { status: "no-transition", snapshot, event };
  }

  return resolveCandidates(candidates, snapshot, event);
};

export const availableTransitions = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
>(
  definition: MachineDefinition<State, Events, Context>,
  snapshot: MachineSnapshot<State, Context>,
): ReadonlyArray<TransitionDefinition<State, Events, Context>> =>
  freezeArray(
    definition.transitions.filter(
      (transition) => transition.from === snapshot.state,
    ),
  );

export const canTransition = <
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string,
>(
  definition: MachineDefinition<State, Events, Context>,
  snapshot: MachineSnapshot<State, Context>,
  event: MachineEvent<Events, EventType>,
): boolean =>
  findMatchingTransitions(definition, snapshot, event).some((candidate) => {
    if (!candidate.guard) {
      return true;
    }

    const details = buildDetails(snapshot, candidate, event);
    return candidate.guard(details);
  });
