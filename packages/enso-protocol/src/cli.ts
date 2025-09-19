#!/usr/bin/env node
import { EnsoClient } from "@promethean/enso-client";
import { createReadStream } from "fs";
import { argv } from "node:process";

const url = process.env.ENSO_URL ?? "ws://localhost:7747";
const token = process.env.ENSO_TOKEN ?? "dev";
const [cmd, arg] = argv.slice(2);

(async () => {
  const enso = new EnsoClient(url, token);
  await enso.connect({
    proto: "ENSO-1",
    caps: ["cache.read", "cache.write", "can.asset.put"],
    privacy: { profile: "pseudonymous" },
  });

  enso.on("event:content.message", (e) =>
    console.log("[message]", JSON.stringify(e.payload)),
  );
  enso.on("event:asset.derived", (e) => console.log("[derived]", e.payload));

  if (cmd === "say") {
    await enso.post({
      role: "human",
      parts: [{ kind: "text", text: arg ?? "hello enso" }],
    });
  } else if (cmd === "attach") {
    const path = arg!;
    const mime = "application/pdf"; // TODO: sniff
    const { uri } = await enso.assets.putFile(path, mime);
    await enso.post({
      role: "human",
      parts: [
        { kind: "text", text: `Please summarize ${path}` },
        { kind: "attachment", uri, mime, bytes: 0 },
      ],
    });
  } else if (cmd === "context") {
    // tiny context demo: pin two example sources
    // enso.contexts.create("Sprint Review"); enso.contexts.pin(...); enso.contexts.apply();
  } else {
    console.log(`Usage:
  enso say "hello"
  enso attach ./docs/enso.pdf
  enso context`);
  }
})();
