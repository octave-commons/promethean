import test from "ava";
import { ContextRegistry } from "../registry.js";
import type {
  ContextApplyOptions,
  ContextInit,
  ContextParticipant,
  DataSourceInit,
} from "../types.js";

test("applyContext returns active view for pinned entries", (t) => {
  const registry = new ContextRegistry();
  const source: DataSourceInit = {
    id: { kind: "enso-asset", location: "enso://asset/cid-alpha" },
    owners: [{ userId: "user-1" }],
    discoverability: "visible",
    availability: { mode: "private" },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    contentHints: { mime: "text/markdown" },
  };
  const meta = registry.registerSource(source);

  const contextInit: ContextInit = {
    name: "Sprint Review",
    owner: { userId: "user-1" },
    entries: [
      {
        id: meta.id,
        state: "pinned",
        permissions: { readable: true, viewable: true },
      },
    ],
  };

  const context = registry.createContext(contextInit);
  const participants: ContextParticipant[] = [{ id: "user-1" }];
  const options: ContextApplyOptions = { participants };

  const applied = registry.applyContext(context.ctxId, options);

  t.is(applied.view.active.length, 1);
  const [activeSource] = applied.view.active;
  t.truthy(activeSource);
  t.is(activeSource?.id.location, meta.id.location);
  t.true(applied.view.parts.length > 0);
  const [part] = applied.view.parts;
  t.is(part?.purpose, "text");
  t.deepEqual(applied.approvals, []);
  t.deepEqual(applied.denied, []);
});

test("conditional availability yields approval requests", (t) => {
  const registry = new ContextRegistry();
  registry.registerSource({
    id: { kind: "fs", location: "file:///secret.md" },
    owners: [{ userId: "user-1" }],
    availability: {
      mode: "conditional",
      conditions: [
        {
          kind: "soft",
          prompt: "Does the project code name match?",
          requireApproval: true,
        },
      ],
    },
    discoverability: "hidden",
  });

  const context = registry.createContext({
    name: "Secret Project",
    owner: { userId: "user-1" },
    entries: [
      {
        id: { kind: "fs", location: "file:///secret.md" },
        state: "pinned",
        permissions: { readable: true },
      },
    ],
  });

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
    contextTags: ["project:secret"],
  });

  t.is(applied.view.active.length, 0, "resource withheld pending approval");
  t.is(applied.approvals.length, 1);
  const [approval] = applied.approvals;
  t.is(approval?.reason, "soft-condition");
});

test("include rules surface standby resources", (t) => {
  const registry = new ContextRegistry();
  const owners = [{ userId: "user-1" }];
  const primary = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/primary" },
    owners,
    discoverability: "visible",
    availability: { mode: "private" },
  });
  registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/derived" },
    owners,
    discoverability: "discoverable",
    availability: { mode: "private" },
    tags: ["auto-include"],
  });

  const context = registry.createContext({
    name: "Review",
    owner: { userId: "user-1" },
    entries: [
      { id: primary.id, state: "active", permissions: { readable: true } },
    ],
    rules: {
      include: [{ op: "tagIncludes", tag: "auto-include" }],
    },
  });

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });

  t.is(applied.view.active.length, 1, "primary remains active");
  t.is(
    applied.view.standby.length,
    1,
    "auto-included source promoted to standby",
  );
  const [standbySource] = applied.view.standby;
  t.is(standbySource?.id.location, "enso://asset/derived");
});

test("discoverability override must narrow visibility", (t) => {
  const registry = new ContextRegistry();
  const source = registry.registerSource({
    id: { kind: "fs", location: "file:///notes.md" },
    owners: [{ userId: "user-1" }],
    discoverability: "hidden",
    availability: { mode: "private" },
  });

  t.throws(
    () =>
      registry.createContext({
        name: "Notebook",
        owner: { userId: "user-1" },
        entries: [
          {
            id: source.id,
            state: "pinned",
            overrides: { discoverability: "visible" },
          },
        ],
      }),
    { message: /discoverability override must not widen/ },
  );
});

