export interface PackageTemplate {
  name: string;
  description: string;
  type: PackageType;
  files: TemplateFile[];
  dependencies: TemplateDependencies;
  scripts: Record<string, string>;
  config: TemplateConfig;
}

export type PackageType =
  | 'typescript-library'
  | 'frontend-package'
  | 'cli-package'
  | 'javascript-package'
  | 'manager-package';

export interface TemplateFile {
  path: string;
  template: string;
  variables?: string[];
}

export interface TemplateDependencies {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface TemplateConfig {
  tsconfig?: Record<string, any>;
  ava?: Record<string, any>;
  nx?: Record<string, any>;
  exports?: Record<string, any>;
  bin?: Record<string, string>;
}

export interface PackageOptions {
  name: string;
  description: string;
  type: PackageType;
  author?: string;
  license?: string;
  repository?: string;
  keywords?: string[];
  main?: string;
  bin?: Record<string, string>;
  exports?: Record<string, any>;
  customVariables?: Record<string, any>;
}

export interface GeneratorConfig {
  templatesDir: string;
  outputDir: string;
  defaultAuthor: string;
  defaultLicense: string;
  defaultRepository: string;
}
