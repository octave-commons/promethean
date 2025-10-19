(ns opencode-unified.plugins
  "Plugin system for Opencode Unified Editor"
  (:require [reagent.core :as r]
            [clojure.string :as str]
            [opencode-unified.state :as state]
            [opencode-unified.buffers :as buffers]
            [opencode-unified.keymap :as keymap]
            [opencode-unified.ui :as ui]
            [clojure.walk :as walk]))

;; Plugin registry and state
(defonce plugin-state
  (r/atom {:loaded-plugins {}
           :active-plugins {}
           :available-plugins []
           :plugin-hooks {}
           :plugin-commands []
           :last-error nil}))

;; Plugin lifecycle states
(def plugin-states
  {:unloaded "Not loaded"
   :loading "Loading..."
   :loaded "Loaded but inactive"
   :activating "Activating..."
   :active "Active"
   :deactivating "Deactivating..."
   :error "Error"})

;; Plugin hook types
(def hook-types
  [:buffer-created
   :buffer-saved
   :buffer-closed
   :editor-focused
   :editor-blurred
   :key-pressed
   :command-executed
   :theme-changed
   :workspace-loaded
   :workspace-saved])

;; Plugin validation schema
(def plugin-schema
  {:name [:required :string]
   :version [:required :string]
   :description [:string]
   :author [:string]
   :main [:required :string] ; Path to main plugin file
   :dependencies [:vector]
   :permissions [:vector] ; File system, network, etc.
   :hooks [:vector] ; Which hooks this plugin uses
   :commands [:vector] ; Commands provided by this plugin
   :config [:map] ; Default configuration
   :enabled [:boolean :default true]})

