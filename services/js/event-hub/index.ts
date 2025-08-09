import { MongoClient } from "mongodb";
import {
  MongoEventStore,
  MongoCursorStore,
  MongoEventBus,
} from "../../shared/js/prom-lib/event/mongo";
import { startWSGateway } from "../../shared/js/prom-lib/ws/server";
import { startOpsDashboard } from "../../shared/js/prom-lib/ops/dashboard";
import { MongoOutbox } from "../../shared/js/prom-lib/outbox/mongo";
import { runOutboxDrainer } from "../../shared/js/prom-lib/outbox/drainer";
import { verifyJWT } from "../../shared/js/prom-lib/auth/jwt";
import { scopesToPolicy } from "../../shared/js/prom-lib/acl/scopes";

async function main() {
  const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/prom";
  const client = await MongoClient.connect(mongoUrl);
  const db = client.db();

  await MongoEventStore.ensureIndexes(db);
  await MongoOutbox.ensureIndexes(db);

  const bus = new MongoEventBus(
    new MongoEventStore(db),
    new MongoCursorStore(db),
  );

  // WS with JWT
  const jwksUrl = process.env.JWT_JWKS_URL; // or JWT_SECRET
  startWSGateway(bus, Number(process.env.WS_PORT ?? 8090), {
    auth: async (token) => {
      if (!token) return { ok: false, code: "no_token", msg: "missing" };
      try {
        const claims = await verifyJWT(token, {
          jwksUrl,
          secret: process.env.JWT_SECRET,
          audience: process.env.JWT_AUD,
          issuer: process.env.JWT_ISS,
        });
        const policy =
          claims.policy ??
          scopesToPolicy(claims.scopes ?? ["publish:**", "subscribe:**"]);
        return { ok: true, policy };
      } catch (e: any) {
        return { ok: false, code: "jwt_invalid", msg: e.message ?? "invalid" };
      }
    },
    ackTimeoutMs: 30_000,
  });

  // Ops dashboard
  startOpsDashboard(db, { port: Number(process.env.OPS_PORT ?? 8082) });

  // Outbox drainer
  const outbox = new MongoOutbox(db);
  runOutboxDrainer(outbox, bus);

  // Done.
  console.log("[event-hub] up");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
