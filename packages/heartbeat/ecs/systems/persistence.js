export function createPersistenceSystem() {
  return {
    name: "heartbeat.persistenceInit",
    stage: "startup",
    writes: ["persistence"],
    async run({ resources }) {
      const persistence = resources.get("persistence");
      if (persistence.collection) return;
      if (!persistence.initPromise) {
        persistence.initPromise = (async () => {
          try {
            persistence.client = await persistence.getMongoClient();
            persistence.collection = persistence.client
              .db(persistence.dbName)
              .collection(persistence.collectionName);
          } catch (err) {
            console.error("heartbeat persistence init failed", err);
            persistence.client = null;
            persistence.collection = null;
          }
        })();
      }
      try {
        await persistence.initPromise;
      } catch (err) {
        console.error("heartbeat persistence init promise failed", err);
        persistence.initPromise = null;
      }
    },
  };
}

export async function closePersistence(persistence) {
  try {
    await persistence.client?.close();
  } catch (err) {
    console.error("heartbeat mongo close failed", err);
  }
}
