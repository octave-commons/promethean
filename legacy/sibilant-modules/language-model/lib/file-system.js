

(function(a, b, c) {
  /* ../groups/mine/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);


;

;
var Descriptions = {  };
var R = require("ramda");
var fmap = R.curry(((f, a) => {
	
  return a.map(f);

}));
var is = { 
  string( v ){ 
    
      return typeof v === "string";
    
   }
 };
is.empty__QUERY = (function is$empty__QUERY$(value) {
  /* is.empty? ../groups/mine/kit/inc/core/fp.sibilant:12:0 */

  return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
  /* athrow ../groups/mine/kit/inc/core/fp.sibilant:14:0 */

  return (() => {
  	
    return (new errType(message));
  
  });
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of ../groups/mine/kit/inc/core/fp.sibilant:17:0 */

  return o.getValue();
});
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
    { 
  EventEmitter
 } = require("events"),
    { 
  TreeMap
 } = require("./tree"),
    Path = require("path");
var assert = require("assert"),
    chokidar = require("chokidar"),
    fs = require("fs");
var testing__QUERY = true;
var identity = (function identity$(a) {
  /* identity src/file-system.sibilant:36:0 */

  return a;
});
var setValue = R.curry(((v, o) => {
	
  return o.value = v;

}));
var reducePromise = R.curry(((f, a) => {
	
  return a.reduce(f, [ Promise.resolve(), "" ]);

}));
var timeout = (function timeout$(t) {
  /* timeout ../groups/mine/kit/inc/core/function-expressions.sibilant:23:8 */

  return (new Promise(((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return setTimeout(success, t);
  
  })));
});
var onceThen = (function onceThen$(event, emitter) {
  /* once-then src/file-system.sibilant:58:0 */

  return (new Promise(((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return emitter.once(event, success);
  
  })));
});
var fmap = R.curry(((f, a) => {
	
  return a.map(f);

}));
var is = { 
  string( v ){ 
    
      return typeof v === "string";
    
   }
 };
is.empty__QUERY = (function is$empty__QUERY$(value) {
  /* is.empty? src/file-system.sibilant:65:0 */

  return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
  /* athrow src/file-system.sibilant:68:0 */

  return (() => {
  	
    return (new errType(message));
  
  });
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of src/file-system.sibilant:71:0 */

  return o.getValue();
});
var FSNode = extend(EventEmitter.prototype, { 
  symbol:Symbol("FSNode")
 });
Descriptions.FSNode = mixin({ 
  init( path = this.path,fs = this.fs ){ 
    
      this.path = path;this.fs = fs;
      EventEmitter.call(this);
      return this;
    
   },
  get stats(  ){ 
    
      return stat(this.path);
    
   },
  get name(  ){ 
    
      return Path.basename(this.path);
    
   },
  watch( path = this.path,fs = this.fs ){ 
    
      return fs.watch(path);
    
   }
 }, FSNode);
var File = extend(FSNode, { 
  symbol:Symbol("File")
 });
mixin({ 
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
 }, File);
var Directory = extend(FSNode, { 
  symbol:Symbol("Directory")
 });
