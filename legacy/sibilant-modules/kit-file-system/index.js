(function(a, b, c) {
  /* node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);





;
var R = require("ramda");
var {
  create,
  extend,
  mixin,
  conditional,
  cond,
  partiallyApplyAfter
 } = require("kit/js/util");
var {
  cond,
  create,
  extend,
  mixin
 } = require("kit/js/util"),
    R = require("ramda"),
    Path = require("path"),
    assert = require("assert"),
    chokidar = require("chokidar"),
    fs = require("fs"),
    {
  TreeMap
 } = require("tree-kit");
var {
  Interface
 } = require("kit-interface");
var {
  EventEmitter,
  emit,
  bubble
 } = require("kit-events");
var FSNode = EventEmitter.define("FSNode", {
  init( rel = this.rel,path = this.path,fs = this.fs ){

      this.rel = rel;this.path = path;this.fs = fs;
      EventEmitter.init.call(this);
      return this;

   },
  get stats(  ){

      return stat(this.path);

   },
  get name(  ){

      return Path.basename(this.path);

   },
  isDir__QUERY(  ){

      throw (new Error("This method must be over written by a sub type."))

   },
  watch( path = this.path,fs = this.fs ){

      return fs.watch(path);

   }
 });
var File = FSNode.define("File", {
  get value(  ){

      return readFile(this.path);

   },
  set value( v ){

      return Promise.resolve(v).then(((v) => {

        return writeFile(this.path, v);

      }));

   },
  get string(  ){

      return readFile(this.path, "utf8");

   },
  set string( s ){

      return Promise.resolve(s).then(((s) => {

        return writeFile(this.path, s);

      }));

   },
  getValue( path = this.path ){

      return readFile(path);

   },
  setValue( value = "",path = this.path ){

      return writeFile(path, value).then(((nil) => {

        return this;

      }));

   },
  get readStream(  ){

      return this.getReadStream();

   },
  get writeStream(  ){

      return this.getWriteStream();

   },
  isDir__QUERY(  ){

      return false;

   },
  isFile__QUERY(  ){

      return true;

   },
  getReadStream( path = this.path ){

      return fs.createReadStream(path);

   },
  getWriteStream( path = this.path ){

      return fs.createWriteStream(path);

   },
  write(  ){

   },
  read(  ){

   },
  pipe(  ){

   }
 });
exports.File = File;
var Directory = FSNode.define("Directory", {
  set( rel = this.rel,value = this.value,type = File,fs = this.fs,path = this.path ){

      return fs.set(Path.join(rel, path), value, type);

   },
  get( rel = this.rel,fs = this.fs,path = this.path ){

      return fs.find(Path.join(this.rel, rel));

   },
  setValue(  ){

      return mkdir(this.path).then(((nil) => {

        return this;

      }));

   },
  getValue(  ){

      return readdir(this.path).then(((nil) => {

        return this;

      }));

   },
  insert( rel = this.rel,type = File,fs = this.fs,path = this.path ){

      return fs.insert(Path.join(rel, path), type);

   },
  each( f = this.f,children = this.children ){

      return children.then(feach(f));

   },
  map( f = this.f,children = this.children ){

      return children.then(fmap(f));

   },
  recursiveRemove( path = this.path ){

      return this.each(cond(is.file, (($fpipe) => {

        return $fpipe.delete();

      }), is.dir, (($fpipe) => {

        return $fpipe.recursiveRemove();

      }))).then((($fpipe) => {

        return $fpipe.remove();

      }));

   },
  removeEmptyDirectory( path = this.path ){

      return rmdir(path);

   },
  remove( path = this.path,recursive__QUERY = false ){

      return (function() {
        if (recursive__QUERY) {
          return this.recursiveRemove(path);
        } else {
          return this.removeEmptyDirectory(path);
        }
      }).call(this);

   },
  get subSystem(  ){

      return create(FileSystem)(this.path);

   },
  isDir__QUERY(  ){

      return true;

   },
  isFile__QUERY(  ){

      return false;

   },
  get keys(  ){

      return readdir(this.path);

   },
  get getChild(  ){

      return ((d) => {

        return this.get(d);

      });

   },
  get children(  ){

      return this.keys.then((($fpipe) => {

        return Promise.all($fpipe.map(this.getChild));

      }));

   }
 });
exports.Directory = Directory;
var _discoverNode = R.curry((function(rel, path, seq, _tree, sys, stats) {
  /* src/index.sibilant:8:34 */

  return _tree.set(seq, (function() {
    if (stats.isDirectory()) {
      return create(Directory)(rel, path, sys);
    } else {
      return create(File)(rel, path, sys);
    }
  }).call(this));
}));
var _findAbsolutePath = (function _findAbsolutePath$(path, root) {
  /* *find-absolute-path src/interfaces/system.sibilant:8:0 */

  return Path.resolve(root, path);
});
var itterate = R.curry((function(f, file) {
  /* src/index.sibilant:8:34 */

  return (async function() {
    if (isDir(file)) {
        return Promise.all(await file.map(itterate(f)));
    } else {
      return f(file);
    }
  }).call(this);
}));
var FileSystem = EventEmitter.define("FileSystem", {
  root:".",
  init( root = this.root,_tree = create(TreeMap)() ){

      this.root = root;this._tree = _tree;
      return this;

   },
  find( rel = this.rel,_tree = this._tree,root = this.root ){

      var absPath = _findAbsolutePath(rel, root);
      var seq = tokenize(absPath);
      var node = findValue(seq, _tree),
          sys = this;
      return (function() {
        if (node) {
          return Promise.resolve(node);
        } else {
          return stat(absPath).then(_discoverNode(rel, absPath, seq, _tree, sys));
        }
      }).call(this);

   },
  exists( path = this.path ){

      return this.find(path).then((() => {

        return true;

      })).catch((() => {

        return false;

      }));

   },
  watch( path = this.path,opts = this.opts,root = this.root ){

      var sys = this;
      return Promise.all([ sys.find(path) ]).then((([ node ]) => {

        node._watcher = chokidar.watch(node.path).on("all", ((eventName, changedPath, stats) => {

          var rel = Path.relative(root, changedPath);
          return Promise.all([ sys.find(rel) ]).then((([ changedNode ]) => {

            var event = {
              event:eventName,
              node:changedNode
             };
            node.emit("*", event);
            node.emit("all", event);
            return node.emit(eventName, event);

          }));

        })).once("error", ((err) => {

          console.log("error on", "all", "of", "chokidar.watch(node.path)", "given", "eventName(changedPath, stats)");
          return console.log(err);

        }));
        return node;

      }));

   },
  insert( rel = this.rel,type = File,root = this.root,sys = this ){

      return sys.find(rel).catch(((e) => {

        var absPath = _findAbsolutePath(rel, root);
        return tokenize(rel).reduce(fillSubDir, [ Promise.resolve(), root ])[0].then(((nil) => {

          return create(type)(rel, absPath, sys).setValue();

        }));

      }));

   },
  set( path = this.path,v = this.v,type = File,root = this.root,sys = this ){

      return sys.insert(path, type, root, sys).then((function() {
        /* src/interfaces/system.sibilant:69:17 */

        return arguments[0].setValue(v);
      }));

   },
  delete( path = this.path ){

   },
  each( f = this.f ){

      return this.find(".").then(itterate(f));

   }
 });
