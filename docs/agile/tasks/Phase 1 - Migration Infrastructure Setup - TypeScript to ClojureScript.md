---
uuid: '1c3cd0e9-phase1-001'
title: 'Phase 1: Migration Infrastructure Setup - TypeScript to ClojureScript'
slug: 'phase-1-migration-infrastructure-setup-typescript-to-clojurescript'
status: 'ready'
priority: 'P1'
labels: ['migration', 'infrastructure', 'typescript', 'clojurescript', 'setup']
created_at: '2025-10-28T00:00:00Z'
estimates:
  complexity: '3'
  scale: 'medium'
  time_to_completion: '2 sessions'
storyPoints: 3
---

# Phase 1: Migration Infrastructure Setup - TypeScript to ClojureScript

## 🎯 Objective

Establish the foundational infrastructure and tooling required to support a systematic TypeScript to ClojureScript migration program. This includes build systems, testing frameworks, development environments, and migration utilities.

## 📋 Scope

### Core Infrastructure Components

1. **Build System Integration**

   - Shadow-CLJS configuration for ClojureScript compilation
   - TypeScript build system integration
   - Unified build pipeline for mixed environments
   - Development server with hot reload

2. **Testing Infrastructure**

   - ClojureScript testing framework setup
   - TypeScript test compatibility layer
   - Cross-language test runners
   - Test migration utilities

3. **Development Environment**

   - IDE configuration for mixed codebases
   - Linting and formatting tools
   - Debugging configurations
   - Development workflow automation

4. **Migration Tooling**
   - Automated migration utilities
   - Code translation helpers
   - Validation and verification tools
   - Progress tracking systems

## 🔧 Implementation Details

### Build System Configuration

```clojure
;; shadow-cljs.edn configuration for migration
{:source-paths ["src" "src-gen"]
 :dependencies [[org.clojure/clojure "1.11.1"]
                [org.clojure/clojurescript "1.11.60"]
                [thheller/shadow-cljs "2.25.8"]
                [reagent "1.2.0"]
                [cljs-http "0.1.46"]]
 :builds
 {:app {:target :browser
         :output-dir "public/js"
         :asset-path "/js"
         :modules {:main {:init-fn app.core/init}}
         :devtools {:http-root "public"
                    :http-port 8080
                    :preloads [devtools.preload]}
         :dev {:compiler-options {:closure-defines {reagent.trace.enabled true}
                                :source-map true}}
         :release {:compiler-options {:optimizations :advanced
                                   :infer-externs :auto}}}

 :migration-test {:target :node-test
                 :output-to "target/test/migration-test.js"
                 :ns-regexp "-test$"
                 :compiler-options {:main migration-test.runner
                                   :optimizations :none}}}

;; package.json scripts for mixed builds
{
  "scripts": {
    "dev:cljs": "shadow-cljs watch app",
    "dev:ts": "webpack serve --config webpack.dev.js",
    "build:cljs": "shadow-cljs release app",
    "build:ts": "webpack --config webpack.prod.js",
    "test:cljs": "shadow-cljs compile migration-test && node target/test/migration-test.js",
    "test:ts": "jest",
    "test:migration": "npm run test:ts && npm run test:cljs",
    "migrate:package": "node scripts/migrate-package.js",
    "validate:migration": "node scripts/validate-migration.js"
  }
}
```

### Testing Framework Setup

```clojure
;; ClojureScript testing configuration
(ns migration-test.runner
  (:require [cljs.test :as t :include-macros true]
            [migration-test.core :as core]))

(defn ^:export main []
  (t/run-tests 'migration-test.core))

;; Test utilities for migration validation
(ns migration-test.utils
  (:require [clojure.string :as str]
            [clojure.walk :as walk]))

(defn validate-api-equivalence
  "Validate that ClojureScript API matches TypeScript API"
  [cljs-api ts-api]
  (let [cljs-fns (filter fn? (vals cljs-api))
        ts-fns (filter fn? (vals ts-api))]
    (and
     (= (count cljs-fns) (count ts-fns))
     (every? (fn [fn-name]
               (let [cljs-fn (get cljs-api fn-name)
                     ts-fn (get ts-api fn-name)]
                 (and cljs-fn ts-fn
                      (= (count (.-params cljs-fn))
                         (count (.-params ts-fn))))))
             (map name (keys cljs-api))))))

(defn validate-behavior-equivalence
  "Validate equivalent behavior between CLJS and TS implementations"
  [test-cases cljs-impl ts-impl]
  (every? (fn [{:keys [input expected]}]
             (= (cljs-impl input) (ts-impl input) expected))
           test-cases))
```

### Development Environment Configuration

