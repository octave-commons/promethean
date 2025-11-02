/**
 * Card Factory
 *
 * Functional equivalent of card constructors.
 * Creates card objects with dependencies injected.
 */

import type { Card } from '../actions/types/index.js';

export interface CardFactoryDependencies {
  /** Logger function for debugging */
  logger?: (message: string) => void;
  /** UUID generator function */
  generateId?: () => string;
  /** Default priority if none specified */
  defaultPriority?: string;
}

export interface CreateCardInput {
  /** Card text content */
  text: string;
  /** Whether card is done */
  done?: boolean;
  /** Card tags */
  tags?: string[];
  /** Card links */
  links?: string[];
  /** Card attributes */
  attrs?: Record<string, string>;
  /** Existing card ID (for updates) */
  id?: string;
}

/**
 * Create a new card with factory dependencies
 */
export const createCard = (
  input: CreateCardInput,
  dependencies: CardFactoryDependencies = {},
): Card => {
  const { logger, generateId = () => crypto.randomUUID() } = dependencies;
  const { text, done = false, tags = [], links = [], attrs = {}, id } = input;

  logger?.(`Creating card: ${text}`);

  return {
    id: id || generateId(),
    text,
    done,
    tags,
    links,
    attrs,
  };
};

/**
 * Create a card from task data
 */
export const createCardFromTask = (
  task: {
    uuid: string;
    title: string;
    content?: string;
    priority?: string;
    labels?: string[];
    metadata?: Record<string, unknown>;
  },
  dependencies: CardFactoryDependencies = {},
): Card => {
  const { logger } = dependencies;

  logger?.(`Creating card from task: ${task.title}`);

  return createCard(
    {
      id: task.uuid,
      text: task.content || task.title,
      tags: task.labels || [],
      attrs: task.metadata
        ? Object.fromEntries(Object.entries(task.metadata).map(([k, v]) => [k, String(v)]))
        : {},
    },
    dependencies,
  );
};
