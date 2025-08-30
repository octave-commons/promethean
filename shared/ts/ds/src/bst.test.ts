import test from 'ava';
import { AVLTree } from './bst';

test('AVLTree: basic operations', (t) => {
    const tree = new AVLTree<number, string>();
    tree.set(5, 'e');
    tree.set(2, 'b');
    tree.set(8, 'h');
    tree.set(3, 'c');
    tree.set(7, 'g');

    t.is(tree.get(3), 'c');
    t.deepEqual(tree.firstEntry(), [2, 'b']);
    t.deepEqual(tree.lastEntry(), [8, 'h']);
    t.deepEqual(tree.floor(6), [5, 'e']);
    t.deepEqual(tree.ceil(6), [7, 'g']);
    t.is(tree.rank(7), 3);
    t.deepEqual(tree.select(2), [5, 'e']);
    t.deepEqual(
        [...tree.range(3, 7)],
        [
            [3, 'c'],
            [5, 'e'],
            [7, 'g'],
        ],
    );
    t.deepEqual(
        [...tree],
        [
            [2, 'b'],
            [3, 'c'],
            [5, 'e'],
            [7, 'g'],
            [8, 'h'],
        ],
    );
    tree.validate();
});
