const Path = require("path");
const fs = require("fs");
const join = Path.join;
const { 
  create,
  extend,
  mixin
 } = require("../util");
;
const Future = require("../async");
const readdir = Future.Array.lift(fs.readdir);
const [ mkdir, readFile, writeFile, stat, unlink, rmdir ] = [ Future.Future.lift(fs.mkdir), Future.Future.lift(fs.readFile), Future.Future.lift(fs.writeFile), Future.Future.lift(fs.stat), Future.Future.lift(fs.unlink), Future.Future.lift(fs.rmdir) ];
// throw (new Error(("attempted to make a value that already exists")));
const { 
  HashedTrie
 } = require("./../collection/hashed-trie");
var conditional = (function conditional$(value, pred, action, ...rest) {
  /* conditional lib/file-system/index.sibilant:26:0 */

  "A functional conditional operator. Immediately evaluates its arguements.";
  return (function() {
    if (action) {
      return (function() {
        if (pred(value)) {
          return action(value);
        } else {
          return conditional(value, ...rest);
        }
      }).call(this);
    } else if (pred) {
      return pred(value);
    } else {
      return value;
    }
  }).call(this);
});
var cond = (function cond$(pred, action, ...rest) {
  /* cond lib/file-system/index.sibilant:37:0 */

  "A lazy application of a functional conditional operator.\n" +
  "Waits for a value to be given to it before applying its functional arguements";
  return (value) => {
  	
    return conditional(value, pred, action, ...rest);
  
  };
});

const Inode = { 
  symbol:Symbol("Inode"),
  init( name = this.name,parent = this.parent ){ 
    
      this.name = name;this.parent = parent;
      return this;
    
   },
  get path(  ){ 
    
      return (this.parent) ? Path.join(this.parent.path, this.name) : this.name;
    
   },
  set path( value ){ 
    
      this.name = value;
      return move(this.path);
    
   },
  stat( path = this.path ){ 
    
      return stat(path);
    
   },
  isFile( path = this.path ){ 
    
      return stat(path).then((stats) => {
      	
        return stats.isFile();
      
      });
    
   },
  isDirectory( path = this.path ){ 
    
      return stat(path).then((stats) => {
      	
        return stats.isDirectory();
      
      });
    
   },
  get( path = this.path,parent = this.parent ){ 
    
      return stat(path).then((stats) => {
      	
        return (function() {
          if (stats.isDirectory()) {
            return create(Directory)(path, parent);
          } else if (stats.isFile()) {
            return create(File)(path, parent);
          } else {
            throw (new Error("There is a file, but it is neither a directory or a 'file'"))
          }
        }).call(this);
      
      });
    
   },
  find( name = this.name,parent = this.parent,path = this.path,inode = this,target = Path.join(path, name) ){ 
    
      return inode.get(target);
    
   },
  remove( name = this.name,parent = this.parent,path = this.path,inode = this,target = Path.join(path, name) ){ 
    
      return inode.delete(target);
    
   },
  add( name = this.name,parent = this.parent,path = this.path,inode = this,target = Path.join(path, name) ){ 
    
      return inode.make(target);
    
   },
  set( name = this.name,parent = this.parent,value = this.value,path = this.path,inode = this,target = Path.join(path, name) ){ 
    
      return inode.insert(target, value);
    
   }
 };
exports.Inode = Inode;
const File = extend(Inode, { 
  symbol:Symbol("File"),
  get string(  ){ 
    
      return readFile(this.path, "utf8");
    
   },
  set string( data ){ 
    
      return Promise.resolve(data).then((str) => {
      	
        return writeFile(this.path, str);
      
      });
    
   },
  get contents(  ){ 
    
      return readFile(this.path);
    
   },
  set contents( data ){ 
    
      return writeFile(this.path, data);
    
   }
 });
File.delete = (function File$delete$(path = this.path) {
  /* File.delete deps.sibilant:61:8 */

  return unlink(path);
});
File.insert = (function File$insert$(path = this.path, contents = this.contents) {
  /* File.insert deps.sibilant:61:8 */

  return writeFile(path, contents).then((nil) => {
  	
    return create(File)(path);
  
  });
});
File.make = (function File$make$(path = this.path) {
  /* File.make deps.sibilant:61:8 */

  return writeFile(path, "").then((nil) => {
  	
    return create(File)(path);
  
  });
});
exports.File = File;
const AsyncCollection = { 
  symbol:Symbol("AsyncCollection"),
  each( ...args ){ 
    
      return this.contents.each(...args);
    
   },
  map( ...args ){ 
    
      return this.contents.map(...args);
    
   },
  bind( ...args ){ 
    
      return this.contents.bind(...args);
    
   },
  reduce( ...args ){ 
    
      return this.contents.reduce(...args);
    
   }
 };
