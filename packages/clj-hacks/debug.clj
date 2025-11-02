(require '[clj-hacks.mcp.adapter-codex-toml :as adapter])

(def data {:mcp {:mcp-servers {:figma {:url "https://mcp.figma.com/mcp" :bearer-token-env-var "FIGMA_TOKEN" :http-headers {"X-API-Version" "v1"} :env-http-headers {"X-User-Agent" "USER_AGENT"}} :experimental-use-rmcp-client true} :rest "# preserved"})

(let [tmp (java.io.File/createTempFile "test" ".toml") path (.getPath tmp)]
  (adapter/write-full path data)
  (println "Generated TOML:")
  (println (slurp path))
  (.delete tmp))