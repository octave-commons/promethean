/**
 * Card types for kanban functional architecture
 * Extracted from @packages/markdown/src/kanban.ts
 */

export type Attrs = Readonly<Record<string, string>>;

export type Card = {
  readonly id: string;
  readonly text: string;
  readonly done: boolean;
  readonly tags: readonly string[];
  readonly links: readonly string[];
  readonly attrs: Attrs;
};

export type Column = {
  readonly name: string;
  readonly _headingIndex: number;
};

export type BoardFrontmatter = Readonly<Record<string, unknown>>;

export type KanbanSettings = Readonly<Record<string, unknown>>;

// Internal types for parsing
export type ColumnState = {
  readonly name: string;
  readonly cards: readonly Card[];
};

export type BoardState = {
  readonly columns: readonly ColumnState[];
  readonly frontmatter: BoardFrontmatter;
  readonly settings: KanbanSettings | null;
};

export type ParseAcc = {
  readonly columns: readonly ColumnState[];
  readonly current: ColumnState | undefined;
  readonly pendingCardIndex: number | undefined;
};

// Card action types
export type CreateCardInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings | null;
  };
  readonly columnName: string;
  readonly card: Partial<Card> & { readonly text: string };
};

export type CreateCardOutput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings | null;
  };
  readonly cardId: string;
};

export type RemoveCardInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings | null;
  };
  readonly columnName: string;
  readonly cardId: string;
};

export type RemoveCardOutput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings | null;
  };
};

export type MoveCardInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings | null;
  };
  readonly cardId: string;
  readonly fromColumn: string;
  readonly toColumn: string;
  readonly toIndex?: number;
};

export type MoveCardOutput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings | null;
  };
};

export type UpdateCardInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
  readonly cardId: string;
  readonly patch: Partial<Omit<Card, 'id'>>;
};

export type UpdateCardOutput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings | null;
  };
};

export type FindCardsInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
  readonly columnName: string;
};

export type FindCardsOutput = {
  readonly cards: readonly Card[];
};

export type CardSearchResult = {
  readonly column: string;
  readonly card: Card;
};
