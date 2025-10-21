import { PackageTemplate, PackageType } from './types.js';

export const PACKAGE_TEMPLATES: Record<PackageType, PackageTemplate> = {
  'typescript-library': {
    name: 'TypeScript Library',
    description: 'Standard TypeScript library package',
    type: 'typescript-library',
    files: [
      { path: 'src/index.ts', template: 'typescript-library/index.ts.hbs' },
      { path: 'package.json', template: 'typescript-library/package.json.hbs' },
      { path: 'tsconfig.json', template: 'typescript-library/tsconfig.json.hbs' },
      { path: 'ava.config.mjs', template: 'typescript-library/ava.config.mjs.hbs' },
      { path: 'project.json', template: 'typescript-library/project.json.hbs' },
      { path: 'README.md', template: 'typescript-library/README.md.hbs' },
    ],
    dependencies: {
      devDependencies: {
        '@types/node': '^20.0.0',
        '@typescript-eslint/eslint-plugin': '^6.19.1',
        '@typescript-eslint/parser': '^6.19.1',
        ava: '^6.1.1',
        eslint: '^8.56.0',
        prettier: '^3.2.4',
        typescript: '^5.4.5',
        tsx: '^4.7.0',
      },
    },
    scripts: {
      build: 'tsc -p tsconfig.json',
      dev: 'tsc -p tsconfig.json --watch',
      test: 'ava',
      lint: 'eslint src --ext .ts',
      format: 'prettier --write src/**/*.ts',
      clean: 'rm -rf dist',
      coverage: 'nyc ava',
      typecheck: 'tsc --noEmit',
    },
    config: {
      tsconfig: {
        extends: '../../config/tsconfig.base.json',
        compilerOptions: {
          outDir: './dist',
          rootDir: './src',
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist', 'test'],
      },
      ava: {
        files: ['test/**/*.test.ts'],
        nodeArguments: ['--loader=tsx'],
      },
      nx: {
        name: '{{name}}',
        sourceRoot: 'src',
        projectType: 'library',
        targets: {
          build: {
            executor: '@nx/js:tsc',
            outputs: ['{options.outputPath}'],
            options: {
              outputPath: './dist',
              main: 'src/index.ts',
              tsConfig: 'tsconfig.json',
              assets: [],
            },
          },
          test: {
            executor: '@nx/jest:jest',
            options: {
              jestConfig: 'ava.config.mjs',
            },
          },
          lint: {
            executor: '@nx/linter:eslint',
            options: {
              lintFilePatterns: ['src/**/*.ts'],
            },
          },
        },
      },
      exports: {
        '.': {
          import: './dist/index.js',
          require: './dist/index.js',
          types: './dist/index.d.ts',
        },
      },
    },
  },

  'frontend-package': {
    name: 'Frontend Package',
    description: 'Frontend package with ClojureScript and TypeScript',
    type: 'frontend-package',
    files: [
      { path: 'src/index.ts', template: 'frontend-package/index.ts.hbs' },
      { path: 'package.json', template: 'frontend-package/package.json.hbs' },
      { path: 'tsconfig.json', template: 'frontend-package/tsconfig.json.hbs' },
      { path: 'shadow-cljs.edn', template: 'frontend-package/shadow-cljs.edn.hbs' },
      { path: 'project.json', template: 'frontend-package/project.json.hbs' },
      { path: 'README.md', template: 'frontend-package/README.md.hbs' },
    ],
    dependencies: {
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@types/node': '^20.0.0',
        '@typescript-eslint/eslint-plugin': '^6.19.1',
        '@typescript-eslint/parser': '^6.19.1',
        ava: '^6.1.1',
        eslint: '^8.56.0',
        prettier: '^3.2.4',
        'shadow-cljs': '^2.25.8',
        typescript: '^5.4.5',
        tsx: '^4.7.0',
      },
    },
    scripts: {
      build: 'tsc -p tsconfig.json && shadow-cljs release app',
      dev: 'concurrently "tsc -p tsconfig.json --watch" "shadow-cljs watch app"',
      test: 'ava',
      lint: 'eslint src --ext .ts',
      format: 'prettier --write src/**/*.{ts,cljs}',
      clean: 'rm -rf dist target',
      coverage: 'nyc ava',
      typecheck: 'tsc --noEmit',
    },
    config: {
      tsconfig: {
        extends: '../../config/tsconfig.base.json',
        compilerOptions: {
          outDir: './dist',
          rootDir: './src',
          lib: ['DOM', 'ES2022'],
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist', 'target', 'test'],
      },
      nx: {
        name: '{{name}}',
        sourceRoot: 'src',
        projectType: 'library',
        targets: {
          build: {
            executor: '@nx/js:tsc',
            outputs: ['{options.outputPath}'],
            options: {
              outputPath: './dist',
              main: 'src/index.ts',
              tsConfig: 'tsconfig.json',
              assets: [],
            },
          },
        },
      },
    },
  },

  'cli-package': {
    name: 'CLI Package',
    description: 'Command-line interface package',
    type: 'cli-package',
    files: [
      { path: 'src/index.ts', template: 'cli-package/index.ts.hbs' },
      { path: 'src/cli/index.ts', template: 'cli-package/cli.ts.hbs' },
      { path: 'package.json', template: 'cli-package/package.json.hbs' },
      { path: 'tsconfig.json', template: 'cli-package/tsconfig.json.hbs' },
      { path: 'ava.config.mjs', template: 'cli-package/ava.config.mjs.hbs' },
      { path: 'project.json', template: 'cli-package/project.json.hbs' },
      { path: 'README.md', template: 'cli-package/README.md.hbs' },
    ],
    dependencies: {
      dependencies: {
        commander: '^11.1.0',
        chalk: '^4.1.2',
        ora: '^5.4.1',
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@typescript-eslint/eslint-plugin': '^6.19.1',
        '@typescript-eslint/parser': '^6.19.1',
        ava: '^6.1.1',
        eslint: '^8.56.0',
        prettier: '^3.2.4',
        typescript: '^5.4.5',
        tsx: '^4.7.0',
      },
    },
    scripts: {
      build: 'tsc -p tsconfig.json',
      dev: 'tsc -p tsconfig.json --watch',
      test: 'ava',
      lint: 'eslint src --ext .ts',
      format: 'prettier --write src/**/*.ts',
      clean: 'rm -rf dist',
      coverage: 'nyc ava',
      typecheck: 'tsc --noEmit',
    },
    config: {
      tsconfig: {
        extends: '../../config/tsconfig.base.json',
        compilerOptions: {
          outDir: './dist',
          rootDir: './src',
          module: 'CommonJS',
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist', 'test'],
      },
      ava: {
        files: ['test/**/*.test.ts'],
        nodeArguments: ['--loader=tsx'],
      },
      nx: {
        name: '{{name}}',
        sourceRoot: 'src',
        projectType: 'library',
        targets: {
          build: {
            executor: '@nx/js:tsc',
            outputs: ['{options.outputPath}'],
            options: {
              outputPath: './dist',
              main: 'src/index.ts',
              tsConfig: 'tsconfig.json',
              assets: [],
            },
          },
        },
      },
      bin: {
        '{{kebabCase name}}': 'dist/cli/index.js',
      },
    },
  },

  'javascript-package': {
    name: 'JavaScript Package',
    description: 'Simple JavaScript package',
    type: 'javascript-package',
    files: [
      { path: 'src/index.js', template: 'javascript-package/index.js.hbs' },
      { path: 'package.json', template: 'javascript-package/package.json.hbs' },
      { path: 'project.json', template: 'javascript-package/project.json.hbs' },
      { path: 'README.md', template: 'javascript-package/README.md.hbs' },
    ],
    dependencies: {
      devDependencies: {
        ava: '^6.1.1',
        eslint: '^8.56.0',
        prettier: '^3.2.4',
      },
    },
    scripts: {
      test: 'ava',
      lint: 'eslint src --ext .js',
      format: 'prettier --write src/**/*.js',
      clean: 'rm -rf dist',
    },
    config: {
      nx: {
        name: '{{name}}',
        sourceRoot: 'src',
        projectType: 'library',
        targets: {
          build: {
            executor: '@nx/js:tsc',
            outputs: ['{options.outputPath}'],
            options: {
              outputPath: './dist',
              main: 'src/index.js',
              assets: [],
            },
          },
        },
      },
    },
  },

  'manager-package': {
    name: 'Manager Package',
    description: 'Complex package with adapters and CLI',
    type: 'manager-package',
    files: [
      { path: 'src/index.ts', template: 'manager-package/index.ts.hbs' },
      { path: 'src/cli/index.ts', template: 'manager-package/cli.ts.hbs' },
      { path: 'src/lib/manager.ts', template: 'manager-package/manager.ts.hbs' },
      { path: 'src/lib/adapters/base-adapter.ts', template: 'manager-package/base-adapter.ts.hbs' },
      { path: 'src/types/index.ts', template: 'manager-package/types.ts.hbs' },
      { path: 'package.json', template: 'manager-package/package.json.hbs' },
      { path: 'tsconfig.json', template: 'manager-package/tsconfig.json.hbs' },
      { path: 'ava.config.mjs', template: 'manager-package/ava.config.mjs.hbs' },
      { path: 'project.json', template: 'manager-package/project.json.hbs' },
      { path: 'README.md', template: 'manager-package/README.md.hbs' },
    ],
    dependencies: {
      dependencies: {
        commander: '^11.1.0',
        dotenv: '^16.3.1',
        chalk: '^4.1.2',
        ora: '^5.4.1',
        inquirer: '^8.2.6',
      },
      devDependencies: {
        '@types/inquirer': '^9.0.7',
        '@types/node': '^20.0.0',
        '@typescript-eslint/eslint-plugin': '^6.19.1',
        '@typescript-eslint/parser': '^6.19.1',
        ava: '^6.1.1',
        eslint: '^8.56.0',
        prettier: '^3.2.4',
        typescript: '^5.4.5',
        tsx: '^4.7.0',
      },
    },
    scripts: {
      build: 'tsc -p tsconfig.json',
      dev: 'tsc -p tsconfig.json --watch',
      test: 'ava',
      lint: 'eslint src --ext .ts',
      format: 'prettier --write src/**/*.ts',
      clean: 'rm -rf dist',
      coverage: 'nyc ava',
      typecheck: 'tsc --noEmit',
    },
    config: {
      tsconfig: {
        compilerOptions: {
          outDir: './dist',
          rootDir: './src',
          module: 'CommonJS',
          target: 'ES2022',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          declaration: true,
          declarationMap: true,
          sourceMap: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist', 'test'],
      },
      ava: {
        files: ['test/**/*.test.ts'],
        nodeArguments: ['--loader=tsx'],
      },
      nx: {
        name: '{{name}}',
        sourceRoot: 'src',
        projectType: 'library',
        targets: {
          build: {
            executor: '@nx/js:tsc',
            outputs: ['{options.outputPath}'],
            options: {
              outputPath: './dist',
              main: 'src/index.ts',
              tsConfig: 'tsconfig.json',
              assets: [],
            },
          },
        },
      },
      bin: {
        '{{kebabCase name}}': 'dist/cli/index.js',
      },
    },
  },
};
