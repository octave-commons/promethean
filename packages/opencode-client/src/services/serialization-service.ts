// SPDX-License-Identifier: GPL-3.0-only
// Serialization Service - Example service using serializers

import { serializeActionResult } from '../serializers/index.js';
import type { ActionResult } from '../serializers/index.js';
import type { SerializationOptions } from '../serializers/types.js';

/**
 * Service that demonstrates how to use serializers with action results
 */
export class SerializationService {
  /**
   * Serialize any action result to the specified format
   */
  static serializeResult(
    result: ActionResult,
    options: SerializationOptions = { format: 'markdown' },
  ): string {
    return serializeActionResult(result, options);
  }

  /**
   * Example method that processes an action and returns serialized output
   */
  static async processActionResult(
    actionFn: () => Promise<ActionResult>,
    options: SerializationOptions = { format: 'markdown' },
  ): Promise<string> {
    try {
      const result = await actionFn();
      return this.serializeResult(result, options);
    } catch (error) {
      return `Error processing action: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Batch process multiple action results
   */
  static serializeBatch(
    results: ActionResult[],
    options: SerializationOptions = { format: 'markdown' },
  ): string[] {
    return results.map((result) => this.serializeResult(result, options));
  }
}
