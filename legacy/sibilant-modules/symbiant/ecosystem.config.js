const Path = require("path")
module.exports = {
  apps : [// {
  //   script: 'index.sibilant',
  //   interpreter:Path.resolve("./node_modules/sibilant/bin/sibilant"),
  //   interpreter_args:"-x",
  //   ignore_watch:["./games/*/js/**.js","./node_modules"],
  //   watch: '.'

  // }
    {
        script: 'index.js',
        ignore_watch:["./games/*/js/**.js","./node_modules"],
        watch: '.'

      }
          ,],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
