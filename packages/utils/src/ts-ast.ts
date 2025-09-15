import ts from "typescript";
import type { ReadonlyDeep } from "type-fest";

/**
 * Extracts concatenated JSDoc comments from a node, if any.
 */
export function getJsDocText(node: ReadonlyDeep<ts.Node>): string | undefined {
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
export function getNodeText(src: string, node: ReadonlyDeep<ts.Node>): string {
  return src.slice(node.getFullStart(), node.getEnd());
}

/**
 * Converts a position in a SourceFile to a 1-based line number.
 */
export function posToLine(
  sf: ReadonlyDeep<ts.SourceFile>,
  pos: number,
): number {
  const { line } = sf.getLineAndCharacterOfPosition(pos);
  return line + 1;
}
