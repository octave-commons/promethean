let brokerModulePromise;

async function loadBroker() {
  if (!brokerModulePromise) {
    const previous = process.env.NODE_ENV;
    if (previous !== "test") {
      process.env.NODE_ENV = "test";
    }
    brokerModulePromise = import("../../packages/broker/index.js").finally(
      () => {
        if (previous === undefined) {
          delete process.env.NODE_ENV;
        } else if (previous !== "test") {
          process.env.NODE_ENV = previous;
        }
      },
    );
  }
  return brokerModulePromise;
}

export async function start(...args) {
  const mod = await loadBroker();
  return mod.start(...args);
}

export async function stop(...args) {
  const mod = await loadBroker();
  return mod.stop(...args);
}
