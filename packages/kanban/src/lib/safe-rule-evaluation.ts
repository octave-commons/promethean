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
  try {
    const { loadString } = await import('nbb');

    // Create validation function that takes task as JS object
    const validationFn = (await loadString(
      `
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

      (fn [task-js]
        (let [task (js->clj task-js :keywordize-keys true)
              valid? (s/valid? :task/map task)
              problems (when-not valid? (s/explain-data :task/map task))
              errors (when problems ["Task validation failed - see debug info for details"])
              debug-info (when problems (pr-str problems))]
          {:isValid (boolean valid?) :errors (or errors ["No specific errors"]) :debugInfo debug-info}))
    `,
      {
        context: 'cljs.user',
        print: () => {}, // Suppress output
      },
    )) as (task: TaskFM) => ValidationResult;

    // Convert ClojureScript result back to JavaScript
    const cljResult = validationFn(task);
    const jsResult = (await loadString(
      `
      (fn [result] (clj->js result))
    `,
      {
        context: 'cljs.user',
        print: () => {},
      },
    )) as (result: unknown) => ValidationResult;

    const result = jsResult(cljResult);
    console.log('Debug - task validation result:', JSON.stringify(result, null, 2));
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
  try {
    const { loadString } = await import('nbb');

    // Create validation function that takes board as JS object
    const validationFn = (await loadString(
      `
      (require '[clojure.spec.alpha :as s])

      (s/def :column/name string?)
      (s/def :column/limit number?)
      (s/def :column/tasks (s/coll-of string? :kind vector?))
      (s/def :column/map (s/keys :req-un [:column/name :column/limit :column/tasks]))
      (s/def :board/columns (s/coll-of :column/map :kind vector?))
      (s/def :board/map (s/keys :req-un [:board/columns]))

      (fn [board-js]
        (let [board (js->clj board-js :keywordize-keys true)
              valid? (s/valid? :board/map board)
              problems (when-not valid? (s/explain-data :board/map board))
              errors (when problems ["Board validation failed - see debug info for details"])
              debug-info (when problems (pr-str problems))]
          {:isValid (boolean valid?) :errors (or errors ["No specific errors"]) :debugInfo debug-info}))
    `,
      {
        context: 'cljs.user',
        print: () => {}, // Suppress output
      },
    )) as (board: Board) => ValidationResult;

    // Convert ClojureScript result back to JavaScript
    const cljResult = validationFn(board);
    const jsResult = (await loadString(
      `
      (fn [result] (clj->js result))
    `,
      {
        context: 'cljs.user',
        print: () => {},
      },
    )) as (result: unknown) => ValidationResult;

    const result = jsResult(cljResult);
    console.log('Debug - board validation result:', JSON.stringify(result, null, 2));
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
const loadAndValidateInputs = async (
  task: TaskFM,
  board: Board,
): Promise<{ success: boolean; validationErrors: ReadonlyArray<string> }> => {
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

  return { success: true, validationErrors: [] };
};

const evaluateRule = async (
  task: TaskFM,
  board: Board,
  ruleImpl: string,
  dslCode: string,
): Promise<boolean> => {
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

  return Boolean(result);
};

export const safeEvaluateTransition = async (
  task: TaskFM,
  board: Board,
  ruleImpl: string,
  dslPath: string,
): Promise<SafeEvaluationResult> => {
  try {
    const dslCode = await readFile(dslPath, 'utf-8');
    const validation = await loadAndValidateInputs(task, board);

    if (!validation.success) {
      return {
        success: false,
        validationErrors: validation.validationErrors,
      };
    }

    const result = await evaluateRule(task, board, ruleImpl, dslCode);

    return {
      success: result,
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