(defn validate-plugin
  "Validate plugin metadata against schema"
  [plugin-metadata]
  (try
    (let [required-fields [:name :version :main]]
      (doseq [field required-fields]
        (when (nil? (get plugin-metadata field))
          (throw (ex-info (str "Missing required field: " field)
                          {:field field :plugin plugin-metadata})))))

    ;; Validate version format (semver)
    (when-not (re-matches #"^\d+\.\d+\.\d+(-.*)?$" (:version plugin-metadata))
      (throw (ex-info "Invalid version format (should be semver)"
                      {:version (:version plugin-metadata)})))

    {:valid true}
    (catch js/Error e
      {:valid false :error (.-message e)})))

(defn register-plugin-hooks
  "Register plugin hooks for a specific plugin"
  [plugin-id hooks]
  (doseq [hook-type hooks]
    (when (contains? (set hook-types) hook-type)
      (swap! plugin-state update-in [:plugin-hooks hook-type] conj plugin-id))))

(defn unregister-plugin-hooks
  "Unregister plugin hooks for a specific plugin"
  [plugin-id]
  (doseq [hook-type hook-types]
    (swap! plugin-state update-in [:plugin-hooks hook-type]
           (fn [hooks] (remove #(= % plugin-id) hooks)))))

(defn execute-hook
  "Execute all plugins registered for a specific hook"
  [hook-type & args]
  (let [plugin-ids (get-in @plugin-state [:plugin-hooks hook-type])]
    (doseq [plugin-id plugin-ids]
      (when-let [plugin (get-in @plugin-state [:active-plugins plugin-id])]
        (when-let [hook-fn (get-in plugin [:instance :hooks hook-type])]
          (try
            (apply hook-fn args)
            (catch js/Error e
              (println "Error executing hook" hook-type "for plugin" plugin-id ":" (.-message e)))))))))

(defn load-plugin
  "Load a plugin from its metadata"
  [plugin-metadata]
  (let [plugin-id (:name plugin-metadata)]
    (try
      (swap! plugin-state assoc-in [:loaded-plugins plugin-id]
             {:metadata plugin-metadata
              :state :loading
              :loaded-at (js/Date.)})

      ;; Validate plugin
      (let [validation (validate-plugin plugin-metadata)]
        (when-not (:valid validation)
          (throw (ex-info (:error validation) {:plugin plugin-metadata}))))

      ;; Load plugin code (simplified for now - in real implementation would load from file)
      (let [plugin-namespace (symbol (str "opencode-unified.plugins." (:name plugin-metadata)))]

        ;; Try to require the plugin namespace
        (try
          (require plugin-namespace)
          (catch js/Error e
            ;; If plugin doesn't exist, create a mock plugin for demonstration
            (println "Plugin namespace not found, creating mock plugin:" plugin-namespace)))

        ;; Create plugin instance
        (let [plugin-instance
              {:id plugin-id
               :namespace plugin-namespace
               :hooks {}
               :commands (:commands plugin-metadata [])
               :config (:config plugin-metadata {})
               :state :loaded}]

          (swap! plugin-state assoc-in [:loaded-plugins plugin-id]
                 (merge (get-in @plugin-state [:loaded-plugins plugin-id])
                        {:instance plugin-instance
                         :state :loaded}))

          ;; Register plugin hooks
          (when (:hooks plugin-metadata)
            (register-plugin-hooks plugin-id (:hooks plugin-metadata)))

          ;; Register plugin commands
          (when-let [commands (:commands plugin-metadata)]
            (swap! plugin-state update :plugin-commands concat
                   (map #(assoc % :plugin-id plugin-id) commands)))

          (println "Plugin loaded:" plugin-id)
          {:success true :plugin-id plugin-id}))

      (catch js/Error e
        (swap! plugin-state assoc-in [:loaded-plugins plugin-id :state] :error)
        (swap! plugin-state assoc :last-error (.-message e))
        (println "Error loading plugin" plugin-id ":" (.-message e))
        {:success false :error (.-message e)}))))

(defn activate-plugin
  "Activate a loaded plugin"
  [plugin-id]
  (try
    (let [plugin (get-in @plugin-state [:loaded-plugins plugin-id])]
      (when-not plugin
        (throw (ex-info "Plugin not found" {:plugin-id plugin-id})))

      (when-not (= (:state plugin) :loaded)
        (throw (ex-info "Plugin not in loaded state" {:plugin-id plugin-id :state (:state plugin)})))

      (swap! plugin-state assoc-in [:loaded-plugins plugin-id :state] :activating)

      ;; Call plugin's activate function if it exists
      (when-let [activate-fn (get-in plugin [:instance :activate])]
        (activate-fn (:config plugin)))

      ;; Move to active plugins
      (swap! plugin-state assoc-in [:active-plugins plugin-id]
             (get-in @plugin-state [:loaded-plugins plugin-id]))

      (swap! plugin-state assoc-in [:loaded-plugins plugin-id :state] :active)

      ;; Execute plugin activation hook
      (execute-hook :plugin-activated plugin-id)

      (println "Plugin activated:" plugin-id)
      {:success true :plugin-id plugin-id})

    (catch js/Error e
      (swap! plugin-state assoc-in [:loaded-plugins plugin-id :state] :error)
      (swap! plugin-state assoc :last-error (.-message e))
      (println "Error activating plugin" plugin-id ":" (.-message e))
      {:success false :error (.-message e)})))

(defn deactivate-plugin
  "Deactivate an active plugin"
  [plugin-id]
  (try
    (let [plugin (get-in @plugin-state [:active-plugins plugin-id])]
      (when-not plugin
        (throw (ex-info "Plugin not active" {:plugin-id plugin-id})))

      (swap! plugin-state assoc-in [:active-plugins plugin-id :state] :deactivating)

      ;; Call plugin's deactivate function if it exists
      (when-let [deactivate-fn (get-in plugin [:instance :deactivate])]
        (deactivate-fn))

      ;; Move back to loaded plugins
      (swap! plugin-state assoc-in [:loaded-plugins plugin-id]
             (assoc plugin :state :loaded))

      (swap! plugin-state update :active-plugins dissoc plugin-id)

      ;; Execute plugin deactivation hook
      (execute-hook :plugin-deactivated plugin-id)

      (println "Plugin deactivated:" plugin-id)
      {:success true :plugin-id plugin-id})

    (catch js/Error e
      (swap! plugin-state assoc :last-error (.-message e))
      (println "Error deactivating plugin" plugin-id ":" (.-message e))
      {:success false :error (.-message e)})))

(defn unload-plugin
  "Unload a plugin completely"
  [plugin-id]
  (try
    ;; Deactivate if active
    (when (get-in @plugin-state [:active-plugins plugin-id])
      (deactivate-plugin plugin-id))

    ;; Unregister hooks
    (unregister-plugin-hooks plugin-id)

    ;; Remove commands
    (swap! plugin-state update :plugin-commands
           (fn [commands] (remove #(= (:plugin-id %) plugin-id) commands)))

    ;; Remove from loaded plugins
    (swap! plugin-state update :loaded-plugins dissoc plugin-id)

    (println "Plugin unloaded:" plugin-id)
    {:success true :plugin-id plugin-id}

    (catch js/Error e
      (swap! plugin-state assoc :last-error (.-message e))
      (println "Error unloading plugin" plugin-id ":" (.-message e))
      {:success false :error (.-message e)})))

(defn discover-plugins
  "Discover available plugins in the plugins directory"
  []
  ;; For now, return some example plugins
  ;; In a real implementation, this would scan the filesystem
  [{:name "example-plugin"
    :version "1.0.0"
    :description "An example plugin for demonstration"
    :author "Opencode Team"
    :main "example_plugin.cljs"
    :dependencies []
    :permissions ["file-system"]
    :hooks [:buffer-created :buffer-saved]
    :commands [{:name "Example Command"
                :description "An example command from the plugin"
                :keys "SPC e e"
                :handler identity}]
    :config {:example-setting true}
    :enabled true}

   {:name "git-integration"
    :version "1.0.0"
    :description "Git integration plugin"
    :author "Opencode Team"
    :main "git_integration.cljs"
    :dependencies ["git-js"]
    :permissions ["file-system" "network"]
    :hooks [:buffer-saved :workspace-loaded]
    :commands [{:name "Git Status"
                :description "Show git status"
                :keys "SPC g s"
                :handler identity}
               {:name "Git Commit"
                :description "Commit current changes"
                :keys "SPC g c"
                :handler identity}]
    :config {:auto-commit false}
    :enabled true}

   {:name "lsp-client"
    :version "1.0.0"
    :description "Language Server Protocol client"
    :author "Opencode Team"
    :main "lsp_client.cljs"
    :dependencies ["vscode-languageserver-protocol"]
    :permissions ["network"]
    :hooks [:buffer-created :editor-focused]
    :commands [{:name "LSP Restart"
                :description "Restart LSP server"
                :keys "SPC l r"
                :handler identity}]
    :config {:servers {:clojure "clojure-lsp"
                       :javascript "typescript-language-server"}}
    :enabled true}])

(defn initialize-plugin-system
  "Initialize the plugin system"
  []
  (println "Initializing plugin system...")

  ;; Discover available plugins
  (let [plugins (discover-plugins)]
    (swap! plugin-state assoc :available-plugins plugins)
    (println "Discovered" (count plugins) "plugins"))

  ;; Load enabled plugins
  (doseq [plugin (:available-plugins @plugin-state)]
    (when (:enabled plugin)
      (let [result (load-plugin plugin)]
        (when (:success result)
          (activate-plugin (:plugin-id result))))))

  ;; Set up global hooks
  (add-watch state/buffers :plugin-hooks
             (fn [_ _ old-buffers new-buffers]
               ;; Check for new buffers
               (doseq [[buffer-id buffer] new-buffers]
                 (when-not (get old-buffers buffer-id)
                   (execute-hook :buffer-created buffer)))

               ;; Check for saved buffers
               (doseq [[buffer-id buffer] new-buffers]
                 (let [old-buffer (get old-buffers buffer-id)]
                   (when (and old-buffer buffer
                              (not (:saved? old-buffer))
                              (:saved? buffer))
                     (execute-hook :buffer-saved buffer))))))

  (println "Plugin system initialized"))

(defn get-plugin-state
  "Get current plugin system state"
  []
  @plugin-state)

(defn get-loaded-plugins
  "Get list of loaded plugins"
  []
  (vals (:loaded-plugins @plugin-state)))

(defn get-active-plugins
  "Get list of active plugins"
  []
  (vals (:active-plugins @plugin-state)))

(defn get-plugin-commands
  "Get all commands from active plugins"
  []
  (:plugin-commands @plugin-state))

(defn execute-plugin-command
  "Execute a command from a plugin"
  [command-name & args]
  (when-let [command (some #(when (= (:name %) command-name) %)
                           (get-plugin-commands))]
    (try
      (apply (:handler command) args)
      {:success true}
      (catch js/Error e
        {:success false :error (.-message e)}))))

;; Plugin UI components
(defn plugin-manager-ui
  "UI component for managing plugins"
  []
  (let [active-tab (r/atom :loaded)]
    (fn []
      [:div.plugin-manager
       [:div.plugin-tabs
        [:button {:class (when (= @active-tab :loaded) "active")
                  :on-click #(reset! active-tab :loaded)}
         "Loaded Plugins"]
        [:button {:class (when (= @active-tab :available) "active")
                  :on-click #(reset! active-tab :available)}
         "Available Plugins"]]

       [:div.plugin-content
        (case @active-tab
          :loaded
          [:div.loaded-plugins
           (for [plugin (get-loaded-plugins)]
             ^{:key (:id plugin)}
             [:div.plugin-item
              [:div.plugin-info
               [:h4 (:name plugin)]
               [:p (:description plugin)]
               [:span.plugin-state (get plugin-states (:state plugin))]]
              [:div.plugin-actions
               (case (:state plugin)
                 :active
                 [:button {:on-click #(deactivate-plugin (:id plugin))}
                  "Deactivate"]
                 :loaded
                 [:button {:on-click #(activate-plugin (:id plugin))}
                  "Activate"]
                 [:button {:on-click #(unload-plugin (:id plugin))}
                  "Unload"])]])]

          :available
          [:div.available-plugins
           (for [plugin (:available-plugins @plugin-state)]
             ^{:key (:name plugin)}
             [:div.plugin-item
              [:div.plugin-info
               [:h4 (:name plugin)]
               [:p (:description plugin)]
               [:span "v" (:version plugin)]]
              [:div.plugin-actions
               (if (get-in @plugin-state [:loaded-plugins (:name plugin)])
                 [:span "Already loaded"]
                 [:button {:on-click #(load-plugin plugin)}
                  "Load"])]])])]])))

;; Export functions for use in other modules
(defn get-plugin-hooks
  "Get all registered hooks"
  []
  (:plugin-hooks @plugin-state))