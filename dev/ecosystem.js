export class Service {
  cosntructor(name, script, args, config) {
    this.name = name;
    this.script = script;
    this.args = args;
    this.config = config;
  }
  static create(name, script, args, config) {}
}
export class Ecosystem {
  constructor(root, env) {
    this.apps = [];
    this.root = root;
    this.common_env = env;
  }
  use() {
    this.apps.push(Service.create());
  }
}
