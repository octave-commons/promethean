(ns promethean.agent-generator.build
  "Build system for agent generator"
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [babashka.fs :as fs]
            [promethean.agent-generator.platform.detection :as detection]))

(defn create-output-dir [output-dir]
  "Create output directory if it doesn't exist"
  (when-not (.exists (io/file output-dir))
    (.mkdirs (io/file output-dir))
    (println (str "Created output directory: " output-dir))))

(defn copy-resources [resource-dir output-dir]
  "Copy resource files to output directory"
  (when (.exists (io/file resource-dir))
    (fs/copy-tree resource-dir output-dir {:replace-existing true})
    (println (str "Copied resources from " resource-dir " to " output-dir))))

(defn build-for-platform [platform]
  "Build for specific platform"
  (println (str "Building for platform: " platform))
  (let [output-dir (str "target/" (name platform))]
    (create-output-dir output-dir)
    (copy-resources "resources" (str output-dir "/resources"))
    (println (str "Build completed for " platform " in " output-dir))))

(defn build-current []
  "Build for current platform"
  (let [platform (detection/current-platform)]
    (println (str "Current platform detected: " platform))
    (build-for-platform platform)))

(defn build-all []
  "Build for all supported platforms"
  (println "Building for all supported platforms...")
  (doseq [platform [:jvm :babashka :node-babashka :clojurescript]]
    (build-for-platform platform))
  (println "All builds completed!"))

(defn clean []
  "Clean build artifacts"
  (println "Cleaning build artifacts...")
  (when (.exists (io/file "target"))
    (fs/delete-tree "target")
    (println "Deleted target directory"))
  (when (.exists (io/file "dist"))
    (fs/delete-tree "dist") 
    (println "Deleted dist directory"))
  (println "Clean completed!"))

(defn -main [& args]
  "Main entry point for build system"
  (let [command (first args)]
    (case command
      "current" (build-current)
      "all" (build-all)
      "clean" (clean)
      (do
        (println "Usage: build [current|all|clean]")
        (println "  current - Build for current platform (default)")
        (println "  all     - Build for all platforms")
        (println "  clean   - Clean build artifacts")
        (build-current)))))