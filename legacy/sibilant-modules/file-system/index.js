

(function(a, b, c) {
  /* ../../../../node_modules/kit/inc/core/defs.sibilant:53:9 */

  return foo(this);
}).bind(this);


;
var R = require("ramda");


var fmap = R.curry((f, a) => {
	
  return a.map(f);

});
var is = { 
  string( v ){ 
    
      return typeof v === "string";
    
   }
 };
is.empty__QUERY = (function is$empty__QUERY$(value) {
  /* is.empty? ../../../../node_modules/kit/inc/core/fp.sibilant:12:0 */

  return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
  /* athrow ../../../../node_modules/kit/inc/core/fp.sibilant:14:0 */

  return () => {
  	
    return (new errType(message));
  
  };
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of ../../../../node_modules/kit/inc/core/fp.sibilant:17:0 */

  return o.getValue();
});
var Descriptions = {  };
var R = require("ramda");
var { 
  create,
  extend,
  mixin,
  cond,
  partiallyApplyAfter
 } = require("kit/js/util");
var identity = (function identity$(a) {
  /* identity sibilant/util.sibilant:4:0 */

  return a;
});
var setValue = R.curry((v, o) => {
	
  return o.value = v;

});
var reducePromise = R.curry((f, a) => {
	
  return a.reduce(f, [ Promise.resolve(), "" ]);

});
var timeout = (function timeout$(t) {
  /* timeout ../../../../node_modules/kit/inc/core/function-expressions.sibilant:25:8 */

  return (new Promise((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return setTimeout(success, t);
  
  }));
});
var onceThen = (function onceThen$(event, emitter) {
  /* once-then sibilant/util.sibilant:26:0 */

  console.log("once then", event, emitter);
  return (new Promise((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return emitter.once(event, success);
  
  }));
});
var R = require("ramda"),
    assert = require("assert"),
    { 
  cond,
  create,
  extend,
  mixin
 } = require("kit/js/util");
var testing__QUERY = true;
var identity = (function identity$(a) {
  /* identity inc/util.sibilant:4:0 */

  return a;
});
var setValue = R.curry((v, o) => {
	
  return o.value = v;

});
var reducePromise = R.curry((f, a) => {
	
  return a.reduce(f, [ Promise.resolve(), "" ]);

});
var timeout = (function timeout$(t) {
  /* timeout ../../../../node_modules/kit/inc/core/function-expressions.sibilant:25:8 */

  return (new Promise((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return setTimeout(success, t);
  
  }));
});
var onceThen = (function onceThen$(event, emitter) {
  /* once-then inc/util.sibilant:26:0 */

  return (new Promise((success, fail) => {
  	
    var resolve = success,
        reject = fail;
    return emitter.once(event, success);
  
  }));
});
var fmap = R.curry((f, a) => {
	
  return a.map(f);

});
var is = { 
  string( v ){ 
    
      return typeof v === "string";
    
   }
 };
is.empty__QUERY = (function is$empty__QUERY$(value) {
  /* is.empty? sibilant/index.sibilant:10:0 */

  return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
  /* athrow sibilant/index.sibilant:13:0 */

  return () => {
  	
    return (new errType(message));
  
  };
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of sibilant/index.sibilant:16:0 */

  return o.getValue();
});
const Tree={ 
  symbol:Symbol("Tree")
 };
