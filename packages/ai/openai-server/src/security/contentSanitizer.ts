import type { FastifyRequest } from "fastify";
import sanitizeHtml from "sanitize-html";

/**
 * Content sanitization utilities
 */
export class ContentSanitizer {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(html: string, options?: sanitizeHtml.IOptions): string {
    const defaultOptions: sanitizeHtml.IOptions = {
      allowedTags: [
        "b", "i", "em", "strong", "p", "br", "ul", "ol", "li",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "blockquote", "code", "pre"
      ],
      allowedAttributes: {
        "*": ["class"],
        "a": ["href", "title"],
        "img": ["src", "alt", "title", "width", "height"]
      },
      allowedSchemes: ["http", "https", "mailto"],
      allowedSchemesAppliedToAttributes: ["href", "src"],
      disallowedTags: ["script", "iframe", "object", "embed", "form", "input", "button"],
      disallowedAttributes: ["onclick", "onload", "onerror", "onmouseover", "onfocus"],
      ...options
    };

    return sanitizeHtml(html, defaultOptions);
  }

  /**
   * Sanitize plain text content
   */
  static sanitizeText(text: string): string {
    if (typeof text !== "string") {
      return "";
    }

    // Remove null bytes and control characters
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim();
  }

  /**
   * Sanitize JSON content
   */
  static sanitizeJson(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "string") {
      return this.sanitizeText(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeJson(item));
    }

    if (typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize keys as well
        const sanitizedKey = this.sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeJson(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Sanitize chat completion messages
   */
  static sanitizeChatMessages(messages: any[]): any[] {
    if (!Array.isArray(messages)) {
      return [];
    }

    return messages.map(message => {
      if (!message || typeof message !== "object") {
        return null;
      }

      return {
        role: this.sanitizeText(message.role),
        content: this.sanitizeText(message.content),
        name: message.name ? this.sanitizeText(message.name) : undefined,
      };
    }).filter(Boolean);
  }

  /**
   * Detect and remove potentially malicious content
   */
  static removeMaliciousContent(text: string): string {
    if (typeof text !== "string") {
      return "";
    }

    // Remove script tags and their content
    let cleaned = text.replace(/<script[^>]*>.*?<\/script>/gis, "");

    // Remove JavaScript event handlers
    cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
    cleaned = cleaned.replace(/on\w+\s*=\s*[^"'\s>]+/gi, "");

    // Remove JavaScript: and vbscript: protocols
    cleaned = cleaned.replace(/(javascript|vbscript):/gi, "");

    // Remove data URLs that could execute scripts
    cleaned = cleaned.replace(/data:(?!image\/(png|jpg|jpeg|gif|webp))/gi, "");

    // Remove potentially dangerous HTML attributes
    cleaned = cleaned.replace(/(src|href|data|action)\s*=\s*["']\s*javascript:/gi, "");

    return cleaned;
  }

  /**
   * Validate and sanitize file paths
   */
  static sanitizePath(path: string): string {
    if (typeof path !== "string") {
      return "";
    }

    // Remove path traversal attempts
    let sanitized = path.replace(/\.\.[\/\\]/g, "");

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, "");

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

    // Normalize path separators
    sanitized = sanitized.replace(/\\/g, "/");

    // Remove leading/trailing slashes and dots
    sanitized = sanitized.replace(/^[/\.]+|[/\.]+$/g, "");

    return sanitized;
  }

  /**
   * Create content sanitization middleware for Fastify
   */
  static createSanitizationMiddleware(options: {
    sanitizeBody?: boolean;
    sanitizeQuery?: boolean;
    sanitizeParams?: boolean;
    customSanitizer?: (data: any) => any;
  } = {}) {
    const {
      sanitizeBody = true,
      sanitizeQuery = true,
      sanitizeParams = true,
      customSanitizer,
    } = options;

    return async (request: FastifyRequest, reply: any) => {
      try {
        // Sanitize request body
        if (sanitizeBody && request.body) {
          request.body = customSanitizer 
            ? customSanitizer(request.body)
            : this.sanitizeJson(request.body);
        }

        // Sanitize query parameters
        if (sanitizeQuery && request.query) {
          request.query = this.sanitizeJson(request.query);
        }

        // Sanitize route parameters
        if (sanitizeParams && request.params) {
          request.params = this.sanitizeJson(request.params);
        }

        // Sanitize headers (read-only, so we just validate)
        if (request.headers) {
          // Log suspicious headers but don't modify them
          const suspiciousHeaders = Object.entries(request.headers)
            .filter(([key, value]) => {
              if (typeof value === "string") {
                return value.includes("<script") || 
                       value.includes("javascript:") ||
                       value.includes("vbscript:");
              }
              return false;
            });

          if (suspiciousHeaders.length > 0) {
            request.log?.warn?.("Suspicious headers detected:", suspiciousHeaders);
          }
        }
      } catch (error) {
        request.log?.error?.("Content sanitization error:", error);
        
        // Don't fail the request, but log the error
        reply.status(500).send({
          error: "Internal server error during content sanitization",
          code: "SANITIZATION_ERROR",
        });
      }
    };
  }

  /**
   * Validate content length
   */
  static validateContentLength(content: string, maxLength: number): boolean {
    if (typeof content !== "string") {
      return false;
    }

    // Get byte length, not character length
    const byteLength = Buffer.byteLength(content, "utf8");
    return byteLength <= maxLength;
  }

  /**
   * Detect encoding issues
   */
  static detectEncodingIssues(text: string): string[] {
    const issues: string[] = [];

    if (typeof text !== "string") {
      return ["Invalid input type"];
    }

    // Check for invalid UTF-8 sequences
    try {
      Buffer.from(text, "utf8");
    } catch (error) {
      issues.push("Invalid UTF-8 encoding");
    }

    // Check for control characters
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(text)) {
      issues.push("Contains control characters");
    }

    // Check for Unicode replacement characters
    if (text.includes("\uFFFD")) {
      issues.push("Contains Unicode replacement characters (invalid encoding)");
    }

    return issues;
  }
}