test("updateSource clones metadata and supports removal of optional fields", (t) => {
  const registry = new ContextRegistry();
  const meta = registry.registerSource({
    id: { kind: "api", location: "https://example.test/resource" },
    owners: [{ userId: "user-1" }],
    tags: ["alpha"],
    contentHints: { mime: "application/json" },
    discoverability: "hidden",
    availability: { mode: "public" },
  });

  const renamed = registry.updateSource(meta.id, {
    title: "renamed",
  });
  t.is(renamed.title, "renamed");

  const removePatch = {
    tags: undefined,
    contentHints: undefined,
  } as unknown as Partial<DataSourceInit>;
  const removed = registry.updateSource(meta.id, removePatch);

  t.is(removed.tags, undefined);
  t.is(removed.contentHints, undefined);

  const fetched = registry.getSource(meta.id);
  t.truthy(fetched);
  t.is(fetched?.title, "renamed");
  t.is(fetched?.tags, undefined);

  const listed = registry.listSources();
  t.is(listed.length, 1);
  const [listedMeta] = listed;
  t.truthy(listedMeta);
  if (listedMeta) {
    listedMeta.title = "mutated";
  }
  t.is(
    registry.getSource(meta.id)?.title,
    "renamed",
    "registry keeps defensive copies",
  );
});

test("setDiscoverability updates room metadata and context overrides", (t) => {
  const registry = new ContextRegistry();
  const meta = registry.registerSource({
    id: { kind: "fs", location: "file:///shared.md" },
    owners: [{ userId: "user-1" }],
    discoverability: "visible",
    availability: { mode: "private" },
  });

  registry.setDiscoverability(meta.id, "hidden", "room");
  t.is(registry.getSource(meta.id)?.discoverability, "hidden");

  const context = registry.createContext({
    name: "Docs",
    owner: { userId: "user-1" },
    entries: [{ id: meta.id, state: "pinned" }],
  });

  t.notThrows(() =>
    registry.setDiscoverability(meta.id, "hidden", "context", context.ctxId),
  );

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });
  t.is(applied.view.active.length, 1);
});

test("removeSource prunes context entries", (t) => {
  const registry = new ContextRegistry();
  const primary = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/A" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "private" },
    discoverability: "visible",
  });
  const secondary = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/B" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "private" },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Pair",
    owner: { userId: "user-1" },
    entries: [
      { id: primary.id, state: "pinned" },
      { id: secondary.id, state: "pinned" },
    ],
  });

  registry.removeSource(primary.id);

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });

  t.is(applied.view.active.length, 1);
  t.is(applied.view.active[0]?.id.location, secondary.id.location);
});

test("applyContext denies private sources for non-owners", (t) => {
  const registry = new ContextRegistry();
  const meta = registry.registerSource({
    id: { kind: "fs", location: "file:///secret.txt" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "private" },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Secret",
    owner: { userId: "user-1" },
    entries: [
      { id: meta.id, state: "pinned", permissions: { readable: true } },
    ],
  });

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-2" }],
  });

  t.is(applied.view.active.length, 0);
  t.is(applied.denied.length, 1);
  t.is(applied.denied[0]?.id.location, meta.id.location);
  t.regex(applied.denied[0]?.reason ?? "", /owner/);
});

test("hard conditions requiring approval remain pending", (t) => {
  const registry = new ContextRegistry();
  const meta = registry.registerSource({
    id: { kind: "fs", location: "file:///policy.md" },
    owners: [{ userId: "user-1" }],
    availability: {
      mode: "conditional",
      conditions: [
        {
          kind: "hard",
          rule: { op: "contextNameMatches", regex: "^Policy" },
          requireApproval: true,
        },
      ],
    },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Policy Review",
    owner: { userId: "user-1" },
    entries: [
      { id: meta.id, state: "pinned", permissions: { readable: true } },
    ],
  });

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });

  t.is(applied.view.active.length, 0);
  t.is(applied.approvals.length, 1);
  t.is(applied.approvals[0]?.reason, "hard-condition-approval");
});

