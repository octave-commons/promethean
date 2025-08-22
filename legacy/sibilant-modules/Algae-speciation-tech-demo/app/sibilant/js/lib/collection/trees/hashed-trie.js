const { 
  create,
  extend,
  mixin
 } = require("../util");
var either = (function either$(left, right, value) {
  /* either lib/collection/hashed-trie.sibilant:11:0 */

  return (function() {
    if (value) {
      return left(value);
    } else {
      return right(value);
    }
  }).call(this);
});
var conditional = (function conditional$(value, pred, action, ...rest) {
  /* conditional lib/collection/hashed-trie.sibilant:13:0 */

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
  /* cond lib/collection/hashed-trie.sibilant:23:0 */

  "A lazy application of a functional conditional operator.\n" +
  "Waits for a value to be given to it before applying its functional arguements";
  return (value) => {
  	
    return conditional(value, pred, action, ...rest);
  
  };
});
Object.prototype.keys = (function Object$prototype$keys$(object = this) {
  /* Object.prototype.keys deps.sibilant:61:8 */

  return Object.keys(object);
});
Object.prototype.each = (function Object$prototype$each$(f = this.f, object = this) {
  /* Object.prototype.each deps.sibilant:61:8 */

  object.keys().each((k, i) => {
  	
    return f(object[k], k, object);
  
  });
  return object;
});
Array.prototype.each = (function Array$prototype$each$(f = this.f, array = this) {
  /* Array.prototype.each deps.sibilant:61:8 */

  array.forEach(f);
  return this;
});
Object.prototype.merge = (function Object$prototype$merge$(subject = this.subject, target = this) {
  /* Object.prototype.merge deps.sibilant:61:8 */

  subject.each((value, key) => {
  	
    // "thing";
    return target[key] = value;
  
  });
  return target;
});
const HashedTrie = { 
  symbol:Symbol("HashedTrie"),
  init( token = "",prefix = null,depth = 0,tokens = [],suffixes = [],indexes = Object.create(null),_hasData = false ){ 
    
      this.token = token;this.prefix = prefix;this.depth = depth;this.tokens = tokens;this.suffixes = suffixes;this.indexes = indexes;this._hasData = _hasData;
      return this;
    
   },
  _inSet( suffixes = this.suffixes,indexes = this.indexes ){ 
    
      "private method. create a locator function that will return the value of a key.\n" +
      "This method is called from add-child in the situation that the requested member passed the membership test.";
      return (k) => {
      	
        return suffixes[indexes[k]];
      
      };
    
   },
  _notInSet( tokens = this.tokens,suffixes = this.suffixes,indexes = this.indexes,node = this,_type = HashedTrie,depth = this.depth ){ 
    
      "private method. create a locator function that will create and add its requested value.\n" +
      "This method is called from add-child in the situation that the requested member failed the membership test.";
      return (k) => {
      	
        tokens.push(k);
        suffixes.push(create(_type)(k, node, (1 + depth)));
        indexes[k] = (suffixes.length - 1);
        return suffixes.slice(-1)[0];
      
      };
    
   },
  addChild( k = this.k,_type = HashedTrie,node = this,_inSet = this._inSet,_notInSet = this._notInSet,tokens = this.tokens,suffixes = this.suffixes,indexes = this.indexes,depth = this.depth ){ 
    
      "add a child if it does not already exist at the given key. Does not perform value\n" +
      "assignment, the node will be marked as empty or valueless";
      return (function() {
        if (indexes[k]) {
          return _inSet(suffixes, indexes)(k);
        } else {
          return _notInSet(tokens, suffixes, indexes, node, _type, depth)(k);
        }
      }).call(this);
    
   },
  _mark(  ){ 
    
      this._hasData = true;
      return this;
    
   },
  setChild( k = this.k,value = this.value,trie = this,node = trie.add(k) ){ 
    
      "add a node if it doesn't already exist at the immediate index given,\n" +
      "mark it as having a value, then populate it with the property members of the given value.";
      node._mark();
      return node.merge(value);
    
   },
  getChild( k = this.k,indexes = this.indexes,suffixes = this.suffixes,s = suffixes[indexes[k]] ){ 
    
      "get the immediate child indexed by token k, throws an error if the child is not found";
      return (function() {
        if (typeof s === "undefined") {
          throw (new Error((k + " is not defined on trie")))
        } else {
          return s;
        }
      }).call(this);
    
   },
  hasChild( k = this.k,suffixes = this.suffixes,indexes = this.indexes ){ 
    
      "return true if the node contains an immediate child at the given index k";
      return typeof suffixes[indexes[key]] !== "undefined";
    
   },
  removeChild( key = this.key,trie = this,tokens = this.tokens,suffixes = this.suffixes,indexes = this.indexes ){ 
    
      "remove an immediate child from the trie.";
      var index = indexes[key];
      return (function() {
        if (index) {
          delete tokens[index];
          delete suffixes[index];
          delete indexes;
          return delete key;
        } else {
          throw (new Error("Attempted to remove a non existant key in trie"))
        }
      }).call(this);
    
   },
  has( seq = this.seq,node = this ){ 
    
      "return true if the trie contains a value indexed by the given token sequence";
      return seq.every(cond(node.has, () => {
      	
        node = node.get(key);
        return true;
      
      }, () => {
      	
        return false;
      
      }));
    
   },
  traverse( f = this.f,suffixes = this.suffixes,depth = this.depth ){ 
    
      "call a function for every node of the trie";
      return suffixes.each((branch, k) => {
      	
        var token = branch.prefix.tokens[k];
        f(branch, depth);
        return branch.traverse(f, branch.suffixes);
      
      });
    
   },
  each( f = this.f,suffixes = this.suffixes,traverse = this.traverse ){ 
    
      "call a function for every valued node of the trie";
      return traverse((node, depth) => {
      	
        return (function() {
          if (node._hasData) {
            return f(node, depth);
          }
        }).call(this);
      
      }, suffixes);
    
   },
  map(  ){ 
    
   },
  reduce(  ){ 
    
   },
  add(  ){ 
    
   },
  set(  ){ 
    
   },
  has(  ){ 
    
   },
  reduceSeq( seq = this.seq,f = this.f,trie = this ){ 
    
      return seq.reduce(f, trie);
    
   },
  followBranch( seq = this.seq,f = this.f,trie = this ){ 
    
      return trie.reduceSeq(seq, (curr, v) => {
      	
        return f(curr.getChild(v), v);
      
      });
    
   },
  bindPrefix( seq = this.seq,f = this.f,args = [],leafKey = seq.pop() ){ 
    
      let prefix = Object.create(f(seq, ...args, leafKey));
      prefix.leafKey = leafKey;
      return prefix;
    
   },
  insert( seq = this.seq,data = this.data,trie = this,_type = this._type ){ 
    
      "recursively inserts nodes at each point in the tree along\n" +
      "a given sequence, adding a data value to the last and marking it as containing\n" +
      "data we care about";
      console.log("inserting", seq, data);
      let addNode = (node, v, k) => {
      	
        console.log("node", node, v, k);
        return node.addChild(v, _type);
      
      };
      let node = trie.reduceSeq(seq, addNode);
      mixin(data, node);
      return node._mark();
    
   },
  find( seq = this.seq,trie = this ){ 
    
      return trie.followBranch(seq, (x) => {
      	
        return x;
      
      });
    
   },
  get(  ){ 
    
   },
  remove( seq = this.seq,trie = this ){ 
    
      let node = trie.find(seq);
      let index = node.prefix.indexes[node.token];
      delete node.prefix.suffixes[index];
      delete node.prefix.tokens[index];
      delete node.prefix.indexes[node.token];
      return node;
    
   }
 };
exports.HashedTrie = HashedTrie;