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
  t.is(applied.view.standby.length, 1, "auto-included source promoted to standby");
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
