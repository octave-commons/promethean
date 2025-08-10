import { estreeProgramToLisp, type Js2LispOptions } from "./js-ast2lisp";
import { printS } from "./print";

export async function jsToLisp(
  src: string,
  opts: Js2LispOptions & { tryAcorn?: boolean } = {},
) {
  let Program: any = null;

  if (opts.tryAcorn !== false) {
    try {
      // Lazy import acorn if available in your environment/bundler
      const acorn = await import(/* @vite-ignore */ "acorn");
      Program = (acorn as any).parse(src, {
        ecmaVersion: "latest",
        sourceType: "module",
      });
    } catch (_) {
      // no acorn; fall through
    }
  }

  if (!Program) {
    throw new Error(
      "No parser available. Install 'acorn' or pass an ESTree Program AST to estreeProgramToLisp()",
    );
  }

  const forms = estreeProgramToLisp(Program, { foldLetInits: true, ...opts });
  const text = forms.map((f) => printS(f, { indent: 2 })).join("\n");
  return { forms, text };
}
