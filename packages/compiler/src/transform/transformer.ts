// SPDX-License-Identifier: GPL-3.0-only
import ts from 'typescript';

// Structural pattern matching with extended wildcard support
// Identifiers named '_' match anything
// Identifiers starting with '_' match whole subtrees (like _args, _body)
function matchPattern(node: ts.Node, pattern: ts.Node): boolean {
    if (pattern.kind === ts.SyntaxKind.Identifier) {
        const name = (pattern as ts.Identifier).text;
        if (name === '_') return true; // universal wildcard
        if (name.startsWith('_')) return true; // subtree wildcard
    }

    if (node.kind !== pattern.kind) return false;

    switch (node.kind) {
        case ts.SyntaxKind.Identifier:
            return (pattern as ts.Identifier).text === (node as ts.Identifier).text;
        case ts.SyntaxKind.StringLiteral:
            return (pattern as ts.StringLiteral).text === (node as ts.StringLiteral).text;
        case ts.SyntaxKind.NumericLiteral:
            return (pattern as ts.NumericLiteral).text === (node as ts.NumericLiteral).text;
        case ts.SyntaxKind.BinaryExpression:
            const nbe = node as ts.BinaryExpression;
            const pbe = pattern as ts.BinaryExpression;
            return (
                nbe.operatorToken.kind === pbe.operatorToken.kind &&
                matchPattern(nbe.left, pbe.left) &&
                matchPattern(nbe.right, pbe.right)
            );
        case ts.SyntaxKind.CallExpression:
            const nce = node as ts.CallExpression;
            const pce = pattern as ts.CallExpression;
            if (!matchPattern(nce.expression, pce.expression)) return false;
            if (
                pce.arguments.length === 1 &&
                ts.isIdentifier(pce.arguments[0]) &&
                (pce.arguments[0] as ts.Identifier).text.startsWith('_')
            ) {
                // wildcard argument list
                return true;
            }
            if (nce.arguments.length !== pce.arguments.length) return false;
            return nce.arguments.every((arg, i) => matchPattern(arg, pce.arguments[i]));
        case ts.SyntaxKind.Block:
            const nb = node as ts.Block;
            const pb = pattern as ts.Block;
            if (
                pb.statements.length === 1 &&
                ts.isIdentifier(pb.statements[0].getChildAt(0)) &&
                (pb.statements[0].getChildAt(0) as ts.Identifier).text.startsWith('_')
            ) {
                // wildcard body
                return true;
            }
            if (nb.statements.length !== pb.statements.length) return false;
            return nb.statements.every((stmt, i) => matchPattern(stmt, pb.statements[i]));
        default:
            return node.getText() === pattern.getText();
    }
}

// Rule: when pattern matches, replace with after AST
interface Rule {
    before: ts.Node;
    after: ts.Node[];
}

export function makeTransformer(before: string, after: string) {
    const beforeSource = ts.createSourceFile('before.ts', before, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const afterSource = ts.createSourceFile('after.ts', after, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    const rules: Rule[] = [];

    // Collect single top-level diff rule
    const beforeNodes = beforeSource.statements;
    const afterNodes = afterSource.statements;

    if (beforeNodes.length > 0) {
        rules.push({ before: beforeNodes[0], after: afterNodes.length ? [...afterNodes] : [] });
    }

    return (source: string) => {
        const src = ts.createSourceFile('input.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

        const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
            const visit: ts.Visitor = (node) => {
                for (const rule of rules) {
                    if (matchPattern(node, rule.before)) {
                        if (rule.after.length === 1) {
                            return rule.after[0];
                        } else if (rule.after.length > 1) {
                            // handled at parent level
                            return rule.after as unknown as ts.Node;
                        } else {
                            return ts.factory.createEmptyStatement();
                        }
                    }
                }
                return ts.visitEachChild(node, visit, context);
            };

            const fileVisitor = (sf: ts.SourceFile): ts.SourceFile => {
                const newStatements: ts.Statement[] = [];
                sf.statements.forEach((stmt) => {
                    const replaced = visit(stmt);
                    if (Array.isArray(replaced)) {
                        newStatements.push(...(replaced as ts.Statement[]));
                    } else if (replaced) {
                        newStatements.push(replaced as ts.Statement);
                    }
                });
                return ts.factory.updateSourceFile(sf, newStatements);
            };

            return fileVisitor;
        };

        const result = ts.transform(src, [transformer]);
        const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
        return printer.printFile(result.transformed[0]);
    };
}

export function applyTransformer(source: string, transformer: (src: string) => string) {
    return transformer(source);
}
