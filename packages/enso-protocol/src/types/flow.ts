export type FlowNackPayload = {
  readonly streamId: string;
  readonly missing: readonly number[];
};

export type FlowPausePayload = {
  readonly streamId: string;
};

export type FlowResumePayload = {
  readonly streamId: string;
};
