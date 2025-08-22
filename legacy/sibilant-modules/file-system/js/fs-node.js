specify(FSNode, extend(EventEmitter.prototype));
defDescription(FSNode, path(fs), init(EventEmitter.call(this)), gett(stats, stat(this.path)), defGeneric(watch, path(fs), fs.watch(path)));