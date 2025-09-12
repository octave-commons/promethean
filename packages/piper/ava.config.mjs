import base from "../../config/ava.config.mjs";

export default {
  ...base,
  // Disable worker threads for CI stability.
  workerThreads: false,
  // serial: true,
};