```json
// .vscode/settings.json for mixed development
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "clojure-lsp.clojure-lsp-path": "clojure-lsp",
  "files.associations": {
    "*.cljs": "clojure",
    "*.cljc": "clojure",
    "*.clj": "clojure"
  },
  "emmet.includeLanguages": {
    "clojure": "html"
  },
  "editor.formatOnSave": true,
  "[clojure]": {
    "editor.defaultFormatter": "betterthantomorrow.calva"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[clojurescript]": {
    "editor.defaultFormatter": "betterthantomorrow.calva"
  }
}
```

### Migration Tooling

```clojure
(ns migration.tools.core
  (:require [clojure.string :as str]
            [clojure.java.io :as io]
            [clojure.walk :as walk]
            [cheshire.core :as json]))

(defn analyze-typescript-package
  "Analyze TypeScript package structure and dependencies"
  [package-path]
  (let [package-json (json/parse-string (slurp (str package-path "/package.json")))]
    {:name (:name package-json)
     :version (:version package-json)
     :dependencies (:dependencies package-json)
     :devDependencies (:devDependencies package-json)
     :main (:main package-json)
     :types (:types package-json)
     :files (find-source-files package-path #"\.ts$")}))

(defn generate-clojurescript-structure
  "Generate ClojureScript package structure from TypeScript analysis"
  [ts-analysis]
  {:name (str (:name ts-analysis) "-cljs")
   :version (:version ts-analysis)
   :dependencies (convert-dependencies (:dependencies ts-analysis))
   :source-paths ["src"]
   :test-paths ["test"]
   :shadow-cljs-config (generate-shadow-config ts-analysis)
   :files-to-migrate (:files ts-analysis)})

(defn convert-typescript-to-clojurescript
  "Convert TypeScript file to ClojureScript"
  [ts-file-path cljs-file-path]
  (let [ts-content (slurp ts-file-path)
        parsed-ts (parse-typescript ts-content)
        cljs-content (generate-clojurescript parsed-ts)]
    (spit cljs-file-path cljs-content)))

(defn validate-migration
  "Validate migration completeness and correctness"
  [original-path migrated-path]
  (let [original-api (extract-api original-path)
        migrated-api (extract-api migrated-path)
        test-cases (generate-test-cases original-path)]
    {:api-equivalent (validate-api-equivalence migrated-api original-api)
     :behavior-equivalent (validate-behavior-equivalence test-cases
                                                      (get-impl migrated-path)
                                                      (get-impl original-path))
     :test-coverage (calculate-test-coverage migrated-path)
     :performance-comparison (benchmark-implementations original-path migrated-path)}))
```

### Migration Workflow Automation

```javascript
// scripts/migrate-package.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PackageMigrator {
  constructor(packageName) {
    this.packageName = packageName;
    this.tsPath = `packages/${packageName}`;
    this.cljsPath = `packages/${packageName}-cljs`;
  }

  async migrate() {
    console.log(`🚀 Starting migration of ${this.packageName}`);

    try {
      // 1. Analyze TypeScript package
      const analysis = await this.analyzePackage();
      console.log('📊 Package analysis complete');

      // 2. Generate ClojureScript structure
      await this.generateClojureScriptStructure(analysis);
      console.log('🏗️  ClojureScript structure generated');

      // 3. Convert source files
      await this.convertSourceFiles();
      console.log('🔄 Source files converted');

      // 4. Migrate tests
      await this.migrateTests();
      console.log('🧪 Tests migrated');

      // 5. Validate migration
      const validation = await this.validateMigration();
      console.log('✅ Migration validation:', validation);

      return validation;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async analyzePackage() {
    const analysisPath = path.join(this.tsPath, 'analysis.json');
    execSync(`node scripts/analyze-package.js ${this.packageName}`, { stdio: 'inherit' });
    return JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  }

  async generateClojureScriptStructure(analysis) {
    // Generate directory structure
    fs.mkdirSync(this.cljsPath, { recursive: true });
    fs.mkdirSync(path.join(this.cljsPath, 'src'), { recursive: true });
    fs.mkdirSync(path.join(this.cljsPath, 'test'), { recursive: true });

    // Generate configuration files
    await this.generateShadowCljsConfig(analysis);
    await this.generatePackageJson(analysis);
    await this.generateDepsEdn(analysis);
  }

  async convertSourceFiles() {
    const sourceFiles = this.findSourceFiles(this.tsPath, '.ts');

    for (const file of sourceFiles) {
      const relativePath = path.relative(this.tsPath, file);
      const cljsPath = path.join(this.cljsPath, 'src', relativePath.replace('.ts', '.cljs'));

      await this.convertFile(file, cljsPath);
    }
  }

  async convertFile(tsPath, cljsPath) {
    execSync(`node scripts/convert-file.js ${tsPath} ${cljsPath}`, { stdio: 'inherit' });
  }
}

// CLI interface
const packageName = process.argv[2];
if (!packageName) {
  console.error('Usage: node migrate-package.js <package-name>');
  process.exit(1);
}

const migrator = new PackageMigrator(packageName);
migrator.migrate().then(console.log).catch(console.error);
```

