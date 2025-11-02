// SPDX-License-Identifier: GPL-3.0-only
// Base serializer types and interfaces

export type Serializer<TInput, TOutput = string> = {
  readonly serialize: (input: TInput) => TOutput;
  readonly deserialize?: (output: TOutput) => TInput;
};

export type SerializationFormat = 'json' | 'markdown' | 'text' | 'html';

export type SerializationOptions = {
  readonly format?: SerializationFormat;
  readonly pretty?: boolean;
  readonly includeMetadata?: boolean;
};

export function createSerializer<TInput, TOutput = string>(
  serializeFn: (input: TInput, options?: SerializationOptions) => TOutput,
  deserializeFn?: (output: TOutput, options?: SerializationOptions) => TInput,
): Serializer<TInput, TOutput> {
  return {
    serialize: serializeFn,
    deserialize: deserializeFn,
  };
}
