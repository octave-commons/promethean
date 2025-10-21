#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { PackageGenerator } from './generator.js';
import { PackageOptions, GeneratorConfig, PackageType } from './types.js';

const program = new Command();

const config: GeneratorConfig = {
  templatesDir: './templates',
  outputDir: './packages',
  defaultAuthor: 'Promethean Team',
  defaultLicense: 'MIT',
  defaultRepository: 'https://github.com/promethean/promethean',
};

program.name('pkg-gen').description('Package generator for Promethean Framework').version('1.0.0');

program
  .command('create [name]')
  .description('Create a new package')
  .option('-t, --type <type>', 'Package type')
  .option('-d, --description <description>', 'Package description')
  .option('--interactive', 'Interactive mode')
  .action(async (name, options) => {
    try {
      const generator = new PackageGenerator(config);

      let packageOptions: PackageOptions;

      if (options.interactive || !name) {
        packageOptions = await runInteractiveMode(generator, name);
      } else {
        packageOptions = await runDirectMode(name, options);
      }

      const exists = await generator.validatePackage(packageOptions.name);
      if (exists) {
        console.log(chalk.red(`❌ Package ${packageOptions.name} already exists`));
        process.exit(1);
      }

      await generator.generatePackage(packageOptions);

      console.log(chalk.green('🎉 Package created successfully!'));
      console.log(chalk.cyan(`📁 Location: packages/${packageOptions.name}`));
      console.log(chalk.yellow('💡 Next steps:'));
      console.log(chalk.white(`   cd packages/${packageOptions.name}`));
      console.log(chalk.white('   pnpm install'));
      console.log(chalk.white('   pnpm build'));
    } catch (error) {
      console.error(chalk.red('❌ Error creating package:'), error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available package types')
  .action(async () => {
    const generator = new PackageGenerator(config);
    await generator.listPackageTypes();
  });

async function runInteractiveMode(
  generator: PackageGenerator,
  initialName?: string,
): Promise<PackageOptions> {
  console.log(chalk.blue('🚀 Welcome to Promethean Package Generator\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Package name:',
      default: initialName,
      validate: (input) => {
        if (!input.trim()) return 'Package name is required';
        if (!/^[a-z0-9-]+$/.test(input))
          return 'Package name must contain only lowercase letters, numbers, and hyphens';
        return true;
      },
    },
    {
      type: 'list',
      name: 'type',
      message: 'Package type:',
      choices: [
        { name: 'TypeScript Library - Standard TypeScript library', value: 'typescript-library' },
        { name: 'Frontend Package - React/ClojureScript frontend', value: 'frontend-package' },
        { name: 'CLI Package - Command-line interface tool', value: 'cli-package' },
        { name: 'JavaScript Package - Simple JavaScript module', value: 'javascript-package' },
        { name: 'Manager Package - Complex package with adapters', value: 'manager-package' },
      ],
    },
    {
      type: 'input',
      name: 'description',
      message: 'Package description:',
      validate: (input) => (input.trim() ? true : 'Description is required'),
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author:',
      default: config.defaultAuthor,
    },
    {
      type: 'input',
      name: 'license',
      message: 'License:',
      default: config.defaultLicense,
    },
    {
      type: 'input',
      name: 'repository',
      message: 'Repository URL:',
      default: config.defaultRepository,
    },
    {
      type: 'input',
      name: 'keywords',
      message: 'Keywords (comma-separated):',
      filter: (input) =>
        input
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
    },
  ]);

  return answers as PackageOptions;
}

async function runDirectMode(name: string, options: any): Promise<PackageOptions> {
  if (!options.type) {
    console.error(chalk.red('❌ Package type is required in non-interactive mode'));
    process.exit(1);
  }

  if (!options.description) {
    console.error(chalk.red('❌ Description is required in non-interactive mode'));
    process.exit(1);
  }

  return {
    name,
    type: options.type as PackageType,
    description: options.description,
    author: config.defaultAuthor,
    license: config.defaultLicense,
    repository: config.defaultRepository,
    keywords: [],
  };
}

program.parse();
