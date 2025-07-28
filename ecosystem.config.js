module.exports = {
    apps: [
        {
            name: "stt_service",
            script: "./services/stt/run.sh",

            cwd:"./services/stt",
            interpreter: "bash",
            env_file: ".env",
            autorestart: true,
            // Very important until I figure out how to disable the console from popping up every time it restarts.
            // Makes my computer unusable if the program is in a bad state while developing
            restart_delay: 10000,
            kill_timeout: 10000
        },
        {
            name: "tts_service",
            script: "./services/tts/run.sh",
            cwd:"./services/tts/",
            interpreter: "bash",
            env_file: ".env",
            autorestart: true,
            // Very important until I figure out how to disable the console from popping up every time it restarts.
            // Makes my computer unusable if the program is in a bad state while developing
            restart_delay: 10000,
            kill_timeout: 10000
        }
    ]
};
