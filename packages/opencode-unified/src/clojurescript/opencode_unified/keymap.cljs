(ns opencode-unified.keymap
  (:require [opencode-unified.state :as state]
            [opencode-unified.evil :as evil]
            [opencode-unified.buffers :as buffers]
            [reagent.core :as r]
            [clojure.string :as str]))

;; Key definitions
(def modifier-keys #{"Control" "Alt" "Shift" "Meta" "Command"})
(def special-keys #{"Escape" "Enter" "Backspace" "Delete" "Tab"
                    "ArrowUp" "ArrowDown" "ArrowLeft" "ArrowRight"
                    "Home" "End" "PageUp" "PageDown" "Space"})

;; Key sequence state
(defonce key-sequence (r/atom []))
(defonce key-timeout (r/atom nil))

;; Spacemacs-style keybindings
(defonce spacemacs-keybindings (r/atom {:leader {:bindings {"SPC" {:name "Leader"
                                                                   :bindings {"f" {:name "File"
                                                                                   :bindings {"f" {:name "Find file"
                                                                                                   :handler #(buffers/find-file)}
                                                                                              "s" {:name "Save file"
                                                                                                   :handler #(buffers/save-current-buffer)}
                                                                                              "w" {:name "Save as"
                                                                                                   :handler #(buffers/save-current-buffer-as)}
                                                                                              "b" {:name "Switch buffer"
                                                                                                   :handler #(buffers/switch-buffer)}
                                                                                              "k" {:name "Kill buffer"
                                                                                                   :handler #(buffers/kill-current-buffer)}}}
                                                                              "b" {:name "Buffer"
                                                                                   :bindings {"b" {:name "Switch buffer"
                                                                                                   :handler #(buffers/switch-buffer)}
                                                                                              "n" {:name "Next buffer"
                                                                                                   :handler #(buffers/next-buffer)}
                                                                                              "p" {:name "Previous buffer"
                                                                                                   :handler #(buffers/previous-buffer)}
                                                                                              "l" {:name "List buffers"
                                                                                                   :handler #(buffers/list-buffers)}}}
                                                                              "w" {:name "Window"
                                                                                   :bindings {"w" {:name "Other window"
                                                                                                   :handler #(buffers/other-window)}
                                                                                              "s" {:name "Split window"
                                                                                                   :handler #(buffers/split-window)}
                                                                                              "v" {:name "Vertical split"
                                                                                                   :handler #(buffers/vsplit-window)}
                                                                                              "c" {:name "Close window"
                                                                                                   :handler #(buffers/close-window)}}}
                                                                              "e" {:name "Editor"
                                                                                   :bindings {"e" {:name "Eval expression"
                                                                                                   :handler #(buffers/eval-expression)}}}
                                                                              "p" {:name "Project"
                                                                                   :bindings {"p" {:name "Switch project"
                                                                                                   :handler #(buffers/switch-project)}
                                                                                              "f" {:name "Find file in project"
                                                                                                   :handler #(buffers/find-file-in-project)}}}

                                                                              "h" {:name "Help"
                                                                                   :bindings {"b" {:name "Describe bindings"
                                                                                                   :handler #(fn [] (state/show-which-key!))}}}}}}}}))

;; Evil mode keybindings
(defonce evil-keybindings (r/atom {:normal {:bindings {"h" {:handler #(evil/move-cursor :left)}
                                                       "j" {:handler #(evil/move-cursor :down)}
                                                       "k" {:handler #(evil/move-cursor :up)}
                                                       "l" {:handler #(evil/move-cursor :right)}
                                                       "w" {:handler #(evil/word-forward)}
                                                       "b" {:handler #(evil/word-backward)}
                                                       "0" {:handler #(evil/beginning-of-line)}
                                                       "$" {:handler #(evil/end-of-line)}
                                                       "gg" {:handler #(evil/beginning-of-buffer)}
                                                       "G" {:handler #(evil/end-of-buffer)}
                                                       "i" {:handler #(evil/enter-insert-mode)}
                                                       "a" {:handler #(evil/append-after-cursor)}
                                                       "o" {:handler #(evil/open-line-below)}
                                                       "O" {:handler #(evil/open-line-above)}
                                                       "dd" {:handler #(evil/delete-line)}
                                                       "yy" {:handler #(evil/yank-line)}
                                                       "p" {:handler #(evil/paste-after)}
                                                       "P" {:handler #(evil/paste-before)}
                                                       "u" {:handler #(evil/undo)}
                                                       "Ctrl-r" {:handler #(evil/redo)}
                                                       "/" {:handler #(evil/search-forward)}
                                                       "?" {:handler #(evil/search-backward)}
                                                       "n" {:handler #(evil/next-search-result)}
                                                       "N" {:handler #(evil/previous-search-result)}
                                                       "v" {:handler #(evil/enter-visual-mode)}
                                                       "V" {:handler #(evil/enter-visual-line-mode)}
                                                       "ESC" {:handler #(evil/exit-visual-mode)}}}

                                   :insert {:bindings {"ESC" {:handler #(evil/enter-normal-mode)}
                                                       "Ctrl-[" {:handler #(evil/enter-normal-mode)}}}

                                   :visual {:bindings {"h" {:handler #(evil/extend-selection :left)}
                                                       "j" {:handler #(evil/extend-selection :down)}
                                                       "k" {:handler #(evil/extend-selection :up)}
                                                       "l" {:handler #(evil/extend-selection :right)}
                                                       "w" {:handler #(evil/extend-selection :word-forward)}
                                                       "b" {:handler #(evil/extend-selection :word-backward)}
                                                       "d" {:handler #(evil/delete-selection)}
                                                       "y" {:handler #(evil/yank-selection)}
                                                       "c" {:handler #(evil/change-selection)}
                                                       "ESC" {:handler #(evil/exit-visual-mode)}}}}))

;; Helper functions
(defn normalize-key [event]
  (let [key (.-key event)
        ctrl? (.-ctrlKey event)
        alt? (.-altKey event)
        shift? (.-shiftKey event)
        meta? (.-metaKey event)]
    (cond-> key
      ctrl? (str "Ctrl-")
      alt? (str "Alt-")
      shift? (str "Shift-")
      meta? (str "Meta-"))))

(defn clear-key-sequence []
  (reset! key-sequence [])
  (when @key-timeout
    (js/clearTimeout @key-timeout)
    (reset! key-timeout nil)))

(defn set-key-timeout []
  (when @key-timeout
    (js/clearTimeout @key-timeout))
  (reset! key-timeout
          (js/setTimeout
           #(do
              (clear-key-sequence)
              (state/hide-which-key!))
           3000)))

(defn find-binding [key-sequence mode]
  (let [current-bindings (get-in @spacemacs-keybindings [:leader :bindings])
        evil-bindings (get-in @evil-keybindings [mode :bindings])]

    ;; Try spacemacs bindings first (leader sequences)
    (if (and (>= (count key-sequence) 1)
             (= (first key-sequence) "SPC"))
      (let [path (rest key-sequence)]
        (loop [bindings current-bindings
               remaining path]
          (if (empty? remaining)
            (when (:handler bindings)
              bindings)
            (let [key (first remaining)
                  next-binding (get-in bindings [:bindings key])]
              (if next-binding
                (recur next-binding (rest remaining))
                nil)))))

      ;; Try evil bindings
      (let [key-str (str/join "-" key-sequence)]
        (get evil-bindings key-str)))))

(defn execute-binding [binding]
  (when-let [handler (:handler binding)]
    (handler))
  (clear-key-sequence)
  (state/hide-which-key!))

(defn show-which-key [prefix]
  (state/show-which-key!)
  (set-key-timeout))

;; Main key event handler
(defn handle-key-down [event]
  (let [key (normalize-key event)
        evil-mode (state/get-evil-mode)
        current-sequence @key-sequence
        new-sequence (conj current-sequence key)]

    ;; Prevent default for special keys
    (when (or (contains? special-keys key)
              (contains? modifier-keys key)
              (.-ctrlKey event)
              (.-altKey event)
              (.-metaKey event))
      (.preventDefault event))

    ;; Update key sequence
    (reset! key-sequence new-sequence)

    ;; Find binding
    (if-let [binding (find-binding new-sequence evil-mode)]
      (if (:handler binding)
        ;; Execute immediately if handler exists
        (execute-binding binding)
        ;; Show which-key if there are sub-bindings
        (do
          (show-which-key new-sequence)
          (set-key-timeout)))

      ;; No binding found, clear sequence
      (do
        (clear-key-sequence)
        (state/hide-which-key!)))))

(defn handle-key-up [event]
  ;; Handle key release if needed
  )

;; Global keybindings (non-modal)
(def global-keybindings
  {"Ctrl-p" {:handler #(buffers/command-palette)}
   "Ctrl-Shift-p" {:handler #(buffers/show-command-palette)}
   "Ctrl-`" {:handler #(buffers/toggle-terminal)}
   "F11" {:handler #(buffers/toggle-fullscreen)}
   "Ctrl-," {:handler #(buffers/open-settings)}
   "Ctrl-Shift-?" {:handler #(show-which-key ["SPC" "h" "b"])}})

(defn handle-global-key [event]
  (let [key (normalize-key event)]
    (when-let [binding (get global-keybindings key)]
      (.preventDefault event)
      (execute-binding binding))))

;; Keymap utilities
(defn register-keybinding [mode key-sequence handler]
  (swap! evil-keybindings update-in [mode :bindings]
         assoc (str/join "-" key-sequence) {:handler handler}))

(defn unregister-keybinding [mode key-sequence]
  (swap! evil-keybindings update-in [mode :bindings]
         dissoc (str/join "-" key-sequence)))

(defn register-spacemacs-binding [path handler]
  (let [path-keys (butlast path)
        final-key (last path)]
    (swap! spacemacs-keybindings update-in [:leader :bindings]
           (fn [bindings]
             (assoc-in bindings
                       (conj (mapv :bindings path-keys) final-key)
                       {:handler handler})))))

;; Initialize keymap
(defn init []
  (println "Initializing keymap...")

  ;; Set up global event listeners
  (js/window.addEventListener "keydown"
                              (fn [e]
                                (handle-global-key e)
                                (handle-key-down e)))

  (js/window.addEventListener "keyup" handle-key-up)

  ;; Initialize which-key timeout
  (set-key-timeout)

  (println "Keymap initialized"))

;; Export functions for external use
(defn get-current-key-sequence []
  @key-sequence)

(defn is-key-sequence-active? []
  (not (empty? @key-sequence)))