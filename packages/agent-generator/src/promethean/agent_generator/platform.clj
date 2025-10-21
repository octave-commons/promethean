(ns promethean.agent-generator.platform
  "Platform detection and compatibility layer.
   
   This namespace handles detecting the current platform and adapting
   behavior for different environments (bb, nbb, JVM, etc.).")

(defn detect-platform
  "Detect the current runtime platform."
  []
  (cond
    (some? (find-ns 'babashka.core)) :babashka
    (some? (find-ns 'nbb.core)) :nbb
    (and (some? *file*) (.endsWith *file* ".js")) :node
    :else :jvm))

(defn platform-features
  "Get available features for the current platform."
  [platform]
  (case platform
    :babashka {:file-system true :network true :shell true}
    :nbb {:file-system true :network true :nodejs true}
    :node {:file-system true :network true :nodejs true}
    :jvm {:file-system true :network true :java-interop true}
    {}))

(defn adapt-to-platform
  "Adapt behavior based on current platform."
  [operation platform]
  {:status :not-implemented
   :message "Platform adaptation not yet implemented"})