var R = require("ramda"),
    assert = require("assert"),
    lit(cond, create, extend, mixin) = require("kit/js/util");
var testing__QUERY = true;
var identity = (function identity$(a) {
  /* identity ../file-system/inc/util.sibilant:4:0 */

  return a;
});
defCurried(setValue, v(o), o.value = v;);
defCurried(reducePromise, f(a), a.reduce(f, [ Promise.resolve(), "" ]));
defPromised(timeout, t(), setTimeout(success, t));
var onceThen = (function onceThen$(event, emitter) {
  /* once-then ../file-system/inc/util.sibilant:26:0 */

  return makePromise(emitter.once(event, success));
});
defCurried(fmap, f(a), a.map(f));
var is = lit(var string = (function string$(v) {
  /* string ../file-system/sib/index.sibilant:8:13 */

  return typeof v === "string";
}););
is.empty__QUERY = (function is$empty__QUERY$(value) {
  /* is.empty? ../file-system/sib/index.sibilant:10:0 */

  return 0 === value.length;
});
var athrow = (function athrow$(errType, message) {
  /* athrow ../file-system/sib/index.sibilant:13:0 */

  return ->((new errType(message)));
});
var getValueOf = (function getValueOf$(o) {
  /* get-value-of ../file-system/sib/index.sibilant:16:0 */

  return o.getValue();
});
type(Tree);
describe(Tree, value(null), parent(null), depth(0), defGeneric(branch__QUERY, value(), null === value), defGeneric(leaf__QUERY, value(), !(null === value)), defGeneric(descend, seq(f, tree(this)), (function() {
  if (0 === seq.length) {
    return tree;
  } else {
    return f(tree, seq);
  }
}).call(this)), defGeneric(find, seq(tree(this)), (function() {
  if (0 === seq.length) {
    return tree;
  } else {
    return tree._find(seq);
  }
}).call(this)), defGeneric(has, seq(tree(this)), (function() {
  if (tree.find(seq)) {
    return true;
  } else {
    return false;
  }
}).call(this)), defGeneric(insert, seq(tree(this)), (function() {
  if (0 === seq.length) {
    tree.value = undefined;
    return tree;
  } else {
    return let(node(tree._insert(seq))(), node.depth = (1 + tree.depth);, node.insert(seq.slice(1)));
  }
}).call(this)), defGeneric(set, seq(value, tree(this)), tree.insert(seq).value = value;), defGeneric(add, key(tree(this), _children(tree._children)), (_children.get(key) || create(tree)(null, tree))), traverseBranches__QUERY(true), defGeneric(each, f(traverseBranches__QUERY, leaf__QUERY, _children), var preorderTraverse = (function preorderTraverse$(node, k) {
  /* preorder-traverse ../file-system/sibilant/tree-map.sibilant:46:12 */

  f(node, k);
  return node.each(f);
});, (function() {
  if (traverseBranches__QUERY) {
    return _children.each(preorderTraverse, true, leaf__QUERY, _children);
  } else {
    return node(k).forEach((function(_children) {
      /* ../file-system/sibilant/tree-map.sibilant:51:16 */
    
      return (function() {
        if (leaf__QUERY(node)) {
          return f(node, k);
        } else {
          return node.each(f, false, leaf, _children);
        }
      }).call(this);
    }));
  }
}).call(this)));
specify(TreeMap, extend(Tree));
describe(TreeMap, init(value(parent, _children((new Map())))), defGeneric(_find, seq(tree(this), _children(tree._children), node(_children.get(seq[0]))), (function() {
  if (node) {
    return node.find(seq.slice(1));
  } else {
    return false;
  }
}).call(this)), defGeneric(_insert, seq(_children, tree(this), node(tree.add(seq[0]))), _children.set(seq[0], node), node));
var fs = require("fs"),
    Path = require("path"),
    chokidar = require("chokidar"),
    lit(EventEmitter) = require("events");
specify(FSNode, extend(EventEmitter.prototype));
defDescription(FSNode, path(fs), init(EventEmitter.call(this)), gett(stats, stat(this.path)), defGeneric(watch, path(fs), fs.watch(path)));
specify(File, extend(FSNode));
describe(File, gett(value, readFile(this.path)), sett(value, v, then(Promise.resolve(v), v, writeFile(this.path, v))), gett(string, readFile(this.path, "utf8")), sett(string, s, then(Promise.resolve(s), s, writeFile(this.path, s))), defGeneric(getValue, path(), readFile(path)), defGeneric(setValue, value("")(path), thenDo(writeFile(path, value), this)), gett(readStream, this.getReadStream()), gett(writeStream, this.getWriteStream()), gmth(getReadStream, path(), fs.createReadStream(path)), gmth(getWriteStream, path(), fs.createWriteStream(path)), gmth(write, null), gmth(read, null), gmth(pipe, null));
specify(Directory, extend(FSNode));
describe(Directory, defGeneric(set, path(value, type(File))), defGeneric(get, null), defGeneric(insert, path(type(File))), defGeneric(each, f()), defGeneric(map, f()), gett(keys, readdir(this.path)), gett(children, this.keys.then(fmap(=>(k(), Path.join(this.path, k))))));
specify(FileSystem, extend(EventEmitter.prototype));
var plift = (function plift$(f) {
  /* plift ../file-system/sibilant/file-system.sibilant:12:0 */

  return promised(args(), f.apply(this, [ args, =>(err(data), (function() {
    if (err) {
      return reject(err);
    } else {
      return resolve(data);
    }
  }).call(this)) ]));
});
var stat = plift(fs.stat),
    mkdir = plift(fs.mkdir),
    readFile = plift(fs.readFile),
    writeFile = plift(fs.writeFile),
    readdir = plift(fs.readdir);
