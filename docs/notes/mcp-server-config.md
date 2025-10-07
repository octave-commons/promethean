---
$$
uuid: e7aac5db-1ee9-49b5-891a-2f4655b2c28c
$$
$$
created_at: '2025-09-03T14:01:47Z'
$$
$$
filename: mcp-server-config
$$
$$
title: mcp-server-config
$$
$$
description: >-
$$
  Elisp configuration for Model Context Protocol (MCP) servers with proper
  command structures and paths. This file defines server programs and their
  execution commands for seamless integration with Emacs and other tools.
tags:
  - elisp
  - mcp
  - configuration
  - command
  - server
$$
related_to_uuid:
$$
  - a39e72eb-34f4-45d2-9b59-a0f9f4a12fc0
  - 01c5547f-27eb-42d1-af24-9cad10b6a2ca
  - 3e74aac4-d652-4ba2-be14-524d5dfb98f1
$$
related_to_title:
$$
  - mcp-server-config
  - run-step-api
  - Promethean CI/CD Pipeline
references:
  - uuid: a39e72eb-34f4-45d2-9b59-a0f9f4a12fc0
    line: 175
    col: 0
    score: 0.9
  - uuid: a39e72eb-34f4-45d2-9b59-a0f9f4a12fc0
    line: 25
    col: 0
    score: 0.87
---


```elisp

;; Wrong way, right data
(setq mcp-server-programs
      '(("backseat-driver" . ("/home/err/.config/calva/backseat-driver/calva-mcp-server.js" ["1664"]))
  ("duckduckgo" . ("/home/err/devel/promethean/scripts/mcp/bin/duck.sh"))
  ("file-system" . ("/home/err/devel/promethean/scripts/mcp/bin/filesystem.sh"))
  ("github" . ("/home/err/devel/promethean/scripts/mcp/bin/github.sh"))
  ("github-chat" . ("/home/err/devel/promethean/scripts/mcp/bin/github_chat.sh"))
  ("haiku-rag" . ("uvx" ["haiku-rag" "serve" "--stdio" "--db" "/home/err/.local/share/haiku-rag/db"]))
  ("ts-ls-lsp" . ("npx" ["tritlo/lsp-mcp" "typescript" "/home/err/.volta/bin/typescript-language-server" "--stdio"]))
  ("npm-helper" . ("npx" ["-y" "npm-helper-mcp"]))
  ("obsidian" . ("/home/err/devel/promethean/scripts/mcp/bin/obsidian.sh"))
  ("sonarqube" . ("/home/err/devel/promethean/scripts/mcp/bin/sonarqube.sh"))))
;; Right wway
(setq mcp-hub-servers ("filesystem" . (:command "npx"
                                                :args ("-y" "@modelcontextprotocol/server-filesystem"
                                                       "~/devel/promethean"))))
```

First we need the right way with the right data:

 ```elisp
(setq mcp-hub-servers
      '((:name "filesystem"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-filesystem"
                         "~/devel/promethean")))
        (:name "github"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-github"
                         "~/devel/promethean")))
        (:name "sonarqube"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-sonarqube"
                         "~/devel/promethean")))
        (:name "ts-ls-lsp"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-lsp-mcp"
                         "~/devel/promethean")))
        (:name "duckduckgo"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-duckduckgo"
                         "~/devel/promethean")))
        (:name "haiku-rag"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-haiku-rag"
                         "~/devel/promethean")))
        (:name "github-chat"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-github-chat"
                         "~/devel/promethean")))
        (:name "obsidian"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-obsidian"
                         "~/devel/promethean")))))
```
$$
^ref-a39e72eb-25-0
$$

## clojure multi config
We generate the wrong way from this file, this is a part of a larger progrma which generates several mcp config files
to many locations with different schemas using the same mcp servers.

We want to update this so it works to generate the right kind of lisp for mcp.el
```clj
(ns mk.mcp-adapter-elisp
  (:require [clojure.string :as str]
            [mk.mcp-core :as core]))

(def re-setq #"\(setq\s+mcp-server-programs\s+'\((?s:.*?)\)\)")

(defn read-full [path]
  (let [s (slurp path)
        ;; parse entries from our known shape (round-trip compatible)
        re-entry #"\(\s*\"([^\"]+)\"\s*\.\s*\(\s*\"([^\"]+)\"\s*(\[.*?\])?\s*\)\s*\)"
        ms (re-seq re-entry s)
        mcp {:mcp-servers
             (into (sorted-map)
                   (for [[_ nm cmd args-edn] ms]
                     [(keyword nm)
                      (cond-> {:command cmd}
                        (and args-edn (not (str/blank? args-edn)))
                        (assoc :args (vec (read-string args-edn))) )]))}
        rest (str/replace s re-setq "")]
    {:mcp mcp :rest rest :raw s}))

(defn- render-entry [[k {:keys [command args]}]]
  (format "  (\"%s\" . (\"%s\"%s))"
          (name k) command (if (seq args) (str " " (pr-str (vec args))) "")))

(defn- render-setq [mcp]
  (str "(setq mcp-server-programs\n"
       "      '(\n"
       (str/join "\n" (map render-entry (:mcp-servers mcp)))
       "\n      ))"))

(defn write-full [path {:keys [mcp rest]}]
  (let [setq (render-setq mcp)
        base (or rest "")
        out (if (re-find re-setq base)
              (str/replace base re-setq setq)
              (str (str/trimr base) "\n\n" setq "\n"))]
    (core/ensure-parent! path)
    (spit path out)))
```

