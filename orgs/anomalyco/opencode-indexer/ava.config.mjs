import base from "../../config/ava.config.mjs";

export default {
  ...base,
  nodeArguments: [
    "--import=tsx",
    "--no-warnings",
  ],
};
