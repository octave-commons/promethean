(ns app.evil
  (:require [app.state :as state]
            [app.buffers :as buffers]
            [clojure.string :as str]))

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
  (set-mode! :normal))

(defn enter-insert-mode []
  (set-mode! :insert))

(defn enter-visual-mode []
  (set-mode! :visual))

(defn enter-visual-line-mode []
  (set-mode! :visual-line))

(defn exit-visual-mode []
  (set-mode! :normal))

;; Cursor movement
(defn move-cursor [direction]
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
          
          buffer)))))

(defn word-forward []
  (state/update-current-buffer!
    (fn [buffer]
      (let [content (:content buffer)
            current-pos (:cursor-pos buffer)
            next-word-pos (buffers/find-next-word-boundary content current-pos)]
        (assoc buffer :cursor-pos next-word-pos)))))

(defn word-backward []
  (state/update-current-buffer!
    (fn [buffer]
      (let [content (:content buffer)
            current-pos (:cursor-pos buffer)
            prev-word-pos (buffers/find-prev-word-boundary content current-pos)]
        (assoc buffer :cursor-pos prev-word-pos)))))

(defn beginning-of-line []
  (state/update-current-buffer!
    (fn [buffer]
      (let [content (:content buffer)
            current-pos (:cursor-pos buffer)
            [line _] (buffers/pos-to-line-col content current-pos)
            line-start-pos (buffers/line-col-to-pos content line 0)]
        (assoc buffer :cursor-pos line-start-pos)))))

(defn end-of-line []
  (state/update-current-buffer!
    (fn [buffer]
      (let [content (:content buffer)
            current-pos (:cursor-pos buffer)
            [line _] (buffers/pos-to-line-col content current-pos)
            lines (str/split-lines content)
            line-end-pos (buffers/line-col-to-pos content line (count (nth lines line)))]
        (assoc buffer :cursor-pos line-end-pos)))))

(defn beginning-of-buffer []
  (state/update-current-buffer!
    (fn [buffer]
      (assoc buffer :cursor-pos 0))))

(defn end-of-buffer []
  (state/update-current-buffer!
    (fn [buffer]
      (assoc buffer :cursor-pos (count (:content buffer))))))

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

(defn delete-line []
  (state/update-current-buffer!
    (fn [buffer]
      (let [content (:content buffer)
            current-pos (:cursor-pos buffer)
            [line _] (buffers/pos-to-line-col content current-pos)
            lines (str/split-lines content)
            new-lines (concat (take line lines) (drop (inc line) lines))
            new-content (str/join "\n" new-lines)
            new-cursor-pos (buffers/line-col-to-pos new-content (min line (count new-lines)) 0)]
        (-> buffer
            (assoc :content new-content)
            (assoc :cursor-pos new-cursor-pos)
            (assoc :modified? true))))))

(defn yank-line []
  (state/update-current-buffer!
    (fn [buffer]
      (let [content (:content buffer)
            current-pos (:cursor-pos buffer)
            [line _] (buffers/pos-to-line-col content current-pos)
            lines (str/split-lines content)
            line-text (nth lines line "")]
        (swap! state/app-state assoc-in [:evil-state :register] line-text)
        buffer))))

(defn paste-after []
  (when-let [text (get-in @state/app-state [:evil-state :register])]
    (move-cursor :right)
    (insert-text-at-cursor text)))

(defn paste-before []
  (when-let [text (get-in @state/app-state [:evil-state :register])]
    (insert-text-at-cursor text)))

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
            (assoc :modified? true))))))

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
            (assoc :modified? true))))))

(defn append-after-cursor []
  (move-cursor :right)
  (enter-insert-mode))

;; Visual mode
(defn start-visual-selection []
  (state/update-current-buffer!
    (fn [buffer]
      (assoc buffer :selection {:start (:cursor-pos buffer)
                                :end (:cursor-pos buffer)}))))

(defn extend-selection [direction]
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
        buffer))))

(defn delete-selection []
  (state/update-current-buffer!
    (fn [buffer]
      (if-let [selection (:selection buffer)]
        (let [content (:content buffer)
              start (min (:start selection) (:end selection))
              end (max (:start selection) (:end selection))
              new-content (str (subs content 0 start) (subs content end))]
          (-> buffer
              (assoc :content new-content)
              (assoc :cursor-pos start)
              (assoc :selection nil)
              (assoc :modified? true)))
        buffer))))

(defn yank-selection []
  (state/update-current-buffer!
    (fn [buffer]
      (if-let [selection (:selection buffer)]
        (let [content (:content buffer)
              start (min (:start selection) (:end selection))
              end (max (:start selection) (:end selection))
              selected-text (subs content start end)]
          (swap! state/app-state assoc-in [:evil-state :register] selected-text)
          (assoc buffer :selection nil))
        buffer))))

(defn change-selection []
  (yank-selection)
  (delete-selection)
  (enter-insert-mode))

;; Search
(defn search-forward []
  (let [query (js/prompt "Search forward:" (get-in @state/app-state [:evil-state :last-search]))]
    (when query
      (swap! state/app-state assoc-in [:evil-state :last-search] query)
      (swap! state/app-state assoc-in [:evil-state :search-direction] :forward)
      (buffers/search-next query))))

(defn search-backward []
  (let [query (js/prompt "Search backward:" (get-in @state/app-state [:evil-state :last-search]))]
    (when query
      (swap! state/app-state assoc-in [:evil-state :last-search] query)
      (swap! state/app-state assoc-in [:evil-state :search-direction] :backward)
      (buffers/search-prev query))))

(defn next-search-result []
  (when-let [query (get-in @state/app-state [:evil-state :last-search])]
    (if (= (get-in @state/app-state [:evil-state :search-direction]) :forward)
      (buffers/search-next query)
      (buffers/search-prev query))))

(defn previous-search-result []
  (when-let [query (get-in @state/app-state [:evil-state :last-search])]
    (if (= (get-in @state/app-state [:evil-state :search-direction]) :forward)
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