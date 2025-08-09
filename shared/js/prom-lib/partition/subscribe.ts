import { EventBus, EventRecord } from "../event/types";
import { PartitionCoordinator } from "./coordinator";
import { jumpHash } from "./jump";

export type PartitionOpts = {
  group: string;
  memberId: string;
  partitions: number;
  keyOf?: (e: EventRecord) => string | undefined;
  rebalanceEveryMs?: number;
};

export async function subscribePartitioned(
  bus: EventBus,
  topic: string,
  handler: (e: EventRecord) => Promise<void>,
  coord: PartitionCoordinator,
  opts: PartitionOpts,
) {
  const keyOf = opts.keyOf ?? ((e: EventRecord) => e.key ?? e.id);
  let myParts = new Set<number>();

  function refreshAssignment() {
    coord.sweep();
    coord.heartbeat(opts.group, opts.memberId);
    const a = coord.assign(opts.group, opts.partitions);
    myParts = new Set<number>(
      Object.entries(a.owners)
        .filter(([pid, owner]) => owner === opts.memberId)
        .map(([pid]) => Number(pid)),
    );
  }

  coord.join(opts.group, opts.memberId, {});
  refreshAssignment();
  const t = setInterval(refreshAssignment, opts.rebalanceEveryMs ?? 3000);

  const unsubscribe = await bus.subscribe(topic, opts.group, handler, {
    from: "latest",
    manualAck: false,
    filter: (e: EventRecord) => {
      const key = keyOf(e) ?? e.id;
      const pid = jumpHash(String(key), opts.partitions);
      return myParts.has(pid);
    },
  });

  return async () => {
    clearInterval(t);
    await unsubscribe();
    coord.leave(opts.group, opts.memberId);
  };
}
