import { MongoClient } from "mongodb";
const mongo = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017",
);
const family = `${process.env.AGENT_NAME}_discord_messages`;
const version = process.env.EMBED_VERSION!;
(async () => {
  await mongo.connect();
  const db = mongo.db("database");
  const c = db.collection(family);
  const n = await c.countDocuments({
    [`embedding_status.${version}`]: { $ne: "done" },
    content: { $ne: null },
  });
  console.log("Pending:", n);
  process.exit(0);
})();
