(ns opencode-unified.evil
  (:require [opencode-unified.state :as state]
            [opencode-unified.buffers :as buffers]
            [clojure.string :as str]))

;; Key handling functions
(defn handle-normal-key [key ctrl? alt? shift? meta?]
  (cond
    ;; Movement
    (= key "h") (move-cursor :left)
    (= key "j") (move-cursor :down)
    (= key "k") (move-cursor :up)
    (= key "l") (move-cursor :right)
    (= key "w") (word-forward)
    (= key "b") (word-backward)
    (= key "e") (end-of-word)
    (= key "0") (beginning-of-line)
    (= key "$") (end-of-line)
    (= key "g") (when (not shift?) (beginning-of-buffer))
    (= key "G") (end-of-buffer)

    ;; Mode changes
    (= key "i") (enter-insert-mode)
    (= key "I") (insert-at-start-of-line)
    (= key "a") (append-after-cursor)
    (= key "A") (append-at-end-of-line)
    (= key "o") (open-line-below)
    (= key "O") (open-line-above)
    (= key "v") (start-visual-selection)
    (= key "V") (start-visual-line-selection)
    (= key "Escape") (exit-visual-mode)

    ;; Operators
    (= key "y") (yank-line)
    (= key "d") (delete-line)
    (= key "c") (change-line)
    (= key "p") (paste-after)
    (= key "P") (paste-before)
    (= key "x") (delete-char-at-cursor)
    (= key "X") (delete-char-before-cursor)

    ;; Search
    (= key "/") (search-forward)
    (= key "?") (search-backward)
    (= key "n") (next-search-result)
    (= key "N") (previous-search-result)

    ;; Undo/Redo
    (= key "u") (undo)
    (and ctrl? (= key "r")) (redo)

    ;; Count handling
    (re-matches #"[0-9]" key) (state/set-evil-count!
                               (-> (state/get-evil-count)
                                   str
                                   (str key)
                                   js/parseInt))))

(defn handle-insert-key [key _ctrl? _alt? _shift? _meta?]
  (when (= key "Escape")
    (enter-normal-mode)))

(defn handle-visual-key [key _ctrl? _alt? _shift? _meta?]
  (cond
    ;; Movement
    (= key "h") (extend-selection :left)
    (= key "j") (extend-selection :down)
    (= key "k") (extend-selection :up)
    (= key "l") (extend-selection :right)
    (= key "w") (do (word-forward) (extend-selection :right))
    (= key "b") (do (word-backward) (extend-selection :left))
    (= key "e") (do (end-of-word) (extend-selection :right))
    (= key "0") (do (beginning-of-line) (extend-selection :left))
    (= key "$") (do (end-of-line) (extend-selection :right))
    (= key "g") (when (not shift?) (do (beginning-of-buffer) (extend-selection :left)))
    (= key "G") (do (end-of-buffer) (extend-selection :right))

    ;; Mode changes
    (= key "Escape") (exit-visual-mode)

    ;; Operators
    (= key "y") (yank-selection)
    (= key "d") (delete-selection)
    (= key "c") (change-selection)
    (= key "x") (delete-selection)
    (= key "X") (delete-selection)

    ;; Count handling
    (re-matches #"[0-9]" key) (state/set-evil-count!
                               (-> (state/get-evil-count)
                                   str
                                   (str key)
                                   js/parseInt))))

(defn handle-key [key-event]
  (let [key (.-key key-event)
        ctrl? (.-ctrlKey key-event)
        alt? (.-altKey key-event)
        shift? (.-shiftKey key-event)
        meta? (.-metaKey key-event)
        mode (get-mode)]

    (case mode
      :normal (handle-normal-key key ctrl? alt? shift? meta?)
      :insert (handle-insert-key key ctrl? alt? shift? meta?)
      :visual (handle-visual-key key ctrl? alt? shift? meta?)
      :visual-line (handle-visual-key key ctrl? alt? shift? meta?))))

;; Evil mode implementation
(defn set-mode! [mode]
  (state/set-evil-mode! mode)
  (update-statusbar))

