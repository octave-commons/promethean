import test from "ava";

import {
  availableTransitions,
  canTransition,
  createMachine,
  createSnapshot,
  defineTransition,
  transition,
  transitionMany,
  transitionManyFromParams,
  type MachineDefinition,
  type MachineEvent,
  type MachineSnapshot,
  type TransitionResult,
} from "../index.js";

type WorkflowState = "idle" | "running" | "completed";

type WorkflowEvents = {
  start: { readonly increment: number };
  finish: { readonly summary: string };
  reset: undefined;
};

type WorkflowContext = Readonly<{
  readonly count: number;
  readonly history: ReadonlyArray<string>;
}>;

const createWorkflowMachine = (): MachineDefinition<
  WorkflowState,
  WorkflowEvents,
  WorkflowContext
> =>
  createMachine<WorkflowState, WorkflowEvents, WorkflowContext>({
    initialState: "idle",
    initialContext: (): WorkflowContext => ({
      count: 0,
      history: [] as ReadonlyArray<string>,
    }),
    transitions: [
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: "idle",
        to: "running",
        event: "start",
        reducer: ({ context, event }): WorkflowContext => ({
          count: context.count + event.payload.increment,
          history: [...context.history, `started:${event.payload.increment}`],
        }),
      }),
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: "running",
        to: "completed",
        event: "finish",
        guard: ({ event }) => event.payload.summary.length > 0,
        reducer: ({ context, event }): WorkflowContext => ({
          count: context.count,
          history: [...context.history, `finished:${event.payload.summary}`],
        }),
      }),
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: "completed",
        to: "idle",
        event: "reset",
        reducer: ({ context }): WorkflowContext => ({
          count: 0,
          history: context.history,
        }),
      }),
    ],
  });

test("creates independent snapshots with the initial configuration", (t) => {
  const machine = createWorkflowMachine();
  const first = createSnapshot(machine);
  const second = createSnapshot(machine);

  t.deepEqual(first, {
    state: "idle",
    context: { count: 0, history: [] },
  });
  t.deepEqual(second, first);
  t.not(first, second);
});

test("applies transitions and reducers immutably", (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);
  const startEvent: MachineEvent<WorkflowEvents, "start"> = {
    type: "start",
    payload: { increment: 2 },
  };

  const startResult = transition(machine, initial, startEvent);
  t.is(startResult.status, "transitioned");

  const runningSnapshot = (
    startResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: "transitioned" }
    >
  ).snapshot;

  t.deepEqual(runningSnapshot, {
    state: "running",
    context: { count: 2, history: ["started:2"] },
  });
  t.deepEqual(initial, {
    state: "idle",
    context: { count: 0, history: [] },
  });

  const finishEvent: MachineEvent<WorkflowEvents, "finish"> = {
    type: "finish",
    payload: { summary: "ok" },
  };

  const finishResult = transition(machine, runningSnapshot, finishEvent);
  t.is(finishResult.status, "transitioned");
  t.deepEqual(
    (
      finishResult as Extract<
        TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
        { readonly status: "transitioned" }
      >
    ).snapshot,
    {
      state: "completed",
      context: { count: 2, history: ["started:2", "finished:ok"] },
    },
  );
});

test("prevents transitions when guards reject the event", (t) => {
  const machine = createWorkflowMachine();
  const runningSnapshot = Object.freeze({
    state: "running" as WorkflowState,
    context: { count: 4, history: ["started:4"] as ReadonlyArray<string> },
  }) as MachineSnapshot<WorkflowState, WorkflowContext>;
  const finishEvent: MachineEvent<WorkflowEvents, "finish"> = {
    type: "finish",
    payload: { summary: "" },
  };

  const result = transition(machine, runningSnapshot, finishEvent);
  if (result.status !== "guard-rejected") {
    t.fail(`Expected guard rejection, received ${result.status}`);
    return;
  }

  t.deepEqual(result.snapshot, runningSnapshot);
  t.deepEqual(result.details, {
    from: "running",
    to: "completed",
    context: runningSnapshot.context,
    event: finishEvent,
  });
});

test("returns no-transition when no candidate exists", (t) => {
  const machine = createWorkflowMachine();
  const snapshot = createSnapshot(machine);
  const finishEvent: MachineEvent<WorkflowEvents, "finish"> = {
    type: "finish",
    payload: { summary: "done" },
  };

  const result = transition(machine, snapshot, finishEvent);
  t.is(result.status, "no-transition");
  t.deepEqual(result.snapshot, snapshot);
});

