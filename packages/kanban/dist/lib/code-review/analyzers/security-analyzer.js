/**
 * Security Code Analyzer
 *
 * Integrates with security scanning tools to detect
 * vulnerabilities and security issues in code.
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
const execAsync = promisify(exec);
/**
 * Security Analyzer for code review
 */
export class SecurityAnalyzer {
    config;
    availableTools = new Map();
    constructor(config) {
        this.config = config;
    }
    /**
     * Check if security tools are available
     */
    async checkAvailability() {
        const availableTools = [];
        for (const tool of this.config.tools) {
            try {
                await this.checkToolAvailability(tool);
                this.availableTools.set(tool, true);
                availableTools.push(tool);
            }
            catch (error) {
                console.warn(`Security tool ${tool} not available:`, error);
                this.availableTools.set(tool, false);
            }
        }
        if (availableTools.length === 0) {
            throw new Error('No security tools are available');
        }
        console.log(`Available security tools: ${availableTools.join(', ')}`);
    }
    /**
     * Analyze files with security tools
     */
    async analyze(files) {
        const results = [];
        for (const tool of this.config.tools) {
            if (!this.availableTools.get(tool)) {
                continue;
            }
            try {
                const result = await this.runSecurityTool(tool, files);
                results.push(result);
            }
            catch (error) {
                console.warn(`Security analysis with ${tool} failed:`, error);
                // Continue with other tools
            }
        }
        return results;
    }
    /**
     * Run a specific security tool
     */
    async runSecurityTool(tool, files) {
        switch (tool.toLowerCase()) {
            case 'semgrep':
                return await this.runSemgrep(files);
            case 'snyk':
                return await this.runSnyk(files);
            case 'eslint-security':
                return await this.runESLintSecurity(files);
            default:
                throw new Error(`Unsupported security tool: ${tool}`);
        }
    }
    /**
     * Run Semgrep security analysis
     */
    async runSemgrep(files) {
        const args = [
            '--config=auto', // Use auto configuration for security rules
            '--json',
            '--no-rewrite-rule-ids',
            '--severity=INFO', // Include all severity levels
        ];
        // Filter relevant files
        const relevantFiles = files.filter((file) => file.endsWith('.ts') ||
            file.endsWith('.tsx') ||
            file.endsWith('.js') ||
            file.endsWith('.jsx'));
        if (relevantFiles.length === 0) {
            return {
                tool: 'semgrep',
                findings: [],
                summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
            };
        }
        args.push(...relevantFiles);
        try {
            const { stdout, stderr } = await execAsync(`semgrep ${args.join(' ')}`, {
                timeout: this.config.timeout,
                cwd: process.cwd(),
            });
            if (stderr) {
                console.warn(`Semgrep stderr:`, stderr);
            }
            const output = stdout.trim();
            if (!output) {
                return {
                    tool: 'semgrep',
                    findings: [],
                    summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
                };
            }
            const semgrepResult = JSON.parse(output);
            const findings = this.parseSemgrepFindings(semgrepResult.results || []);
            const summary = this.calculateSummary(findings);
            return {
                tool: 'semgrep',
                findings,
                summary,
            };
        }
        catch (error) {
            if (error instanceof Error && 'stdout' in error) {
                const stdout = error.stdout;
                if (stdout) {
                    try {
                        const semgrepResult = JSON.parse(stdout);
                        const findings = this.parseSemgrepFindings(semgrepResult.results || []);
                        const summary = this.calculateSummary(findings);
                        return {
                            tool: 'semgrep',
                            findings,
                            summary,
                        };
                    }
                    catch (parseError) {
                        throw new Error(`Failed to parse Semgrep output: ${parseError}`);
                    }
                }
            }
            throw error;
        }
    }
    /**
     * Run Snyk security analysis
     */
    async runSnyk(_files) {
        try {
            const { stdout, stderr } = await execAsync('snyk test --json', {
                timeout: this.config.timeout,
                cwd: process.cwd(),
            });
            if (stderr) {
                console.warn(`Snyk stderr:`, stderr);
            }
            const output = stdout.trim();
            if (!output) {
                return {
                    tool: 'snyk',
                    findings: [],
                    summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
                };
            }
            const snykResult = JSON.parse(output);
            const findings = this.parseSnykFindings(snykResult.vulnerabilities || []);
            const summary = this.calculateSummary(findings);
            return {
                tool: 'snyk',
                findings,
                summary,
            };
        }
        catch (error) {
            // Snyk returns non-zero exit code on vulnerabilities
            if (error instanceof Error && 'stdout' in error) {
                const stdout = error.stdout;
                if (stdout) {
                    try {
                        const snykResult = JSON.parse(stdout);
                        const findings = this.parseSnykFindings(snykResult.vulnerabilities || []);
                        const summary = this.calculateSummary(findings);
                        return {
                            tool: 'snyk',
                            findings,
                            summary,
                        };
                    }
                    catch (parseError) {
                        throw new Error(`Failed to parse Snyk output: ${parseError}`);
                    }
                }
            }
            throw error;
        }
    }
    /**
     * Run ESLint security rules
     */
    async runESLintSecurity(files) {
        const args = ['--format', 'json', '--config', this.getESLintSecurityConfigPath()];
        const relevantFiles = files.filter((file) => file.endsWith('.ts') ||
            file.endsWith('.tsx') ||
            file.endsWith('.js') ||
            file.endsWith('.jsx'));
        if (relevantFiles.length === 0) {
            return {
                tool: 'eslint-security',
                findings: [],
                summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
            };
        }
        args.push(...relevantFiles);
        try {
            const { stdout, stderr } = await execAsync(`npx eslint ${args.join(' ')}`, {
                timeout: this.config.timeout,
                cwd: process.cwd(),
            });
            if (stderr && !stderr.includes('warning')) {
                console.warn(`ESLint security stderr:`, stderr);
            }
            const output = stdout.trim();
            if (!output) {
                return {
                    tool: 'eslint-security',
                    findings: [],
                    summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
                };
            }
            const eslintResults = JSON.parse(output);
            const findings = this.parseESLintSecurityFindings(eslintResults);
            const summary = this.calculateSummary(findings);
            return {
                tool: 'eslint-security',
                findings,
                summary,
            };
        }
        catch (error) {
            if (error instanceof Error && 'stdout' in error) {
                const stdout = error.stdout;
                if (stdout) {
                    try {
                        const eslintResults = JSON.parse(stdout);
                        const findings = this.parseESLintSecurityFindings(eslintResults);
                        const summary = this.calculateSummary(findings);
                        return {
                            tool: 'eslint-security',
                            findings,
                            summary,
                        };
                    }
                    catch (parseError) {
                        throw new Error(`Failed to parse ESLint security output: ${parseError}`);
                    }
                }
            }
            throw error;
        }
    }
    /**
     * Check if a specific tool is available
     */
    async checkToolAvailability(tool) {
        switch (tool.toLowerCase()) {
            case 'semgrep':
                await execAsync('semgrep --version', { timeout: 5000 });
                break;
            case 'snyk':
                await execAsync('snyk --version', { timeout: 5000 });
                break;
            case 'eslint-security':
                await execAsync('npx eslint --version', { timeout: 5000 });
                break;
            default:
                throw new Error(`Unknown security tool: ${tool}`);
        }
    }
    /**
     * Parse Semgrep findings
     */
    parseSemgrepFindings(results) {
        return results.map((result) => ({
            id: result.check_id || 'unknown',
            ruleId: result.metadata?.name || result.check_id,
            severity: this.mapSemgrepSeverity(result.metadata?.severity || 'INFO'),
            confidence: this.mapSemgrepConfidence(result.metadata?.confidence || 'MEDIUM'),
            message: result.message || 'Security issue detected',
            file: result.path,
            line: result.start?.line,
            endLine: result.end?.line,
            column: result.start?.col,
            endColumn: result.end?.col,
            cwe: result.metadata?.cwe?.join(', '),
            owasp: result.metadata?.owasp?.join(', '),
            references: result.metadata?.references || [],
        }));
    }
    /**
     * Parse Snyk findings
     */
    parseSnykFindings(vulnerabilities) {
        return vulnerabilities.map((vuln) => ({
            id: vuln.id || 'unknown',
            ruleId: vuln.title || vuln.name,
            severity: this.mapSnykSeverity(vuln.severity || 'medium'),
            confidence: 'high',
            message: vuln.description || 'Security vulnerability detected',
            file: vuln.from?.[0] || 'unknown',
            cwe: vuln.cwe,
            references: vuln.references || [],
        }));
    }
    /**
     * Parse ESLint security findings
     */
    parseESLintSecurityFindings(results) {
        const findings = [];
        for (const fileResult of results) {
            for (const message of fileResult.messages || []) {
                if (message.ruleId && message.ruleId.startsWith('security/')) {
                    findings.push({
                        id: `eslint-${message.ruleId}`,
                        ruleId: message.ruleId,
                        severity: message.severity === 2 ? 'high' : 'medium',
                        confidence: 'medium',
                        message: message.message,
                        file: fileResult.filePath,
                        line: message.line,
                        endLine: message.endLine,
                        column: message.column,
                        endColumn: message.endColumn,
                    });
                }
            }
        }
        return findings;
    }
    /**
     * Map Semgrep severity to our format
     */
    mapSemgrepSeverity(severity) {
        switch (severity.toUpperCase()) {
            case 'ERROR':
                return 'critical';
            case 'WARNING':
                return 'high';
            case 'INFO':
                return 'medium';
            default:
                return 'low';
        }
    }
    /**
     * Map Semgrep confidence to our format
     */
    mapSemgrepConfidence(confidence) {
        switch (confidence.toUpperCase()) {
            case 'HIGH':
                return 'high';
            case 'MEDIUM':
                return 'medium';
            case 'LOW':
                return 'low';
            default:
                return 'medium';
        }
    }
    /**
     * Map Snyk severity to our format
     */
    mapSnykSeverity(severity) {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'critical';
            case 'high':
                return 'high';
            case 'medium':
                return 'medium';
            case 'low':
                return 'low';
            default:
                return 'info';
        }
    }
    /**
     * Calculate summary statistics
     */
    calculateSummary(findings) {
        const summary = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
        };
        for (const finding of findings) {
            summary[finding.severity]++;
        }
        return summary;
    }
    /**
     * Get path to ESLint security configuration
     */
    getESLintSecurityConfigPath() {
        return path.join(__dirname, '../../../config/eslint.security.json');
    }
}
//# sourceMappingURL=security-analyzer.js.map