const path = require("path");
const { defineApp } = require(
  path.join(__dirname, "../../../dev/pm2Helpers.js"),
);
const root = path.join(__dirname, "../../..");

if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
  defineApp.PYTHONPATH = root;
  defineApp.HEARTBEAT_PORT = 5005;
}

const apps = [
  defineApp("eidolon-field", ".", [], {
    cwd: __dirname,
    watch: [__dirname],
  }),
];

if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
  const deps = require("./ecosystem.dependencies.js");
  module.exports = { apps: [...apps, ...deps.apps] };
} else {
  module.exports = { apps };
}