test("includeInactive option surfaces inactive entries as standby", (t) => {
  const registry = new ContextRegistry();
  const meta = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/inactive" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "public" },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Archive",
    owner: { userId: "user-1" },
    entries: [
      { id: meta.id, state: "inactive", permissions: { readable: true } },
    ],
  });

  const defaultApplied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });
  t.is(defaultApplied.view.standby.length, 0);

  const includeInactiveApplied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
    includeInactive: true,
  });
  t.is(includeInactiveApplied.view.standby.length, 1);
  t.is(includeInactiveApplied.view.standby[0]?.id.location, meta.id.location);
});

test("applyContext diff reports state changes", (t) => {
  const registry = new ContextRegistry();
  const meta = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/diff" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "public" },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Diff",
    owner: { userId: "user-1" },
    entries: [
      { id: meta.id, state: "active", permissions: { readable: true } },
    ],
  });

  const first = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });

  registry.updateEntry(context.ctxId, {
    id: meta.id,
    state: "ignored",
    permissions: { readable: true },
  });

  const second = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
    previousView: first.view,
  });

  t.truthy(second.diff);
  t.deepEqual(second.diff?.added, []);
  t.deepEqual(second.diff?.removed, []);
  t.deepEqual(second.diff?.stateChanged, [
    {
      id: meta.id,
      from: "active",
      to: "ignored",
    },
  ]);
});

test("createContext requires registered sources", (t) => {
  const registry = new ContextRegistry();

  t.throws(() =>
    registry.createContext({
      name: "NoSources",
      owner: { userId: "user-1" },
      entries: [],
    }),
  );
});

test("getSource returns undefined for unknown id", (t) => {
  const registry = new ContextRegistry();
  t.is(
    registry.getSource({ kind: "fs", location: "file:///missing" }),
    undefined,
  );
});

test("shared availability restricts membership", (t) => {
  const registry = new ContextRegistry();
  const shared = registry.registerSource({
    id: { kind: "db", location: "db://shared/table" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "shared", members: ["user-1", "group-analytics"] },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Shared",
    owner: { userId: "user-1" },
    entries: [
      { id: shared.id, state: "pinned", permissions: { readable: true } },
    ],
  });

  const allowed = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });
  t.is(allowed.view.active.length, 1);

  const groupAllowed = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-3", groups: ["group-analytics"] }],
  });
  t.is(groupAllowed.view.active.length, 1);

  const denied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-2" }],
  });
  t.is(denied.view.active.length, 0);
  t.is(denied.denied.length, 1);
});

test("include rules propagate pending approvals for conditional matches", (t) => {
  const registry = new ContextRegistry();
  const base = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/base" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "public" },
    discoverability: "visible",
  });
  registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/conditional" },
    owners: [{ userId: "user-1" }],
    tags: ["auto-include"],
    availability: {
      mode: "conditional",
      conditions: [
        {
          kind: "soft",
          prompt: "Allow auto include?",
          requireApproval: true,
        },
      ],
    },
    discoverability: "discoverable",
  });

  const context = registry.createContext({
    name: "Pending",
    owner: { userId: "user-1" },
    entries: [
      { id: base.id, state: "active", permissions: { readable: true } },
    ],
    rules: { include: [{ op: "tagIncludes", tag: "auto-include" }] },
  });

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });

  t.is(applied.view.standby.length, 0);
  t.true(applied.approvals.length > 0);
});

test("availability override must narrow scope", (t) => {
  const registry = new ContextRegistry();
  const meta = registry.registerSource({
    id: { kind: "fs", location: "file:///widen.txt" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "private" },
    discoverability: "visible",
  });

  t.throws(
    () =>
      registry.createContext({
        name: "InvalidOverride",
        owner: { userId: "user-1" },
        entries: [
          {
            id: meta.id,
            state: "pinned",
            overrides: { availability: { mode: "public" } },
          },
        ],
      }),
    { message: /availability override must not widen scope/ },
  );
});

