(ns app.buffers
  (:require [app.state :as state]
            [clojure.string :as str]
            [reagent.core :as r]))

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
          (fn [b] (assoc b :id buffer-id))
          save-current-buffer)))
    (state/remove-buffer! buffer-id)))

(defn kill-current-buffer []
  (when-let [buffer-id (:current-buffer @state/app-state)]
    (close-buffer buffer-id)))

;; File operations (placeholders)
(defn open-file [file-path]
  (println "Open file not implemented yet"))

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
  (println "Search next not implemented yet"))

(defn search-prev [query]
  (println "Search prev not implemented yet"))

;; Editor component (simplified)
(defn editor [buffer]
  (let [content (:content buffer)
        cursor-pos (:cursor-pos buffer)
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
                               (assoc :modified? true)))))))}]))

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