```edn
{:mcp-servers
 {:github
  {:command "/home/err/devel/promethean/scripts/mcp/bin/github.sh"}

  :github-chat
  {:command "/home/err/devel/promethean/scripts/mcp/bin/github_chat.sh"}

  :sonarqube
  {:command "/home/err/devel/promethean/scripts/mcp/bin/sonarqube.sh"}

  :file-system
  {:command "/home/err/devel/promethean/scripts/mcp/bin/filesystem.sh"}

  :obsidian
  {:command "/home/err/devel/promethean/scripts/mcp/bin/obsidian.sh"}

  :duckduckgo
  {:command "/home/err/devel/promethean/scripts/mcp/bin/duck.sh"}

  :npm-helper
  {:command "npx"
   :args ["-y" "npm-helper-mcp"]}

  :ts-ls-lsp
  {:command "npx"
   :args ["tritlo/lsp-mcp"
          "typescript"
          "/home/err/.volta/bin/typescript-language-server"
          "--stdio"]}

  :haiku-rag
  {:command "uvx"
   :args ["haiku-rag"
          "serve"
          "--stdio"
          "--db" "/home/err/.local/share/haiku-rag/db"]}

  :backseat-driver
  {:command "/home/err/.config/calva/backseat-driver/calva-mcp-server.js"
   :args ["1664"]}}

 :outputs
 [{:schema :codex.toml  :path "/home/err/.codex/config.toml"}
  ;; {:schema :codex.json  :path "out/codex.json"}
  {:schema :vscode.json :path "/home/err/.config/User/mcp.json"
   :opts {:include-inputs? true}}
  ;; codex json is just th wrong way to describe this schema.
  ;; but codium/windsurf expects this format, so...
  ;; This is more like claud.json, since this is how they did it, and they started this whole
  ;; MCP craze
  ;; Wind Surf
  {:schema :codex.json :path "/home/err/.codeium/windsurf/mcp_config.json"}
  ;; Oterm
  {:schema :codex.json :path "/home/err/.local/share/oterm/config.json"}

  ;; Emacs MCP package
  {:schema :elisp       :path "/home/err/devel/promethean/.emacs/layers/llm/config.el"}]}
```

# The refactored program

The above program is not idempotent, generates the wrong list schema, and attaches it to the wrong variable name, in the wrong way.

Given the above edn config file, we expect `/home/err/devel/promethean/.emacs/layers/llm/config.el` to have the following added to the bottom of the file if it is not already:

```elisp
;; AUTO GENREATED MCP SERVER CONFIG BY mk.mcp-cli START
(with-eval-after-load 'mcp
  (setq mcp-hub-servers
      '((:name "filesystem"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-filesystem"
                         "~/devel/promethean")))
        (:name "github"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-github"
                         "~/devel/promethean")))
        (:name "sonarqube"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-sonarqube"
                         "~/devel/promethean")))
        (:name "ts-ls-lsp"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-lsp-mcp"
                         "~/devel/promethean")))
        (:name "duckduckgo"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-duckduckgo"
                         "~/devel/promethean")))
        (:name "haiku-rag"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-haiku-rag"
                         "~/devel/promethean")))
        (:name "github-chat"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-github-chat"
                         "~/devel/promethean")))
        (:name "obsidian"
         (:command "npx"
                  :args ("-y" "@modelcontextprotocol/server-obsidian"
                         "~/devel/promethean"))))))
;; AUTO GENREATED MCP SERVER CONFIG BY mk.mcp-cli START
^ref-a39e72eb-175-0
```

If there is anything between the two comments in the target file, the contents between them is erased, and replaced with the new version.


## Solution

new bb script module that:
- generates an valid elisp s-expression mcp-hub-server list content within a `with-eval-after-load`
- The sexprsesion  is placed between two comments
- If there is already an s-expression between the comemnts, erase it and rewrite it with the new value from th ecurrent `config.edn`
aced between two comments
- If there is already an s-expression between the comemnts, erase it and rewrite it with the new value from th ecurrent `config.edn`
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $mcp-server-config$(2025.09.03.14.01.47.md)
- $run-step-api$$run-step-api.md$
- $Promethean CI/CD Pipeline$$promethean-ci-cd-pipeline.md$
## Sources
- $mcp-server-config — L175$$2025.09.03.14.01.47.md#^ref-a39e72eb-175-0$ (line 175, col 0, score 0.9)
- $mcp-server-config — L25$$2025.09.03.14.01.47.md#^ref-a39e72eb-25-0$ (line 25, col 0, score 0.87)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
