import { randomUUID } from "node:crypto";
import type {
  ApprovalRequest,
  Availability,
  AvailabilityResult,
  Condition,
  ContentPermissions,
  Context,
  ContextApplication,
  ContextApplyOptions,
  ContextDiff,
  ContextEntry,
  ContextInit,
  ContextParticipant,
  ContextViewState,
  DataSourceId,
  DataSourceInit,
  DataSourceMeta,
  DeniedDataSource,
  Discoverability,
  LlmView,
  RuleExpr,
} from "./types.js";

const DISCOVERABILITY_ORDER: Record<Discoverability, number> = {
  invisible: 0,
  hidden: 1,
  discoverable: 2,
  visible: 3,
};

const DEFAULT_PERMISSIONS: Readonly<Required<ContentPermissions>> = {
  readable: true,
  viewable: false,
  changeable: false,
  movable: false,
  exchangeable: false,
  sendable: false,
  addable: false,
  removable: false,
  deletable: false,
  saveable: false,
};

const DEFAULT_DISCOVERABILITY: Discoverability = "hidden";
const DEFAULT_AVAILABILITY: Availability = { mode: "private" };

function isoNow(): string {
  return new Date().toISOString();
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function sourceKey(id: DataSourceId): string {
  return `${id.kind}|${id.location}`;
}

function cloneMeta(meta: DataSourceMeta): DataSourceMeta {
  const copy: DataSourceMeta = {
    id: meta.id,
    owners: meta.owners.map((owner) => ({ ...owner })),
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    discoverability: meta.discoverability,
    availability: cloneAvailability(meta.availability),
  };
  if (meta.title !== undefined) {
    copy.title = meta.title;
  }
  if (meta.tags) {
    copy.tags = [...meta.tags];
  }
  if (meta.contentHints) {
    copy.contentHints = { ...meta.contentHints };
  }
  return copy;
}

function cloneAvailability(avail: Availability): Availability {
  switch (avail.mode) {
    case "public":
    case "private":
      return { mode: avail.mode };
    case "shared":
      return { mode: "shared", members: [...avail.members] };
    case "conditional":
      return {
        mode: "conditional",
        conditions: avail.conditions.map((condition) =>
          cloneCondition(condition),
        ),
      };
  }
}

function cloneCondition(condition: Condition): Condition {
  if (condition.kind === "soft") {
    return { kind: "soft", prompt: condition.prompt, requireApproval: true };
  }
  const cloned: Condition = { kind: "hard", rule: { ...condition.rule } };
  if (condition.requireApproval) {
    cloned.requireApproval = condition.requireApproval;
  }
  return cloned;
}

function normalizePermissions(perm?: ContentPermissions): ContentPermissions {
  if (!perm) {
    return { ...DEFAULT_PERMISSIONS };
  }
  return {
    readable:
      perm.readable === undefined
        ? DEFAULT_PERMISSIONS.readable
        : perm.readable,
    changeable:
      perm.changeable === undefined
        ? DEFAULT_PERMISSIONS.changeable
        : perm.changeable,
    movable:
      perm.movable === undefined ? DEFAULT_PERMISSIONS.movable : perm.movable,
    exchangeable:
      perm.exchangeable === undefined
        ? DEFAULT_PERMISSIONS.exchangeable
        : perm.exchangeable,
    sendable:
      perm.sendable === undefined
        ? DEFAULT_PERMISSIONS.sendable
        : perm.sendable,
    addable:
      perm.addable === undefined ? DEFAULT_PERMISSIONS.addable : perm.addable,
    removable:
      perm.removable === undefined
        ? DEFAULT_PERMISSIONS.removable
        : perm.removable,
    deletable:
      perm.deletable === undefined
        ? DEFAULT_PERMISSIONS.deletable
        : perm.deletable,
    saveable:
      perm.saveable === undefined
        ? DEFAULT_PERMISSIONS.saveable
        : perm.saveable,
    viewable:
      perm.viewable === undefined
        ? DEFAULT_PERMISSIONS.viewable
        : perm.viewable,
  };
}

function inferPurpose(meta: DataSourceMeta): "text" | "image" | "other" {
  const mime = meta.contentHints?.mime?.toLowerCase();
  if (!mime) {
    return "other";
  }
  if (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime.endsWith("+json")
  ) {
    return "text";
  }
  if (mime.startsWith("image/")) {
    return "image";
  }
  return "other";
}

function discoverabilityNarrower(
  base: Discoverability,
  candidate: Discoverability,
): boolean {
  return DISCOVERABILITY_ORDER[candidate] <= DISCOVERABILITY_ORDER[base];
}

function availabilityOverrideAllowed(
  base: Availability,
  candidate: Availability,
): boolean {
  if (base.mode === "public") {
    return true;
  }
  if (base.mode === "private") {
    return candidate.mode === "private";
  }
  if (base.mode === "shared") {
    if (candidate.mode === "private") {
      return true;
    }
    if (candidate.mode === "shared") {
      const baseMembers = new Set(base.members);
      return candidate.members.every((m) => baseMembers.has(m));
    }
    if (candidate.mode === "conditional") {
      return true;
    }
    return false;
  }
  // conditional base
  if (candidate.mode === "private") {
    return true;
  }
  if (candidate.mode === "conditional") {
    return true;
  }
  return false;
}

function serializeId(id: DataSourceId): string {
  return `${id.kind}:${id.location}`;
}

function evaluateRule(
  rule: RuleExpr,
  env: {
    now: Date;
    contextName: string;
    contextTags: string[];
    roomMembers: string[];
    metaTags: string[];
  },
): boolean {
  switch (rule.op) {
    case "roomHasMember":
      return env.roomMembers.includes(rule.id);
    case "timeBetween": {
      const start = new Date(rule.start);
      const end = new Date(rule.end);
      if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
        return false;
      }
      return env.now >= start && env.now <= end;
    }
    case "tagIncludes":
      return (
        env.metaTags.includes(rule.tag) || env.contextTags.includes(rule.tag)
      );
    case "contextNameMatches": {
      try {
        const re = new RegExp(rule.regex);
        return re.test(env.contextName);
      } catch (error) {
        return false;
      }
    }
    default:
      return false;
  }
}

