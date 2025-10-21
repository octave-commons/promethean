(ns opencode-unified.evil
  (:require [opencode-unified.state :as state]
            [opencode-unified.buffers :as buffers]
            [clojure.string :as str]))

;; ===== Mode state =====
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
  (state/update-current-buffer!
   (fn [buffer]
     (assoc buffer :selection nil)))
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

;; ===== Text helpers =====
(defn- clamp [x lo hi] (max lo (min hi x)))
(defn- line-start [^string s pos] (inc (.lastIndexOf s "\n" (max 0 (dec pos)))))
(defn- line-end [^string s pos] (let [i (.indexOf s "\n" pos)] (if (= -1 i) (.-length s) i)))
(defn- column [^string s pos] (- pos (line-start s pos)))
(defn- goto-col [^string s ls col] (+ ls (clamp col 0 (- (line-end s ls) ls))))
(defn- setpos! [^js el p] (set! (.-selectionStart el) p) (set! (.-selectionEnd el) p))
(defn- setrange! [^js el a b] (set! (.-selectionStart el) (min a b)) (set! (.-selectionEnd el) (max a b)))

(defn- wordch? [ch] (boolean (re-matches #"[A-Za-z0-9_]" (str ch))))
(defn- next-word [^string s pos]
  (let [n (.-length s)]
    (loop [i (min n (max 0 pos)) seen? false]
      (cond
        (>= i n) n
        (and seen? (not (wordch? (.charAt s i)))) i
        :else (recur (inc i) (or seen? (wordch? (.charAt s i))))))))
(defn- prev-word [^string s pos]
  (loop [i (max 0 (dec pos)) seen? false]
    (cond
      (<= i 0) 0
      (and seen? (not (wordch? (.charAt s i)))) (inc i)
      :else (recur (dec i) (or seen? (wordch? (.charAt s i)))))))
(defn- end-word [^string s pos]
  (let [n (.-length s)]
    (loop [i (min n (max 0 pos)) in? false]
      (cond
        (>= i n) (dec n)
        (and in? (not (wordch? (.charAt s i)))) (dec i)
        :else (recur (inc i) (or in? (wordch? (.charAt s i))))))))

;; ===== Motions =====
(defn move-left! [^js el] (setpos! el (max 0 (dec (.-selectionStart el)))))
(defn move-right! [^js el] (let [s (.-value el)] (setpos! el (min (.-length s) (inc (.-selectionStart el))))))
(defn move-up! [^js el]
  (let [s (.-value el) p (.-selectionStart el) col (column s p)
        prev-start (line-start s (max 0 (dec (line-start s p))))]
    (setpos! el (goto-col s prev-start col))))
(defn move-down! [^js el]
  (let [s (.-value el) p (.-selectionStart el) col (column s p)
        next-start (min (.-length s) (inc (line-end s p)))]
    (setpos! el (goto-col s next-start col))))
(defn move-bol! [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (line-start s p))))
(defn move-eol! [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (line-end s p))))
(defn move-w! [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (next-word s (inc p)))))
(defn move-b! [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (prev-word s p))))
(defn move-e! [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (inc (end-word s p)))))
(defn goto-start! [^js el] (setpos! el 0))
(defn goto-end! [^js el] (setpos! el (.-length (.-value el))))

;; ===== Registers & clipboard =====
(defonce reg* (atom {:text "" :linewise? false}))
(defonce g-prev* (atom 0))
(defn- clip-write! [s] (try (.writeText (.-navigator.clipboard js/window) s) (catch :default _ nil)))
(defn- yank! [txt line?] (reset! reg* {:text txt :linewise? line?}) (clip-write! txt))

;; ===== Operators =====
(defonce op* (atom nil)) ;; {:op :y|:d|:c, :anchor pos}

