import { randomUUID } from "node:crypto";

export interface MindMessageProposal {
  id: string;
  sessionId: string;
  cephalonId: string;
  circuitIndex?: number;
  createdAt: number;
  content: string;
  rationale?: string;
  suggestedChannelId?: string;
  suggestedChannelName?: string;
  sourceEventType?: string;
}

export interface MindPromptProposal {
  id: string;
  proposerSessionId: string;
  proposerCephalonId: string;
  proposerCircuitIndex?: number;
  targetSessionId: string;
  createdAt: number;
  rationale?: string;
  systemPrompt?: string;
  developerPrompt?: string;
  attentionFocus?: string;
}

export interface MindQueueSummary {
  messageProposalCount: number;
  promptProposalCount: number;
}

export class CephalonMindQueue {
  private readonly maxMessageProposals: number;
  private readonly maxPromptProposals: number;
  private readonly messageProposals: MindMessageProposal[] = [];
  private readonly promptProposals: MindPromptProposal[] = [];

  public constructor(options?: { readonly maxMessageProposals?: number; readonly maxPromptProposals?: number }) {
    this.maxMessageProposals = options?.maxMessageProposals ?? 256;
    this.maxPromptProposals = options?.maxPromptProposals ?? 128;
  }

  public proposeMessage(input: {
    readonly sessionId: string;
    readonly cephalonId: string;
    readonly circuitIndex?: number;
    readonly content: string;
    readonly rationale?: string;
    readonly suggestedChannelId?: string;
    readonly suggestedChannelName?: string;
    readonly sourceEventType?: string;
  }): MindMessageProposal {
    const proposal: MindMessageProposal = {
      id: randomUUID(),
      sessionId: input.sessionId,
      cephalonId: input.cephalonId,
      circuitIndex: input.circuitIndex,
      createdAt: Date.now(),
      content: input.content,
      rationale: input.rationale,
      suggestedChannelId: input.suggestedChannelId,
      suggestedChannelName: input.suggestedChannelName,
      sourceEventType: input.sourceEventType,
    };

    this.messageProposals.push(proposal);
    this.trimOldest(this.messageProposals, this.maxMessageProposals);
    return proposal;
  }

  public proposePrompt(input: {
    readonly proposerSessionId: string;
    readonly proposerCephalonId: string;
    readonly proposerCircuitIndex?: number;
    readonly targetSessionId: string;
    readonly rationale?: string;
    readonly systemPrompt?: string;
    readonly developerPrompt?: string;
    readonly attentionFocus?: string;
  }): MindPromptProposal {
    const proposal: MindPromptProposal = {
      id: randomUUID(),
      proposerSessionId: input.proposerSessionId,
      proposerCephalonId: input.proposerCephalonId,
      proposerCircuitIndex: input.proposerCircuitIndex,
      targetSessionId: input.targetSessionId,
      createdAt: Date.now(),
      rationale: input.rationale,
      systemPrompt: input.systemPrompt,
      developerPrompt: input.developerPrompt,
      attentionFocus: input.attentionFocus,
    };

    this.promptProposals.push(proposal);
    this.trimOldest(this.promptProposals, this.maxPromptProposals);
    return proposal;
  }

  public peekMessageProposals(limit = 12): MindMessageProposal[] {
    return this.messageProposals.slice(0, Math.max(0, limit));
  }

  public peekPromptProposals(limit = 12): MindPromptProposal[] {
    return this.promptProposals.slice(0, Math.max(0, limit));
  }

  public consumeMessageProposals(ids: readonly string[]): MindMessageProposal[] {
    if (ids.length === 0) {
      return [];
    }

    const idSet = new Set(ids);
    const consumed = this.messageProposals.filter((proposal) => idSet.has(proposal.id));
    if (consumed.length === 0) {
      return [];
    }

    const remaining = this.messageProposals.filter((proposal) => !idSet.has(proposal.id));
    this.messageProposals.length = 0;
    this.messageProposals.push(...remaining);
    return consumed;
  }

  public consumePromptProposals(ids: readonly string[]): MindPromptProposal[] {
    if (ids.length === 0) {
      return [];
    }

    const idSet = new Set(ids);
    const consumed = this.promptProposals.filter((proposal) => idSet.has(proposal.id));
    if (consumed.length === 0) {
      return [];
    }

    const remaining = this.promptProposals.filter((proposal) => !idSet.has(proposal.id));
    this.promptProposals.length = 0;
    this.promptProposals.push(...remaining);
    return consumed;
  }

  public summary(): MindQueueSummary {
    return {
      messageProposalCount: this.messageProposals.length,
      promptProposalCount: this.promptProposals.length,
    };
  }

  private trimOldest<T>(values: T[], max: number): void {
    while (values.length > max) {
      values.shift();
    }
  }
}