function evaluateAvailability(
  availability: Availability,
  meta: DataSourceMeta,
  ctx: Context,
  participants: ContextParticipant[],
  env: {
    now: Date;
    contextTags: string[];
    roomMembers: string[];
  },
): AvailabilityResult {
  const approvals: ApprovalRequest[] = [];
  switch (availability.mode) {
    case "public":
      return { status: "granted", approvals };
    case "private": {
      const owners = meta.owners;
      const matchesOwner = (participant: ContextParticipant): boolean =>
        owners.some((owner) =>
          "userId" in owner
            ? owner.userId === participant.id
            : participant.groups?.includes(owner.groupId) ?? false,
        );
      const allParticipantsAllowed = participants.every(matchesOwner);
      if (!allParticipantsAllowed) {
        return {
          status: "denied",
          approvals,
          reason: "context participants not owned by data source owner",
        };
      }
      return { status: "granted", approvals };
    }
    case "shared": {
      const allowed = new Set(availability.members);
      const participantAllowed = (participant: ContextParticipant): boolean =>
        allowed.has(participant.id) ||
        (participant.groups?.some((group) => allowed.has(group)) ?? false);
      if (participants.every(participantAllowed)) {
        return { status: "granted", approvals };
      }
      return {
        status: "denied",
        approvals,
        reason: "context participants are outside shared member list",
      };
    }
    case "conditional": {
      const metaTags = meta.tags ?? [];
      const contextTags = env.contextTags;
      const ruleEnv = {
        now: env.now,
        contextName: ctx.name,
        contextTags,
        roomMembers: env.roomMembers,
        metaTags,
      };
      for (const condition of availability.conditions) {
        if (condition.kind === "hard") {
          const satisfied = evaluateRule(condition.rule, ruleEnv);
          if (!satisfied) {
            return {
              status: "denied",
              approvals,
              reason: "hard condition failed",
            };
          }
          if (condition.requireApproval) {
            approvals.push({
              id: randomUUID(),
              ctxId: ctx.ctxId,
              dataSource: meta.id,
              condition,
              reason: "hard-condition-approval",
            });
          }
        } else {
          approvals.push({
            id: randomUUID(),
            ctxId: ctx.ctxId,
            dataSource: meta.id,
            condition,
            reason: "soft-condition",
            prompt: condition.prompt,
          });
        }
      }
      if (approvals.length > 0) {
        return { status: "pending", approvals, reason: "awaiting approvals" };
      }
      return { status: "granted", approvals };
    }
    default:
      return {
        status: "denied",
        approvals,
        reason: "unknown availability mode",
      };
  }
}

