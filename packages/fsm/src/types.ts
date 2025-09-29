export type MachineEvent<
  Events extends Record<string, unknown>,
  Type extends keyof Events & string = keyof Events & string,
> = Readonly<{
  readonly type: Type;
  readonly payload: Events[Type];
}>;

export type MachineSnapshot<State extends string, Context> = Readonly<{
  readonly state: State;
  readonly context: Context;
}>;

export type SnapshotOptions<State extends string, Context> = Readonly<{
  readonly state?: State;
  readonly context?: Context;
}>;

export type InitialContext<Context> = Context | (() => Context);

export type TransitionDetails<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string,
> = Readonly<{
  readonly from: State;
  readonly to: State;
  readonly context: Context;
  readonly event: MachineEvent<Events, EventType>;
}>;

export type TransitionDefinition<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
> = {
  [EventType in keyof Events & string]: Readonly<{
    readonly from: State;
    readonly to: State;
    readonly event: EventType;
    readonly guard?: (
      details: TransitionDetails<State, Events, Context, EventType>,
    ) => boolean;
    readonly reducer?: (
      details: TransitionDetails<State, Events, Context, EventType>,
    ) => Context;
  }>;
}[keyof Events & string];

export type TransitionForEvent<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string,
> = Extract<
  TransitionDefinition<State, Events, Context>,
  { readonly event: EventType }
>;

export type MachineDefinition<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
> = Readonly<{
  readonly initialState: State;
  readonly initialContext: InitialContext<Context>;
  readonly transitions: readonly TransitionDefinition<State, Events, Context>[];
}>;

export type TransitionResult<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
  EventType extends keyof Events & string = keyof Events & string,
> =
  | Readonly<{
      readonly status: "transitioned";
      readonly snapshot: MachineSnapshot<State, Context>;
      readonly event: MachineEvent<Events, EventType>;
      readonly transition: TransitionForEvent<
        State,
        Events,
        Context,
        EventType
      >;
      readonly details: TransitionDetails<State, Events, Context, EventType>;
    }>
  | Readonly<{
      readonly status: "guard-rejected";
      readonly snapshot: MachineSnapshot<State, Context>;
      readonly event: MachineEvent<Events, EventType>;
      readonly transition: TransitionForEvent<
        State,
        Events,
        Context,
        EventType
      >;
      readonly details: TransitionDetails<State, Events, Context, EventType>;
    }>
  | Readonly<{
      readonly status: "no-transition";
      readonly snapshot: MachineSnapshot<State, Context>;
      readonly event: MachineEvent<Events, EventType>;
    }>;

export type TransitionManyStatus = "no-events" | "complete" | "halted";

export type TransitionManyResult<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
> = Readonly<{
  readonly status: TransitionManyStatus;
  readonly snapshot: MachineSnapshot<State, Context>;
  readonly results: ReadonlyArray<TransitionResult<State, Events, Context>>;
}>;

export type TransitionManyParams<
  State extends string,
  Events extends Record<string, unknown>,
  Context,
> = {
  readonly definition: MachineDefinition<State, Events, Context>;
  readonly snapshot: MachineSnapshot<State, Context>;
  readonly events: ReadonlyArray<MachineEvent<Events>>;
};
