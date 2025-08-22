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
  /* preorder-traverse ../file-system/sib/tree-map.sibilant:46:12 */

  f(node, k);
  return node.each(f);
});, (function() {
  if (traverseBranches__QUERY) {
    return _children.each(preorderTraverse, true, leaf__QUERY, _children);
  } else {
    return node(k).forEach((function(_children) {
      /* ../file-system/sib/tree-map.sibilant:51:16 */
    
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