function applyAvailabilityOverrides(
  meta: DataSourceMeta,
  entry: ContextEntry,
): DataSourceMeta {
  const next = cloneMeta(meta);
  if (entry.overrides?.discoverability) {
    const override = entry.overrides.discoverability;
    if (!discoverabilityNarrower(meta.discoverability, override)) {
      throw new Error("discoverability override must narrow visibility");
    }
    next.discoverability = override;
  }
  if (entry.overrides?.availability) {
    const override = entry.overrides.availability;
    if (!availabilityOverrideAllowed(meta.availability, override)) {
      throw new Error("availability override must narrow scope");
    }
    next.availability = cloneAvailability(override);
  }
  return next;
}

function normalizeEntry(
  entry: ContextEntry,
  meta: DataSourceMeta,
): ContextEntry {
  const state = entry.state ?? "pinned";
  const overrides = entry.overrides ? { ...entry.overrides } : undefined;
  if (
    overrides?.discoverability &&
    !discoverabilityNarrower(meta.discoverability, overrides.discoverability)
  ) {
    throw new Error("discoverability override must not widen scope");
  }
  if (
    overrides?.availability &&
    !availabilityOverrideAllowed(meta.availability, overrides.availability)
  ) {
    throw new Error("availability override must not widen scope");
  }
  const normalized: ContextEntry = {
    id: entry.id,
    state,
    permissions: normalizePermissions(entry.permissions),
  };
  if (overrides) {
    const resultOverrides: {
      discoverability?: Discoverability;
      availability?: Availability;
    } = {};
    if (overrides.discoverability) {
      resultOverrides.discoverability = overrides.discoverability;
    }
    if (overrides.availability) {
      resultOverrides.availability = cloneAvailability(overrides.availability);
    }
    if (Object.keys(resultOverrides).length > 0) {
      normalized.overrides = resultOverrides;
    }
  }
  return normalized;
}

function computeParts(sources: DataSourceMeta[]): LlmView["parts"] {
  return sources.map((meta) => ({
    id: meta.id,
    purpose: inferPurpose(meta),
    uri: meta.id.location,
    mime: meta.contentHints?.mime ?? "application/octet-stream",
  }));
}

function computeDiff(
  previous: LlmView | undefined,
  next: LlmView,
): ContextDiff | undefined {
  const prevMap = new Map<string, ContextViewState>();
  if (previous) {
    for (const meta of previous.active) {
      prevMap.set(serializeId(meta.id), "active");
    }
    for (const meta of previous.standby) {
      prevMap.set(serializeId(meta.id), "standby");
    }
    for (const meta of previous.ignored) {
      prevMap.set(serializeId(meta.id), "ignored");
    }
  }

  const nextMap = new Map<string, ContextViewState>();
  for (const meta of next.active) {
    nextMap.set(serializeId(meta.id), "active");
  }
  for (const meta of next.standby) {
    nextMap.set(serializeId(meta.id), "standby");
  }
  for (const meta of next.ignored) {
    nextMap.set(serializeId(meta.id), "ignored");
  }

  const added: DataSourceId[] = [];
  const removed: DataSourceId[] = [];
  const stateChanged: Array<{
    id: DataSourceId;
    from: ContextViewState;
    to: ContextViewState;
  }> = [];

  for (const [id, state] of nextMap.entries()) {
    if (!prevMap.has(id)) {
      const [kind, ...locationParts] = id.split(":");
      added.push({
        kind: kind as DataSourceId["kind"],
        location: locationParts.join(":"),
      });
      continue;
    }
    const prevState = prevMap.get(id)!;
    if (prevState !== state) {
      const [kind, ...locationParts] = id.split(":");
      stateChanged.push({
        id: {
          kind: kind as DataSourceId["kind"],
          location: locationParts.join(":"),
        },
        from: prevState,
        to: state,
      });
    }
  }

  if (previous) {
    for (const id of prevMap.keys()) {
      if (!nextMap.has(id)) {
        const [kind, ...locationParts] = id.split(":");
        removed.push({
          kind: kind as DataSourceId["kind"],
          location: locationParts.join(":"),
        });
      }
    }
  }

  if (added.length === 0 && removed.length === 0 && stateChanged.length === 0) {
    return undefined;
  }

  return { added, removed, stateChanged };
}

