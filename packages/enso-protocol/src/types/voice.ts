export type VoiceMetaPayload = {
  readonly streamId: string;
  readonly lang?: string;
  readonly speaker?: string;
  readonly hints?: readonly string[];
  readonly tags?: readonly string[];
};
