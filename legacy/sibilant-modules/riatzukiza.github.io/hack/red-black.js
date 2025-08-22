// Javascript program for the above approach

// Enumeration for color of the node
const COLOR = {
	RED: "RED",
	BLACK: "BLACK",
};

// Class representing a Node in the Red-Black Tree
class Node {
	constructor(val) {
		this.val = val;
		this.color = COLOR.RED;
		this.left = this.right = this.parent = null;
	}

	// Returns pointer to uncle
	uncle() {
		if (!this.parent || !this.parent.parent)
			return null;

		if (this.parent.isOnLeft())
			return this.parent.parent.right;
		else
			return this.parent.parent.left;
	}

	// Check if node is left child of parent
	isOnLeft() {
		return this === this.parent.left;
	}

	// Returns pointer to sibling
	sibling() {
		if (!this.parent)
			return null;

		return this.isOnLeft() ? this.parent.right : this.parent.left;
	}

	// Moves node down and moves given node in its place
	moveDown(nParent) {
		if (this.parent) {
			if (this.isOnLeft())
				this.parent.left = nParent;
			else
				this.parent.right = nParent;
		}
		nParent.parent = this.parent;
		this.parent = nParent;
	}

	// Checks if the node has a red child
	hasRedChild() {
		return (this.left && this.left.color === COLOR.RED) ||
			(this.right && this.right.color === COLOR.RED);
	}
}

// Class representing a Red-Black Tree
class RBTree {
	constructor() {
		this.root = null;
	}

	// Left rotates the given node
	leftRotate(x) {
		const nParent = x.right;

		if (x === this.root)
			this.root = nParent;

		x.moveDown(nParent);

		x.right = nParent.left;

		if (nParent.left)
			nParent.left.parent = x;

		nParent.left = x;
	}

	// Right rotates the given node
	rightRotate(x) {
		const nParent = x.left;

		if (x === this.root)
			this.root = nParent;

		x.moveDown(nParent);

		x.left = nParent.right;

		if (nParent.right)
			nParent.right.parent = x;

		nParent.right = x;
	}

	// Swaps colors of two nodes
	swapColors(x1, x2) {
		const temp = x1.color;
		x1.color = x2.color;
		x2.color = temp;
	}

	// Swaps values of two nodes
	swapValues(u, v) {
		const temp = u.val;
		u.val = v.val;
		v.val = temp;
	}

	// Fixes red-red violation at the given node
	fixRedRed(x) {
		if (x === this.root) {
			x.color = COLOR.BLACK;
			return;
		}

		let parent = x.parent,
			grandparent = parent.parent,
			uncle = x.uncle();

		if (parent.color !== COLOR.BLACK) {
			if (uncle && uncle.color === COLOR.RED) {
				parent.color = COLOR.BLACK;
				uncle.color = COLOR.BLACK;
				grandparent.color = COLOR.RED;
				this.fixRedRed(grandparent);
			} else {
				if (parent.isOnLeft()) {
					if (x.isOnLeft()) {
						this.swapColors(parent, grandparent);
					} else {
						this.leftRotate(parent);
						this.swapColors(x, grandparent);
					}
					this.rightRotate(grandparent);
				} else {
					if (x.isOnLeft()) {
						this.rightRotate(parent);
						this.swapColors(x, grandparent);
					} else {
						this.swapColors(parent, grandparent);
					}
					this.leftRotate(grandparent);
				}
			}
		}
	}

	// Finds the node that does not have a left child in the subtree of the given node
	successor(x) {
		let temp = x;

		while (temp.left)
			temp = temp.left;

		return temp;
	}

	// Finds the node that replaces a deleted node in BST
	BSTreplace(x) {
		if (x.left && x.right)
			return this.successor(x.right);

		if (!x.left && !x.right)
			return null;

		return x.left || x.right;
	}

	// Deletes the given node
	deleteNode(v) {
		const u = this.BSTreplace(v);
		const uvBlack = (!u || u.color === COLOR.BLACK) && (v.color === COLOR.BLACK);
		const parent = v.parent;

		if (!u) {
			if (v === this.root) {
				this.root = null;
			} else {
				if (uvBlack) {
					this.fixDoubleBlack(v);
				} else if (v.sibling()) {
					v.sibling().color = COLOR.RED;
				}

				if (v.isOnLeft()) {
					parent.left = null;
				} else {
					parent.right = null;
				}
			}
			return;
		}

		if (!v.left || !v.right) {
			if (v === this.root) {
				v.val = u.val;
				v.left = v.right = null;
			} else {
				if (v.isOnLeft()) {
					parent.left = u;
				} else {
					parent.right = u;
				}

				u.parent = parent;

				if (uvBlack) {
					this.fixDoubleBlack(u);
				} else {
					u.color = COLOR.BLACK;
				}
			}
			return;
		}

		this.swapValues(u, v);
		this.deleteNode(u);
	}