test("availability override narrows shared scope to private or conditional", (t) => {
  const registry = new ContextRegistry();
  const meta = registry.registerSource({
    id: { kind: "db", location: "db://shared/limited" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "shared", members: ["user-1", "user-2"] },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Override",
    owner: { userId: "user-1" },
    entries: [
      {
        id: meta.id,
        state: "pinned",
        permissions: { readable: true },
        overrides: { availability: { mode: "private" } },
      },
      {
        id: meta.id,
        state: "standby",
        overrides: {
          availability: {
            mode: "shared",
            members: ["user-1"],
          },
        },
        permissions: { readable: true },
      },
      {
        id: meta.id,
        state: "standby",
        overrides: { availability: { mode: "conditional", conditions: [] } },
        permissions: { readable: true },
      },
    ],
  });

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });

  t.true(applied.view.active.length >= 1);

  t.throws(() =>
    registry.createContext({
      name: "InvalidOverride",
      owner: { userId: "user-1" },
      entries: [
        {
          id: meta.id,
          state: "pinned",
          overrides: {
            availability: { mode: "shared", members: ["user-1", "user-3"] },
          },
        },
      ],
    }),
  );
});

test("context mutation helpers manage entries", (t) => {
  const registry = new ContextRegistry();
  const primary = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/mutableA" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "public" },
    discoverability: "visible",
  });
  const secondary = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/mutableB" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "public" },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Mutable",
    owner: { userId: "user-1" },
    entries: [
      { id: primary.id, state: "active", permissions: { readable: true } },
    ],
  });

  const added = registry.addEntry(context.ctxId, {
    id: secondary.id,
    state: "pinned",
    permissions: { readable: true },
  });
  t.is(added.state, "pinned");

  const renamed = registry.updateContext(context.ctxId, {
    name: "Mutable-Updated",
  });
  t.is(renamed.name, "Mutable-Updated");

  registry.updateEntry(context.ctxId, {
    id: secondary.id,
    state: "ignored",
    permissions: { readable: true },
    overrides: { availability: { mode: "private" } },
  });

  const afterUpdate = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });
  t.is(afterUpdate.view.ignored.length, 1);

  t.false(
    registry.removeEntry(context.ctxId, {
      kind: "enso-asset",
      location: "enso://asset/missing",
    }),
  );
  t.true(registry.removeEntry(context.ctxId, secondary.id));
  const afterRemove = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });
  t.is(afterRemove.view.active.length, 1);

  t.throws(() =>
    registry.addEntry(context.ctxId, {
      id: primary.id,
      state: "active",
    }),
  );

  const updatedContext = registry.updateContext(context.ctxId, {
    rules: { caps: ["can.tool.demo"] },
    privacy: { inheritRoom: false },
  });
  t.deepEqual(updatedContext.rules?.caps, ["can.tool.demo"]);
  t.false(updatedContext.privacy?.inheritRoom ?? true);
});

test.serial(
  "deepClone fallback is used when structuredClone is unavailable",
  (t) => {
    t.plan(2);
    const registry = new ContextRegistry();
    const meta = registry.registerSource({
      id: { kind: "fs", location: "file:///clone.txt" },
      owners: [{ userId: "user-1" }],
      availability: { mode: "public" },
      discoverability: "visible",
    });

    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      "structuredClone",
    );
    Object.defineProperty(globalThis, "structuredClone", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    try {
      const context = registry.createContext({
        name: "CloneFallback",
        owner: { userId: "user-1" },
        entries: [
          { id: meta.id, state: "pinned", permissions: { readable: true } },
        ],
      });
      context.name = "Mutated";

      const reapplied = registry.applyContext(context.ctxId, {
        participants: [{ id: "user-1" }],
      });
      t.is(reapplied.view.active.length, 1);
      t.is(
        registry.applyContext(context.ctxId, {
          participants: [{ id: "user-1" }],
        }).view.ctxId,
        context.ctxId,
      );
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, "structuredClone", descriptor);
      } else {
        // @ts-ignore intentional cleanup
        delete (globalThis as Record<string, unknown>).structuredClone;
      }
    }
  },
);

