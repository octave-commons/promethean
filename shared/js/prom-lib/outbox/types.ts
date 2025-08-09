import { UUID } from "../event/types";

export interface OutboxRecord<T = any> {
  _id: UUID;
  topic: string;
  payload: T;
  headers?: Record<string, string>;
  status: "pending" | "claimed" | "sent" | "error";
  claimed_by?: string;
  lease_until?: number;
  last_err?: string;
  ts: number;
  attempts: number;
}

export interface OutboxStore<T = any> {
  add(rec: {
    id: UUID;
    topic: string;
    payload: T;
    headers?: Record<string, string>;
  }): Promise<void>;
  claimBatch(
    n: number,
    leaseMs: number,
    workerId: string,
  ): Promise<OutboxRecord<T>[]>;
  markSent(id: UUID): Promise<void>;
  markError(id: UUID, err: string): Promise<void>;
  requeueExpired(now?: number): Promise<number>;
}