export class ContextRegistry {
  private readonly contexts = new Map<string, Context>();
  private readonly sources = new Map<string, DataSourceMeta>();

  registerSource(metaInit: DataSourceInit): DataSourceMeta {
    const key = sourceKey(metaInit.id);
    if (this.sources.has(key)) {
      throw new Error(`data source already registered: ${key}`);
    }
    if (metaInit.owners.length === 0) {
      throw new Error("data source requires at least one owner");
    }
    const createdAt = metaInit.createdAt ?? isoNow();
    const updatedAt = metaInit.updatedAt ?? createdAt;
    const meta: DataSourceMeta = {
      id: metaInit.id,
      owners: metaInit.owners.map((owner) => ({ ...owner })),
      createdAt,
      updatedAt,
      discoverability: metaInit.discoverability ?? DEFAULT_DISCOVERABILITY,
      availability: metaInit.availability
        ? cloneAvailability(metaInit.availability)
        : cloneAvailability(DEFAULT_AVAILABILITY),
    };
    if (metaInit.title !== undefined) {
      meta.title = metaInit.title;
    }
    if (metaInit.tags) {
      meta.tags = [...metaInit.tags];
    }
    if (metaInit.contentHints) {
      meta.contentHints = { ...metaInit.contentHints };
    }
    this.sources.set(key, meta);
    return cloneMeta(meta);
  }

  updateSource(
    id: DataSourceId,
    patch: Partial<DataSourceInit>,
  ): DataSourceMeta {
    const key = sourceKey(id);
    const existing = this.sources.get(key);
    if (!existing) {
      throw new Error(`unknown data source: ${key}`);
    }
    const next = cloneMeta(existing);
    if (patch.owners) {
      next.owners = patch.owners.map((owner) => ({ ...owner }));
    }
    if (patch.title !== undefined) {
      next.title = patch.title;
    }
    if ("tags" in patch) {
      if (patch.tags) {
        next.tags = [...patch.tags];
      } else {
        delete next.tags;
      }
    }
    if ("contentHints" in patch) {
      if (patch.contentHints) {
        next.contentHints = { ...patch.contentHints };
      } else {
        delete next.contentHints;
      }
    }
    if (patch.discoverability) {
      next.discoverability = patch.discoverability;
    }
    if (patch.availability) {
      next.availability = cloneAvailability(patch.availability);
    }
    next.updatedAt = patch.updatedAt ?? isoNow();
    if (next.owners.length === 0) {
      throw new Error("data source requires at least one owner");
    }
    this.sources.set(key, next);
    return cloneMeta(next);
  }

  removeSource(id: DataSourceId): boolean {
    const key = sourceKey(id);
    const removed = this.sources.delete(key);
    if (removed) {
      const targetId = serializeId(id);
      for (const context of this.contexts.values()) {
        context.entries = context.entries.filter(
          (entry) => serializeId(entry.id) !== targetId,
        );
      }
    }
    return removed;
  }

  getSource(id: DataSourceId): DataSourceMeta | undefined {
    const existing = this.sources.get(sourceKey(id));
    return existing ? cloneMeta(existing) : undefined;
  }

  listSources(): DataSourceMeta[] {
    return [...this.sources.values()].map((meta) => cloneMeta(meta));
  }

  createContext(init: ContextInit): Context {
    if (!this.sources.size) {
      throw new Error(
        "context registry requires at least one data source before creating contexts",
      );
    }
    const ctxId = init.ctxId ?? randomUUID();
    if (this.contexts.has(ctxId)) {
      throw new Error(`context already exists: ${ctxId}`);
    }
    const createdAt = init.createdAt ?? isoNow();
    const updatedAt = init.updatedAt ?? createdAt;
    const entries = (init.entries ?? []).map((entry) => {
      const meta = this.sources.get(sourceKey(entry.id));
      if (!meta) {
        throw new Error(
          `context entry references unknown data source: ${serializeId(
            entry.id,
          )}`,
        );
      }
      return normalizeEntry(entry, meta);
    });
    const context: Context = {
      ctxId,
      name: init.name,
      owner: { ...init.owner },
      createdAt,
      updatedAt,
      entries,
    };
    if (init.rules) {
      context.rules = { ...init.rules };
    }
    if (init.privacy) {
      context.privacy = { ...init.privacy };
    }
    this.contexts.set(ctxId, context);
    return deepClone(context);
  }

