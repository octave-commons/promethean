(ns promethean.agent-generator.platform.adapters.yaml
  "YAML processing adapter for SCI compatibility"
  (:require [clj-yaml.core :as yaml]))

(defn yaml-parse [content]
  "Parse YAML content - simplified for SCI"
  (try
    (yaml/parse-string content)
    (catch Exception _
      {})))

(defn yaml-generate [data]
  "Generate YAML content - simplified for SCI"
  (try
    (yaml/generate-string data)
    (catch Exception _
      "")))