(defn get-mode []
  (state/get-evil-mode))

(defn update-statusbar []
  (let [mode (get-mode)
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
                            [line col] (buffers/pos-to-line-col content cursor-pos)
                            lines (str/split-lines content)]
                        (str "Line " (inc line) ", Col " (inc col)
                             " of " (count lines)
                             (when (:modified? current-buffer) " [+]"))))]

    (state/update-statusbar!
     mode-name
     (or buffer-info "")
     (str "Evil Mode - " (name mode)))))

;; Mode transitions
(defn enter-normal-mode []
  (set-mode! :normal)
  (update-statusbar))

(defn enter-insert-mode []
  (set-mode! :insert)
  (update-statusbar))

(defn enter-visual-mode []
  (let [current-buffer (state/get-current-buffer)]
    (when current-buffer
      (state/update-current-buffer!
       (fn [buffer]
         (assoc buffer :selection {:start (:cursor-pos buffer)
                                   :end (:cursor-pos buffer)})))))
  (set-mode! :visual)
  (update-statusbar))

(defn enter-visual-line-mode []
  (let [current-buffer (state/get-current-buffer)]
    (when current-buffer
      (let [content (:content current-buffer)
            cursor-pos (:cursor-pos current-buffer)
            [line _] (buffers/pos-to-line-col content cursor-pos)
            line-range (buffers/get-line-range content line)]
        (state/update-current-buffer!
         (fn [buffer]
           (assoc buffer :selection {:start (first line-range)
                                     :end (second line-range)}))))))
  (set-mode! :visual-line)
  (update-statusbar))

(defn exit-visual-mode []
  (state/update-current-buffer!
   (fn [buffer]
     (assoc buffer :selection nil)))
  (enter-normal-mode))

;; Cursor movement
(defn move-cursor [direction]
  (let [count (state/get-evil-count)]
    (dotimes [_ count]
      (state/update-current-buffer!
       (fn [buffer]
         (let [content (:content buffer)
               lines (str/split-lines content)
               current-pos (:cursor-pos buffer)
               line-count (count lines)

               [line col] (buffers/pos-to-line-col content current-pos)]

           (case direction
             :left (if (> col 0)
                     (assoc buffer :cursor-pos (buffers/line-col-to-pos content line (dec col)))
                     buffer)

             :right (if (< col (count (nth lines line)))
                      (assoc buffer :cursor-pos (buffers/line-col-to-pos content line (inc col)))
                      buffer)

             :up (if (> line 0)
                   (let [prev-line (nth lines (dec line))
                         new-col (min col (count prev-line))]
                     (assoc buffer :cursor-pos (buffers/line-col-to-pos content (dec line) new-col)))
                   buffer)

             :down (if (< line (dec line-count))
                     (let [next-line (nth lines (inc line))
                           new-col (min col (count next-line))]
                       (assoc buffer :cursor-pos (buffers/line-col-to-pos content (inc line) new-col)))
                     buffer)

             buffer))))))
  (state/set-evil-count! 1)
  (update-statusbar))

;; Word boundaries - improved implementation
(defn word-forward []
  (let [count (state/get-evil-count)]
    (dotimes [_ count]
      (state/update-current-buffer!
       (fn [buffer]
         (let [content (:content buffer)
               current-pos (:cursor-pos buffer)
               content-len (count content)]
           (if (>= current-pos content-len)
             buffer
             (let [word-chars "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
                   whitespace-chars " \t\n\r"]
               (loop [pos current-pos]
                 (cond
                   ;; Skip whitespace first
                   (and (< pos content-len)
                        (str/includes? whitespace-chars (get content pos)))
                   (recur (inc pos))

                   ;; Skip word characters
                   (and (< pos content-len)
                        (str/includes? word-chars (get content pos)))
                   (recur (inc pos))

                   ;; Found boundary
                   :else (assoc buffer :cursor-pos pos))))))))))
  (state/set-evil-count! 1)
  (update-statusbar))