## ✅ Acceptance Criteria

1. **Build System**

   - Shadow-CLJS properly configured
   - TypeScript build integration working
   - Mixed development environment functional
   - Hot reload for both languages

2. **Testing Infrastructure**

   - ClojureScript testing framework setup
   - Cross-language test compatibility
   - Migration validation tools
   - Automated test migration

3. **Development Environment**

   - IDE configuration for mixed development
   - Linting and formatting for both languages
   - Debugging capabilities
   - Development workflow automation

4. **Migration Tooling**
   - Automated package analysis
   - Source code conversion utilities
   - Migration validation tools
   - Progress tracking and reporting

## 🧪 Testing Requirements

### Infrastructure Tests

```clojure
(deftest test-build-system-integration
  (testing "Shadow-CLJS compilation"
    (is (zero? (sh "shadow-cljs compile app" :dir "test-project"))))

  (testing "TypeScript build integration"
    (is (zero? (sh "npm run build:ts" :dir "test-project"))))

  (testing "Mixed build pipeline"
    (is (zero? (sh "npm run build:all" :dir "test-project")))))

(deftest test-migration-tools
  (testing "Package analysis"
    (let [analysis (analyze-typescript-package "test-ts-package")]
      (is (contains? analysis :name))
      (is (contains? analysis :dependencies))
      (is (contains? analysis :files))))

  (testing "File conversion"
    (let [result (convert-typescript-to-clojurescript "test.ts" "test.cljs")]
      (is (.exists (io/file "test.cljs")))))

  (testing "Migration validation"
    (let [validation (validate-migration "original.ts" "migrated.cljs")]
      (is (contains? validation :api-equivalent))
      (is (contains? validation :behavior-equivalent)))))
```

## 📁 File Structure

```
migration-infrastructure/
├── build-system/
│   ├── shadow-cljs.edn              # Shadow-CLJS configuration
│   ├── webpack.config.js             # TypeScript webpack config
│   ├── package.json                 # Unified build scripts
│   └── build-pipeline.clj           # Mixed build orchestration
├── testing/
│   ├── cljs-test-setup.clj          # ClojureScript testing framework
│   ├── ts-test-compat.clj           # TypeScript test compatibility
│   ├── migration-validation.clj       # Migration test utilities
│   └── cross-language-runner.clj     # Unified test runner
├── development/
│   ├── vscode-settings.json          # IDE configuration
│   ├── linting-configs/            # Linting for both languages
│   ├── debugging-configs/           # Debug configurations
│   └── workflow-automation.clj      # Development workflow tools
├── tools/
│   ├── package-analyzer.js          # TypeScript package analysis
│   ├── file-converter.js           # Source file conversion
│   ├── migration-validator.js       # Migration validation
│   └── progress-tracker.clj         # Migration progress tracking
└── scripts/
    ├── migrate-package.js            # Package migration script
    ├── validate-migration.js        # Migration validation script
    └── setup-infrastructure.sh      # Infrastructure setup script
```

## 🔗 Dependencies

- Shadow-CLJS (ClojureScript compiler)
- TypeScript compiler and tools
- Webpack (for TypeScript builds)
- Jest (TypeScript testing)
- ClojureScript testing libraries
- Development environment tools

## 🚀 Deliverables

1. **Build System** - Unified TypeScript/ClojureScript build pipeline
2. **Testing Infrastructure** - Cross-language testing framework
3. **Development Environment** - IDE and workflow configuration
4. **Migration Tools** - Automated migration utilities
5. **Documentation** - Setup and usage guides

## ⏱️ Timeline

**Estimated Time**: 2 sessions (8-12 hours)
**Dependencies**: None (foundation component)
**Blockers**: None

## 🎯 Success Metrics

- ✅ Complete build system integration
- ✅ Functional testing infrastructure
- ✅ Productive development environment
- ✅ Automated migration tooling
- ✅ Comprehensive validation capabilities

---

## 📝 Notes

This infrastructure setup is critical for the success of the entire migration program. It must be robust, well-documented, and easy to use for developers working with both TypeScript and ClojureScript codebases. The tools should automate as much of the migration process as possible while maintaining high quality standards.
