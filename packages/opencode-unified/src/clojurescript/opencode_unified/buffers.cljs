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
                     (let [key (.-key e)
                           ctrl-key (.-ctrlKey e)
                           alt-key (.-altKey e)
                           meta-key (.-metaKey e)]
                       (when-not (or ctrl-key alt-key meta-key)
                         (case evil-mode
                           :normal (handle-normal-mode-key e key)
                           :insert (when (= key "Escape")
                                     (.preventDefault e)
                                     (enter-normal-mode))
                           :visual (handle-visual-mode-key e key)
                           nil))))
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

;; Simplified key handlers for basic Evil mode
(defn handle-normal-mode-key [e key]
  (case key
    ;; Mode switches
    "i" (do (.preventDefault e) (enter-insert-mode))
    "v" (do (.preventDefault e) (enter-visual-mode))
    "V" (do (.preventDefault e) (enter-visual-line-mode))

    ;; Basic motions
    "h" (do (.preventDefault e) (move-cursor-left e))
    "j" (do (.preventDefault e) (move-cursor-down e))
    "k" (do (.preventDefault e) (move-cursor-up e))
    "l" (do (.preventDefault e) (move-cursor-right e))
    "0" (do (.preventDefault e) (move-to-line-start e))
    "$" (do (.preventDefault e) (move-to-line-end e))

    ;; Basic operators
    "x" (do (.preventDefault e) (delete-char e))
    "dd" (do (.preventDefault e) (delete-line e))

    nil))

(defn handle-visual-mode-key [e key]
  (case key
    "Escape" (do (.preventDefault e) (exit-visual-mode))
    "h" (do (.preventDefault e) (extend-selection-left e))
    "j" (do (.preventDefault e) (extend-selection-down e))
    "k" (do (.preventDefault e) (extend-selection-up e))
    "l" (do (.preventDefault e) (extend-selection-right e))
    "y" (do (.preventDefault e) (yank-selection e))
    "d" (do (.preventDefault e) (delete-selection e))
    nil))

;; Motion functions
(defn move-cursor-left [e]
  (let [el (.-target e)
        current-pos (.-selectionStart el)]
    (when (> current-pos 0)
      (set! (.-selectionStart el) (dec current-pos))
      (set! (.-selectionEnd el) (dec current-pos))
      (state/update-current-buffer! (fn [b] (assoc b :cursor-pos (dec current-pos)))))))

(defn move-cursor-right [e]
  (let [el (.-target e)
        current-pos (.-selectionStart el)
        max-pos (.-length (.-value el))]
    (when (< current-pos max-pos)
      (set! (.-selectionStart el) (inc current-pos))
      (set! (.-selectionEnd el) (inc current-pos))
      (state/update-current-buffer! (fn [b] (assoc b :cursor-pos (inc current-pos)))))))

(defn move-cursor-up [e]
  (let [el (.-target e)
        content (.-value el)
        current-pos (.-selectionStart el)
        [line col] (pos-to-line-col content current-pos)]
    (when (> line 0)
      (let [new-pos (line-col-to-pos content (dec line) col)]
        (set! (.-selectionStart el) new-pos)
        (set! (.-selectionEnd el) new-pos)
        (state/update-current-buffer! (fn [b] (assoc b :cursor-pos new-pos)))))))

(defn move-cursor-down [e]
  (let [el (.-target e)
        content (.-value el)
        current-pos (.-selectionStart el)
        [line col] (pos-to-line-col content current-pos)
        line-count (get-line-count content)]
    (when (< line (dec line-count))
      (let [new-pos (line-col-to-pos content (inc line) col)]
        (set! (.-selectionStart el) new-pos)
        (set! (.-selectionEnd el) new-pos)
        (state/update-current-buffer! (fn [b] (assoc b :cursor-pos new-pos)))))))

(defn move-to-line-start [e]
  (let [el (.-target e)
        content (.-value el)
        current-pos (.-selectionStart el)
        [line _] (pos-to-line-col content current-pos)
        new-pos (line-col-to-pos content line 0)]
    (set! (.-selectionStart el) new-pos)
    (set! (.-selectionEnd el) new-pos)
    (state/update-current-buffer! (fn [b] (assoc b :cursor-pos new-pos)))))

(defn move-to-line-end [e]
  (let [el (.-target e)
        content (.-value el)
        current-pos (.-selectionStart el)
        [line _] (pos-to-line-col content current-pos)
        line-content (get-line-content content line)
        new-pos (line-col-to-pos content line (count line-content))]
    (set! (.-selectionStart el) new-pos)
    (set! (.-selectionEnd el) new-pos)
    (state/update-current-buffer! (fn [b] (assoc b :cursor-pos new-pos)))))

;; Operator functions
(defn delete-char [e]
  (let [el (.-target e)
        content (.-value el)
        current-pos (.-selectionStart el)]
    (when (< current-pos (count content))
      (let [new-content (str (subs content 0 current-pos) (subs content (inc current-pos)))]
        (set! (.-value el) new-content)
        (state/update-current-buffer!
         (fn [b]
           (-> b
               (assoc :content new-content)
               (assoc :cursor-pos current-pos)
               (assoc :modified? true))))))))