mixin({ 
  set( path = this.path,value = this.value,type = File ){ 
    
   },
  get( k = this.k,fs = this.fs,path = this.path ){ 
    
      return fs.find(Path.join(path, k));
    
   },
  insert( path = this.path,type = File ){ 
    
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
 }, Directory);
var feach = R.curry(((f, a) => {
	
  return a.each(f);

}));
var plift = (function plift$(f) {
  /* plift src/file-system.sibilant:171:0 */

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
var fillSubDir = (function fillSubDir$(p_subPath$1, seg) {
  /* fill-sub-dir src/file-system.sibilant:182:0 */

  var p = p_subPath$1[0],
      subPath = p_subPath$1[1];

  return [ p.then(((nil) => {
  	
    return mkdir(subPath);
  
  })).catch(((e) => {
  	
    
  
  })), Path.join(subPath, seg) ];
});
var _directory__QUERY = ((stats) => {
	
  return stats.isDirectory();

});
var emit = R.invoker(2, "emit");
var biCurry = R.curryN(2);
var _ = R._;
var notSingleDot = ((token) => {
	
  return !(token === ".");

}),
    findValue = ((seq, _tree) => {
	
  return _tree.find(seq).value;

}),
    tokenize = (($fpipe) => {
	
  return $fpipe.split("/").filter(notSingleDot);

});
var FileSystem = extend(EventEmitter.prototype, { 
  symbol:Symbol("FileSystem")
 });
var isDir = (function isDir$(c) {
  /* is-dir src/file-system.sibilant:213:0 */

  return c.symbol === Directory.symbol;
});
mixin({ 
  root:".",
  init( root = this.root,_tree = create(TreeMap)() ){ 
    
      this.root = root;this._tree = _tree;
      return this;
    
   },
  _discoverNode:R.curry((function(path, seq, _tree, fs, stats) {
    /* src/file-system.sibilant:209:28 */
  
    return _tree.set(seq, (function() {
      if (stats.isDirectory()) {
        return create(Directory)(path, fs);
      } else {
        return create(File)(path, fs);
      }
    }).call(this));
  })),
  _findAbsolutePath( path,root ){ 
    
      return Path.resolve(root, path);
    
   },
  find( path = this.path,[ _tree, root ] = [ this._tree, this.root ],[ _discoverNode, _findAbsolutePath ] = [ this._discoverNode, this._findAbsolutePath ],relPath = _findAbsolutePath(path, root),seq = tokenize(relPath),node = findValue(seq, _tree),fs = this ){ 
    
      return (function() {
        if (node) {
          return Promise.resolve(node);
        } else {
          return stat(relPath).then(_discoverNode(relPath, seq, _tree, fs));
        }
      }).call(this);
    
   },
  watch( path = this.path,opts = this.opts,[ root ] = [ this.root ],[ _findAbsolutePath ] = [ this._findAbsolutePath ],relPath = _findAbsolutePath(path, root),fs = this ){ 
    
      return Promise.all([ fs.find(path) ]).then((([ node ]) => {
      	
        chokidar.watch(node.path).on("all", ((eventName, changedPath, stats) => {
        	
          return Promise.all([ fs.find(Path.relative(root, changedPath)) ]).then((([ changedNode ]) => {
          	
            return node.emit(eventName, changedNode);
          
          }));
        
        })).once("error", ((err) => {
        	
          console.log("error on", "all", "of", "chokidar.watch(node.path)", "given", "eventName(changedPath, stats)");
          return console.log(err);
        
        }));
        return node;
      
      }));
    
   },
  insert( path = this.path,[ root ] = [ this.root ],[ _findAbsolutePath ] = [ this._findAbsolutePath ],type = File,relPath = _findAbsolutePath(path, root),fs = this ){ 
    
      return fs.find(path).catch(((e) => {
      	
        return (function(seq) {
          /* ../groups/mine/kit/inc/macros.sibilant:162:9 */
        
          return (function(fileName) {
            /* ../groups/mine/kit/inc/macros.sibilant:162:9 */
          
            return seq.reduce(fillSubDir, [ Promise.resolve(), "./" ])[0].then(((nil) => {
            	
              return create(type)(path, fs).setValue();
            
            }));
          })(seq.pop());
        })(tokenize(path));
      
      }));
    
   },
  set( path = this.path,v = this.v,type = File,fs = this ){ 
    
      return Promise.all([ fs.insert(path, [], [], type, fs) ]).then((([ node ]) => {
      	
        return node.setValue(v);
      
      }));
    
   },
  delete( path = this.path ){ 
    
   },
  each( f = this.f ){ 
    
      var itterate = R.curry(((f, file) => {
      	
        return (function() {
          if (isDir(file)) {
            return file.each(itterate(f));
          } else {
            return f(file);
          }
        }).call(this);
      
      }));
      return this.find(".").then(itterate(f));
    
   }
 }, FileSystem);
exports.FileSystem = FileSystem;