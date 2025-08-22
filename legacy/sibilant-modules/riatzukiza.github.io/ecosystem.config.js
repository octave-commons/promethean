module.exports = {
    apps: [{
        script: 'npm run dev:server',
        watch: ['./inc','./dev/server.sibilant', './server']
    },
    {
        script: "npm run dev:watch",
        watch: ['./inc/',"./dev"]
    }
    ],

    deploy: {
        production: {
            user: 'SSH_USERNAME',
            host: 'SSH_HOSTMACHINE',
            ref: 'origin/master',
            repo: 'GIT_REPOSITORY',
            path: 'DESTINATION_PATH',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
};
