const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
  path: __dirname + "/.tokens",
});
const python_env = {
  PYTHONPATH: "../../",
  PYTHONUNBUFFERED: 1,
  PYTHONUTF8: 1,
};
const AGENT_NAME = "Duck";
const { defineApp } = require("../../dev/pm2Helpers");

const discord_env = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DISCORD_CLIENT_USER_ID: "449279570445729793",
  DEFAULT_CHANNEL: "450688080542695436",
  DEFAULT_CHANNEL_NAME: "duck-bots",
  DISCORD_CLIENT_USER_NAME: AGENT_NAME,
  AUTHOR_USER_NAME: "Error",
  AGENT_NAME,
};
// we have a mongodb instance running seperately from this file that the services depend on.
// we'll figure out what to do about that in the future.

// an instruction to future users?
// a container?

// I moved this out of containers because I was using the NPU for some of these services.
// and docker is just not the place to run that.
// either way, you use docker, you use a mongo db instance
// someone needs to download a program as a dependency.

module.exports = {
  apps: [
    defineApp(
      "duck_discord_indexer",
      "pipenv",
      ["run", "python", "-m", "main"],
      {
        cwd: path.join(__dirname, "../../services/py/discord_indexer/"),
        env_file: ".env",
        env: {
          ...python_env,
          ...discord_env,
        },
      },
    ),
    defineApp("duck_cephalon", ".", [], {
      cwd: path.join(__dirname, "../../services/ts/cephalon"),
      env: {
        ...discord_env,
      },
    }),
    defineApp("duck_embedder", ".", [], {
      cwd: path.join(__dirname, "../../services/ts/discord-embedder"),
      env: {
        ...discord_env,
      },
    }),
    defineApp(
      "duck_attachment_indexer",
      "pipenv",
      ["run", "python", "-m", "main"],
      {
        cwd: "./services/py/discord_attachment_indexer",
        watch: ["./services/py/tts"],
        env: {
          ...discord_env,
          DEESKTOP_CAPTURE_CHANNEL_ID: "1401730790467047586",
        },
      },
    ),

    {
      name: "chromadb",
      cwd: __dirname,
      script: "./scripts/run_chroma.sh",
      restart_delay: 10000,
      kill_timeout: 10000,
    },
  ],
};