mixin({ 
  value:null,
  parent:null,
  depth:0,
  branch__QUERY( value = this.value ){ 
    
      return null === value;
    
   },
  leaf__QUERY( value = this.value ){ 
    
      return !(null === value);
    
   },
  descend( seq = this.seq,f = this.f,tree = this ){ 
    
      return (function() {
        if (0 === seq.length) {
          return tree;
        } else {
          return f(tree, seq);
        }
      }).call(this);
    
   },
  find( seq = this.seq,tree = this ){ 
    
      return (function() {
        if (0 === seq.length) {
          return tree;
        } else {
          return tree._find(seq);
        }
      }).call(this);
    
   },
  has( seq = this.seq,tree = this ){ 
    
      return (function() {
        if (tree.find(seq)) {
          return true;
        } else {
          return false;
        }
      }).call(this);
    
   },
  insert( seq = this.seq,tree = this ){ 
    
      return (function() {
        if (0 === seq.length) {
          tree.value = undefined;
          return tree;
        } else {
          return (function(node) {
            /* ../../../../node_modules/kit/inc/macros.sibilant:165:9 */
          
            node.depth = (1 + tree.depth);
            return node.insert(seq.slice(1));
          })(tree._insert(seq));
        }
      }).call(this);
    
   },
  set( seq = this.seq,value = this.value,tree = this ){ 
    
      return tree.insert(seq).value = value;
    
   },
  add( key = this.key,tree = this,_children = tree._children ){ 
    
      return (_children.get(key) || create(tree)(null, tree));
    
   },
  traverseBranches__QUERY:true,
  each( f = this.f,traverseBranches__QUERY = this.traverseBranches__QUERY,leaf__QUERY = this.leaf__QUERY,_children = this._children ){ 
    
      var preorderTraverse = (function preorderTraverse$(node, k) {
        /* preorder-traverse sibilant/tree-map.sibilant:46:12 */
      
        f(node, k);
        return node.each(f);
      });
      return (function() {
        if (traverseBranches__QUERY) {
          return _children.each(preorderTraverse, true, leaf__QUERY, _children);
        } else {
          return _children.each((node, k) => {
          	
            return (function() {
              if (leaf__QUERY(node)) {
                return f(node, k);
              } else {
                return node.each(f, false, leaf, _children);
              }
            }).call(this);
          
          });
        }
      }).call(this);
    
   }
 }, Tree);
var TreeMap = extend(Tree, { 
  symbol:Symbol("TreeMap")
 });
mixin({ 
  init( value = this.value,parent = this.parent,_children = (new Map()) ){ 
    
      this.value = value;this.parent = parent;this._children = _children;
      return this;
    
   },
  _find( seq = this.seq,tree = this,_children = tree._children,node = _children.get(seq[0]) ){ 
    
      return (function() {
        if (node) {
          return node.find(seq.slice(1));
        } else {
          return false;
        }
      }).call(this);
    
   },
  _insert( seq = this.seq,_children = this._children,tree = this,node = tree.add(seq[0]) ){ 
    
      _children.set(seq[0], node);
      return node;
    
   }
 }, TreeMap);
var fs = require("fs"),
    Path = require("path"),
    chokidar = require("chokidar"),
    { 
  EventEmitter
 } = require("events");
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
    
      return Promise.resolve(v).then((v) => {
      	
        return writeFile(this.path, v);
      
      });
    
   },
  get string(  ){ 
    
      return readFile(this.path, "utf8");
    
   },
  set string( s ){ 
    
      return Promise.resolve(s).then((s) => {
      	
        return writeFile(this.path, s);
      
      });
    
   },
  getValue( path = this.path ){ 
    
      return readFile(path);
    
   },
  setValue( value = "",path = this.path ){ 
    
      return writeFile(path, value).then((nil) => {
      	
        return this;
      
      });
    
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
  get(  ){ 
    
   },
  insert( path = this.path,type = File ){ 
    
   },
  each( f = this.f ){ 
    
   },
  map( f = this.f ){ 
    
   },
  get keys(  ){ 
    
      return readdir(this.path);
    
   },
  get children(  ){ 
    
      return this.keys.then(fmap((k) => {
      	
        return Path.join(this.path, k);
      
      }));
    
   }
 }, Directory);
var FileSystem = extend(EventEmitter.prototype, { 
  symbol:Symbol("FileSystem")
 });
var plift = (function plift$(f) {
  /* plift sibilant/file-system.sibilant:12:0 */

  return (...args) => {
  	
    return (new Promise((success, fail) => {
    	
      var resolve = success,
          reject = fail;
      return f.apply(this, [ ...args, (err, data) => {
      	
        return (function() {
          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        }).call(this);
      
      } ]);
    
    }));
  
  };
});
var stat = plift(fs.stat),
    mkdir = plift(fs.mkdir),
    readFile = plift(fs.readFile),
    writeFile = plift(fs.writeFile),
    readdir = plift(fs.readdir);