var fillSubDir = (function fillSubDir$(p_subPath$2, seg) {
  /* fill-sub-dir ../file-system/sibilant/file-system.sibilant:22:0 */

  var p = p_subPath$2[0],
      subPath = p_subPath$2[1];

  return [ catch(thenDo(p, mkdir(subPath))), Path.join(subPath, seg) ];
});
var _directory__QUERY = =>(stats(), stats.isDirectory());
var emit = R.invoker(2, "emit");
var biCurry = R.curryN(2);
var _ = R._;
var notSingleDot = =>(token(), !(token === ".")),
    findValue = =>(seq(_tree), _tree.find(seq).value),
    tokenize = =>($fpipe(), $fpipe.split("/").filter(notSingleDot));
defLitMacro(defCurried, name.apply(this, [ args ].concat(body)), {
  file: "../file-system/sibilant/file-system.sibilant",
  token: "(",
  type: "expression",
  line: 48,
  col: 3,
  contents: [ {
    file: "../file-system/sibilant/file-system.sibilant",
    token: "property",
    type: "literal",
    line: 48,
    col: 4,
    contents: [],
    specials: 0,
    precedingIgnored: []
  }, name, {
    file: "../file-system/sibilant/file-system.sibilant",
    token: "(",
    type: "expression",
    line: 48,
    col: 19,
    contents: [ {
      file: "../file-system/sibilant/file-system.sibilant",
      token: "R.curry",
      type: "literal",
      line: 48,
      col: 20,
      contents: [],
      specials: 0,
      precedingIgnored: []
    }, {
      file: "../file-system/sibilant/file-system.sibilant",
      token: "(",
      type: "expression",
      line: 48,
      col: 28,
      contents: [ {
        file: "../file-system/sibilant/file-system.sibilant",
        token: "lambda",
        type: "literal",
        line: 48,
        col: 29,
        contents: [],
        specials: 0,
        precedingIgnored: []
      }, args ].concat(body),
      precedingIgnored: [ {
        file: "../file-system/sibilant/file-system.sibilant",
        token: " ",
        type: "whitespace",
        line: 48,
        col: 27,
        contents: []
      } ],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    } ],
    precedingIgnored: [ {
      file: "../file-system/sibilant/file-system.sibilant",
      token: " ",
      type: "whitespace",
      line: 48,
      col: 18,
      contents: []
    } ],
    specials: 0,
    end: undefined,
    closed: true,
    closingIgnored: []
  } ],
  precedingIgnored: [],
  specials: 0,
  end: undefined,
  closed: true,
  closingIgnored: []
});
describe(FileSystem, root("."), init(root(_tree(create(TreeMap)()))), defCurried(_discoverNode, path(seq, _tree, stats), _tree.set(seq, (function() {
  if (stats.isDirectory()) {
    return create(Directory)(path);
  } else {
    return create(File)(path);
  }
}).call(this))), var _findAbsolutePath = (function _findAbsolutePath$(path, root) {
  /* *find-absolute-path ../file-system/sibilant/file-system.sibilant:62:10 */

  return Path.resolve(path, root);
});, defGeneric(find, path([ _tree, root ], [ _discoverNode, _findAbsolutePath ], relPath(_findAbsolutePath(path, root)), seq(tokenize(relPath)), node(findValue(seq, _tree)), fs(this)), print("finding", path), (function() {
  if (node) {
    return Promise.resolve(node);
  } else {
    return stat(relPath).then(_discoverNode(relPath, seq, _tree));
  }
}).call(this)), defGeneric(watch, path([ root ], [ _findAbsolutePath ], relPath(_findAbsolutePath(path, root)), fs(this)), then(fs.find(path, [], [], relPath), node, on(chokidar.watch(node.path), "all", eventName(changedPath, stats), print("changed path", changedPath), then(fs.find(Path.relative(root, changedPath)), changedNode, node.emit(eventName, changedNode))), node)), defGeneric(insert, path([ root ], [ _findAbsolutePath ], type(File), relPath(_findAbsolutePath(path, root)), fs(this)), catch(fs.find(path), let(seq(tokenize(path))(), let(fileName(seq.pop())(), thenDo(seq.reduce(fillSubDir, [ Promise.resolve(), "./" ])[0], create(type)(path, fs).setValue()))))), defGeneric(set, path(v, type(File), fs(this)), then(fs.insert(path, [], [], type, fs), node, node.setValue(v))));
exports.FileSystem = FileSystem;
exports.File = File;