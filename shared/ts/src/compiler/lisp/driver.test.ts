import test from 'ava';
import { runLisp } from './driver';

test('lisp: basic arithmetic', (t) => {
    t.is(runLisp('(+ 2 40)'), 42);
});

test('lisp: macro expansion', (t) => {
    const src = `
    (defmacro twice (x)
      \`(+ ,x ,x))
    (twice 21)
  `;
    t.is(runLisp(src), 42);
});

test('lisp: class definition and method call', (t) => {
    const src = `
    (defclass Point (x y)
      ((sum () (+ (get this x) (get this y)))))
    (let1 p (new Point 1 2)
      (call p sum))
  `;
    t.is(runLisp(src), 3);
});
