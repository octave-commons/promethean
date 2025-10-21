#!/usr/bin/env bb

(ns create-clojure-package
  "Script to create a new Clojure package following the standard structure."
  
  (:require [clojure.string :as str]
            [clojure.java.io :as io]
            [babashka.fs :as fs]
            [babashka.process :as process]))

(defn sanitize-package-name
  "Convert package name to valid format."
  [name]
  (-> name
      (str/lower-case)
      (str/replace #"[^a-z0-9-]" "-")
      (str/replace #"-+" "-")
      (str/replace #"^-" "")
      (str/replace #"-$" "")))

(defn create-namespace-path
  "Convert package name to namespace path."
  [package-name]
  (str/replace package-name "-" "_"))

(defn create-directory-structure
  "Create the standard directory structure for a Clojure package."
  [base-path package-name]
  (let [ns-path (create-namespace-path package-name)
        package-dir (fs/path base-path "packages" package-name)]
    
    (println "Creating directory structure for" package-name)
    
    ;; Create main directories
    (fs/create-dirs (fs/path package-dir "src" "promethean" ns-path))
    (fs/create-dirs (fs/path package-dir "test" "promethean" ns-path))
    (fs/create-dirs (fs/path package-dir "docs"))
    (fs/create-dirs (fs/path package-dir "resources" "templates"))
    (fs/create-dirs (fs/path package-dir "resources" "config"))
    (fs/create-dirs (fs/path package-dir ".serena"))
    
    package-dir))

(defn create-deps-edn
  "Create deps.edn file for the package."
  [package-dir package-name]
  (let [ns-path (create-namespace-path package-name)]
    (spit (str (fs/path package-dir "deps.edn"))
          (str "{:paths [\"src\" \"resources\" \"test\"]\n"
               "\n"
               " :deps {org.clojure/clojure {:mvn/version \"1.11.1\"}\n"
               "       org.clojure/clojurescript {:mvn/version \"1.11.60\"}\n"
               "       ;; Add other dependencies here\n"
               "       }\n"
               "\n"
               " :aliases {:test {:extra-paths [\"test\"]\n"
               "                  :extra-deps {io.github.cognitect-labs/test-runner\n"
               "                               {:git/url \"https://github.com/cognitect-labs/test-runner.git\"\n"
               "                                :git/tag \"v0.5.1\"\n"
               "                                :git/sha \"dfb30dd6605cb6c0efc275e1df1736e6379e87ac\"}}\n"
               "                  :main-opts [\"-m\" \"cognitect.test-runner\"]\n"
               "                  :exec-fn cognitect.test-runner.api/test}\n"
               "           \n"
               "           :build {:deps {io.github.seancorfield/build-clj\n"
               "                          {:git/tag \"v0.9.2\"\n"
               "                           :git/sha \"9c9f078\"}}\n"
               "                   :ns-default build}\n"
               "           \n"
               "           :repl {:main-opts [\"-m\" \"nrepl.cmdline\" \"--port\" \"65536\"]}}}\n"))))

(defn create-package-json
  "Create package.json file for npm integration."
  [package-dir package-name description]
  (spit (str (fs/path package-dir "package.json"))
        (str "{\n"
             "  \"name\": \"@promethean/" package-name "\",\n"
             "  \"version\": \"1.0.0\",\n"
             "  \"description\": \"" description "\",\n"
             "  \"main\": \"src/promethean/" (create-namespace-path package-name) "/core.clj\",\n"
             "  \"scripts\": {\n"
             "    \"test\": \"clojure -M:test\",\n"
             "    \"repl\": \"clojure -M:repl\",\n"
             "    \"build\": \"clojure -M:build\",\n"
             "    \"clean\": \"rm -rf target\"\n"
             "  },\n"
             "  \"keywords\": [\"clojure\", \"promethean\"],\n"
             "  \"author\": \"Promethean Team\",\n"
             "  \"license\": \"MIT\",\n"
             "  \"devDependencies\": {\n"
             "    \"@promethean/eslint-config\": \"workspace:*\"\n"
             "  }\n"
             "}\n")))

(defn create-core-clj
  "Create the main core.clj namespace."
  [package-dir package-name description]
  (let [ns-path (create-namespace-path package-name)]
    (spit (str (fs/path package-dir "src" "promethean" ns-path "core.clj"))
          (str "(ns promethean." ns-path ".core\n"
               "  \"Main namespace for " package-name " package.\n"
               "   \n"
               "   This package provides " description ".\n"
               "   \n"
               "   Key features:\n"
               "   - Feature 1\n"
               "   - Feature 2\n"
               "   - Feature 3\"\n"
               "  \n"
               "  (:require [some.required.ns :as req])\n"
               "  (:gen-class))\n"
               "\n"
               "(def ^:const version \"1.0.0\")\n"
               "\n"
               "(defn main-function\n"
               "  \"Primary function that demonstrates the package's core functionality.\"\n"
               "  [args]\n"
               "  ;; Implementation\n"
               "  (println \"Hello from\" package-name \"package!\")\n"
               "  args)\n"
               "\n"
               "(defn -main\n"
               "  \"Main entry point for the application.\"\n"
               "  [& args]\n"
               "  (main-function args))\n"))))

(defn create-core-test
  "Create the core test file."
  [package-dir package-name]
  (let [ns-path (create-namespace-path package-name)]
    (spit (str (fs/path package-dir "test" "promethean" ns-path "core_test.clj"))
          (str "(ns promethean." ns-path ".core-test\n"
               "  \"Tests for core namespace.\"\n"
               "  \n"
               "  (:require [clojure.test :refer [deftest testing is use-fixtures]]\n"
               "            [promethean." ns-path ".core :as core]))\n"
               "\n"
               "(deftest test-version\n"
               "  (testing \"Version is defined correctly\"\n"
               "    (is (= \"1.0.0\" core/version))))\n"
               "\n"
               "(deftest test-main-function\n"
               "  (testing \"Main function works correctly\"\n"
               "    (let [result (core.main-function \"test\")]\n"
               "      (is (= \"test\" result))))))\n"))))

(defn create-readme
  "Create README.md file."
  [package-dir package-name description]
  (spit (str (fs/path package-dir "README.md"))
        (str "# @promethean/" package-name "\n"
             "\n"
             "## Description\n"
             "\n"
             description "\n"
             "\n"
             "## Usage\n"
             "\n"
             "```clojure\n"
             "(require '[promethean." (create-namespace-path package-name) ".core :as core])\n"
             "\n"
             ";; Example usage\n"
             "(core.main-function args)\n"
             "```\n"
             "\n"
             "## Development\n"
             "\n"
             "### Prerequisites\n"
             "\n"
             "- Clojure CLI\n"
             "- Node.js (for monorepo integration)\n"
             "\n"
             "### Running Tests\n"
             "\n"
             "```bash\n"
             "pnpm --filter @promethean/" package-name " test\n"
             "```\n"
             "\n"
             "### Starting REPL\n"
             "\n"
             "```bash\n"
             "pnpm --filter @promethean/" package-name " repl\n"
             "```\n"
             "\n"
             "## API Documentation\n"
             "\n"
             "See [docs/API.md](docs/API.md) for detailed API documentation.\n"
             "\n"
             "## License\n"
             "\n"
             "MIT\n")))

(defn create-docs
  "Create documentation files."
  [package-dir package-name description]
  (let [ns-path (create-namespace-path package-name)]
    
    ;; API.md
    (spit (str (fs/path package-dir "docs" "API.md"))
          (str "# API Documentation\n"
               "\n"
               "## promethean." ns-path ".core\n"
               "\n"
               "### Functions\n"
               "\n"
               "#### `main-function`\n"
               "\n"
               "```clojure\n"
               "(main-function args)\n"
               "```\n"
               "\n"
               "**Parameters:**\n"
               "- `args`: Input arguments\n"
               "\n"
               "**Returns:** Processed arguments\n"
               "\n"
               "**Description:** Primary function that demonstrates the package's core functionality.\n"
               "\n"
               "**Example:**\n"
               "```clojure\n"
               "(main-function \"hello\")\n"
               ";; => \"hello\"\n"
               "```\n"))
    
    ;; docs/README.md
    (spit (str (fs/path package-dir "docs" "README.md"))
          (str "# " package-name " Documentation\n"
               "\n"
               "## Overview\n"
               "\n"
               description "\n"
               "\n"
               "## Topics\n"
               "\n"
               "- [API Reference](API.md)\n"
               "- [Architecture](ARCHITECTURE.md)\n"
               "- [Configuration](CONFIGURATION.md)\n"
               "- [Examples](EXAMPLES.md)\n"))))

(defn create-serena-config
  "Create Serena project configuration."
  [package-dir package-name]
  (spit (str (fs/path package-dir ".serena" "project.yml"))
        (str "project:\n"
             "  name: \"" package-name "\"\n"
             "  description: \"Clojure package for " package-name "\"\n"
             "  type: \"clojure\"\n"
             "  paths:\n"
             "    src: \"src\"\n"
             "    test: \"test\"\n"
             "    docs: \"docs\"\n"
             "  build:\n"
             "    tool: \"clojure\"\n"
             "    command: \"build\"\n"
             "  test:\n"
             "    tool: \"clojure\"\n"
             "    command: \"test\"\n")))

(defn create-project-json
  "Create project.json file."
  [package-dir package-name]
  (spit (str (fs/path package-dir "project.json"))
        (str "{\n"
             "  \"name\": \"" package-name "\",\n"
             "  \"type\": \"clojure\",\n"
             "  \"description\": \"Clojure package for " package-name "\",\n"
             "  \"version\": \"1.0.0\",\n"
             "  \"main\": \"src/promethean/" (create-namespace-path package-name) "/core.clj\",\n"
             "  \"scripts\": {\n"
             "    \"test\": \"clojure -M:test\",\n"
             "    \"repl\": \"clojure -M:repl\",\n"
             "    \"build\": \"clojure -M:build\"\n"
             "  }\n"
             "}\n")))

(defn create-clojure-package
  "Create a complete Clojure package structure."
  [base-path package-name description]
  (let [sanitized-name (sanitize-package-name package-name)
        package-dir (create-directory-structure base-path sanitized-name)]
    
    (println "Creating files for" sanitized-name "...")
    
    ;; Create all configuration files
    (create-deps-edn package-dir sanitized-name)
    (create-package-json package-dir sanitized-name description)
    (create-core-clj package-dir sanitized-name description)
    (create-core-test package-dir sanitized-name)
    (create-readme package-dir sanitized-name description)
    (create-docs package-dir sanitized-name description)
    (create-serena-config package-dir sanitized-name)
    (create-project-json package-dir sanitized-name)
    
    (println "✅ Created Clojure package:" sanitized-name)
    (println "📁 Location:" package-dir)
    (println "")
    (println "Next steps:")
    (println "1. cd packages/" sanitized-name)
    (println "2. pnpm install")
    (println "3. pnpm test")
    (println "4. Start implementing your package!")
    
    package-dir))

(defn -main
  "Main entry point for the script."
  [& args]
  (when (or (empty? args) (contains? (set args) "--help"))
    (println "Usage: bb create-clojure-package.clj <package-name> <description>")
    (println "")
    (println "Example:")
    (println "  bb create-clojure-package.clj my-awesome-package \"An awesome Clojure package\"")
    (System/exit 0))
  
  (let [package-name (first args)
        description (or (second args) "A Clojure package for the Promethean framework")
        base-path (or (System/getenv "PROJECT_ROOT") ".")]
    
    (if (fs/exists? (fs/path base-path "packages" (sanitize-package-name package-name)))
      (do
        (println "❌ Package already exists:" package-name)
        (System/exit 1))
      (create-clojure-package base-path package-name description))))

;; Run the script
(apply -main *command-line-args*)