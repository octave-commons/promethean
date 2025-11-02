/**
 * Template processing serializers for the Kanban system
 * Extracted from kanban.ts to fix hanging bug and improve organization
 */

// Removed unused import to fix compilation error

/**
 * Apply template replacements with proper validation and error handling
 */
export const applyTemplateReplacements = (
  template: string,
  replacements: Record<string, string>,
): string => {
  // Security: Validate template input to prevent injection attacks
  if (typeof template !== 'string') {
    throw new Error('Template must be a string');
  }

  // Security: Sanitize replacement values to prevent code injection
  const sanitizedReplacements: Record<string, string> = {};
  for (const [key, value] of Object.entries(replacements)) {
    // Only allow alphanumeric keys
    if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key)) {
      throw new Error(`Invalid replacement key: ${key}`);
    }

    // Sanitize replacement values to prevent injection
    if (value === null || value === undefined) {
      sanitizedReplacements[key] = '';
    } else if (typeof value !== 'string') {
      sanitizedReplacements[key] = String(value);
    } else {
      // Escape HTML special characters and remove dangerous patterns
      sanitizedReplacements[key] = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/`/g, '&#x60;')
        // Remove potential JavaScript execution patterns
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/on\w+/gi, '');
    }
  }

  // Safe template replacement with validation
  return template.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_-]*)\s*\}\}/g, (_match, key: string) => {
    const replacement = sanitizedReplacements[key];
    return typeof replacement === 'string' ? replacement : '';
  });
};

interface TemplateConfig {
  readonly templatePath: string | undefined;
  readonly defaultTemplatePath: string | undefined;
  readonly title: string;
  readonly body: string;
  readonly uuid: string;
}

const createTimeoutChecker =
  (startTime: number, timeout: number) =>
  (operation: string): void => {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Template processing timeout at ${operation}`);
    }
  };

const readTemplateFile = async (
  templatePath: string,
  checkTimeout: (operation: string) => void,
): Promise<string> => {
  checkTimeout('before file read');
  const { promises: fs } = await import('node:fs');
  const content = await fs.readFile(templatePath, 'utf8');
  checkTimeout('after file read');
  return content;
};

const applyTemplate = (
  templateContent: string | undefined,
  title: string,
  body: string,
  uuid: string,
): string => {
  const bodyText = body ?? '';
  return typeof templateContent === 'string'
    ? applyTemplateReplacements(templateContent, {
        TITLE: title,
        BODY: bodyText,
        UUID: uuid,
      })
    : bodyText;
};

/**
 * Process template content with timeout protection
 */
export const processTemplateContent = async (config: TemplateConfig): Promise<string> => {
  const startTime = Date.now();
  const TIMEOUT = 5000; // 5 second timeout
  const checkTimeout = createTimeoutChecker(startTime, TIMEOUT);

  try {
    checkTimeout('start');

    const effectiveTemplatePath = config.templatePath ?? config.defaultTemplatePath;

    const templateContent = effectiveTemplatePath
      ? await readTemplateFile(effectiveTemplatePath, checkTimeout)
      : undefined;

    checkTimeout('before replacement');

    const contentFromTemplate = applyTemplate(
      templateContent,
      config.title,
      config.body,
      config.uuid,
    );

    checkTimeout('after replacement');

    return contentFromTemplate || '';
  } catch (error) {
    return config.body || '';
  }
};