	fixDoubleBlack(x) {
		if (x === this.root)
			return;

		const sibling = x.sibling(),
			parent = x.parent;

		if (!sibling) {
			this.fixDoubleBlack(parent);
		} else {
			if (sibling.color === COLOR.RED) {
				parent.color = COLOR.RED;
				sibling.color = COLOR.BLACK;

				if (sibling.isOnLeft())
					this.rightRotate(parent);
				else
					this.leftRotate(parent);

				this.fixDoubleBlack(x);
			} else {
				if (sibling.hasRedChild()) {
					if (sibling.left && sibling.left.color === COLOR.RED) {
						if (sibling.isOnLeft()) {
							sibling.left.color = sibling.color;
							sibling.color = parent.color;
							this.rightRotate(parent);
						} else {
							sibling.left.color = parent.color;
							this.rightRotate(sibling);
							this.leftRotate(parent);
						}
					} else {
						if (sibling.isOnLeft()) {
							sibling.right.color = parent.color;
							this.leftRotate(sibling);
							this.rightRotate(parent);
						} else {
							sibling.right.color = sibling.color;
							sibling.color = parent.color;
							this.leftRotate(parent);
						}
					}
					parent.color = COLOR.BLACK;
				} else {
					sibling.color = COLOR.RED;
					if (parent.color === COLOR.BLACK)
						this.fixDoubleBlack(parent);
					else
						parent.color = COLOR.BLACK;
				}
			}
		}
	}

	// Prints level order for the given node
	levelOrder(x) {
		if (!x)
			return;

		const q = [];
		q.push(x);

		while (q.length > 0) {
			const curr = q.shift();
			document.write(curr.val + " ");

			if (curr.left)
				q.push(curr.left);
			if (curr.right)
				q.push(curr.right);
		}
	}

	// Prints inorder recursively
	inorder(x) {
		if (!x)
			return;

		this.inorder(x.left);
		document.write(x.val + " ");
		this.inorder(x.right);
	}

	// Searches for the given value
	// If found, returns the node (used for delete)
	// Else returns the last node while traversing (used in insert)
	search(n) {
		let temp = this.root;
		while (temp) {
			if (n < temp.val) {
				if (!temp.left)
					break;
				else
					temp = temp.left;
			} else if (n === temp.val) {
				break;
			} else {
				if (!temp.right)
					break;
				else
					temp = temp.right;
			}
		}

		return temp;
	}

	// Inserts the given value into the tree
	insert(n) {
		const newNode = new Node(n);
		if (!this.root) {
			newNode.color = COLOR.BLACK;
			this.root = newNode;
		} else {
			const temp = this.search(n);
			if (temp.val === n)
				return;

			newNode.parent = temp;

			if (n < temp.val)
				temp.left = newNode;
			else
				temp.right = newNode;

			this.fixRedRed(newNode);
		}
	}

	// Utility function to delete the node with the given value
	deleteByVal(n) {
		if (!this.root)
			return;

		const v = this.search(n);
		if (v.val !== n) {
			document.write("No node found to delete with value: " + n);
			return;
		}

		this.deleteNode(v);
	}

	// Prints inorder of the tree
	printInOrder() {
	
		document.write("<br>Inorder: <br>");
		if (!this.root)
			document.write("Tree is empty");
		else
			this.inorder(this.root);
	}

	// Prints level order of the tree
	printLevelOrder() {
		document.write("<br>Level order: <br>");
		if (!this.root)
			document.write("Tree is empty");
		else
			this.levelOrder(this.root);
		document.write("<br>");
	}
}

const tree = new RBTree();

tree.insert(7);
tree.insert(3);
tree.insert(18);
tree.insert(10);
tree.insert(22);
tree.insert(8);
tree.insert(11);
tree.insert(26);
tree.insert(2);
tree.insert(6);
tree.insert(13);

tree.printInOrder();
tree.printLevelOrder();
document.write("Deleting 18, 11, 3, 10, 22");
tree.deleteByVal(18);
tree.deleteByVal(11);
tree.deleteByVal(3);
tree.deleteByVal(10);
tree.deleteByVal(22);

tree.printInOrder();
tree.printLevelOrder();

// This code is contributed by Susobhan Akhuli