const Directory = extend(Inode, { 
  symbol:Symbol("Directory"),
  get contents(  ){ 
    
      return Future.Array.resolve(readdir(this.path));
    
   },
  get array(  ){ 
    
   },
  each( ...args ){ 
    
      return this.contents.each(...args);
    
   },
  map( ...args ){ 
    
      return this.contents.map(...args);
    
   },
  bind( ...args ){ 
    
      return this.contents.bind(...args);
    
   },
  reduce( ...args ){ 
    
      return this.contents.reduce(...args);
    
   },
  make( path = this.path ){ 
    
      return mkdir(path).then((dir) => {
      	
        return create(Directory)(path);
      
      });
    
   },
  fill( path = this.path ){ 
    
      return this.make(path).catch((e) => {
      	
        return create(Directory)(path);
      
      });
    
   },
  insert( path = this.path,names = this.names ){ 
    
      return Future.Array.resolve(names).map((name) => {
      	
        return this.make(Path.join(path, name));
      
      });
    
   },
  delete( path = this.path ){ 
    
      return rmdir(path);
    
   }
 });
exports.Directory = Directory;
const PathTree = { 
  symbol:Symbol("PathTree"),
  init( root = process.cwd(),trie = create(HashedTrie)(),tree = this ){ 
    
      this.root = root;this.trie = trie;this.tree = tree;
      return this;
    
   },
  _seq( path = this.path,root = this.root,tree = this.tree ){ 
    
      "generate pathing data for tree operations.";
      let fullPath = Path.join(root, path);
      let seq = fullPath.split("/").filter((string) => {
      	
        return !(string === "");
      
      });
      return { 
        fullPath,
        seq
       };
    
   },
  _add( seq = this.seq,_type = this._type,instance = this.instance,trie = this.trie ){ 
    
      "adds a value to the tree using its types symbol";
      return trie.insert(seq, { 
        [ _type.symbol ]:instance
       }, trie);
    
   },
  _get( pathingData = this.pathingData,_type = this._type,trie = this.trie,tree = this.tree ){ 
    
      "This method will call get method of the given type and add its value to the trie using the *add method";
      let { 
        fullPath,
        seq
       } = pathingData;
      return _type.get(fullPath).then((instance) => {
      	
        return tree._add(seq, _type, instance);
      
      });
    
   },
  get( path = this.path,_type = this._type,trie = this.trie,root = this.root,tree = this.tree,pathingData = tree._seq(path),node = trie.get(pathingData.seq) ){ 
    
      "locate a node in the Path tree, if it is part of the tree, then we just return a promise for it.\n" +
      "if it is not already a part of the tree, then we attempt to locate thep";
      return (function() {
        if (node) {
          return _type.resolve(node);
        } else {
          return tree._get(pathingData, _type, trie, tree);
        }
      }).call(this);
    
   },
  make( path = this.path,_type = this._type,trie = this.trie,tree = this.tree,pathingData = tree._seq(path) ){ 
    
      "gets a node of the given type from the tree making it if it does not exist";
      return tree.get(path, _type, trie, tree, pathingData).catch((e) => {
      	
        return _type.make(path);
      
      }).then((instance) => {
      	
        return tree._add(path, _type, instance, trie);
      
      });
    
   },
  insert( path = this.path,data = this.data,_type = this._type,trie = this.trie,tree = this,pathingData = tree._seq(path) ){ 
    
      "gets a node of the given type from the tree, filling in all absent values along the path and\n" +
      "creating a complex type at the end if it does not exist";
      return tree.get(path, _type, trie, tree, pathingData).catch((e) => {
      	
        return trie.followTo(pathingData.seq, addIfNotExists);
      
      }).then((instance) => {
      	
        return tree._add(path, _type, instance, trie);
      
      });
    
   },
  clear( path = this.path ){ 
    
      return "clears the tree of nodes starting at a branch indexed by the given path.\n" +
      "Use this method to manage the memory of the application. Since other methods will still grab the content of their\n" +
      "files regardless, you can call this as often as you like.";
    
   },
  delete( path = this.path ){ 
    
   }
 };
exports.PathTree = PathTree;