(defn word-backward []
  (let [count (state/get-evil-count)]
    (dotimes [_ count]
      (state/update-current-buffer!
       (fn [buffer]
         (let [content (:content buffer)
               current-pos (:cursor-pos buffer)]
           (if (<= current-pos 0)
             (assoc buffer :cursor-pos 0)
             (let [word-chars "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
                   whitespace-chars " \t\n\r"]
               (loop [pos (max 0 (dec current-pos))]
                 (cond
                   ;; Skip whitespace first
                   (and (>= pos 0)
                        (str/includes? whitespace-chars (get content pos)))
                   (recur (max 0 (dec pos)))

                   ;; Skip word characters
                   (and (>= pos 0)
                        (str/includes? word-chars (get content pos)))
                   (recur (max 0 (dec pos)))

                   ;; Found boundary - move to start of word
                   :else (assoc buffer :cursor-pos (inc pos)))))))))))
  (state/set-evil-count! 1)
  (update-statusbar))

(defn end-of-word []
  (let [count (state/get-evil-count)]
    (dotimes [_ count]
      (state/update-current-buffer!
       (fn [buffer]
         (let [content (:content buffer)
               current-pos (:cursor-pos buffer)
               content-len (count content)]
           (if (>= current-pos content-len)
             buffer
             (let [word-chars "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
                   whitespace-chars " \t\n\r"]
               (loop [pos current-pos]
                 (cond
                   ;; If on whitespace, skip it first
                   (and (< pos content-len)
                        (str/includes? whitespace-chars (get content pos)))
                   (recur (inc pos))

                   ;; Skip word characters to find end
                   (and (< pos content-len)
                        (str/includes? word-chars (get content pos)))
                   (recur (inc pos))

                   ;; Found end of word
                   :else (assoc buffer :cursor-pos (max 0 (dec pos))))))))))))
  (state/set-evil-count! 1)
  (update-statusbar))

(defn beginning-of-line []
  (state/update-current-buffer!
   (fn [buffer]
     (let [content (:content buffer)
           current-pos (:cursor-pos buffer)
           [line _] (buffers/pos-to-line-col content current-pos)
           line-start-pos (buffers/line-col-to-pos content line 0)]
       (assoc buffer :cursor-pos line-start-pos))))
  (update-statusbar))

(defn end-of-line []
  (state/update-current-buffer!
   (fn [buffer]
     (let [content (:content buffer)
           current-pos (:cursor-pos buffer)
           [line _] (buffers/pos-to-line-col content current-pos)
           lines (str/split-lines content)
           line-end-pos (buffers/line-col-to-pos content line (count (nth lines line)))]
       (assoc buffer :cursor-pos line-end-pos))))
  (update-statusbar))

(defn beginning-of-buffer []
  (state/update-current-buffer!
   (fn [buffer]
     (assoc buffer :cursor-pos 0)))
  (update-statusbar))

(defn end-of-buffer []
  (state/update-current-buffer!
   (fn [buffer]
     (assoc buffer :cursor-pos (count (:content buffer)))))
  (update-statusbar))

;; Text editing
(defn insert-text-at-cursor [text]
  (state/update-current-buffer!
   (fn [buffer]
     (let [content (:content buffer)
           cursor-pos (:cursor-pos buffer)
           new-content (str (subs content 0 cursor-pos) text (subs content cursor-pos))
           new-cursor-pos (+ cursor-pos (count text))]
       (-> buffer
           (assoc :content new-content)
           (assoc :cursor-pos new-cursor-pos)
           (assoc :modified? true))))))

(defn delete-char-at-cursor []
  (state/update-current-buffer!
   (fn [buffer]
     (let [content (:content buffer)
           cursor-pos (:cursor-pos buffer)]
       (if (< cursor-pos (count content))
         (let [new-content (str (subs content 0 cursor-pos) (subs content (inc cursor-pos)))]
           (-> buffer
               (assoc :content new-content)
               (assoc :modified? true)))
         buffer)))))

