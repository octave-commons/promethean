(ns opencode-unified.buffers
  (:require [opencode-unified.state :as state]
            [clojure.string :as str]
            [reagent.core :as r]
            [reagent.dom :as dom]))

;; Buffer ID counter
(defonce buffer-id-counter (r/atom 0))

(defn generate-buffer-id []
  (swap! buffer-id-counter inc))

;; Buffer management
(defn close-buffer [buffer-id]
  (let [buffer (get-in @state/app-state [:buffers buffer-id])]
    (when (and buffer (:modified? buffer))
      (when (js/confirm (str "Save changes to " (:name buffer) "?"))
        (state/update-current-buffer!
         (fn [b] (assoc b :id buffer-id)))
        ;; Save is not implemented yet, just log for now
        (println "Saving buffer" (:name buffer))))
    (state/remove-buffer! buffer-id)))

(defn kill-current-buffer []
  (when-let [buffer-id (:current-buffer @state/app-state)]
    (close-buffer buffer-id)))

;; File operations
(defn open-file [file-path]
  (let [buffer-id (generate-buffer-id)
        file-name (last (str/split file-path #"/"))
        ;; For demo purposes, create some sample content
        sample-content (cond
                         (str/ends-with? file-path ".cljs")
                         (str "(ns " (str/replace file-name ".cljs" "") "\n"
                              "  \"Sample ClojureScript file\"\n"
                              "  (:require [reagent.core :as r]))\n\n"
                              "(defn hello-world []\n"
                              "  (println \"Hello from ClojureScript!\"))\n")

                         (str/ends-with? file-path ".js")
                         (str "// Sample JavaScript file\n"
                              "function helloWorld() {\n"
                              "  console.log('Hello from JavaScript!');\n"
                              "}\n")

                         (str/ends-with? file-path ".md")
                         (str "# " file-name "\n\n"
                              "This is a sample markdown file.\n\n"
                              "## Features\n\n"
                              "- Feature 1\n"
                              "- Feature 2\n")

                         :else
                         (str "This is a sample file: " file-name "\n\n"
                              "File content would be loaded here.\n"))]
    (let [buffer (state/create-buffer buffer-id sample-content :name file-name :path file-path)]
      (state/add-buffer! buffer)
      (state/set-current-buffer! buffer-id)
      (println "Opened file:" file-path "with buffer ID:" buffer-id))))

(defn save-current-buffer []
  (println "Save current buffer not implemented yet"))

(defn save-current-buffer-as []
  (println "Save current buffer as not implemented yet"))

;; Buffer operations
(defn switch-buffer []
  (println "Switch buffer not implemented yet"))

(defn next-buffer []
  (println "Next buffer not implemented yet"))

(defn previous-buffer []
  (println "Previous buffer not implemented yet"))

(defn list-buffers []
  (println "List buffers not implemented yet"))

;; Search functionality
(defn search-next [query]
  (when-let [buffer (state/get-current-buffer)]
    (let [content (:content buffer)
          current-pos (:cursor-pos buffer)
          search-pos (inc current-pos)
          match-index (str/index-of content query search-pos)]
      (if match-index
        (do
          (state/update-current-buffer!
           (fn [b]
             (-> b
                 (assoc :cursor-pos match-index)
                 (assoc :selection {:start match-index
                                    :end (+ match-index (count query))}))))
          (println "Found at position:" match-index))
        (println "Not found:" query)))))

(defn search-prev [query]
  (when-let [buffer (state/get-current-buffer)]
    (let [content (:content buffer)
          current-pos (:cursor-pos buffer)
          search-pos (max 0 (dec current-pos))
          match-index (str/last-index-of content query search-pos)]
      (if match-index
        (do
          (state/update-current-buffer!
           (fn [b]
             (-> b
                 (assoc :cursor-pos match-index)
                 (assoc :selection {:start match-index
                                    :end (+ match-index (count query))}))))
          (println "Found at position:" match-index))
        (println "Not found:" query)))))

;; Editor component with Evil mode integration
(defn editor [buffer]
  (let [content (:content buffer)
        cursor-pos (:cursor-pos buffer)
        selection (:selection buffer)
        evil-mode (state/get-evil-mode)]

    [:textarea.editor-content
     {:value content
      :read-only (not= evil-mode :insert)
      :on-change (fn [e]
                   (when (= evil-mode :insert)
                     (let [new-value (-> e .-target .-value)
                           new-cursor-pos (-> e .-target .-selectionStart)]
                       (state/update-current-buffer!
                        (fn [b]
                          (-> b
                              (assoc :content new-value)
                              (assoc :cursor-pos new-cursor-pos)
                              (assoc :modified? true)))))))
      :on-key-down (fn [e]
                     (when-not (or (.-ctrlKey e) (.-altKey e) (.-metaKey e))
                       (let [key (.-key e)]
                         (when (and (not= evil-mode :insert)
                                    (or (and (>= (.-keyCode e) 37) (<= (.-keyCode e) 40)) ; arrow keys
                                        (and (>= (.-keyCode e) 48) (<= (.-keyCode e) 57)) ; numbers
                                        (= key "Escape")
                                        (some #(= key %) ["h" "j" "k" "l" "w" "b" "e" "0" "$" "g" "G"
                                                          "i" "I" "a" "A" "o" "O" "v" "V"
                                                          "y" "d" "c" "p" "P" "x" "X"
                                                          "/" "?" "n" "N" "u"])))
                           (.preventDefault e)
                           ((resolve 'opencode-unified.evil/handle-key) e)))))
      :style {:width "100%"
              :height "100%"
              :border "none"
              :outline "none"
              :background "transparent"
              :color "var(--text-primary)"
              :font-family "monospace"
              :font-size "14px"
              :line-height "1.5"
              :padding "1rem"
              :resize "none"
              :white-space "pre"
              :overflow "auto"}}]))

;; Command palette
(defn command-palette []
  (println "Command palette not implemented yet"))

(defn show-command-palette []
  (println "Show command palette not implemented yet"))

;; Window operations (placeholders)
(defn other-window []
  (println "Other window not implemented yet"))

(defn split-window []
  (println "Split window not implemented yet"))

(defn vsplit-window []
  (println "Vertical split window not implemented yet"))

(defn close-window []
  (println "Close window not implemented yet"))

;; File operations (placeholders)
(defn find-file []
  (println "Find file not implemented yet"))

(defn find-file-in-project []
  (println "Find file in project not implemented yet"))

(defn switch-project []
  (println "Switch project not implemented yet"))

;; Editor operations (placeholders)
(defn eval-expression []
  (println "Eval expression not implemented yet"))

;; UI operations
(defn toggle-terminal []
  (println "Toggle terminal not implemented yet"))

(defn toggle-fullscreen []
  (println "Toggle fullscreen not implemented yet"))

(defn open-settings []
  (println "Open settings not implemented yet"))

;; Buffer position utilities
(defn pos-to-line-col [content pos]
  "Convert buffer position to line and column numbers (0-based)"
  (let [lines (str/split-lines content)
        before-pos (subs content 0 pos)
        line-count (dec (count (str/split-lines before-pos)))]
    (if (= line-count -1)
      [0 0]
      (let [last-line-start (str/last-index-of before-pos "\n")
            col (if (nil? last-line-start)
                  pos
                  (- pos (inc last-line-start)))]
        [line-count col]))))

(defn line-col-to-pos [content line col]
  "Convert line and column numbers (0-based) to buffer position"
  (let [lines (str/split-lines content)
        line-count (count lines)
        line-num (if (and (number? line) (>= line 0)) line 0)]
    (if (>= line-num line-count)
      (count content)
      (loop [current-line 0
             pos 0
             remaining-lines lines]
        (if (= current-line line-num)
          (+ pos (min col (count (first remaining-lines))))
          (recur (inc current-line)
                 (+ pos (inc (count (first remaining-lines))))
                 (rest remaining-lines)))))))

(defn get-line-content [content line-num]
  "Get content of specific line (0-based)"
  (let [lines (str/split-lines content)]
    (when (< line-num (count lines))
      (nth lines line-num))))

(defn get-line-count [content]
  "Get total number of lines in content"
  (count (str/split-lines content)))

(defn get-current-line [buffer]
  "Get current line number (0-based) for buffer"
  (let [content (:content buffer)
        cursor-pos (:cursor-pos buffer)]
    (first (pos-to-line-col content cursor-pos))))

(defn get-current-col [buffer]
  "Get current column number (0-based) for buffer"
  (let [content (:content buffer)
        cursor-pos (:cursor-pos buffer)]
    (second (pos-to-line-col content cursor-pos))))

(defn move-cursor-to-line [buffer line-num]
  "Move cursor to start of specific line (0-based)"
  (let [content (:content buffer)
        line-count (get-line-count content)]
    (if (>= line-num line-count)
      buffer
      (let [new-pos (line-col-to-pos content line-num 0)]
        (assoc buffer :cursor-pos new-pos)))))

(defn move-cursor-to-line-col [buffer line-num col-num]
  "Move cursor to specific line and column (0-based)"
  (let [content (:content buffer)
        line-count (get-line-count content)]
    (if (>= line-num line-count)
      buffer
      (let [new-pos (line-col-to-pos content line-num col-num)]
        (assoc buffer :cursor-pos new-pos)))))

(defn get-line-range [content line-num]
  "Get start and end positions of a line (0-based)"
  (let [lines (str/split-lines content)
        line-count (count lines)]
    (when (< line-num line-count)
      (let [start-pos (line-col-to-pos content line-num 0)
            line-content (nth lines line-num)
            end-pos (+ start-pos (count line-content))]
        [start-pos end-pos]))))

(defn get-word-at-cursor [buffer]
  "Get the word at the current cursor position"
  (let [content (:content buffer)
        cursor-pos (:cursor-pos buffer)
        [line col] (pos-to-line-col content cursor-pos)
        line-content (get-line-content content line)]
    (when line-content
      (let [before (subs line-content 0 col)
            after (subs line-content col)
            word-chars "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
            word-before (take-while #(str/includes? word-chars (str %)) (reverse before))
            word-after (take-while #(str/includes? word-chars (str %)) after)
            word (str (apply str (reverse word-before)) word-after)]
        (when (not (empty? word))
          word)))))

(defn find-buffer-by-path [path]
  "Find buffer by file path"
  (let [buffers (:buffers @state/app-state)]
    (first (filter #(= (:path %) path) (vals buffers)))))

;; Word boundary finding
(defn find-next-word-boundary [content pos]
  "Find the next word boundary starting from pos"
  (let [word-chars "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
        content-len (count content)]
    (loop [current-pos pos]
      (if (>= current-pos content-len)
        content-len
        (let [char (get content current-pos)]
          (if (str/includes? word-chars char)
            (recur (inc current-pos))
            current-pos))))))

(defn find-prev-word-boundary [content pos]
  "Find the previous word boundary starting from pos"
  (let [word-chars "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"]
    (loop [current-pos (max 0 (dec pos))]
      (if (< current-pos 0)
        0
        (let [char (get content current-pos)]
          (if (str/includes? word-chars char)
            (recur (dec current-pos))
            (inc current-pos)))))))