(defn- yank-range! [^js el a b line?]
  (let [s (.-value el) lo (min a b) hi (max a b)
        txt (.substring s lo hi)
        txt' (if (and line? (not (.endsWith txt "\n"))) (str txt "\n") txt)]
    (yank! txt' line?)
    (setpos! el a)))

(defn- delete-range! [^js el a b line?]
  (when-not (.-readOnly el)
    (let [s (.-value el) lo (min a b) hi (max a b)
          txt (.substring s lo hi)
          txt' (if (and line? (not (.endsWith txt "\n"))) (str txt "\n") txt)
          out (str (.substring s 0 lo) (.substring s hi (.-length s)))]
      (yank! txt' line?)
      (set! (.-value el) out)
      (setpos! el lo))))

(defn- change-range! [^js el a b line?]
  (delete-range! el a b line?)
  (enter-insert-mode))

(defn- delete-line! [^js el]
  (let [s (.-value el) p (.-selectionStart el) ls (line-start s p) le (line-end s p)
        hi (min (.-length s) (inc le))]
    (delete-range! el ls hi true)))

(defn- change-line! [^js el]
  (let [s (.-value el) p (.-selectionStart el) ls (line-start s p) le (line-end s p)
        hi (min (.-length s) (inc le))]
    (change-range! el ls hi true)))

(defn- paste! [^js el before?]
  (when-not (.-readOnly el)
    (let [{:keys [text linewise?]} @reg*
          text (or text "") p (.-selectionStart el) s (.-value el)]
      (if linewise?
        (let [target (if before? (line-start s p) (min (.-length s) (inc (line-end s p))))
              v (.-value el)
              out (str (.substring v 0 target) text (.substring v target (.-length v)))]
          (set! (.-value el) out) (setpos! el (+ target (.-length text))))
        (let [idx (if before? p (inc p)) v (.-value el)
              out (str (.substring v 0 idx) text (.substring v idx (.-length v)))]
          (set! (.-value el) out) (setpos! el (+ idx (.-length text))))))))

(defn- apply-op-motion! [^js el {:keys [op anchor]} k]
  (let [s (.-value el)
        tgt (case k
              ("y" "d" "c") :line
              "w" (next-word s (inc anchor))
              "b" (prev-word s anchor)
              "e" (inc (end-word s anchor))
              "0" (line-start s anchor)
              "$" (line-end s anchor)
              "G" (.-length s)
              nil)]
    (when tgt
      (case op
        :y (if (= tgt :line)
             (yank-range! el (line-start s anchor) (inc (line-end s anchor)) true)
             (yank-range! el anchor tgt false))
        :d (if (= tgt :line) (delete-line! el) (delete-range! el anchor tgt false))
        :c (if (= tgt :line) (change-line! el) (change-range! el anchor tgt false))))))

;; ===== Visual mode =====
(defonce v-anchor* (atom nil))
(defn- visual-start! [^js el line?]
  (reset! v-anchor* (.-selectionStart el))
  (set-mode! (if line? :visual-line :visual))
  (if line?
    (let [s (.-value el) a @v-anchor*] (setrange! el (line-start s a) (inc (line-end s a))))
    (setrange! el @v-anchor* (.-selectionStart el)))
  (update-statusbar))

(defn- visual-update! [^js el]
  (let [mode (get-mode)]
    (when (= mode :visual)
      (let [s (.-value el) a @v-anchor* p (.-selectionStart el)]
        (setrange! el a p)))))

(defn- visual-exit! [] (reset! v-anchor* nil) (exit-visual-mode))

;; ===== gg helper =====
(defn handle-gg! [^js e ^js el]
  (when (= (.-key e) "g")
    (let [now (.now js/Date)]
      (if (< (- now @g-prev*) 350)
        (do (.preventDefault e)
            (goto-start! el)
            (when (= (get-mode) :visual) (visual-update! el))
            (reset! g-prev* 0))
        (reset! g-prev* now)))))

;; ===== Main key handler =====
(defn handle-key! [^js e ^js el]
  (let [mode (get-mode) k (.-key e) op @op* ro? (.-readOnly el)]
    (cond
      ;; mode switches
      (= k "Escape") (do (.preventDefault e) (reset! op* nil) (visual-exit!))
      (and (= mode :normal) (= k "i")) (do (.preventDefault e) (reset! op* nil) (enter-insert-mode))
      (and (= mode :normal) (= k "v")) (do (.preventDefault e) (visual-start! el false))
      (and (= mode :normal) (= k "V")) (do (.preventDefault e) (visual-start! el true))

      ;; operator-pending resolution
      (and (= mode :normal) op) (do (.preventDefault e) (apply-op-motion! el op k) (reset! op* nil))

      ;; Visual mode
      (= mode :visual)
      (case k
        ;; motions
        "h" (do (.preventDefault e) (move-left! el) (visual-update! el))
        "l" (do (.preventDefault e) (move-right! el) (visual-update! el))
        "j" (do (.preventDefault e) (move-down! el) (visual-update! el))
        "k" (do (.preventDefault e) (move-up! el) (visual-update! el))
        "0" (do (.preventDefault e) (move-bol! el) (visual-update! el))
        "$" (do (.preventDefault e) (move-eol! el) (visual-update! el))
        "w" (do (.preventDefault e) (move-w! el) (visual-update! el))
        "b" (do (.preventDefault e) (move-b! el) (visual-update! el))
        "e" (do (.preventDefault e) (move-e! el) (visual-update! el))
        "G" (do (.preventDefault e) (goto-end! el) (visual-update! el))
        ;; ops on selection
        "y" (do (.preventDefault e)
                (let [s (.-selectionStart el) epos (.-selectionEnd el)
                      txt (.substring (.-value el) (min s epos) (max s epos))
                      txt' (if (not (.endsWith txt "\n")) (str txt "\n") txt)]
                  (yank! txt' false) (visual-exit!)))
        "d" (do (.preventDefault e) (when-not ro? (delete-range! el (.-selectionStart el) (.-selectionEnd el) false)) (visual-exit!))
        "c" (do (.preventDefault e) (when-not ro? (change-range! el (.-selectionStart el) (.-selectionEnd el) false)) (visual-exit!))
        nil)

      ;; Normal mode (start ops / motions / paste)
      (= mode :normal)
      (case k
        ;; start ops
        "y" (do (.preventDefault e) (reset! op* {:op :y :anchor (.-selectionStart el)}))
        "d" (do (.preventDefault e) (reset! op* {:op :d :anchor (.-selectionStart el)}))
        "c" (do (.preventDefault e) (reset! op* {:op :c :anchor (.-selectionStart el)}))
        ;; linewise shortcuts
        "Y" (do (.preventDefault e) (let [s (.-value el) p (.-selectionStart el)] (yank-range! el (line-start s p) (inc (line-end s p)) true)))
        "D" (do (.preventDefault e) (when-not ro? (let [s (.-value el) p (.-selectionStart el)] (delete-range! el p (line-end s p) false))))
        "C" (do (.preventDefault e) (when-not ro? (let [s (.-value el) p (.-selectionStart el)] (change-range! el p (line-end s p) false))))
        ;; paste
        "p" (do (.preventDefault e) (paste! el false))
        "P" (do (.preventDefault e) (paste! el true))
        ;; motions
        "h" (do (.preventDefault e) (move-left! el))
        "l" (do (.preventDefault e) (move-right! el))
        "j" (do (.preventDefault e) (move-down! el))
        "k" (do (.preventDefault e) (move-up! el))
        "0" (do (.preventDefault e) (move-bol! el))
        "$" (do (.preventDefault e) (move-eol! el))
        "w" (do (.preventDefault e) (move-w! el))
        "b" (do (.preventDefault e) (move-b! el))
        "e" (do (.preventDefault e) (move-e! el))
        "G" (do (.preventDefault e) (goto-end! el))
        nil)
      :else nil)))

;; Initialize Evil mode
(defn init []
  (println "Initializing Evil mode...")
  (enter-normal-mode)
  (update-statusbar)
  (println "Evil mode initialized"))