(defn delete-char-before-cursor []
  (state/update-current-buffer!
   (fn [buffer]
     (let [content (:content buffer)
           cursor-pos (:cursor-pos buffer)]
       (if (> cursor-pos 0)
         (let [new-content (str (subs content 0 (dec cursor-pos)) (subs content cursor-pos))
               new-cursor-pos (dec cursor-pos)]
           (-> buffer
               (assoc :content new-content)
               (assoc :cursor-pos new-cursor-pos)
               (assoc :modified? true)))
         buffer)))))

;; Operators with motions
(defn yank-motion [motion-fn]
  (let [current-buffer (state/get-current-buffer)]
    (when current-buffer
      (let [content (:content current-buffer)
            start-pos (:cursor-pos current-buffer)]
        (motion-fn)
        (let [end-pos (:cursor-pos (state/get-current-buffer))]
          (let [yanked-text (subs content (min start-pos end-pos) (max start-pos end-pos))]
            (state/set-evil-register! yanked-text)
            ;; Restore cursor position
            (state/update-current-buffer! (fn [b] (assoc b :cursor-pos start-pos)))))))))

(defn delete-motion [motion-fn]
  (let [current-buffer (state/get-current-buffer)]
    (when current-buffer
      (let [content (:content current-buffer)
            start-pos (:cursor-pos current-buffer)]
        (motion-fn)
        (let [end-pos (:cursor-pos (state/get-current-buffer))]
          (let [start (min start-pos end-pos)
                end (max start-pos end-pos)
                new-content (str (subs content 0 start) (subs content end))]
            (state/update-current-buffer!
             (fn [buffer]
               (-> buffer
                   (assoc :content new-content)
                   (assoc :cursor-pos start)
                   (assoc :modified? true))))))))))

(defn change-motion [motion-fn]
  (delete-motion motion-fn)
  (enter-insert-mode))

;; Line operations
(defn delete-line []
  (let [count (state/get-evil-count)]
    (state/update-current-buffer!
     (fn [buffer]
       (let [content (:content buffer)
             current-pos (:cursor-pos buffer)
             [line _] (buffers/pos-to-line-col content current-pos)
             lines (str/split-lines content)
             line-count (count lines)
             end-line (min (+ line count) line-count)
             lines-to-delete (take count (drop line lines))
             deleted-text (str/join "\n" lines-to-delete)]
         ;; Yank deleted lines
         (state/set-evil-register! deleted-text)
         ;; Delete lines
         (let [new-lines (concat (take line lines) (drop end-line lines))
               new-content (str/join "\n" new-lines)
               new-cursor-pos (buffers/line-col-to-pos new-content (min line (count new-lines)) 0)]
           (-> buffer
               (assoc :content new-content)
               (assoc :cursor-pos new-cursor-pos)
               (assoc :modified? true)))))))
  (state/set-evil-count! 1)
  (update-statusbar))

(defn yank-line []
  (let [count (state/get-evil-count)]
    (state/update-current-buffer!
     (fn [buffer]
       (let [content (:content buffer)
             current-pos (:cursor-pos buffer)
             [line _] (buffers/pos-to-line-col content current-pos)
             lines (str/split-lines content)
             line-count (count lines)
             end-line (min (+ line count) line-count)
             lines-to-yank (take count (drop line lines))
             yanked-text (str/join "\n" lines-to-yank)]
         (state/set-evil-register! yanked-text)
         buffer))))
  (state/set-evil-count! 1)
  (update-statusbar))

(defn change-line []
  (delete-line)
  (enter-insert-mode))

(defn paste-after []
  (when-let [text (state/get-evil-register)]
    (let [count (state/get-evil-count)]
      (dotimes [_ count]
        (state/update-current-buffer!
         (fn [buffer]
           (let [content (:content buffer)
                 cursor-pos (:cursor-pos buffer)
                 new-content (str (subs content 0 cursor-pos) text (subs content cursor-pos))
                 new-cursor-pos (+ cursor-pos (count text))]
             (-> buffer
                 (assoc :content new-content)
                 (assoc :cursor-pos new-cursor-pos)
                 (assoc :modified? true))))))))
  (state/set-evil-count! 1)
  (update-statusbar))