var fillSubDir = (function fillSubDir$(p_subPath$1, seg) {
  /* fill-sub-dir sibilant/file-system.sibilant:22:0 */

  var p = p_subPath$1[0],
      subPath = p_subPath$1[1];

  return [ p.then((nil) => {
  	
    return mkdir(subPath);
  
  }).catch((e) => {
  	
    
  
  }), Path.join(subPath, seg) ];
});
var _directory__QUERY = (stats) => {
	
  return stats.isDirectory();

};
var emit = R.invoker(2, "emit");
var biCurry = R.curryN(2);
var _ = R._;
var notSingleDot = (token) => {
	
  return !(token === ".");

},
    findValue = (seq, _tree) => {
	
  return _tree.find(seq).value;

},
    tokenize = ($fpipe) => {
	
  return $fpipe.split("/").filter(notSingleDot);

};
mixin({ 
  root:".",
  init( root = this.root,_tree = create(TreeMap)() ){ 
    
      this.root = root;this._tree = _tree;
      return this;
    
   },
  _discoverNode:R.curry((function(path, seq, _tree, stats) {
    /* sibilant/file-system.sibilant:48:28 */
  
    return _tree.set(seq, (function() {
      if (stats.isDirectory()) {
        return create(Directory)(path);
      } else {
        return create(File)(path);
      }
    }).call(this));
  })),
  _findAbsolutePath( path,root ){ 
    
      return Path.resolve(path, root);
    
   },
  find( path = this.path,[ _tree = this._tree, root = this.root ] = [ this._tree, this.root ],[ _discoverNode = this._discoverNode, _findAbsolutePath = this._findAbsolutePath ] = [ this._discoverNode, this._findAbsolutePath ],relPath = _findAbsolutePath(path, root),seq = tokenize(relPath),node = findValue(seq, _tree),fs = this ){ 
    
      console.log("finding", path);
      return (function() {
        if (node) {
          return Promise.resolve(node);
        } else {
          return stat(relPath).then(_discoverNode(relPath, seq, _tree));
        }
      }).call(this);
    
   },
  watch( path = this.path,[ root = this.root ] = [ this.root ],[ _findAbsolutePath = this._findAbsolutePath ] = [ this._findAbsolutePath ],relPath = _findAbsolutePath(path, root),fs = this ){ 
    
      return fs.find(path, [], [], relPath).then((node) => {
      	
        chokidar.watch(node.path).on("all", (eventName, changedPath, stats) => {
        	
          console.log("changed path", changedPath);
          return fs.find(Path.relative(root, changedPath)).then((changedNode) => {
          	
            return node.emit(eventName, changedNode);
          
          });
        
        }).once("error", (err) => {
        	
          console.log("error on", "all", "of", "chokidar.watch(node.path)", "given", "eventName(changedPath, stats)");
          return console.log(err);
        
        });
        return node;
      
      });
    
   },
  insert( path = this.path,[ root = this.root ] = [ this.root ],[ _findAbsolutePath = this._findAbsolutePath ] = [ this._findAbsolutePath ],type = File,relPath = _findAbsolutePath(path, root),fs = this ){ 
    
      return fs.find(path).catch((e) => {
      	
        return (function(seq) {
          /* ../../../../node_modules/kit/inc/macros.sibilant:165:9 */
        
          return (function(fileName) {
            /* ../../../../node_modules/kit/inc/macros.sibilant:165:9 */
          
            return seq.reduce(fillSubDir, [ Promise.resolve(), "./" ])[0].then((nil) => {
            	
              return create(type)(path, fs).setValue();
            
            });
          })(seq.pop());
        })(tokenize(path));
      
      });
    
   },
  set( path = this.path,v = this.v,type = File,fs = this ){ 
    
      return fs.insert(path, [], [], type, fs).then((node) => {
      	
        return node.setValue(v);
      
      });
    
   }
 }, FileSystem);
