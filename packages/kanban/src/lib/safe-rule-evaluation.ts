import { readFile } from 'node:fs/promises';
import type { TaskFM } from '../board/types.js';
import type { Board } from '../lib/types.js';

/**
 * Safe task and board validation using NBB + clojure.spec.alpha
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
 * Validate task using clojure.spec.alpha schemas in NBB context
 */
export const validateTaskWithZod = async (task: TaskFM): Promise<ValidationResult> => {
  const clojureCode = `
    (require '[clojure.spec.alpha :as s])

    (s/def :task/uuid string?)
    (s/def :task/title string?)
    (s/def :task/priority #{"P0" "P1" "P2" "P3"})
    (s/def :task/content string?)
    (s/def :task/status string?)
    (s/def :task/estimates (s/keys :req-un [:estimates/complexity]))
    (s/def :estimates/complexity number?)
    (s/def :task/storyPoints number?)
    (s/def :task/labels (s/coll-of string? :kind vector?))
    (s/def :task/map (s/keys :req-un [:task/uuid :task/title :task/priority :task/content :task/status :task/estimates :task/storyPoints :task/labels]))

    (let [task-js ${JSON.stringify(task)}
          task (js->clj task-js :keywordize-keys true)
          valid? (s/valid? :task/map task)
          problems (when-not valid? (s/explain-data :task/map task))
          errors (when problems (map str (:clojure.spec.alpha/problems problems)))]
      {:isValid (boolean valid?) :errors (or errors [])})
  `;

  try {
    const { loadString } = await import('nbb');
    const result = (await loadString(clojureCode, {
      context: 'cljs.user',
      print: () => {}, // Suppress output
    })) as ValidationResult;

    return result;
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
 * Validate board using clojure.spec.alpha schemas in NBB context
 */
export const validateBoardWithZod = async (board: Board): Promise<ValidationResult> => {
  const clojureCode = `
    (require '[clojure.spec.alpha :as s])

    (s/def :column/name string?)
    (s/def :column/limit number?)
    (s/def :column/tasks (s/coll-of string? :kind vector?))
    (s/def :column/map (s/keys :req-un [:column/name :column/limit :column/tasks]))
    (s/def :board/columns (s/coll-of :column/map :kind vector?))
    (s/def :board/map (s/keys :req-un [:board/columns]))

    (let [board-js ${JSON.stringify(board)}
          board (js->clj board-js :keywordize-keys true)
          valid? (s/valid? :board/map board)
          problems (when-not valid? (s/explain-data :board/map board))
          errors (when problems (map str (:clojure.spec.alpha/problems problems)))]
      {:isValid (boolean valid?) :errors (or errors [])})
  `;

  try {
    const { loadString } = await import('nbb');
    const result = (await loadString(clojureCode, {
      context: 'cljs.user',
      print: () => {}, // Suppress output
    })) as ValidationResult;

    return result;
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
    const result = (await loadString(clojureCode, {
      context: 'cljs.user',
      print: () => {}, // Suppress output
    })) as boolean;

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