(defn paste-before []
  (when-let [text (state/get-evil-register)]
    (let [count (state/get-evil-count)]
      (dotimes [_ count]
        (state/update-current-buffer!
         (fn [buffer]
           (let [content (:content buffer)
                 cursor-pos (:cursor-pos buffer)
                 new-content (str (subs content 0 cursor-pos) text (subs content cursor-pos))]
             (-> buffer
                 (assoc :content new-content)
                 (assoc :modified? true))))))))
  (state/set-evil-count! 1)
  (update-statusbar))

;; Line operations
(defn open-line-below []
  (state/update-current-buffer!
   (fn [buffer]
     (let [content (:content buffer)
           current-pos (:cursor-pos buffer)
           [line _] (buffers/pos-to-line-col content current-pos)
           lines (str/split-lines content)
           new-lines (concat (take (inc line) lines) [""] (drop (inc line) lines))
           new-content (str/join "\n" new-lines)
           new-cursor-pos (buffers/line-col-to-pos new-content (inc line) 0)]
       (-> buffer
           (assoc :content new-content)
           (assoc :cursor-pos new-cursor-pos)
           (assoc :modified? true)))))
  (enter-insert-mode))

(defn open-line-above []
  (state/update-current-buffer!
   (fn [buffer]
     (let [content (:content buffer)
           current-pos (:cursor-pos buffer)
           [line _] (buffers/pos-to-line-col content current-pos)
           lines (str/split-lines content)
           new-lines (concat (take line lines) [""] (drop line lines))
           new-content (str/join "\n" new-lines)
           new-cursor-pos (buffers/line-col-to-pos new-content line 0)]
       (-> buffer
           (assoc :content new-content)
           (assoc :cursor-pos new-cursor-pos)
           (assoc :modified? true)))))
  (enter-insert-mode))

(defn append-after-cursor []
  (state/update-current-buffer!
   (fn [buffer]
     (let [content (:content buffer)
           cursor-pos (:cursor-pos buffer)]
       (if (< cursor-pos (count content))
         (assoc buffer :cursor-pos (inc cursor-pos))
         buffer))))
  (enter-insert-mode))

(defn append-at-end-of-line []
  (end-of-line)
  (enter-insert-mode))

(defn insert-at-start-of-line []
  (beginning-of-line)
  (enter-insert-mode))

;; Visual mode operations
(defn start-visual-selection []
  (enter-visual-mode))

(defn start-visual-line-selection []
  (enter-visual-line-mode))

(defn extend-selection [direction]
  (let [count (state/get-evil-count)]
    (dotimes [_ count]
      (state/update-current-buffer!
       (fn [buffer]
         (if-let [selection (:selection buffer)]
           (let [content (:content buffer)
                 current-pos (:cursor-pos buffer)
                 new-pos (case direction
                           :left (max 0 (dec current-pos))
                           :right (min (count content) (inc current-pos))
                           :up (let [[line col] (buffers/pos-to-line-col content current-pos)]
                                 (if (> line 0)
                                   (let [prev-line (nth (str/split-lines content) (dec line))
                                         new-col (min col (count prev-line))]
                                     (buffers/line-col-to-pos content (dec line) new-col))
                                   current-pos))
                           :down (let [[line col] (buffers/pos-to-line-col content current-pos)]
                                   (let [lines (str/split-lines content)]
                                     (if (< line (dec (count lines)))
                                       (let [next-line (nth lines (inc line))
                                             new-col (min col (count next-line))]
                                         (buffers/line-col-to-pos content (inc line) new-col))
                                       current-pos))))]
             (-> buffer
                 (assoc :cursor-pos new-pos)
                 (assoc-in [:selection :end] new-pos)))
           buffer)))))
  (state/set-evil-count! 1)
  (update-statusbar))