  updateContext(
    ctxId: string,
    patch: Partial<Omit<Context, "ctxId" | "entries">> & {
      entries?: ContextEntry[];
    },
  ): Context {
    const context = this.contexts.get(ctxId);
    if (!context) {
      throw new Error(`unknown context: ${ctxId}`);
    }
    if (patch.entries) {
      context.entries = patch.entries.map((entry) => {
        const meta = this.sources.get(sourceKey(entry.id));
        if (!meta) {
          throw new Error(
            `context entry references unknown data source: ${serializeId(
              entry.id,
            )}`,
          );
        }
        return normalizeEntry(entry, meta);
      });
    }
    if (patch.name) {
      context.name = patch.name;
    }
    if (patch.owner) {
      context.owner = { ...patch.owner };
    }
    if (patch.rules) {
      context.rules = { ...patch.rules };
    }
    if (patch.privacy) {
      context.privacy = { ...patch.privacy };
    }
    context.updatedAt = isoNow();
    return deepClone(context);
  }

  addEntry(ctxId: string, entry: ContextEntry): ContextEntry {
    const context = this.contexts.get(ctxId);
    if (!context) {
      throw new Error(`unknown context: ${ctxId}`);
    }
    const key = serializeId(entry.id);
    if (context.entries.some((existing) => serializeId(existing.id) === key)) {
      throw new Error(`context entry already exists: ${key}`);
    }
    const meta = this.sources.get(sourceKey(entry.id));
    if (!meta) {
      throw new Error(`context entry references unknown data source: ${key}`);
    }
    const normalized = normalizeEntry(entry, meta);
    context.entries = [...context.entries, normalized];
    context.updatedAt = isoNow();
    return deepClone(normalized);
  }

  updateEntry(ctxId: string, entry: ContextEntry): ContextEntry {
    const context = this.contexts.get(ctxId);
    if (!context) {
      throw new Error(`unknown context: ${ctxId}`);
    }
    const idx = context.entries.findIndex(
      (existing) => serializeId(existing.id) === serializeId(entry.id),
    );
    if (idx === -1) {
      throw new Error(`context entry not found: ${serializeId(entry.id)}`);
    }
    const meta = this.sources.get(sourceKey(entry.id));
    if (!meta) {
      throw new Error(
        `context entry references unknown data source: ${serializeId(
          entry.id,
        )}`,
      );
    }
    const normalized = normalizeEntry(entry, meta);
    context.entries = [
      ...context.entries.slice(0, idx),
      normalized,
      ...context.entries.slice(idx + 1),
    ];
    context.updatedAt = isoNow();
    return deepClone(normalized);
  }

  removeEntry(ctxId: string, id: DataSourceId): boolean {
    const context = this.contexts.get(ctxId);
    if (!context) {
      throw new Error(`unknown context: ${ctxId}`);
    }
    const before = context.entries.length;
    context.entries = context.entries.filter(
      (entry) => serializeId(entry.id) !== serializeId(id),
    );
    if (context.entries.length !== before) {
      context.updatedAt = isoNow();
      return true;
    }
    return false;
  }

  setDiscoverability(
    id: DataSourceId,
    state: Discoverability,
    scope: "room" | "context",
    ctxId?: string,
  ): void {
    if (scope === "room") {
      const meta = this.sources.get(sourceKey(id));
      if (!meta) {
        throw new Error(`unknown data source: ${serializeId(id)}`);
      }
      if (
        !discoverabilityNarrower(meta.discoverability, state) &&
        meta.discoverability !== state
      ) {
        throw new Error("room discoverability cannot widen visibility");
      }
      meta.discoverability = state;
      meta.updatedAt = isoNow();
      return;
    }
    if (!ctxId) {
      throw new Error("context discoverability override requires ctxId");
    }
    const context = this.contexts.get(ctxId);
    if (!context) {
      throw new Error(`unknown context: ${ctxId}`);
    }
    const entry = context.entries.find(
      (value) => serializeId(value.id) === serializeId(id),
    );
    if (!entry) {
      throw new Error(
        `context entry not found for override: ${serializeId(id)}`,
      );
    }
    const meta = this.sources.get(sourceKey(id));
    if (!meta) {
      throw new Error(`unknown data source: ${serializeId(id)}`);
    }
    if (!discoverabilityNarrower(meta.discoverability, state)) {
      throw new Error("context override cannot widen discoverability");
    }
    entry.overrides = { ...(entry.overrides ?? {}), discoverability: state };
    context.updatedAt = isoNow();
  }

