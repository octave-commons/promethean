(ns mk.mcp-core
  "Thin wrapper around clj-hacks MCP core helpers."
  (:require [clj-hacks.mcp.core :as core]))

(defn spit-edn! [path data]
  (core/spit-edn! path data))
