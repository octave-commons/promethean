// JavaScript prgram to print BST
// in a given range

class Node {
    constructor(x) {
        this.data = x;
        this.left = null;
        this.right = null;
    }
}

// Recursive function to append nodes that 
// lie in the given range.
function appendNodes(root, l, h, ans) {
    if (root === null) return;

    // If the curr node lies in the range, 
    // process left subtree, append curr node 
    // and process right subtree (to perform in-order)
    if (root.data >= l && root.data <= h) {
        appendNodes(root.left, l, h, ans);
        ans.push(root.data);
        appendNodes(root.right, l, h, ans);
    }

    // If curr node is less than low, then
    // process right subtree.
    else if (root.data < l) {
        appendNodes(root.right, l, h, ans);
    }

    // If curr node is greater than high, then
    // process left subtree.
    else {
        appendNodes(root.left, l, h, ans);
    }
}

function printNearNodes(root, low, high) {
    let ans = [];
    appendNodes(root, low, high, ans);
    return ans;
}
    
// BST
//       22
//      /  \
//    12    30
//   /  \
//  8    20
let root = new Node(22);
root.left = new Node(12);
root.right = new Node(30);
root.left.left = new Node(8);
root.left.right = new Node(20);

let low = 10, high = 22;
let ans = printNearNodes(root, low, high);

console.log(ans.join(" "));
