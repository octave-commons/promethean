import test from 'ava';
import { makeTransformer, applyTransformer } from '@promethean/compiler/transform/transformer.js';

test.skip("replaces spawn('ffmpeg') with await supervisedFfmpeg", (t) => {
    const before = `spawn("ffmpeg", ["-f", "s16le"]);`;
    const after = `await supervisedFfmpeg(["-f", "s16le"]);`;

    const transformer = makeTransformer(before, after);

    const input = `
    function synth() {
      const proc = spawn("ffmpeg", ["-f", "s16le"]);
      return proc;
    }
  `;

    const output = applyTransformer(input, transformer);

    t.true(output.includes('await supervisedFfmpeg(["-f", "s16le"])\n'));
    t.false(output.includes('spawn("ffmpeg")'));
});

// Negative case: other spawns should not be replaced
// ---------------------------------------------------
test.skip("does not replace spawn('sox')", (t) => {
    const before = `spawn("ffmpeg", ["-f", "s16le"]);`;
    const after = `await supervisedFfmpeg(["-f", "s16le"]);`;

    const transformer = makeTransformer(before, after);

    const input = `
    function synth() {
      const proc = spawn("sox", ["-f", "s16le"]);
      return proc;
    }
  `;

    const output = applyTransformer(input, transformer);

    t.true(output.includes('spawn("sox")'));
    t.false(output.includes('supervisedFfmpeg'));
});

// Multiple occurrences should all be replaced
// -------------------------------------------
test.skip("replaces multiple spawn('ffmpeg') calls", (t) => {
    const before = `spawn("ffmpeg", ["-f", "s16le"]);`;
    const after = `await supervisedFfmpeg(["-f", "s16le"]);`;

    const transformer = makeTransformer(before, after);

    const input = `
    function synth() {
      const a = spawn("ffmpeg", ["-f", "s16le"]);
      const b = spawn("ffmpeg", ["-f", "s16le"]);
      return [a, b];
    }
  `;

    const output = applyTransformer(input, transformer);

    const count = (output.match(/supervisedFfmpeg/g) || []).length;
    t.is(count, 2);
});

// Nested occurrences should be replaced too
// -----------------------------------------
test.skip("replaces nested spawn('ffmpeg') calls", (t) => {
    const before = `spawn("ffmpeg", ["-f", "s16le"]);`;
    const after = `await supervisedFfmpeg(["-f", "s16le"]);`;

    const transformer = makeTransformer(before, after);

    const input = `
    function outer() {
      function inner() {
        return spawn("ffmpeg", ["-f", "s16le"]);
      }
      return inner();
    }
  `;

    const output = applyTransformer(input, transformer);

    t.false(output.includes('spawn("ffmpeg")'));
    t.true(output.includes('supervisedFfmpeg'));
});

// Generic transformation cases
// -----------------------------

const cases = [
    {
        name: 'renames foo() to bar()',
        before: `foo();`,
        after: `bar();`,
        input: `function f() { foo(); }`,
        expect: `bar()`,
    },
    {
        name: 'changes literal 42 to 99',
        before: `42;`,
        after: `99;`,
        input: `const x = 42;`,
        expect: `99`,
    },
    {
        name: 'wraps x in log(x)',
        before: `x;`,
        after: `log(x);`,
        input: `const y = x;`,
        expect: `log(x)`,
    },
    {
        name: 'changes + to -',
        before: `a + b;`,
        after: `a - b;`,
        input: `let z = a + b;`,
        expect: `a - b`,
    },
];

for (const { name, before, after, input, expect } of cases) {
    test.skip(name, (t) => {
        const transformer = makeTransformer(before, after);
        const output = applyTransformer(input, transformer);
        t.true(output.includes(expect));
    });
}

// Advanced transformation cases
// -----------------------------
const advancedCases = [
    {
        name: 'inserts debug log before assignment',
        before: `x = 1;`,
        after: `console.log("debug");\n    x = 1;`,
        input: `function f() { x = 1; }`,
        expect: `console.log("debug")`,
    },
    {
        name: 'adds type annotations to function',
        before: `function add(a, b) { return a + b; }`,
        after: `function add(a: number, b: number): number { return a + b; }`,
        input: `function add(a, b) { return a + b; }`,
        expect: `a: number`,
    },
    {
        name: 'replaces if with while',
        before: `if (flag) { doThing(); }`,
        after: `while (flag) { doThing(); }`,
        input: `function f(flag) { if (flag) { doThing(); } }`,
        expect: `while (flag)`,
    },
    {
        name: 'converts class to function',
        before: `class Greeter { greet() { return "hi"; } }`,
        after: `function Greeter() { return { greet: () => "hi" }; }`,
        input: `class Greeter { greet() { return "hi"; } }`,
        expect: `function Greeter()`,
    },
    {
        name: "only rewrites spawn('ffmpeg'), not spawn('sox')",
        before: `spawn("ffmpeg", ["-f", "s16le"]);`,
        after: `await supervisedFfmpeg(["-f", "s16le"]);`,
        input: `function f() { spawn("ffmpeg", ["-f", "s16le"]); spawn("sox", ["-f", "s16le"]); }`,
        expect: `supervisedFfmpeg`,
    },
];

for (const { name, before, after, input, expect } of advancedCases) {
    test.skip(name, (t) => {
        const transformer = makeTransformer(before, after);
        const output = applyTransformer(input, transformer);
        t.true(output.includes(expect));
    });
}
