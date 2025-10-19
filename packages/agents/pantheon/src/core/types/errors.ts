/**
 * Error types for the Pantheon Agent Framework
 */

export class PantheonError extends Error {
  public readonly code: string;
  public readonly module: string;
  public readonly details?: Readonly<Record<string, unknown>> | undefined;

  constructor(
    message: string,
    code: string,
    module: string,
    details?: Readonly<Record<string, unknown>>
  ) {
    super(message);
    this.name = 'PantheonError';
    this.code = code;
    this.module = module;
    this.details = details;
  }
}

export class ContextError extends PantheonError {
  constructor(
    message: string,
    code: string,
    details?: Readonly<Record<string, unknown>>
  ) {
    super(message, code, 'context', details);
    this.name = 'ContextError';
  }
}

export class ProtocolError extends PantheonError {
  constructor(
    message: string,
    code: string,
    details?: Readonly<Record<string, unknown>>
  ) {
    super(message, code, 'protocol', details);
    this.name = 'ProtocolError';
  }
}

export class WorkflowError extends PantheonError {
  constructor(
    message: string,
    code: string,
    details?: Readonly<Record<string, unknown>>
  ) {
    super(message, code, 'workflow', details);
    this.name = 'WorkflowError';
  }
}

export class OrchestrationError extends PantheonError {
  constructor(
    message: string,
    code: string,
    details?: Readonly<Record<string, unknown>>
  ) {
    super(message, code, 'orchestration', details);
    this.name = 'OrchestrationError';
  }
}
