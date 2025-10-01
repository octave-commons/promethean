import test from "ava";
import { ContextRegistry } from "../registry.js";
import type {
  ContextInit,
  ContextParticipant,
  DataSourceInit,
} from "../types.js";

const OWNER: ContextParticipant = { id: "user-1" };
const ANALYTICS_MEMBER: ContextParticipant = {
  id: "analyst",
  groups: ["group.analytics"],
};
const GUEST: ContextParticipant = { id: "guest" };

test("e2e shared workspace session", (t) => {
  const registry = new ContextRegistry();

  // 1. Owner registers the primary shared data source
  const timelineSource: DataSourceInit = {
    id: { kind: "db", location: "db://team/timeline" },
    owners: [{ userId: OWNER.id }],
    discoverability: "visible",
    availability: { mode: "shared", members: [OWNER.id, ANALYTICS_MEMBER.id] },
    title: "Team Timeline",
  };
  registry.registerSource(timelineSource);

  // 2. Owner registers a private draft document
  const draftSource: DataSourceInit = {
    id: { kind: "fs", location: "file:///drafts/strategy.md" },
    owners: [{ userId: OWNER.id }],
    discoverability: "hidden",
    availability: { mode: "private" },
    contentHints: { mime: "text/markdown" },
  };
  registry.registerSource(draftSource);

  // 3. Create a collaboration context with both sources
  const ctx = registry.createContext({
    name: "2025 Strategy",
    owner: { userId: OWNER.id },
    entries: [
      {
        id: timelineSource.id,
        state: "active",
        permissions: { readable: true, viewable: true },
      },
      {
        id: draftSource.id,
        state: "pinned",
        permissions: { readable: true, changeable: true },
        overrides: { discoverability: "hidden" },
      },
    ],
    rules: {
      include: [{ op: "tagIncludes", tag: "auto" }],
    },
  } satisfies ContextInit);

  // 4. Owner applies context: everything available
  const ownerView = registry.applyContext(ctx.ctxId, {
    participants: [OWNER],
    contextTags: ["auto"],
  });
  t.is(ownerView.view.active.length, 2);
  t.is(ownerView.view.standby.length, 0);
  t.deepEqual(ownerView.denied, []);
  t.deepEqual(ownerView.approvals, []);

  // 5. Analytics member joins: sees shared data but not private draft
  const analyticsView = registry.applyContext(ctx.ctxId, {
    participants: [ANALYTICS_MEMBER],
    contextTags: ["auto"],
  });
  t.is(analyticsView.view.active.length, 1);
  t.is(analyticsView.view.active[0]?.id.location, timelineSource.id.location);
  t.is(analyticsView.denied.length, 1);
  t.regex(analyticsView.denied[0]?.reason ?? "", /owner/);

  // 6. Guest requests access: denied, draft explicitly blocked
  const guestView = registry.applyContext(ctx.ctxId, {
    participants: [GUEST],
  });
  t.is(guestView.view.active.length, 0);
  t.is(guestView.denied.length, 2);

  // 7. Owner shares draft temporarily by narrowing override
  const analyticsUpdated = registry.applyContext(ctx.ctxId, {
    participants: [ANALYTICS_MEMBER],
  });
  t.is(analyticsUpdated.view.active.length, 1);
  t.is(analyticsUpdated.approvals.length, 0);

  // 8. Guest requests explicit approval via conditional rule
  registry.updateSource(draftSource.id, {
    availability: {
      mode: "conditional",
      conditions: [
        {
          kind: "soft",
          prompt: "Allow guest to view draft?",
          requireApproval: true,
        },
      ],
    },
  });

  const guestApproval = registry.applyContext(ctx.ctxId, {
    participants: [GUEST],
  });
  t.is(guestApproval.approvals.length, 1);
  t.is(guestApproval.view.active.length, 0);
});
