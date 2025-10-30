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
 * Normalize raw Clojure validation result to stable ValidationResult shape
 */
const normalizeValidationResult = (raw: unknown): ValidationResult => {
  if (typeof raw === 'boolean') {
    return { isValid: raw, errors: [] };
  }
  if (typeof raw === 'string') {
    return { isValid: false, errors: [raw] };
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const isValid = Boolean(obj.isValid ?? obj.valid ?? true);
    const errors = Array.isArray(obj.errors) ? (obj.errors as unknown[]).map(String) : [];
    return { isValid, errors };
  }
  // Fallback for unexpected types
  return { isValid: false, errors: [] };
};

/**
 * Load Clojure validation module and validate task
 */
export const validateTaskWithZod = async (task: TaskFM): Promise<ValidationResult> => {
  try {
    const { loadString } = await import('nbb');
    const fs = await import('fs');
    const path = await import('path');

    // Read and load the Clojure validation file content
    const validationPath = path.resolve('./src/clojure/validation.clj');
    const validationContent = fs.readFileSync(validationPath, 'utf8');

    await loadString(validationContent, {
      context: 'cljs.user',
      print: () => {},
    });

    // Call the validation function with JS object syntax
    const taskObj = {
      title: task.title,
      priority: task.priority,
      status: task.status,
      uuid: task.uuid,
      estimates: { complexity: task.estimates?.complexity || 0 },
      labels: task.labels || [],
    };
    const validationResult = await loadString(
      '(promethean.kanban.validation/validate-task taskObj)',
      {
        context: 'cljs.user',
        print: () => {},
      },
    );

    return normalizeValidationResult(validationResult);
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
    const fs = await import('fs');
    const path = await import('path');

    // Read and load the Clojure validation file content
    const validationPath = path.resolve('./src/clojure/validation.clj');
    const validationContent = fs.readFileSync(validationPath, 'utf8');

    await loadString(validationContent, {
      context: 'cljs.user',
      print: () => {},
    });

    // Convert board columns to Clojure format
    const columnsClojure = board.columns
      .map(
        (col) =>
          `#js {:name "${col.name}" :limit ${col.limit === null ? null : col.limit || 0} :tasks #js []}`,
      )
      .join(' ');

    // Call the validation function with JS object syntax
    const validationResult = await loadString(
      '(promethean.kanban.validation/validate-board #js {:columns #js [' + columnsClojure + ']})',
      {
        context: 'cljs.user',
        print: () => {},
      },
    );

    return normalizeValidationResult(validationResult);
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
  const fs = await import('fs');
  const path = await import('path');

  try {
    // Load the validation file content first
    const validationPath = path.resolve('./src/clojure/validation.clj');
    const validationContent = fs.readFileSync(validationPath, 'utf8');

    await loadString(validationContent, {
      context: 'cljs.user',
      print: () => {},
    });

    // Load DSL file content if provided
    if (dslPath && fs.existsSync(dslPath)) {
      const dslContent = fs.readFileSync(dslPath, 'utf8');
      await loadString(dslContent, {
        context: 'cljs.user',
        print: () => {},
      });
    }

    // Create task and board objects in Clojure format
    const taskClojure = `#js {:title "${task.title}" :priority "${task.priority}" :status "${task.status}" :uuid "${task.uuid}" :estimates #js {:complexity ${task.estimates?.complexity || 0}} :labels #js [${task.labels?.map((l) => '"' + l + '"').join(' ') || ''}]}`;

    const columnsClojure = board.columns
      .map((col) => `#js {:name "${col.name}" :limit ${col.limit || 'null'} :tasks #js []}`)
      .join(' ');
    const boardClojure = `#js {:columns #js [${columnsClojure}]}`;

    // Evaluate the rule directly with the Clojure objects
    const result = await loadString(`(${ruleImpl} ${taskClojure} ${boardClojure})`, {
      context: 'cljs.user',
      print: () => {},
    });

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
