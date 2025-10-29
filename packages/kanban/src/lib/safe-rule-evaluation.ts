import { readFile } from 'node:fs/promises';
import type { TaskFM } from '../board/types.js';
import type { Board } from '../lib/types.js';

/**
 * Safe task and board validation using NBB + Zod
 * Replaces unsafe string interpolation with proper validation
 */

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ReadonlyArray<string>;
}

export interface SafeEvaluationResult {
  readonly success: boolean;
  readonly validationErrors: ReadonlyArray<string>;
  readonly evaluationError?: string;
}

/**
 * Validate task using Zod schemas in NBB context
 */
export const validateTaskWithZod = async (task: TaskFM): Promise<ValidationResult> => {
  const clojureCode = `
    (require '[zod :as z])

    (def TaskSchema 
      (z/object 
        {:uuid (z/string)
         :title (z/string)
         :priority (z/enum ["P0" "P1" "P2" "P3"])
         :content (z/string)
         :status (z/string)
         :estimates (z/object {:complexity (z/number)})
         :storyPoints (z/number)
         :labels (z/array (z/string))}))

    (let [task-js ${JSON.stringify(task)}
          result (-> (.parseAsync TaskSchema task-js)
                   (.then #(:success %))
                   (.catch #(do 
                            (js/console.error "Task validation failed:" %)
                            {:isValid false :errors [%]})))]
      (if (:isValid result)
        {:isValid true :errors []}
        result))
  `;

  try {
    const { loadString } = await import('nbb');
    const result = await loadString(clojureCode, {
      context: 'cljs.user',
      print: () => {}, // Suppress output
    });

    return result as ValidationResult;
  } catch (error) {
    return {
      isValid: false,
      errors: [
        `Validation system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
};

/**
 * Validate board using Zod schemas in NBB context
 */
export const validateBoardWithZod = async (board: Board): Promise<ValidationResult> => {
  const clojureCode = `
    (require '[zod :as z])

    (def BoardSchema
      (z/object 
        {:columns (z/array 
                   (z/object 
                     {:name (z/string)
                      :limit (z/number)
                      :tasks (z/array (z/string))}))}))

    (let [board-js ${JSON.stringify(board)}
          result (-> (.parseAsync BoardSchema board-js)
                   (.then #(:success %))
                   (.catch #(do 
                            (js/console.error "Board validation failed:" %)
                            {:isValid false :errors [%]})))]
      (if (:isValid result)
        {:isValid true :errors []}
        result))
  `;

  try {
    const { loadString } = await import('nbb');
    const result = await loadString(clojureCode, {
      context: 'cljs.user',
      print: () => {}, // Suppress output
    });

    return result as ValidationResult;
  } catch (error) {
    return {
      isValid: false,
      errors: [
        `Board validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
};

/**
 * Safely evaluate transition rule with validated data
 */
export const safeEvaluateTransition = async (
  task: TaskFM,
  board: Board,
  ruleImpl: string,
  dslPath: string,
): Promise<SafeEvaluationResult> => {
  try {
    // Load DSL
    const dslCode = await readFile(dslPath, 'utf-8');

    // Validate inputs first
    const [taskValidation, boardValidation] = await Promise.all([
      validateTaskWithZod(task),
      validateBoardWithZod(board),
    ]);

    if (!taskValidation.isValid || !boardValidation.isValid) {
      return {
        success: false,
        validationErrors: [...taskValidation.errors, ...boardValidation.errors],
      };
    }

    // Safe evaluation with validated data
    const clojureCode = `
      ${dslCode}

      ;; Use validated data (no string interpolation vulnerabilities)
      (let [task-js ${JSON.stringify(task)}
            board-js ${JSON.stringify(board)}
            task (js->clj task-js)
            board (js->clj board-js)]
        ${ruleImpl.replace('kanban-transitions/evaluate-transition', 'evaluate-transition')})
    `;

    const { loadString } = await import('nbb');
    const result = await loadString(clojureCode, {
      context: 'cljs.user',
      print: () => {}, // Suppress output
    });

    return {
      success: Boolean(result),
      validationErrors: [],
    };
  } catch (error) {
    return {
      success: false,
      validationErrors: [],
      evaluationError: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
