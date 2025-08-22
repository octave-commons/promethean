import ts from 'typescript';

/** Utility: deep structural equality check of AST nodes */
function astEquals(a: ts.Node, b: ts.Node): boolean {
    if (a.kind !== b.kind) return false;
    const aChildren = a.getChildren();
    const bChildren = b.getChildren();
    if (aChildren.length !== bChildren.length) return false;
    return aChildren.every((child, i) => astEquals(child, bChildren[i]));
}

/** Create a transformer that replaces all occurrences of `before` with `after` */
export function makeTransformer(beforeCode: string, afterCode: string): ts.TransformerFactory<ts.SourceFile> {
    const beforeFile = ts.createSourceFile('before.ts', beforeCode, ts.ScriptTarget.Latest, true);
    const afterFile = ts.createSourceFile('after.ts', afterCode, ts.ScriptTarget.Latest, true);

    // assume top-level first statement is the pattern
    const beforeNode = beforeFile.statements[0];
    const afterNode = afterFile.statements[0];

    return (context) => {
        const visit: ts.Visitor = (node) => {
            if (astEquals(node, beforeNode)) {
                return afterNode; // replace
            }
            return ts.visitEachChild(node, visit, context);
        };
        return (sf: ts.SourceFile): ts.SourceFile => ts.visitEachChild(sf, visit, context);
    };
}

/** Apply a generated transformer to source code */
export function applyTransformer(code: string, transformer: ts.TransformerFactory<ts.SourceFile>): string {
    const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);
    const result = ts.transform(sourceFile, [transformer]);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return printer.printFile(result.transformed[0]);
}
