/**
 * ESLint Code Analyzer
 *
 * Integrates with ESLint to perform static code analysis
 * and style checking for JavaScript/TypeScript files.
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
const execAsync = promisify(exec);
/**
 * ESLint Analyzer for code review
 */
export class ESLintAnalyzer {
    config;
    available = false;
    constructor(config) {
        this.config = config;
    }
    /**
     * Check if ESLint is available
     */
    async checkAvailability() {
        try {
            // Check if eslint command is available
            await execAsync('npx eslint --version', { timeout: 5000 });
            this.available = true;
        }
        catch (error) {
            throw new Error(`ESLint not available: ${error}`);
        }
    }
    /**
     * Analyze files with ESLint
     */
    async analyze(files) {
        if (!this.available) {
            throw new Error('ESLint analyzer is not available');
        }
        // Filter files by extension
        const relevantFiles = files.filter((file) => this.config.extensions.some((ext) => file.endsWith(ext)));
        if (relevantFiles.length === 0) {
            return [];
        }
        const results = [];
        for (const file of relevantFiles) {
            try {
                const result = await this.analyzeFile(file);
                results.push(result);
            }
            catch (error) {
                console.warn(`Failed to analyze ${file} with ESLint:`, error);
                // Continue with other files
            }
        }
        return results;
    }
    /**
     * Analyze a single file
     */
    async analyzeFile(filePath) {
        const args = [
            '--format',
            'json',
            '--no-eslintrc', // Ignore local config files
        ];
        // Add config file if specified
        if (this.config.configPath) {
            args.push('--config', this.config.configPath);
        }
        else {
            // Use default strict config
            args.push('--config', this.getDefaultConfigPath());
        }
        args.push(filePath);
        try {
            const { stdout, stderr } = await execAsync(`npx eslint ${args.join(' ')}`, {
                timeout: this.config.timeout,
                cwd: process.cwd(),
            });
            if (stderr && !stderr.includes('warning')) {
                console.warn(`ESLint stderr for ${filePath}:`, stderr);
            }
            const output = stdout.trim();
            if (!output) {
                return {
                    filePath,
                    messages: [],
                    errorCount: 0,
                    warningCount: 0,
                    fixableErrorCount: 0,
                    fixableWarningCount: 0,
                };
            }
            const eslintResults = JSON.parse(output);
            const eslintResult = Array.isArray(eslintResults) ? eslintResults[0] : eslintResults;
            const messages = eslintResult.messages || [];
            const errorCount = messages.filter((m) => m.severity === 2).length;
            const warningCount = messages.filter((m) => m.severity === 1).length;
            const fixableErrorCount = messages.filter((m) => m.severity === 2 && m.fix).length;
            const fixableWarningCount = messages.filter((m) => m.severity === 1 && m.fix).length;
            return {
                filePath,
                messages: messages.map(this.normalizeMessage),
                errorCount,
                warningCount,
                fixableErrorCount,
                fixableWarningCount,
            };
        }
        catch (error) {
            // ESLint returns non-zero exit code on violations
            if (error instanceof Error && 'stdout' in error) {
                const stdout = error.stdout;
                if (stdout) {
                    try {
                        const eslintResults = JSON.parse(stdout);
                        const eslintResult = Array.isArray(eslintResults) ? eslintResults[0] : eslintResults;
                        const messages = eslintResult.messages || [];
                        const errorCount = messages.filter((m) => m.severity === 2).length;
                        const warningCount = messages.filter((m) => m.severity === 1).length;
                        const fixableErrorCount = messages.filter((m) => m.severity === 2 && m.fix).length;
                        const fixableWarningCount = messages.filter((m) => m.severity === 1 && m.fix).length;
                        return {
                            filePath,
                            messages: messages.map(this.normalizeMessage),
                            errorCount,
                            warningCount,
                            fixableErrorCount,
                            fixableWarningCount,
                        };
                    }
                    catch (parseError) {
                        throw new Error(`Failed to parse ESLint output: ${parseError}`);
                    }
                }
            }
            throw error;
        }
    }
    /**
     * Normalize ESLint message format
     */
    normalizeMessage(message) {
        return {
            ruleId: message.ruleId,
            severity: message.severity,
            message: message.message,
            line: message.line,
            column: message.column,
            nodeType: message.nodeType,
            messageId: message.messageId,
            endLine: message.endLine,
            endColumn: message.endColumn,
            fix: message.fix,
        };
    }
    /**
     * Get path to default ESLint configuration
     */
    getDefaultConfigPath() {
        // Return path to a strict ESLint config for code review
        return path.join(__dirname, '../../../config/eslint.code-review.json');
    }
    /**
     * Auto-fix ESLint issues
     */
    async fixFiles(files) {
        if (!this.available) {
            throw new Error('ESLint analyzer is not available');
        }
        const relevantFiles = files.filter((file) => this.config.extensions.some((ext) => file.endsWith(ext)));
        if (relevantFiles.length === 0) {
            return { fixed: [], remaining: [] };
        }
        const args = ['--fix', '--format', 'json', '--no-eslintrc'];
        if (this.config.configPath) {
            args.push('--config', this.config.configPath);
        }
        else {
            args.push('--config', this.getDefaultConfigPath());
        }
        args.push(...relevantFiles);
        try {
            await execAsync(`npx eslint ${args.join(' ')}`, {
                timeout: this.config.timeout,
                cwd: process.cwd(),
            });
            // Check which files still have issues
            const remainingResults = await this.analyze(relevantFiles);
            const remaining = remainingResults
                .filter((result) => result.messages.length > 0)
                .map((result) => result.filePath);
            const fixed = relevantFiles.filter((file) => !remaining.includes(file));
            return { fixed, remaining };
        }
        catch (error) {
            console.warn('ESLint auto-fix failed:', error);
            return { fixed: [], remaining: relevantFiles };
        }
    }
}
//# sourceMappingURL=eslint-analyzer.js.map