  applyContext(
    ctxId: string,
    options: ContextApplyOptions,
  ): ContextApplication {
    const context = this.contexts.get(ctxId);
    if (!context) {
      throw new Error(`unknown context: ${ctxId}`);
    }
    const participants = options.participants;
    if (participants.length === 0) {
      throw new Error("context application requires at least one participant");
    }
    const envNow = options.now ?? new Date();
    const contextTags = options.contextTags ?? context.rules?.caps ?? [];
    const roomMembers = participants.map((participant) => participant.id);
    const availabilityEnv = { now: envNow, contextTags, roomMembers };

    const approvals: ApprovalRequest[] = [];
    const denied: DeniedDataSource[] = [];
    const active: DataSourceMeta[] = [];
    const standby: DataSourceMeta[] = [];
    const ignored: DataSourceMeta[] = [];
    const grants: LlmView["grants"] = [];

    for (const entry of context.entries) {
      const meta = this.sources.get(sourceKey(entry.id));
      if (!meta) {
        denied.push({ id: entry.id, reason: "data source metadata missing" });
        continue;
      }
      const effectiveMeta = applyAvailabilityOverrides(meta, entry);
      const availability = evaluateAvailability(
        effectiveMeta.availability,
        effectiveMeta,
        context,
        participants,
        availabilityEnv,
      );
      if (availability.status === "denied") {
        denied.push({
          id: entry.id,
          reason: availability.reason ?? "availability denied",
        });
        continue;
      }
      if (availability.status === "pending") {
        approvals.push(...availability.approvals);
        continue;
      }
      // status granted
      if (availability.approvals.length) {
        approvals.push(...availability.approvals);
      }
      switch (entry.state) {
        case "ignored":
          ignored.push(cloneMeta(effectiveMeta));
          break;
        case "inactive":
          if (options.includeInactive) {
            standby.push(cloneMeta(effectiveMeta));
          }
          break;
        case "standby":
          standby.push(cloneMeta(effectiveMeta));
          break;
        case "active":
        case "pinned":
          active.push(cloneMeta(effectiveMeta));
          break;
        default:
          ignored.push(cloneMeta(effectiveMeta));
          break;
      }
      grants.push({
        id: entry.id,
        permissions: normalizePermissions(entry.permissions),
      });
    }

    // implicit include rules → standby
    if (context.rules?.include?.length) {
      const alreadyKnown = new Set<string>([
        ...active.map((meta) => serializeId(meta.id)),
        ...standby.map((meta) => serializeId(meta.id)),
        ...ignored.map((meta) => serializeId(meta.id)),
      ]);
      for (const meta of this.sources.values()) {
        const metaId = serializeId(meta.id);
        if (alreadyKnown.has(metaId)) {
          continue;
        }
        const metaTags = meta.tags ?? [];
        const includeMatch = context.rules.include.some((rule) =>
          evaluateRule(rule, {
            now: envNow,
            contextName: context.name,
            contextTags,
            roomMembers,
            metaTags,
          }),
        );
        if (includeMatch) {
          const availability = evaluateAvailability(
            meta.availability,
            meta,
            context,
            participants,
            availabilityEnv,
          );
          if (availability.status === "granted") {
            standby.push(cloneMeta(meta));
          } else if (availability.status === "pending") {
            approvals.push(...availability.approvals);
          }
        }
      }
    }

    const view: LlmView = {
      ctxId,
      active,
      standby,
      ignored,
      grants,
      parts: computeParts(active),
    };
    const diff = computeDiff(options.previousView, view);

    const application: ContextApplication = { view, approvals, denied };
    if (diff) {
      application.diff = diff;
    }
    return application;
  }
}
