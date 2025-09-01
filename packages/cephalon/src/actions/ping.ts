import type { PingScope } from "./ping.scope.js";

export type PingInput = { userId: string };
export type PingOutput = { message: string };

export default async function run(
  scope: PingScope,
  input: PingInput,
): Promise<PingOutput> {
  await scope.policy.assertAllowed(input.userId, "ping");
  const now = scope.time();
  scope.logger.debug("pong at", now.toISOString());
  return { message: "pong" };
}
