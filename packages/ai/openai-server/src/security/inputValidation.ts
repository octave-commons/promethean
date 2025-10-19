import type { FastifyRequest } from "fastify";
import type { InputValidationResult, SecurityConfig } from "../types/security.js";
import sanitizeHtml from "sanitize-html";

/**
 * Malicious patterns to detect in input
 */
const MALICIOUS_PATTERNS = [
  // SQL injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
  /(--|\/\*|\*\/|;|'|")/,
  // XSS patterns
  /(<script[^>]*>.*?<\/script>)/gi,
  /(javascript:|vbscript:|onload=|onerror=)/gi,
  // Path traversal
  /(\.\.[\/\\])/g,
  // Command injection
  /(\||&|;|\$\(|`)/g,
  // NoSQL injection
  /(\{.*\$.*\})/g,
];

/**
 * Content sanitization configuration
 */
const SANITIZE_CONFIG = {
  allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
  allowedAttributes: {},
  allowedIframeHostnames: [],
  allowedIframeDomains: [],
  allowedIframeSchemes: [],
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  allowedScriptHostnames: [],
  allowedScriptDomains: [],
  allowedScriptSchemes: [],
  allowedScriptTypes: [],
  allowedStyles: [],
  allowedClasses: {},
  allowedAttributes: {},
  allowedTags: [],
  disallowedTags: ["script", "iframe", "object", "embed", "form", "input", "button"],
  disallowedAttributes: ["onclick", "onload", "onerror", "onmouseover"],
  textFilter: (text: string) => text,
  exclusiveFilter: (frame: any) => false,
};

/**
 * Input validation and sanitization service
 */
export class InputValidationService {
  private readonly config: SecurityConfig["validation"];

  constructor(config: SecurityConfig["validation"]) {
    this.config = config;
  }

  /**
   * Validate and sanitize request body
   */
  async validateRequestBody(request: FastifyRequest): Promise<InputValidationResult> {
    try {
      // Check request size
      const contentLength = parseInt(request.headers["content-length"] || "0", 10);
      if (contentLength > this.config.maxRequestSize) {
        return {
          isValid: false,
          errors: [`Request size ${contentLength} exceeds maximum ${this.config.maxRequestSize}`],
        };
      }

      // Check content type
      const contentType = request.headers["content-type"] || "";
      const isAllowedContentType = this.config.allowedContentTypes.some(type =>
        contentType.toLowerCase().includes(type.toLowerCase())
      );

      if (!isAllowedContentType) {
        return {
          isValid: false,
          errors: [`Content type ${contentType} is not allowed`],
        };
      }

      // Validate and sanitize body
      const body = request.body as any;
      const sanitizedBody = await this.sanitizeObject(body);
      const validationResult = this.detectMaliciousContent(sanitizedBody);

      if (!validationResult.isValid) {
        return validationResult;
      }

      return {
        isValid: true,
        sanitizedData: sanitizedBody,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`],
      };
    }
  }

  /**
   * Recursively sanitize an object
   */
  private async sanitizeObject(obj: any): Promise<any> {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "string") {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return Promise.all(obj.map(item => this.sanitizeObject(item)));
    }

    if (typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize object keys as well
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = await this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Sanitize a string for XSS prevention
   */
  private sanitizeString(str: string): string {
    if (typeof str !== "string") {
      return str;
    }

    // First, check for malicious patterns
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(str)) {
        // Remove or replace malicious content
        str = str.replace(pattern, "");
      }
    }

    // Then sanitize HTML
    return sanitizeHtml(str, SANITIZE_CONFIG);
  }

  /**
   * Detect malicious content in sanitized data
   */
  private detectMaliciousContent(data: any): InputValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const scanForMaliciousContent = (obj: any, path: string = ""): void => {
      if (typeof obj === "string") {
        // Check for remaining malicious patterns after sanitization
        for (const pattern of MALICIOUS_PATTERNS) {
          if (pattern.test(obj)) {
            errors.push(`Malicious content detected at ${path}: ${pattern.source}`);
          }
        }

        // Check for suspicious content
        if (obj.length > 10000) {
          warnings.push(`Large content at ${path}: ${obj.length} characters`);
        }
      } else if (Array.isArray(obj)) {
        if (obj.length > 1000) {
          warnings.push(`Large array at ${path}: ${obj.length} items`);
        }
        obj.forEach((item, index) => {
          scanForMaliciousContent(item, `${path}[${index}]`);
        });
      } else if (typeof obj === "object" && obj !== null) {
        const keys = Object.keys(obj);
        if (keys.length > 100) {
          warnings.push(`Large object at ${path}: ${keys.length} properties`);
        }
        keys.forEach(key => {
          scanForMaliciousContent(obj[key], path ? `${path}.${key}` : key);
        });
      }
    };

    scanForMaliciousContent(data);

    return {
      isValid: errors.length === 0,
      sanitizedData: data,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validate chat completion specific fields
   */
  validateChatCompletionInput(body: any): InputValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate model
    if (!body.model || typeof body.model !== "string") {
      errors.push("Model is required and must be a string");
    } else if (body.model.length > 100) {
      errors.push("Model name too long (max 100 characters)");
    }

    // Validate messages
    if (!Array.isArray(body.messages)) {
      errors.push("Messages must be an array");
    } else {
      if (body.messages.length === 0) {
        errors.push("At least one message is required");
      } else if (body.messages.length > 100) {
        warnings.push("Large number of messages may impact performance");
      }

      body.messages.forEach((message: any, index: number) => {
        if (!message.role || typeof message.role !== "string") {
          errors.push(`Message ${index}: role is required and must be a string`);
        } else if (!["system", "user", "assistant", "tool"].includes(message.role)) {
          errors.push(`Message ${index}: invalid role "${message.role}"`);
        }

        if (!message.content || typeof message.content !== "string") {
          errors.push(`Message ${index}: content is required and must be a string`);
        } else if (message.content.length > 50000) {
          errors.push(`Message ${index}: content too long (max 50000 characters)`);
        }
      });
    }

    // Validate optional parameters
    if (body.temperature !== undefined) {
      if (typeof body.temperature !== "number" || body.temperature < 0 || body.temperature > 2) {
        errors.push("Temperature must be a number between 0 and 2");
      }
    }

    if (body.max_tokens !== undefined) {
      if (typeof body.max_tokens !== "number" || body.max_tokens < 1 || body.max_tokens > 32000) {
        errors.push("Max tokens must be a number between 1 and 32000");
      }
    }

    if (body.top_p !== undefined) {
      if (typeof body.top_p !== "number" || body.top_p < 0 || body.top_p > 1) {
        errors.push("Top_p must be a number between 0 and 1");
      }
    }

    if (body.stream !== undefined && typeof body.stream !== "boolean") {
      errors.push("Stream must be a boolean");
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Create input validation middleware for Fastify
   */
  createValidationMiddleware(options: {
    skipValidation?: boolean;
    customValidator?: (body: any) => InputValidationResult;
  } = {}) {
    const { skipValidation = false, customValidator } = options;

    return async (request: FastifyRequest, reply: any) => {
      if (skipValidation) {
        return;
      }

      // Basic validation
      const basicValidation = await this.validateRequestBody(request);
      if (!basicValidation.isValid) {
        return reply.status(400).send({
          error: "Invalid request",
          code: "INVALID_REQUEST",
          details: basicValidation.errors,
        });
      }

      // Apply sanitized data
      if (basicValidation.sanitizedData) {
        request.body = basicValidation.sanitizedData;
      }

      // Custom validation if provided
      if (customValidator) {
        const customValidation = customValidator(request.body);
        if (!customValidation.isValid) {
          return reply.status(400).send({
            error: "Validation failed",
            code: "VALIDATION_FAILED",
            details: customValidation.errors,
          });
        }
      }

      // Log warnings if any
      if (basicValidation.warnings) {
        request.log?.warn?.("Input validation warnings:", basicValidation.warnings);
      }
    };
  }
}