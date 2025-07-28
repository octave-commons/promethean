
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
            script:"./scripts/discord_indexer_run.sh",
            interpreter: "bash",
            instances: 1,
            autorestart: true,
            "env_file": ".env",
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            "name": "duck_cephalon",
            "cwd": ".",
            "script":"./scripts/duck_cephalon_run.sh",
            "interpreter": "bash",
            "autorestart": true,
            "env_file": ".env",
            restart_delay: 10000,
            kill_timeout: 10000 // wait 5s before SIGKILL

        },
        {
            "name": "duck_embedder",
            "cwd": ".",
            "script":"./scripts/duck_discord_embedder.sh",
            "interpreter": "bash",
            "autorestart": true,
            "env_file": ".env",
            restart_delay: 10000,
            kill_timeout: 10000 // wait 5s before SIGKILL

        },
        {
            // should each agent hold their own chroma?
            // will there be a single core chroma?
            // or will it be a mix of the two?
            // some "core" data we know is just used by all agents
            // and some data is specific to the agent?
            // for now, we'll just run chroma in each agent
            "name": "chromadb",
            "script": "python",
            "args": "-m pipenv run chroma run --path ./chroma_data",
            restart_delay: 10000,
            kill_timeout: 10000
        }

    ]
};
