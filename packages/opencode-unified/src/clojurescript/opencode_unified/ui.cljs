(ns opencode-unified.ui
  (:require [reagent.core :as r]
            [reagent.dom :as dom]
            [reagent.dom.client :as rdomc]
            [opencode-unified.state :as state]
            [opencode-unified.layout :as layout]
            [opencode-unified.keymap :as keymap]
            [opencode-unified.evil :as evil]
            [opencode-unified.buffers :as buffers]
            [clojure.string :as str]))

;; Main app component
(defn app []
  (let [app-state state/app-state]
    (r/create-class
     {:component-did-mount
      (fn [this]
        ;; Ensure proper reactivity setup
        (println "App component mounted"))

      :reagent-render
      (fn []
        [:div
         [theme-styles]
         [:div.app-container
          {:class (str "theme-" (name (:theme (:ui @app-state)))
                       " evil-mode-" (name (get-in @app-state [:evil-state :mode])))
           :tab-index 0}

          ;; Header with menu bar
          [layout/header]

          ;; Main content area
          [:div.main-content
           ;; Left sidebar (file tree, etc.)
           [layout/left-sidebar]

           ;; Editor area
           [:div.editor-area
            ;; Tab bar
            [layout/tab-bar]

            ;; Editor pane
            [:div.editor-pane
             (let [current-buffer (:current-buffer @app-state)
                   current-buffer-content (when current-buffer
                                            (get-in @app-state [:buffers current-buffer]))]
               (if current-buffer-content
                 [opencode-unified.buffers/editor current-buffer-content]
                 [:div.no-buffer
                  [:h2 "No Buffer Open"]
                  [:p "Open a file to start editing"]]))]

            ;; Minimap (if enabled)
            (when (get-in @app-state [:ui :minimap])
              [layout/minimap (get-in @app-state [:buffers (:current-buffer @app-state)])])]

           ;; Right sidebar (plugins, etc.)
           [layout/right-sidebar]]

          ;; Status bar
          [layout/status-bar]

          ;; Which-key popup
          [layout/which-key-popup]

          ;; Command palette
          [layout/command-palette]]])})))

;; Theme styles
(defn theme-styles []
  [:style
   (str "
/* Dark theme */
.theme-dark {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-dim: #808080;
  --border: #404040;
  --accent: #61dafb;
  --accent-hover: #4fa8c5;
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
  --selection: rgba(97, 218, 251, 0.3);
}

/* Light theme */
.theme-light {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e0e0e0;
  --text-primary: #000000;
  --text-secondary: #333333;
  --text-dim: #666666;
  --border: #cccccc;
  --accent: #007acc;
  --accent-hover: #005a9e;
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
  --selection: rgba(0, 122, 204, 0.3);
}

/* Base styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace;
  font-size: 14px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: var(--bg-primary);
}

.editor-pane {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.no-buffer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-dim);
}

.no-buffer h2 {
  margin: 0 0 1rem 0;
  font-weight: 300;
}

.no-buffer p {
  margin: 0;
  font-size: 0.9rem;
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-dim);
}

/* Selection styles */
::selection {
  background-color: var(--selection);
}

/* Evil mode cursor styles */
.evil-mode-normal .editor-content {
  cursor: default;
}

.evil-mode-insert .editor-content {
  cursor: text;
}

.evil-mode-visual .editor-content {
  cursor: crosshair;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

.slide-in {
  animation: slideIn 0.2s ease-in-out;
}
")])

;; Initialize app
(defn init []
  (println "Initializing Opencode UI...")

  ;; Load workspace from localStorage
  (state/load-workspace! "default-workspace")

  ;; Set up global event listeners
  (js/window.addEventListener "beforeunload"
                              (fn [e]
                                (state/save-workspace! "default-workspace")))

  ;; Set up resize handler
  (js/window.addEventListener "resize"
                              (fn []
                              ;; Trigger re-render on resize
                                (println "Window resized")))

  ;; Mount app using Reagent's React 18 compatible rendering
  (defonce root (rdomc/create-root (js/document.getElementById "app")))
  ;; Use Reagent's as-element to ensure proper reactivity tracking
  (rdomc/render root (r/as-element [app]))

  (println "Opencode UI initialized"))

;; Hot module replacement support
(defn ^:export reload []
  (println "Hot reloading UI...")
  (when-let [root (resolve 'root)]
    (rdomc/render @root (r/as-element [app]))))

;; Hot module replacement support

(defn ^:export clear []
  (println "Clearing UI...")
  (when-let [root (resolve 'root)]
    (.unmount @root)))