test("lists available transitions for the current state", (t) => {
  const machine = createWorkflowMachine();
  const runningSnapshot = Object.freeze({
    state: "running" as WorkflowState,
    context: { count: 1, history: ["started:1"] as ReadonlyArray<string> },
  }) as MachineSnapshot<WorkflowState, WorkflowContext>;

  const transitions = availableTransitions(machine, runningSnapshot);
  t.deepEqual(
    transitions.map((item) => item.event),
    ["finish"],
  );
});

test("canTransition respects guard logic", (t) => {
  const machine = createWorkflowMachine();
  const runningSnapshot = Object.freeze({
    state: "running" as WorkflowState,
    context: { count: 1, history: ["started:1"] as ReadonlyArray<string> },
  }) as MachineSnapshot<WorkflowState, WorkflowContext>;

  const goodEvent: MachineEvent<WorkflowEvents, "finish"> = {
    type: "finish",
    payload: { summary: "great" },
  };
  const badEvent: MachineEvent<WorkflowEvents, "finish"> = {
    type: "finish",
    payload: { summary: "" },
  };

  t.true(canTransition(machine, runningSnapshot, goodEvent));
  t.false(canTransition(machine, runningSnapshot, badEvent));
});

test("snapshot options override defaults", (t) => {
  const machine = createWorkflowMachine();
  const customSnapshot = createSnapshot(machine, {
    state: "completed",
    context: { count: 10, history: ["custom"] },
  });

  t.deepEqual(customSnapshot, {
    state: "completed",
    context: { count: 10, history: ["custom"] },
  });
});

test("transitionMany processes a sequence until completion", (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);
  const startEvent: MachineEvent<WorkflowEvents, "start"> = {
    type: "start",
    payload: { increment: 1 },
  };
  const finishEvent: MachineEvent<WorkflowEvents, "finish"> = {
    type: "finish",
    payload: { summary: "done" },
  };

  const sequence = transitionMany(machine, initial, [startEvent, finishEvent]);

  t.is(sequence.status, "complete");
  t.true(Object.isFrozen(sequence.results));
  t.is(sequence.results.length, 2);
  t.deepEqual(sequence.snapshot, {
    state: "completed",
    context: { count: 1, history: ["started:1", "finished:done"] },
  });
});

test("transitionMany halts on guard rejection and preserves the snapshot", (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);
  const startEvent: MachineEvent<WorkflowEvents, "start"> = {
    type: "start",
    payload: { increment: 3 },
  };
  const rejectedFinish: MachineEvent<WorkflowEvents, "finish"> = {
    type: "finish",
    payload: { summary: "" },
  };
  const resetEvent: MachineEvent<WorkflowEvents, "reset"> = {
    type: "reset",
    payload: undefined,
  };

  const events: ReadonlyArray<MachineEvent<WorkflowEvents>> = [
    startEvent,
    rejectedFinish,
    resetEvent,
  ];
  const sequence = transitionMany(machine, initial, events);

  t.is(sequence.status, "halted");
  t.is(sequence.results.length, 2);
  t.deepEqual(
    sequence.results.map((result) => result.status),
    ["transitioned", "guard-rejected"],
  );

  const transitioned = sequence.results[0] as Extract<
    TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
    { readonly status: "transitioned" }
  >;

  t.deepEqual(sequence.snapshot, transitioned.snapshot);
});

test("transitionMany reports no events when the sequence is empty", (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);

  const sequence = transitionMany(machine, initial, []);

  t.is(sequence.status, "no-events");
  t.deepEqual(sequence.snapshot, initial);
  t.deepEqual(sequence.results, []);
  t.true(Object.isFrozen(sequence.results));
});

test("transitionManyFromParams mirrors the tuple signature", (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);
  const events: ReadonlyArray<MachineEvent<WorkflowEvents>> = [
    { type: "start", payload: { increment: 5 } },
    { type: "finish", payload: { summary: "wrapped" } },
  ];

  const tupleResult = transitionMany(machine, initial, events);
  const paramsResult = transitionManyFromParams({
    definition: machine,
    snapshot: initial,
    events,
  });

  t.deepEqual(paramsResult, tupleResult);
  t.true(Object.isFrozen(paramsResult.results));
});
