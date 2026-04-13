import { AtpAgent } from "@atproto/api";
import type {
  SignalEvent,
  Thread,
  ReducedSnapshot,
  ConnectionOpportunity,
  ActionCard,
} from "@workspace/radar-core";
import {
  LEXICON_SIGNAL_EVENT,
  LEXICON_THREAD,
  LEXICON_SNAPSHOT,
  LEXICON_CONNECTION_OPPORTUNITY,
  LEXICON_ACTION_CARD,
  LEXICON_GAUGE_DEFINITION,
} from "./collections.js";
import {
  toAtprotoSignalEvent,
  toAtprotoThread,
  toAtprotoSnapshot,
  toAtprotoConnectionOpportunity,
  toAtprotoActionCard,
} from "./converters.js";

export interface SignalAtprotoConfig {
  service: string;
  identifier: string;
  password: string;
}

export class SignalAtprotoClient {
  private agent: AtpAgent;
  private config: SignalAtprotoConfig;
  private _did = "";

  constructor(config: SignalAtprotoConfig) {
    this.config = config;
    this.agent = new AtpAgent({ service: config.service });
  }

  async login(): Promise<void> {
    const response = await this.agent.login({
      identifier: this.config.identifier,
      password: this.config.password,
    });
    this._did = response.data.did;
  }

  get did(): string {
    return this._did;
  }

  async publishSignalEvent(event: SignalEvent): Promise<string> {
    const record = toAtprotoSignalEvent(event);
    const result = await this.agent.com.atproto.repo.createRecord({
      repo: this.did,
      collection: LEXICON_SIGNAL_EVENT,
      record,
    });
    return result.data.uri;
  }

  async publishThread(thread: Thread): Promise<string> {
    const record = toAtprotoThread(thread);
    const result = await this.agent.com.atproto.repo.createRecord({
      repo: this.did,
      collection: LEXICON_THREAD,
      record,
    });
    return result.data.uri;
  }

  async publishSnapshot(snapshot: ReducedSnapshot): Promise<string> {
    const record = toAtprotoSnapshot(snapshot);
    const result = await this.agent.com.atproto.repo.createRecord({
      repo: this.did,
      collection: LEXICON_SNAPSHOT,
      record,
    });
    return result.data.uri;
  }

  async publishConnectionOpportunity(opp: ConnectionOpportunity): Promise<string> {
    const record = toAtprotoConnectionOpportunity(opp);
    const result = await this.agent.com.atproto.repo.createRecord({
      repo: this.did,
      collection: LEXICON_CONNECTION_OPPORTUNITY,
      record,
    });
    return result.data.uri;
  }

  async publishActionCard(card: ActionCard): Promise<string> {
    const record = toAtprotoActionCard(card);
    const result = await this.agent.com.atproto.repo.createRecord({
      repo: this.did,
      collection: LEXICON_ACTION_CARD,
      record,
    });
    return result.data.uri;
  }

  async listSignalEvents(limit = 50): Promise<Array<{ uri: string; value: Record<string, unknown> }>> {
    const result = await this.agent.com.atproto.repo.listRecords({
      repo: this.did,
      collection: LEXICON_SIGNAL_EVENT,
      limit,
    });
    return result.data.records.map((r) => ({
      uri: r.uri,
      value: r.value as Record<string, unknown>,
    }));
  }

  async listThreads(limit = 50): Promise<Array<{ uri: string; value: Record<string, unknown> }>> {
    const result = await this.agent.com.atproto.repo.listRecords({
      repo: this.did,
      collection: LEXICON_THREAD,
      limit,
    });
    return result.data.records.map((r) => ({
      uri: r.uri,
      value: r.value as Record<string, unknown>,
    }));
  }

  async listSnapshots(limit = 50): Promise<Array<{ uri: string; value: Record<string, unknown> }>> {
    const result = await this.agent.com.atproto.repo.listRecords({
      repo: this.did,
      collection: LEXICON_SNAPSHOT,
      limit,
    });
    return result.data.records.map((r) => ({
      uri: r.uri,
      value: r.value as Record<string, unknown>,
    }));
  }

  async getRecord(uri: string): Promise<{ uri: string; value: Record<string, unknown> }> {
    const parts = uri.replace("at://", "").split("/");
    if (parts.length < 3) throw new Error(`Invalid AT URI: ${uri}`);
    const result = await this.agent.com.atproto.repo.getRecord({
      repo: parts[0],
      collection: parts[1],
      rkey: parts[2],
    });
    return {
      uri: result.data.uri,
      value: result.data.value as Record<string, unknown>,
    };
  }

  async deleteRecord(uri: string): Promise<void> {
    const parts = uri.replace("at://", "").split("/");
    if (parts.length < 3) throw new Error(`Invalid AT URI: ${uri}`);
    await this.agent.com.atproto.repo.deleteRecord({
      repo: parts[0],
      collection: parts[1],
      rkey: parts[2],
    });
  }
}
