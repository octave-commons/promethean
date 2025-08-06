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
  defineApp(
    "stt",
    "pipenv",
    ["run", "uvicorn", "--host", "0.0.0.0", "--port", "5002", "app:app"],
    {
      cwd: __dirname,
      watch: [__dirname],
      env: {
        FLASK_APP: "app.py",
        FLASK_ENV: "production",
      },
    },
  ),
];

if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
  const deps = require("./ecosystem.dependencies.js");
  module.exports = { apps: [...apps, ...deps.apps] };
} else {
  module.exports = { apps };
}
