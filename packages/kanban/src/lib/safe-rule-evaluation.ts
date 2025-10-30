import type { TaskFM } from '../board/types.js';
import type { Board } from '../lib/types.js';

/**
 * Safe task and board validation using NBB + clojure.spec.alpha
 * Calls separate Clojure files for validation logic
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
 * Load Clojure validation module and validate task
 */
export const validateTaskWithZod = async (task: TaskFM): Promise<ValidationResult> => {
  try {
    const { loadString } = await import('nbb');

    // Load the Clojure validation module
    await loadString('(load-file "./src/clojure/validation.clj")', {
      context: 'cljs.user',
      print: () => {},
    });

    // Call the validation function
    const validateFn = (await loadString('promethean.kanban.validation/validate-task', {
      context: 'cljs.user',
      print: () => {},
    })) as (task: TaskFM) => ValidationResult;

    const result = validateFn(task);
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
 * Load Clojure validation module and validate board
 */
export const validateBoardWithZod = async (board: Board): Promise<ValidationResult> => {
  try {
    const { loadString } = await import('nbb');

    // Load the Clojure validation module
    await loadString('(load-file "./src/clojure/validation.clj")', {
      context: 'cljs.user',
      print: () => {},
    });

    // Call the validation function
    const validateFn = (await loadString('promethean.kanban.validation/validate-board', {
      context: 'cljs.user',
      print: () => {},
    })) as (board: Board) => ValidationResult;

    const result = validateFn(board);
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
  dslPath: string,
): Promise<boolean> => {
  const { loadString } = await import('nbb');

  try {
    // Load the DSL file first to establish context
    await loadString(`(load-file "${dslPath}")`, {
      context: 'cljs.user',
      print: () => {},
    });

    // Load the validation module for rule evaluation
    await loadString('(load-file "./src/clojure/validation.clj")', {
      context: 'cljs.user',
      print: () => {},
    });

    // Evaluate the rule implementation to get the function
    const ruleFunction = (await loadString(ruleImpl, {
      context: 'cljs.user',
      print: () => {},
    })) as (task: TaskFM, board: Board) => boolean;

    // Use the validation module's evaluate function
    const evaluateFn = (await loadString('promethean.kanban.validation/evaluate-transition-rule', {
      context: 'cljs.user',
      print: () => {},
    })) as (task: TaskFM, board: Board, ruleFn: (task: TaskFM, board: Board) => boolean) => boolean;

    // Call the evaluation function with the JavaScript objects directly
    const result = evaluateFn(task, board, ruleFunction);

    return Boolean(result);
  } catch (error) {
    throw new Error(
      `Rule evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

export const safeEvaluateTransition = async (
  task: TaskFM,
  board: Board,
  ruleImpl: string,
  dslPath: string,
): Promise<SafeEvaluationResult> => {
  try {
    const validation = await loadAndValidateInputs(task, board);

    if (!validation.success) {
      return {
        success: false,
        validationErrors: validation.validationErrors,
      };
    }

    const result = await evaluateRule(task, board, ruleImpl, dslPath);

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
