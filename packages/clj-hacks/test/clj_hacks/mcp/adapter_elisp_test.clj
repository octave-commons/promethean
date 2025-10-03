(ns clj-hacks.mcp.adapter-elisp-test
  (:require [babashka.fs :as fs]
            [clj-hacks.mcp.adapter-elisp :as adapter]
            [clojure.test :refer :all]))

(def sample-elisp
  (str "(with-eval-after-load 'mcp\n"
       "  (message \"noop\"))\n\n"
       "(with-eval-after-load 'mcp\n"
       "  (setq mcp-hub-servers\n"
       "        '(( \"github\" .\n"
       "            (:command \"/home/err/devel/promethean/scripts/mcp/bin/github.sh\"))\n"
       "          ( \"npm-helper\" .\n"
       "            (:command \"npx\"\n"
       "                      :args (\"-y\" \"@pinkpixel/npm-helper-mcp\")\n"
       "                      :cwd \"$HOME/devel/promethean\"))\n"
       "          )))\n"))

(deftest read-full-parses-hub-servers
  (let [tmp  (fs/create-temp-file {:prefix "mcp-elisp-" :suffix ".el"})
        path (str tmp)]
    (spit path sample-elisp)
    (let [{:keys [mcp rest raw]} (adapter/read-full path)
          servers (:mcp-servers mcp)]
      (is (= "/home/err/devel/promethean/scripts/mcp/bin/github.sh"
             (get-in servers [:github :command])))
      (is (= ["-y" "@pinkpixel/npm-helper-mcp"]
             (get-in servers [:npm-helper :args])))
      (is (= "$HOME/devel/promethean"
             (get-in servers [:npm-helper :cwd])))
      (is (string? rest))
      (is (string? raw)))))

(deftest write-full-renders-new-format
  (let [tmp     (fs/create-temp-file {:prefix "mcp-elisp-out-" :suffix ".el"})
        path    (str tmp)
        servers {:github {:command "/home/err/devel/promethean/scripts/mcp/bin/github.sh"}
                 :npm-helper {:command "npx"
                              :args ["-y" "@pinkpixel/npm-helper-mcp"]
                              :cwd "$HOME/devel/promethean"}}
        data    {:mcp {:mcp-servers servers}
                 :rest ";; header\n"}
        expected (str ";; header\n\n"
                      "(with-eval-after-load 'mcp\n"
                      "  (setq mcp-hub-servers\n"
                      "        '(( \"github\" .\n"
                      "            (:command \"/home/err/devel/promethean/scripts/mcp/bin/github.sh\"))\n"
                      "          ( \"npm-helper\" .\n"
                      "            (:command \"npx\"\n"
                      "                      :args (\"-y\" \"@pinkpixel/npm-helper-mcp\")\n"
                      "                      :cwd \"$HOME/devel/promethean\"))\n"
                      "          )))\n")]
    (adapter/write-full path data)
    (is (= expected (slurp path)))))
