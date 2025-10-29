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
  /** Card title */
  title: string;
  /** Card content/description */
  content?: string;
  /** Card priority */
  priority?: string;
  /** Card labels */
  labels?: string[];
  /** Card metadata */
  metadata?: Record<string, unknown>;
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
  const { logger, generateId = () => crypto.randomUUID(), defaultPriority = 'medium' } = dependencies;
  const { title, content, priority = defaultPriority, labels = [], metadata = {}, id } = input;

  logger?.(`Creating card: ${title}`);

  return {
    id: id || generateId(),
    title,
    content: content || '',
    priority,
    labels,
    metadata,
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
      title: task.title,
      content: task.content,
      priority: task.priority,
      labels: task.labels,
      metadata: task.metadata,
    },
    dependencies,
  );
};