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

const HEARTBEAT_PORT = 5005;
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
    {
      name: "duck_discord_indexer",
      script: "pipenv",
      cwd: path.join(__dirname, "../../services/py/discord_indexer/"),
      args: ["run", "python", "-m", "main"],
      instances: 1,
      autorestart: true,
      env_file: ".env",
      restart_delay: 10000,
      kill_timeout: 10000,
      env: {
        ...python_env,
        ...discord_env,
        HEARTBEAT_PORT,
      },
    },
    {
      name: "duck_cephalon",
      cwd: path.join(__dirname, "../../services/ts/cephalon"),
      script: ".",
      autorestart: true,
      restart_delay: 10000,
      kill_timeout: 10000,
      env: {
        ...discord_env,
        HEARTBEAT_PORT,
      },
    },
    {
      name: "duck_embedder",
      cwd: path.join(__dirname, "../../services/ts/discord-embedder"),
      script: ".",
      autorestart: true,
      restart_delay: 10000,
      kill_timeout: 10000,
      env: {
        ...discord_env,
        HEARTBEAT_PORT,
      },
    },

    // {
    //     "name": "duck_voice",
    //     "cwd": path.join(__dirname,"../../services/ts/voice"),
    //     "script":".",
    //     "autorestart": true,
    //     restart_delay: 10000,
    //     kill_timeout: 10000,
    //     env:{
    //         ...discord_env
    //     }
    // } ,
    {
      // should each agent hold their own chroma?
      // will there be a single core chroma?
      // or will it be a mix of the two?
      // some "core" data we know is just used by all agents
      // and some data is specific to the agent?
      // for now, we'll just run chroma in each agent
      name: "chromadb",
      cwd: __dirname,
      script: "./scripts/run_chroma.sh",
      restart_delay: 10000,
      kill_timeout: 10000,
    },
  ],
};