var testing__QUERY = true;
var is = {
  string( v ){

      return typeof v === "string";

   },
  empty( value ){

      return 0 === value.length;

   }
 };
var athrow = (function athrow$(errType, message) {
  /* athrow src/util.sibilant:16:0 */

  return (() => {

    return (new errType(message));

  });
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of src/util.sibilant:19:0 */

  return o.getValue();
});
var emit = R.invoker(2, "emit");
var biCurry = R.curryN(2);
var _ = R._;
var feach = R.curry((function(f, a) {
  /* src/index.sibilant:8:34 */

  return a.each(f);
}));
var fmap = R.curry((function(f, a) {
  /* src/index.sibilant:8:34 */

  return a.map(f);
}));
var identity = (function identity$(a) {
  /* identity src/util/fp.sibilant:23:0 */

  return a;
});
var setValue = R.curry((function(v, o) {
  /* src/index.sibilant:8:34 */

  return o.value = v;
}));
var fs = require("fs");
var plift = (function plift$(f) {
  /* plift src/util/fs.sibilant:3:0 */

  return ((...args) => {

    return (new Promise(((success, fail) => {

      var resolve = success,
          reject = fail;
      return f.apply(this, [ ...args, ((err, data) => {

        return (function() {
          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        }).call(this);

      }) ]);

    })));

  });
});
var stat = plift(fs.stat),
    mkdir = plift(fs.mkdir),
    rmdir = plift(fs.rmdir),
    readFile = plift(fs.readFile),
    writeFile = plift(fs.writeFile),
    readdir = plift(fs.readdir);
var isDir = (function isDir$(c) {
  /* is-dir src/util/fs.sibilant:15:0 */

  return c.symbol === Directory.symbol;
});
var _directory__QUERY = ((stats) => {

  return stats.isDirectory();

});
var fillSubDir = (function fillSubDir$(p_subPath$1, seg) {
  /* fill-sub-dir src/util/fs.sibilant:19:0 */

  var p = p_subPath$1[0],
      subPath = p_subPath$1[1];

  return [ p.then(((nil) => {

    return mkdir(subPath);

  })).catch(((e) => {



  })), Path.join(subPath, seg) ];
});
var notSingleDot = ((token) => {

  return !(token === ".");

}),
    findValue = ((seq, _tree) => {

  return _tree.find(seq).value;

}),
    tokenize = (($fpipe) => {

  return $fpipe.split("/").filter(notSingleDot);

});
var reducePromise = R.curry((function(f, a) {
  /* src/index.sibilant:8:34 */

  return a.reduce(f, [ Promise.resolve(), "" ]);
}));
var timeout = (function timeout$(t) {
  /* timeout node_modules/kit/inc/core/function-expressions.sibilant:23:8 */

  return (new Promise(((success, fail) => {

    var resolve = success,
        reject = fail;
    return setTimeout(success, t);

  })));
});
var onceThen = (function onceThen$(event, emitter) {
  /* once-then src/util/promise.sibilant:11:0 */

  return (new Promise(((success, fail) => {

    var resolve = success,
        reject = fail;
    return emitter.once(event, success);

  })));
});
exports.FileSystem = FileSystem;
exports.System = FileSystem;
FileSystem.load = (function FileSystem$load$(rootPath) {
  /* File-system.load src/index.sibilant:34:0 */

  return create(FileSystem)(rootPath);
});
exports.load = FileSystem.load;
