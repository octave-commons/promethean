# Tree-sitter Elisp Rewrite Engine

This update introduces a composable rewrite engine for the MCP Emacs Lisp
configuration blocks. The new flow replaces the brittle string munger with a
Tree-sitter backed pipeline that understands comments, trivia, and byte
offsets.

## Modules

- `elisp.read` – now exposes `syntax-tree`, `node->syntax`, and UTF-8 aware
  helpers so we can inspect concrete syntax with offsets for any node.
- `elisp.ast` – a tiny AST/printer layer which turns EDN data structures into
  Elisp forms with stable formatting. It drives both generation and validation.
- `clj_hacks.mcp.elisp` – domain specific helpers for MCP blocks. It can render
  a full `with-eval-after-load` block, splice it into existing source, and run
  post-write validation to confirm the generated block is discoverable again.
- `elisp.mcp` – finds the generated region using the syntax tree $comment +
  `with-eval-after-load` list$ and returns byte-accurate slices for before,
  block, and after segments.
- `clj_hacks.mcp.adapter_elisp` – refactored to consume the new helpers. Read
  still maps the block back into EDN maps, while writing now funnels through
  `clj_hacks.mcp.elisp/rewrite-source` to guarantee validation.

## Validation Flow

1. Parse the original source with Tree-sitter, locating the generated block via
   `elisp.mcp/find-generated-block`.
2. Render the desired block with `clj_hacks.mcp.elisp/render-generated-block`
   (merging HTTP endpoints where needed).
3. Splice the block with `clj_hacks.mcp.elisp/rewrite-source`, which only
   replaces the generated region (or appends it if missing) and reparses the
   result to ensure the block is discoverable and the tree is error free.
4. Adapter tests now exercise the end-to-end rewrite and confirm that fixtures
$$
   can round-trip.
$$
## Usage Notes

- `clj_hacks.mcp.elisp/rewrite-source` returns diagnostics (`:ok?`,
  `:changed?`, `:inserted?`, etc.) so higher level code can decide how to
  surface failures.
- When the adapter receives explicit `:rest {:before ... :after ...}`, it still
  honours those slices to preserve custom prefixes/suffixes; otherwise it falls
  back to rewriting the file contents in-place.
- New unit tests cover AST printing, block discovery, the rewrite engine, and
  adapter integration.