test("computeParts infers image purpose", (t) => {
  const registry = new ContextRegistry();
  const image = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/image" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "public" },
    discoverability: "visible",
    contentHints: { mime: "image/png" },
  });
  const other = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/other" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "public" },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Images",
    owner: { userId: "user-1" },
    entries: [
      { id: image.id, state: "pinned", permissions: { readable: true } },
      { id: other.id, state: "active", permissions: { readable: true } },
    ],
  });

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });

  const purposes = applied.view.parts.map((part) => part.purpose);
  t.true(purposes.includes("image"));
  t.true(purposes.includes("other"));
});

test("evaluateRule covers membership and time windows", (t) => {
  const registry = new ContextRegistry();
  const now = new Date();
  const start = new Date(now.getTime() - 1_000).toISOString();
  const end = new Date(now.getTime() + 1_000).toISOString();

  const included = registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/rule" },
    owners: [{ userId: "user-1" }],
    availability: {
      mode: "conditional",
      conditions: [
        { kind: "hard", rule: { op: "roomHasMember", id: "user-1" } },
        { kind: "hard", rule: { op: "timeBetween", start, end } },
        { kind: "hard", rule: { op: "contextNameMatches", regex: "^Rule" } },
      ],
    },
    discoverability: "discoverable",
    tags: ["linked"],
  });

  registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/baseRule" },
    owners: [{ userId: "user-1" }],
    availability: { mode: "public" },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "RuleTest",
    owner: { userId: "user-1" },
    entries: [
      { id: included.id, state: "standby", permissions: { readable: true } },
    ],
    rules: {
      include: [
        { op: "roomHasMember", id: "user-1" },
        { op: "tagIncludes", tag: "linked" },
      ],
      exclude: [{ op: "contextNameMatches", regex: "Impossible" }],
    },
  });

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });

  t.true(applied.view.standby.length >= 1);
});

test("conditional availability grants without approvals when conditions satisfied", (t) => {
  const registry = new ContextRegistry();
  const now = new Date();
  const start = new Date(now.getTime() - 2_000).toISOString();
  const end = new Date(now.getTime() + 2_000).toISOString();

  const meta = registry.registerSource({
    id: { kind: "api", location: "https://api.test/no-approval" },
    owners: [{ userId: "user-1" }],
    availability: {
      mode: "conditional",
      conditions: [{ kind: "hard", rule: { op: "timeBetween", start, end } }],
    },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Grant",
    owner: { userId: "user-1" },
    entries: [
      { id: meta.id, state: "pinned", permissions: { readable: true } },
    ],
  });

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });

  t.is(applied.view.active.length, 1);
  t.deepEqual(applied.approvals, []);

  t.throws(() =>
    registry.applyContext(context.ctxId, {
      participants: [],
    }),
  );

  const failure = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-2" }],
    now: new Date(now.getTime() + 5_000),
  });
  t.is(failure.view.active.length, 0);
});

test("evaluateRule default branch handles invalid regex and unmatched tags", (t) => {
  const registry = new ContextRegistry();
  const meta = registry.registerSource({
    id: { kind: "fs", location: "file:///invalid-regex.txt" },
    owners: [{ userId: "user-1" }],
    availability: {
      mode: "conditional",
      conditions: [
        { kind: "hard", rule: { op: "contextNameMatches", regex: "[" } },
      ],
    },
    discoverability: "visible",
  });

  const context = registry.createContext({
    name: "Invalid",
    owner: { userId: "user-1" },
    entries: [
      { id: meta.id, state: "pinned", permissions: { readable: true } },
    ],
    rules: { include: [{ op: "tagIncludes", tag: "missing" }] },
  });

  const applied = registry.applyContext(context.ctxId, {
    participants: [{ id: "user-1" }],
  });

  t.is(applied.view.active.length, 0);
  t.true(applied.denied.length > 0);
});
