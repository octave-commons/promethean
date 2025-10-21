(defproject opencode-unified "0.1.0-SNAPSHOT"
  :description "Promethean OpenCode Unified"
  :source-paths ["src/clojurescript"]
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [org.clojure/clojurescript "1.11.132"]
                 [thheller/shadow-cljs "2.28.23"]]
  :jvm-opts ["-Xmx2g" "-Xss1m" "-XX:+UseG1GC"]
  :plugins [[lein-cljsbuild "1.1.8"]
            [lein-ancient "1.0.0-RC3"]]
  :cljsbuild {:builds [{:source-paths ["src/clojurescript"]
                        :compiler {:output-to "dist/public/js/main.js"
                                   :output-dir "dist/public/js"
                                   :asset-path "/js"
                                   :main app
                                   :optimizations :none
                                   :source-map-timestamp true
                                   :pretty-print true}}]})