(defn delete-selection []
  (state/update-current-buffer!
   (fn [buffer]
     (if-let [selection (:selection buffer)]
       (let [content (:content buffer)
             start (min (:start selection) (:end selection))
             end (max (:start selection) (:end selection))
             selected-text (subs content start end)]
         ;; Yank deleted text
         (state/set-evil-register! selected-text)
         ;; Delete selection
         (let [new-content (str (subs content 0 start) (subs content end))]
           (-> buffer
               (assoc :content new-content)
               (assoc :cursor-pos start)
               (assoc :selection nil)
               (assoc :modified? true))))
       buffer)))
  (enter-normal-mode))

(defn yank-selection []
  (state/update-current-buffer!
   (fn [buffer]
     (if-let [selection (:selection buffer)]
       (let [content (:content buffer)
             start (min (:start selection) (:end selection))
             end (max (:start selection) (:end selection))
             selected-text (subs content start end)]
         (state/set-evil-register! selected-text)
         (assoc buffer :selection nil))
       buffer)))
  (exit-visual-mode))

(defn change-selection []
  (state/update-current-buffer!
   (fn [buffer]
     (if-let [selection (:selection buffer)]
       (let [content (:content buffer)
             start (min (:start selection) (:end selection))
             end (max (:start selection) (:end selection))
             selected-text (subs content start end)]
         ;; Yank deleted text
         (state/set-evil-register! selected-text)
         ;; Delete selection
         (let [new-content (str (subs content 0 start) (subs content end))]
           (-> buffer
               (assoc :content new-content)
               (assoc :cursor-pos start)
               (assoc :selection nil)
               (assoc :modified? true))))
       buffer)))
  (enter-insert-mode))

;; Search
(defn search-forward []
  (let [query (js/prompt "Search forward:" (state/get-last-search))]
    (when query
      (state/set-last-search! query)
      (state/set-search-direction! :forward)
      (buffers/search-next query))))

(defn search-backward []
  (let [query (js/prompt "Search backward:" (state/get-last-search))]
    (when query
      (state/set-last-search! query)
      (state/set-search-direction! :backward)
      (buffers/search-prev query))))

(defn next-search-result []
  (when-let [query (state/get-last-search)]
    (if (= (state/get-search-direction) :forward)
      (buffers/search-next query)
      (buffers/search-prev query))))

(defn previous-search-result []
  (when-let [query (state/get-last-search)]
    (if (= (state/get-search-direction) :forward)
      (buffers/search-prev query)
      (buffers/search-next query))))

;; Undo/Redo
(defn undo []
  (state/update-current-buffer!
   (fn [buffer]
     (if-let [undo-stack (:undo-stack buffer)]
       (let [current-state {:content (:content buffer)
                            :cursor-pos (:cursor-pos buffer)
                            :selection (:selection buffer)}
             new-undo-stack (conj undo-stack current-state)
             previous-state (last new-undo-stack)
             new-redo-stack (:redo-stack buffer)]
         (-> buffer
             (assoc :content (:content previous-state))
             (assoc :cursor-pos (:cursor-pos previous-state))
             (assoc :selection (:selection previous-state))
             (assoc :undo-stack (butlast new-undo-stack))
             (assoc :redo-stack (conj new-redo-stack current-state))))
       buffer))))

(defn redo []
  (state/update-current-buffer!
   (fn [buffer]
     (if-let [redo-stack (:redo-stack buffer)]
       (let [current-state {:content (:content buffer)
                            :cursor-pos (:cursor-pos buffer)
                            :selection (:selection buffer)}
             next-state (first redo-stack)
             new-undo-stack (:undo-stack buffer)]
         (-> buffer
             (assoc :content (:content next-state))
             (assoc :cursor-pos (:cursor-pos next-state))
             (assoc :selection (:selection next-state))
             (assoc :undo-stack (conj new-undo-stack current-state))
             (assoc :redo-stack (rest redo-stack))))
       buffer))))

;; Initialize Evil mode
(defn init []
  (println "Initializing Evil mode...")
  (enter-normal-mode)
  (update-statusbar)
  (println "Evil mode initialized"))