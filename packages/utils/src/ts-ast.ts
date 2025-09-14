import ts from "typescript";

/**
 * Extracts concatenated JSDoc comments from a node, if any.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function getJsDocText(node: Readonly<ts.Node>): string | undefined {
  const jsdocs = ts.getJSDocCommentsAndTags(node);
  if (!jsdocs?.length) return undefined;
  const texts = jsdocs
    .map((d) =>
      "comment" in d && typeof d.comment === "string" ? d.comment : undefined,
    )
    .filter((c): c is string => Boolean(c));
  return texts.join("\n\n").trim() || undefined;
}

/**
 * Returns the source text for a node from the given source string.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function getNodeText(src: string, node: Readonly<ts.Node>): string {
  return src.slice(node.getFullStart(), node.getEnd());
}

/**
 * Converts a position in a SourceFile to a 1-based line number.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function posToLine(sf: Readonly<ts.SourceFile>, pos: number): number {
  const { line } = sf.getLineAndCharacterOfPosition(pos);
  return line + 1;
}
