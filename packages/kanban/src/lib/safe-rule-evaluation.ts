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

// Cache loaded validation functions
interface ValidationFunctions {
  validateTask: (task: unknown) => unknown;
  validateBoard: (board: unknown) => unknown;
  evaluateTransitionRule: (task: unknown, board: unknown, ruleFn: Function) => boolean;
}

const validationFunctionsCache: { current: ValidationFunctions | null } = { current: null };

const loadValidationFunctions = async (): Promise<ValidationFunctions> => {
  if (validationFunctionsCache.current) return validationFunctionsCache.current;

  try {
    const { loadFile } = await import('nbb');
    const path = await import('path');
    const url = await import('url');

    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const validationPath = path.resolve(__dirname, '../clojure/validation.clj');
    const functions = (await loadFile(validationPath)) as Record<string, Function>;

    if (
      !functions['validate-task'] ||
      !functions['validate-board'] ||
      !functions['evaluate-transition-rule']
    ) {
      throw new Error('Required validation functions not found in validation.clj');
    }

    validationFunctionsCache.current = {
      validateTask: functions['validate-task'] as (task: unknown) => unknown,
      validateBoard: functions['validate-board'] as (board: unknown) => unknown,
      evaluateTransitionRule: functions['evaluate-transition-rule'] as (
        task: unknown,
        board: unknown,
        ruleFn: Function,
      ) => boolean,
    };

    return validationFunctionsCache.current;
  } catch (error) {
    throw new Error(
      `Failed to load validation functions: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

/**
 * Load Clojure validation module and validate task
 */
export const validateTaskWithZod = async (task: TaskFM): Promise<ValidationResult> => {
  try {
    const { validateTask } = await loadValidationFunctions();

    const taskObj = {
      title: task.title,
      priority: task.priority,
      status: task.status,
      uuid: task.uuid,
      estimates: { complexity: task.estimates?.complexity ?? 0 },
      labels: task.labels || [],
    };

    const validationResult = validateTask(taskObj);
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
    const { validateBoard } = await loadValidationFunctions();

    const boardObj = {
      columns: board.columns.map((col) => ({
        name: col.name,
        limit: col.limit === null ? null : (col.limit ?? 0),
        tasks: col.tasks || [],
        count: col.count ?? (col.tasks ? col.tasks.length : 0),
      })),
    };

    const validationResult = validateBoard(boardObj);
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
      validationErrors: [...(taskValidation.errors ?? []), ...(boardValidation.errors ?? [])],
    };
  }

  return { success: true, validationErrors: [] };
};

const loadClojureContext = async (dslPath: string): Promise<void> => {
  const { loadString } = await import('nbb');
  const fs = await import('fs');
  const path = await import('path');
  const url = await import('url');

  // Load the validation file content first
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const validationPath = path.resolve(__dirname, '../clojure/validation.clj');
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
};

const evaluateDirectFunctionCall = async (
  task: TaskFM,
  board: Board,
  ruleImpl: string,
): Promise<boolean> => {
  const { loadString } = await import('nbb');
  const { evaluateResolvedFunction } = await loadValidationFunctions();

  const functionMatch = ruleImpl.match(/\(([^ ]+)\s+"([^"]+)"\s+"([^"]+)"/);
  if (!functionMatch) {
    throw new Error('Invalid function call format');
  }

  const namespaceAndFunction = functionMatch[1];

  if (!namespaceAndFunction) {
    throw new Error('Could not parse function name from rule implementation');
  }

  // Resolve the function inside the Clojure context
  const resolveForm = `(resolve '${namespaceAndFunction}')`;
  const resolveResult: unknown = await loadString(resolveForm, {
    context: 'cljs.user',
    print: () => {},
  });

  if (!resolveResult) {
    throw new Error(`Function ${namespaceAndFunction} not found in DSL`);
  }

  // Use the new helper that properly handles resolved functions with dependency injection
  const result = evaluateResolvedFunction(task, board, resolveResult as Function);
  return Boolean(result);
};

const evaluateFunctionDefinition = async (
  task: TaskFM,
  board: Board,
  ruleImpl: string,
): Promise<boolean> => {
  const { loadString } = await import('nbb');
  const { evaluateTransitionRule } = await loadValidationFunctions();

  const ruleFn: unknown = await loadString(`(${ruleImpl})`, {
    context: 'cljs.user',
    print: () => {},
  });

  // Call the evaluateTransitionRule function directly with JavaScript objects
  const result = (
    evaluateTransitionRule as (task: TaskFM, board: Board, ruleFn: Function) => boolean
  )(task, board, ruleFn as Function);
  return Boolean(result);
};

const evaluateRule = async (
  task: TaskFM,
  board: Board,
  ruleImpl: string,
  dslPath: string,
): Promise<boolean> => {
  try {
    console.log('evaluateRule called with:', { ruleImpl, dslPath });
    await loadClojureContext(dslPath);

    // Check if ruleImpl is a direct function call or a function definition
    if (ruleImpl.trim().startsWith('(evaluate-transition')) {
      console.log('Using evaluateDirectFunctionCall path');
      return await evaluateDirectFunctionCall(task, board, ruleImpl);
    }

    // Function definition - wrap it and call with evaluateTransitionRule
    console.log('Using evaluateFunctionDefinition path');
    return await evaluateFunctionDefinition(task, board, ruleImpl);
  } catch (error) {
    console.error('Error in evaluateRule:', error);
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
    console.error('Error in evaluateRule:', error);
    return {
      success: false,
      validationErrors: [],
      evaluationError: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
