import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { PackageTemplate, PackageOptions, GeneratorConfig } from './types.js';
import { PACKAGE_TEMPLATES } from './templates.js';
import { compile } from 'handlebars';

export class PackageGenerator {
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
  }

  async generatePackage(options: PackageOptions): Promise<void> {
    const template = PACKAGE_TEMPLATES[options.type];
    if (!template) {
      throw new Error(`Unknown package type: ${options.type}`);
    }

    const packageDir = join(this.config.outputDir, options.name);
    await fs.mkdir(packageDir, { recursive: true });

    const templateData = this.prepareTemplateData(options);

    for (const file of template.files) {
      const filePath = join(packageDir, file.path);
      await fs.mkdir(dirname(filePath), { recursive: true });

      const templateContent = await this.loadTemplate(file.template);
      const compiledTemplate = compile(templateContent);
      const content = compiledTemplate(templateData);

      await fs.writeFile(filePath, content, 'utf-8');
    }

    console.log(`✅ Package ${options.name} generated successfully at ${packageDir}`);
  }

  private prepareTemplateData(options: PackageOptions): Record<string, any> {
    const now = new Date();
    return {
      name: options.name,
      description: options.description,
      author: options.author || this.config.defaultAuthor,
      license: options.license || this.config.defaultLicense,
      repository: options.repository || this.config.defaultRepository,
      keywords: options.keywords || [],
      main: options.main || './dist/index.js',
      bin: options.bin || {},
      exports: options.exports || {},
      customVariables: options.customVariables || {},
      kebabCase: (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      camelCase: (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()),
      pascalCase: (str: string) =>
        str.replace(/(^|-)([a-z])/g, (g) => g.toUpperCase().replace('-', '')),
      year: now.getFullYear(),
      date: now.toISOString().split('T')[0],
      timestamp: now.toISOString(),
    };
  }

  private async loadTemplate(templatePath: string): Promise<string> {
    const fullPath = join(this.config.templatesDir, templatePath);
    try {
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load template: ${fullPath}`);
    }
  }

  async listPackageTypes(): Promise<void> {
    console.log('Available package types:');
    Object.entries(PACKAGE_TEMPLATES).forEach(([key, template]) => {
      console.log(`  ${key}: ${template.description}`);
    });
  }

  async validatePackage(packageName: string): Promise<boolean> {
    const packageDir = join(this.config.outputDir, packageName);

    try {
      const stat = await fs.stat(packageDir);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }
}
