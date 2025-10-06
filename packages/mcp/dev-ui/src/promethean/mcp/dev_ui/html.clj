(ns promethean.mcp.dev-ui.html)

(defn- emit-attr-value [value]
  `(promethean.mcp.dev-ui.runtime/fragment->string ~value))

(defn- emit-node [node]
  (cond
    (vector? node)
    (let [tag (name (first node))
          rest-nodes (rest node)
          [attrs children] (if (and (seq rest-nodes) (map? (first rest-nodes)))
                              [(first rest-nodes) (rest rest-nodes)]
                              [nil rest-nodes])
          attr-exprs (vec (for [[k v] attrs]
                            `[~(name k) ~(emit-attr-value v)]))
          child-exprs (vec (for [child children]
                             (emit-node child)))]
      `(promethean.mcp.dev-ui.runtime/element ~tag ~attr-exprs ~child-exprs))

    (string? node) node
    (keyword? node) (name node)
    :else `(promethean.mcp.dev-ui.runtime/fragment->string ~node)))

(defmacro html [& nodes]
  (let [parts (for [node nodes]
                (emit-node node))]
    `(promethean.mcp.dev-ui.runtime/join* ~(vec parts))))