(defn delete-line [e]
  (let [el (.-target e)
        content (.-value el)
        current-pos (.-selectionStart el)
        [line _] (pos-to-line-col content current-pos)
        line-range (get-line-range content line)
        [start-pos end-pos] line-range
        new-content (str (subs content 0 start-pos) (subs content end-pos))]
    (set! (.-value el) new-content)
    (state/update-current-buffer!
     (fn [b]
       (-> b
           (assoc :content new-content)
           (assoc :cursor-pos start-pos)
           (assoc :modified? true))))))

;; Visual mode functions
(defn extend-selection-left [e]
  (let [el (.-target e)
        current-end (.-selectionEnd el)]
    (when (> current-end 0)
      (set! (.-selectionEnd el) (dec current-end))
      (state/update-current-buffer!
       (fn [b]
         (let [start (.-selectionStart el)
               end (.-selectionEnd el)]
           (assoc b :selection {:start (min start end) :end (max start end)})))))))

(defn extend-selection-right [e]
  (let [el (.-target e)
        current-end (.-selectionEnd el)
        max-pos (.-length (.-value el))]
    (when (< current-end max-pos)
      (set! (.-selectionEnd el) (inc current-end))
      (state/update-current-buffer!
       (fn [b]
         (let [start (.-selectionStart el)
               end (.-selectionEnd el)]
           (assoc b :selection {:start (min start end) :end (max start end)})))))))

(defn extend-selection-up [e]
  (let [el (.-target e)
        content (.-value el)
        current-end (.-selectionEnd el)
        [line col] (pos-to-line-col content current-end)]
    (when (> line 0)
      (let [new-pos (line-col-to-pos content (dec line) col)]
        (set! (.-selectionEnd el) new-pos)
        (state/update-current-buffer!
         (fn [b]
           (let [start (.-selectionStart el)
                 end (.-selectionEnd el)]
             (assoc b :selection {:start (min start end) :end (max start end)}))))))))

(defn extend-selection-down [e]
  (let [el (.-target e)
        content (.-value el)
        current-end (.-selectionEnd el)
        [line col] (pos-to-line-col content current-end)
        line-count (get-line-count content)]
    (when (< line (dec line-count))
      (let [new-pos (line-col-to-pos content (inc line) col)]
        (set! (.-selectionEnd el) new-pos)
        (state/update-current-buffer!
         (fn [b]
           (let [start (.-selectionStart el)
                 end (.-selectionEnd el)]
             (assoc b :selection {:start (min start end) :end (max start end)}))))))))

(defn yank-selection [e]
  (let [el (.-target e)
        content (.-value el)
        start (.-selectionStart el)
        end (.-selectionEnd el)
        selected-text (.substring content (min start end) (max start end))]
    (state/set-evil-register! selected-text)
    (exit-visual-mode)))

(defn delete-selection [e]
  (let [el (.-target e)
        content (.-value el)
        start (.-selectionStart el)
        end (.-selectionEnd el)
        selected-text (.substring content (min start end) (max start end))
        new-content (str (subs content 0 (min start end)) (subs content (max start end)))]
    (state/set-evil-register! selected-text)
    (set! (.-value el) new-content)
    (set! (.-selectionStart el) (min start end))
    (set! (.-selectionEnd el) (min start end))
    (state/update-current-buffer!
     (fn [b]
       (-> b
           (assoc :content new-content)
           (assoc :cursor-pos (min start end))
           (assoc :selection nil)
           (assoc :modified? true))))
    (enter-normal-mode)))

;; Mode transition functions
(defn enter-insert-mode []
  (state/set-evil-mode! :insert)
  (update-statusbar))

(defn enter-normal-mode []
  (state/update-current-buffer! (fn [b] (assoc b :selection nil)))
  (state/set-evil-mode! :normal)
  (update-statusbar))

(defn enter-visual-mode []
  (let [current-buffer (state/get-current-buffer)]
    (when current-buffer
      (let [cursor-pos (:cursor-pos current-buffer)]
        (state/update-current-buffer!
         (fn [b]
           (assoc b :selection {:start cursor-pos :end cursor-pos})))))
    (state/set-evil-mode! :visual)
    (update-statusbar)))

(defn enter-visual-line-mode []
  (let [current-buffer (state/get-current-buffer)]
    (when current-buffer
      (let [content (:content current-buffer)
            cursor-pos (:cursor-pos current-buffer)
            [line _] (pos-to-line-col content cursor-pos)
            line-range (get-line-range content line)]
        (state/update-current-buffer!
         (fn [b]
           (assoc b :selection {:start (first line-range) :end (second line-range)})))))
    (state/set-evil-mode! :visual-line)
    (update-statusbar)))

(defn exit-visual-mode []
  (state/update-current-buffer! (fn [b] (assoc b :selection nil)))
  (enter-normal-mode))

(defn update-statusbar []
  (let [mode (state/get-evil-mode)
        mode-name (case mode
                    :normal "NORMAL"
                    :insert "INSERT"
                    :visual "VISUAL"
                    :visual-line "VISUAL LINE"
                    "")
        current-buffer (state/get-current-buffer)
        buffer-info (when current-buffer
                      (let [content (:content current-buffer)
                            cursor-pos (:cursor-pos current-buffer)
                            [line col] (pos-to-line-col content cursor-pos)
                            lines (str/split-lines content)]
                        (str "Line " (inc line) ", Col " (inc col)
                             " of " (count lines)
                             (when (:modified? current-buffer) " [+]"))))]

    (state/update-statusbar!
     mode-name
     (or buffer-info "")
     (str "Evil Mode - " (name mode)))))

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