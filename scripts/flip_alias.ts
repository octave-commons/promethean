import { MongoClient } from "mongodb";

const mongo = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017",
);
const family = `${process.env.AGENT_NAME}_discord_messages`;
const target = process.argv[2];

(async () => {
  await mongo.connect();
  const db = mongo.db("database");
  await db
    .collection("collection_aliases")
    .updateOne({ _id: family }, { $set: { target } });
  console.log("Alias flipped:", family, "→", target);
  process.exit(0);
})();
