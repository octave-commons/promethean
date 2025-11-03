import { z } from 'zod';

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
  readonly value?: unknown;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ReadonlyArray<ValidationError>;
  readonly data?: unknown;
}

export interface Validator<T = unknown> {
  validate(data: unknown): ValidationResult;
  parse(data: unknown): T;
  safeParse(data: unknown): { success: true; data: T } | { success: false; error: ValidationError };
}

export interface ValidationRule {
  readonly name: string;
  readonly validator: (value: unknown) => boolean | string;
  readonly message?: string;
  readonly required?: boolean;
}

export interface SchemaValidator<T = unknown> extends Validator<T> {
  readonly schema: z.ZodSchema<T>;
  transform<R>(transformer: (data: T) => R): SchemaValidator<R>;
  withRule(rule: ValidationRule): SchemaValidator<T>;
  optional(): SchemaValidator<T | undefined>;
  nullable(): SchemaValidator<T | null>;
}

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
  value: z.unknown().optional(),
});

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(ValidationErrorSchema),
  data: z.unknown().optional(),
});

export const ValidationRuleSchema = z.object({
  name: z.string(),
  validator: z.function(),
  message: z.string().optional(),
  required: z.boolean().optional(),
});

export function createValidationError(
  field: string,
  message: string,
  code: string,
  value?: unknown,
): ValidationError {
  return { field, message, code, value };
}

export function createValidationResult(
  isValid: boolean,
  errors: ReadonlyArray<ValidationError>,
  data?: unknown,
): ValidationResult {
  return { isValid, errors, data };
}

export function createSchemaValidator<T>(schema: z.ZodSchema<T>): SchemaValidator<T> {
  return {
    schema,
    validate: (data: unknown): ValidationResult => {
      const result = schema.safeParse(data);
      if (result.success) {
        return createValidationResult(true, [], result.data);
      }

      const errors = result.error.issues.map((issue) =>
        createValidationError(
          issue.path.join('.'),
          issue.message,
          issue.code,
          (issue as { received?: unknown }).received,
        ),
      );

      return createValidationResult(false, errors);
    },

    parse: (data: unknown): T => {
      return schema.parse(data);
    },

    safeParse: (data: unknown) => {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      }

      return {
        success: false,
        error: createValidationError('root', result.error.message, 'VALIDATION_ERROR', data),
      };
    },

    transform: <R>(transformer: (data: T) => R): SchemaValidator<R> => {
      return createSchemaValidator(schema.transform(transformer) as unknown as z.ZodSchema<R>);
    },

    withRule: (rule: ValidationRule): SchemaValidator<T> => {
      const refinedSchema = schema.refine(rule.validator, {
        message: rule.message || `Validation failed for ${rule.name}`,
      });
      return createSchemaValidator(refinedSchema);
    },

    optional: (): SchemaValidator<T | undefined> => {
      return createSchemaValidator(schema.optional());
    },

    nullable: (): SchemaValidator<T | null> => {
      return createSchemaValidator(schema.nullable());
    },
  };
}

export type ValidationMiddleware<T = unknown> = (
  data: unknown,
  next: (validatedData: T) => void,
) => void;

export type AsyncValidator = (data: unknown) => Promise<ValidationResult>;
