declare module 'swagger-jsdoc' {
  interface SwaggerJsdocOptions {
    definition: Record<string, unknown>;
    apis: string[];
  }

  const swaggerJsdoc: (options: SwaggerJsdocOptions) => Record<string, unknown>;
  export default swaggerJsdoc;
}

declare module 'swagger-ui-express' {
  import type { RequestHandler } from 'express';

  export const serve: RequestHandler[];
  export function setup(document: unknown, options?: Record<string, unknown>): RequestHandler;
}