exports.FileSystem = FileSystem;
exports.File = File;
(function() {
  if (testing__QUERY) {
    return (function(fileSystem) {
      /* ../../../../node_modules/kit/inc/macros.sibilant:165:9 */
    
      return Promise.resolve().then((nil) => {
      	
        var message = "should get files that exist with in this project from the project root";
        console.log(message);
        return fileSystem.find(".").then((function(b, ...others) {
          /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
        
          console.log("found current directory", b, ...others);
          return b;
        }));
      
      }).then((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("", b, ...others);
        return b;
      })).then((nil) => {
      	
        var message = "should find files that are not the current directory";
        console.log(message);
        return (function() {
          /* tests/file-system.sibilant:13:18 */
        
          is.true__QUERY = (function is$true__QUERY$(v) {
            /* is.true? tests/file-system.sibilant:15:19 */
          
            return !(!(v));
          });
          var fevery = R.curry((f, a) => {
          	
            return a.every(f);
          
          });
          var allTrue = (function allTrue$(a) {
            /* all-true tests/file-system.sibilant:19:19 */
          
            return Promise.all(a).then(fevery(is.true__QUERY));
          });
          return allTrue([ fileSystem.find("js"), fileSystem.find("sib"), fileSystem.find("tests") ]);
        }).call(this);
      
      }).then((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("", b, ...others);
        return b;
      })).then((nil) => {
      	
        var message = "should resolve .. properly";
        console.log(message);
        return fileSystem.find("../kit").then((node) => {
        	
          return (function() {
            if (node.path === "/home/aaron/devel/groups/mine/kit") {
              return node;
            } else {
              throw (new Error("didn't properly resolve .."))
            }
          }).call(this);
        
        });
      
      }).then((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("", b, ...others);
        return b;
      })).then((nil) => {
      	
        var message = "file created by an insert should be empty";
        console.log(message);
        return fileSystem.insert("./empty.txt").then(getValueOf).then(cond(is.empty__QUERY, (function(b, ...others) {
          /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
        
          console.log("inserted successfully", b, ...others);
          return b;
        }), athrow(RangeError, "inserted file is not empty")));
      
      }).then((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("", b, ...others);
        return b;
      })).then((nil) => {
      	
        var message = "should create a file if it doesn't exist, and fill it with the second argument";
        console.log(message);
        return fileSystem.set("./hello.txt", "hello world").then((function(b, ...others) {
          /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
        
          console.log("checking value of setted file", b, ...others);
          return b;
        })).then(getValueOf).then(cond(R.pipe(R.toString, R.equals("hello world")), (function(b, ...others) {
          /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
        
          console.log("setted successfuly", b, ...others);
          return b;
        }), athrow(TypeError, "setted value is not correct")));
      
      }).then((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("", b, ...others);
        return b;
      })).then((nil) => {
      	
        var message = "find always returns the same node for the same file";
        console.log(message);
        return Promise.all([ fileSystem.find("./sib/index.sibilant"), fileSystem.find("./sib/index.sibilant") ]).then(cond(R.apply(R.equals), (function(b, ...others) {
          /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
        
          console.log("files are the same", b, ...others);
          return b;
        }), athrow(Error, "found files are not the same")));
      
      }).then((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("", b, ...others);
        return b;
      })).then((nil) => {
      	
        var message = "watch events for the same file, consistantly return the same node";
        console.log(message);
        return fileSystem.set("./hello.txt", "hello world").then((nil) => {
        	
          return fileSystem.watch("./hello.txt");
        
        }).then((node) => {
        	
          return Promise.resolve([ onceThen("add", node), node ]);
        
        }).then(cond(R.apply(R.equals), (function(b, ...others) {
          /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
        
          console.log("same node for watcher", b, ...others);
          return b;
        }), athrow(Error, "once then did not return the right node")));
      
      }).then((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("", b, ...others);
        return b;
      })).then((nil) => {
      	
        var message = "Changing the value of a file node, will trigger a change event on the file system";
        console.log(message);
        return fileSystem.watch("./hello.txt").then(R.curry(onceThen)("add")).then((node) => {
        	
          node.on("change", (function(b, ...others) {
            /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
          
            console.log("a file changed", b, ...others);
            return b;
          }));
          timeout(1000).then((nil) => {
          	
            return node.value = "more hello, and now you know";
          
          });
          return Promise.race([ timeout(5000).then((nil) => {
          	
            throw (new Error("took too long, assuming that change event will not fire"))
          
          }), onceThen("change", node) ]);
        
        }).then((function(b, ...others) {
          /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
        
          console.log("file change event successfully fired", b, ...others);
          return b;
        }));
      
      }).then((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("", b, ...others);
        return b;
      })).then((nil) => {
      	
        var message = "can create file systems with any path";
        console.log(message);
        return (function(sibFs, jsFs) {
          /* ../../../../node_modules/kit/inc/macros.sibilant:165:9 */
        
          return sibFs.watch(".");
        })(create(FileSystem)("./sib/"), create(FileSystem)("./js/"));
      
      }).then((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("", b, ...others);
        return b;
      })).then((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("file system unit tests succeeded", b, ...others);
        return b;
      })).catch((function(b, ...others) {
        /* ../../../../node_modules/kit/inc/console.sibilant:10:8 */
      
        console.log("failed filesystem unit tests", b, ...others);
        return b;
      }));
    })(create(FileSystem)("."));
  }
}).call(this);