module.exports = {
    apps: [
        {
            name: "stt_service",
            script: "./services/stt/run.sh",
            interpreter: "bash",
            env_file: ".env",
            autorestart: true
        },
        {
            name: "tts_service",
            script: "./services/tts/run.sh",
            interpreter: "bash",
            env_file: ".env",
            autorestart: true
        }
    ]
};
