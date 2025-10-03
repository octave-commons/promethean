(ns promethean.mcp.dev-ui.core
  (:require [clojure.string :as str]
            [promethean.mcp.dev-ui.runtime :as runtime])
  (:require-macros [promethean.mcp.dev-ui.html :refer [html]]))

(def styles
  """:root {
  color-scheme: dark;
  font-family: \"Inter\", \"Segoe UI\", sans-serif;
  background: #0f172a;
}

body {
  margin: 0;
  padding: 0;
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  min-height: 100vh;
}

h1, h2, h3 {
  margin: 0;
}

button {
  cursor: pointer;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.app__header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app__title {
  font-size: 2.25rem;
  font-weight: 700;
}

.app__subtitle {
  color: #94a3b8;
}

.panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.panel {
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.4);
}

.panel__title {
  font-size: 1.25rem;
  font-weight: 600;
}

.chat-log {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;
}

.chat-message {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  background: rgba(30, 64, 175, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.chat-message--user {
  align-self: flex-end;
  background: rgba(59, 130, 246, 0.3);
}

.chat-message__author {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #60a5fa;
  margin-bottom: 4px;
}

.chat-inputs {
  display: flex;
  gap: 12px;
}

.chat-inputs textarea {
  flex: 1;
  resize: vertical;
  min-height: 60px;
  max-height: 160px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.8);
  color: inherit;
  padding: 12px 16px;
  font-size: 1rem;
}

.primary-button {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25);
}

.secondary-button {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.6);
  color: #dbeafe;
  padding: 10px 16px;
  font-size: 0.95rem;
}

.text-input,
.select-input {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.8);
  color: inherit;
  padding: 10px 14px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}

.tool-list,
.endpoint-list,
.proxy-list,
.resolved-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;
}

.tool-card,
.endpoint-row,
.proxy-card,
.resolved-card {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 16px;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-card__id {
  font-weight: 600;
  color: #f8fafc;
}

.tool-card__description {
  color: #cbd5f5;
  line-height: 1.4;
}

.endpoint-row__header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.endpoint-tools,
.global-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tool-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.16);
  border: 1px solid rgba(96, 165, 250, 0.3);
  font-size: 0.85rem;
}

.status-banner {
  min-height: 20px;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  background: rgba(22, 163, 74, 0.18);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #bbf7d0;
}

.status-banner--error {
  background: rgba(220, 38, 38, 0.16);
  border-color: rgba(248, 113, 113, 0.35);
  color: #fecaca;
}

.error-banner {
  background: rgba(220, 38, 38, 0.16);
  border: 1px solid rgba(248, 113, 113, 0.35);
  border-radius: 12px;
  padding: 12px 16px;
  color: #fecaca;
}

.footer-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.75);
}

.loading-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #60a5fa;
  animation: bounce 1.2s infinite ease-in-out;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  40% {
    transform: scale(1.0);
    opacity: 1;
  }
}
""")

(def initial-state
  {:loading? true
   :error nil
   :status nil
   :saving? false
   :chat []
   :available-tools []
   :http-endpoints []
   :proxies []
   :meta {:config-path "" :config-source "Unknown"}
   :form {:transport "http"
          :tools #{}
          :endpoints [{:path "" :tools #{}}]
          :stdio-proxy ""}})

(defn ->clj [value]
  (when (some? value)
    (js->clj value :keywordize-keys true)))

(defn describe-source [source fallback]
  (case (:type source)
    "file" (str "File · " (:path source))
    "env" "Environment variable (MCP_CONFIG_JSON)"
    "default" (str "Default · " fallback)
    (or fallback "Unknown")))

(defn ensure-endpoints [form]
  (update form :endpoints
          (fn [rows]
            (let [rows (vec rows)]
              (if (seq rows) rows [{:path "" :tools #{}}])))))

(defn config->form [cfg]
  (let [cfg (or cfg {})
        endpoints (or (:endpoints cfg) {})]
    (ensure-endpoints
     {:transport (or (:transport cfg) "http")
      :tools (set (or (:tools cfg) []))
      :endpoints (mapv (fn [[path endpoint]]
                         {:path path
                          :tools (set (or (:tools endpoint) []))})
                       (sort-by first endpoints))
      :stdio-proxy (or (:stdioProxyConfig cfg) "")})))

(defn decode-ui-state [data]
  (let [cfg (->clj (:config data))
        tools (->clj (:availableTools data))
        endpoints (->clj (:httpEndpoints data))
        proxies (->clj (:proxies data))
        src (->clj (:configSource data))
        config-path (:configPath data)]
    {:available-tools (vec (sort-by :id tools))
     :http-endpoints (vec endpoints)
     :proxies (vec proxies)
     :meta {:config-path config-path
            :config-source (describe-source src config-path)}
     :form (config->form cfg)}))

(defn state-atom [el] (aget el "__state"))

(declare render! attach-handlers!)

(defn update-state! [el f & args]
  (when-let [state (state-atom el)]
    (apply swap! state f args)
    (render! el)))

(defn set-status! [el kind message]
  (update-state! el assoc :status {:kind kind :message message})
  (js/setTimeout
   (fn []
     (when (state-atom el)
       (update-state! el assoc :status nil)))
   3200))

(defn fetch-json
  ([url] (fetch-json url nil))
  ([url opts]
   (let [options (cond-> #js{}
                   opts (clj->js opts))]
     (-> (js/fetch url options)
         (.then (fn [res]
                  (if (.-ok res)
                    (.json res)
                    (.then (.text res)
                           (fn [text]
                             (js/Promise.reject
                              (js/Error. (if (str/blank? text)
                                           (str "Request failed: " (.-status res))
                                           text))))))))
         (.then (fn [data] (->clj data)))))))

(defn ensure-shadow-root! [el]
  (or (.-shadowRoot el)
      (.attachShadow el #js{:mode "open"})))

(defn render-chat [chat]
  (if (seq chat)
    (for [{:keys [author message]} chat]
      (let [cls (str "chat-message" (when (= author :user) " chat-message--user"))
            name (-> author name str/upper-case)]
        (html
         [:div {:class cls}
          [:div {:class "chat-message__author"} name]
          [:div message]])))
    [(html [:div {:class "empty-text"} "No chat activity yet. Start the conversation below."])]))

(defn render-global-tools [available selected]
  (for [{:keys [id description name]} available]
    (let [checked? (contains? selected id)]
      (html
       [:label {:class "tool-card"}
        [:div {:class "tool-card__header"}
         [:div {:class "tool-card__id"} id]
         [:div {:class "tool-chip"}
          [:input {:type "checkbox"
                   :class "tool-toggle"
                   :data-id id
                   :checked (when checked? "checked")}]
          "Enabled"]]
        (when (or name description)
          (html [:div {:class "tool-card__description"}
                 (or description name "No description provided.")]))]))))

(defn render-endpoints [available endpoints]
  (if (seq endpoints)
    (map-indexed
     (fn [idx {:keys [path tools]}]
       (let [tools (or tools #{})]
         (html
          [:div {:class "endpoint-row"}
           [:div {:class "endpoint-row__header"}
            [:input {:type "text"
                     :class "text-input endpoint-path"
                     :placeholder "/mcp"
                     :value path
                     :data-index idx}]
            [:button {:type "button"
                      :class "secondary-button endpoint-remove"
                      :data-index idx}
             "Remove"]]
           [:div {:class "endpoint-tools"}
            (for [{:keys [id]} available]
              (let [checked? (contains? tools id)]
                (html
                 [:label {:class "tool-chip"}
                  [:input {:type "checkbox"
                           :class "endpoint-tool-toggle"
                           :data-index idx
                           :data-tool id
                           :checked (when checked? "checked")}]
                  id])))] ])))
     endpoints)
    [(html [:div {:class "empty-text"} "No endpoints configured yet. Add one below."])]))

(defn render-resolved-endpoints [endpoints]
  (if (seq endpoints)
    (for [{:keys [path tools]} endpoints]
      (html
       [:div {:class "resolved-card"}
        [:div {:class "resolved-card__path"} path]
        [:div {:class "endpoint-tools"}
         (for [tool tools]
           (html [:span {:class "tool-chip"} tool]))]]))
    [(html [:div {:class "empty-text"} "No HTTP endpoints are currently active."])]))

(defn render-proxies [proxies]
  (if (seq proxies)
    (for [{:keys [name httpPath]} proxies]
      (html
       [:div {:class "proxy-card"}
        [:div {:class "tool-card__id"} name]
        [:div {:class "tool-card__description"} httpPath]]))
    [(html [:div {:class "empty-text"} "No stdio proxies are active."])]))

(defn render-status [status]
  (when status
    (let [cls (str "status-banner"
                   (when (= (:kind status) :error) " status-banner--error"))]
      (html [:div {:class cls :id "status-banner"} (:message status)]))))

(defn render-error [error]
  (when (seq error)
    (html [:div {:class "error-banner"} error])))

(defn render-loading [loading?]
  (when loading?
    (html
     [:div {:class "loading-overlay"}
      [:div {:class "loading-dot"}]
      [:div {:class "loading-dot"}]
      [:div {:class "loading-dot"}]
      [:div "Loading latest MCP state..."]]))))

(defn render-app [state]
  (let [{:keys [loading? error status saving? chat available-tools http-endpoints proxies meta form]} state
        {:keys [transport tools endpoints stdio-proxy]} form
        tools (or tools #{})
        endpoints (vec endpoints)
        config-path (:config-path meta)
        config-source (:config-source meta)]
    (html
     [:div {:class "app"}
      [:style styles]
      [:div {:class "app__header"}
       [:h1 {:class "app__title"} "Promethean MCP"]
       [:div {:class "app__subtitle"}
        "Interactive console for MCP transports, tools, and stdio proxies."]
       [:div {:class "footer-actions"}
        [:button {:type "button" :id "refresh-button" :class "secondary-button"}
         "Refresh State"]
        [:span {:class "meta-text"}
         (str "Config source: " config-source)]]]
      (render-status status)
      (render-error error)
      [:div {:class "panels"}
       [:section {:class "panel"}
        [:h2 {:class "panel__title"} "Chat Console"]
        [:div {:class "chat-log" :id "chat-log"}
         (render-chat chat)]
        [:form {:id "chat-form"}
         [:div {:class "chat-inputs"}
          [:textarea {:id "chat-input"
                      :placeholder "Ask about tools, endpoints, or proxies..."}]
          [:button {:type "submit" :class "primary-button"}
           "Send"]]]]
       [:section {:class "panel"}
        [:h2 {:class "panel__title"} "Global Tools"]
        [:div {:class "tool-list"}
         (render-global-tools available-tools tools)]]
       [:section {:class "panel"}
        [:h2 {:class "panel__title"} "HTTP Endpoints"]
        [:div {:class "endpoint-list" :id "endpoints-container"}
         (render-endpoints available-tools endpoints)]
        [:button {:type "button" :class "secondary-button" :id "add-endpoint"}
         "Add Endpoint"]]
       [:section {:class "panel"}
        [:h2 {:class "panel__title"} "Configuration"]
        [:form {:id "config-form"}
         [:label {:class "field"}
          [:div {:class "field-label"} "Transport"]
          [:select {:id "transport-select" :class "select-input" :value transport}
           [:option {:value "http"} "HTTP"]
           [:option {:value "stdio"} "STDIO"]]]
         [:label {:class "field"}
          [:div {:class "field-label"} "Config Path"]
          [:input {:type "text" :class "text-input"
                   :id "config-path"
                   :placeholder "promethean.mcp.json"
                   :value config-path}]]
         [:label {:class "field"}
          [:div {:class "field-label"} "Stdio Proxy Config"]
          [:input {:type "text" :class "text-input"
                   :id "proxy-input"
                   :placeholder "config/mcp_servers.edn"
                   :value stdio-proxy}]]
         [:button {:type "submit"
                   :class "primary-button"
                   :id "save-config"
                   :disabled (when saving? "disabled")}
          (if saving? "Saving..." "Save Configuration")]]]
       [:section {:class "panel"}
        [:h2 {:class "panel__title"} "Resolved HTTP Endpoints"]
        [:div {:class "resolved-list"}
         (render-resolved-endpoints http-endpoints)]]
       [:section {:class "panel"}
        [:h2 {:class "panel__title"} "Active Proxies"]
        [:div {:class "proxy-list"}
         (render-proxies proxies)]]]
      (render-loading loading?)])))

(defn parse-index [element]
  (some-> element .-dataset .-index js/parseInt))

(defn read-target [event]
  (.-target event))

(defn remove-endpoint [rows idx]
  (let [rows (vec (concat (subvec rows 0 idx) (subvec rows (inc idx))))]
    (if (seq rows) rows [{:path "" :tools #{}}])))

(defn attach-global-tool-handlers! [el root]
  (doseq [input (array-seq (.querySelectorAll root "input.tool-toggle"))]
    (.addEventListener input "change"
      (fn [event]
        (let [target (read-target event)
              tool-id (.. target -dataset -id)
              checked (.-checked target)]
          (update-state! el update-in [:form :tools]
                         (fn [tools]
                           (let [tools (or tools #{})]
                             (if checked
                               (conj tools tool-id)
                               (disj tools tool-id))))))))))

(defn attach-endpoint-handlers! [el root]
  (doseq [input (array-seq (.querySelectorAll root "input.endpoint-path"))]
    (.addEventListener input "input"
      (fn [event]
        (let [target (read-target event)
              idx (parse-index target)
              value (-> target .-value str/trim)]
          (when (number? idx)
            (update-state! el assoc-in [:form :endpoints idx :path] value))))))
  (doseq [input (array-seq (.querySelectorAll root "input.endpoint-tool-toggle"))]
    (.addEventListener input "change"
      (fn [event]
        (let [target (read-target event)
              idx (parse-index target)
              tool-id (.. target -dataset -tool)
              checked (.-checked target)]
          (when (number? idx)
            (update-state! el update-in [:form :endpoints idx :tools]
                           (fn [tools]
                             (let [tools (or tools #{})]
                               (if checked
                                 (conj tools tool-id)
                                 (disj tools tool-id))))))))))
  (doseq [btn (array-seq (.querySelectorAll root "button.endpoint-remove"))]
    (.addEventListener btn "click"
      (fn [event]
        (let [target (read-target event)
              idx (parse-index target)]
          (when (number? idx)
            (update-state! el update-in [:form :endpoints]
                           (fn [rows]
                             (remove-endpoint rows idx)))))))))

(defn attach-config-handlers! [el root]
  (when-let [select (.querySelector root "#transport-select")]
    (.addEventListener select "change"
      (fn [event]
        (let [value (-> event read-target .-value)]
          (update-state! el assoc-in [:form :transport] value)))))
  (when-let [proxy (.querySelector root "#proxy-input")]
    (.addEventListener proxy "input"
      (fn [event]
        (let [value (-> event read-target .-value)]
          (update-state! el assoc-in [:form :stdio-proxy] value)))))
  (when-let [path-input (.querySelector root "#config-path")]
    (.addEventListener path-input "input"
      (fn [event]
        (let [value (-> event read-target .-value)]
          (update-state! el assoc-in [:meta :config-path] value)))))
  (when-let [add-btn (.querySelector root "#add-endpoint")]
    (.addEventListener add-btn "click"
      (fn [_]
        (update-state! el update-in [:form :endpoints]
                       (fn [rows]
                         (conj (vec rows) {:path "" :tools #{}}))))))
  (when-let [form (.querySelector root "#config-form")]
    (.addEventListener form "submit"
      (fn [event]
        (.preventDefault event)
        (save-config! el)))))

(defn attach-chat-handlers! [el root]
  (when-let [form (.querySelector root "#chat-form")]
    (.addEventListener form "submit"
      (fn [event]
        (.preventDefault event)
        (let [input (.querySelector root "#chat-input")
              value (-> input .-value str/trim)]
          (when (seq value)
            (set! (.-value input) "")
            (send-chat! el value)))))))

(defn attach-general-handlers! [el root]
  (when-let [refresh (.querySelector root "#refresh-button")]
    (.addEventListener refresh "click"
      (fn [event]
        (.preventDefault event)
        (refresh-state! el)))))

(defn attach-handlers! [el root]
  (attach-general-handlers! el root)
  (attach-chat-handlers! el root)
  (attach-global-tool-handlers! el root)
  (attach-endpoint-handlers! el root)
  (attach-config-handlers! el root))

(defn render! [el]
  (let [state @(state-atom el)
        root (ensure-shadow-root! el)]
    (set! (.-innerHTML root) (render-app state))
    (attach-handlers! el root)))

(defn form->config [form]
  {:transport (or (:transport form) "http")
   :tools (vec (sort (:tools form)))
   :stdioProxyConfig (let [value (-> form :stdio-proxy str/trim)]
                       (when (seq value) value))
   :endpoints (into {}
                    (for [{:keys [path tools]} (:endpoints form)
                          :let [p (str/trim (or path ""))]
                          :when (seq p)]
                      [p {:tools (vec (sort tools))}]))})

(defn handle-config-response! [el response]
  (let [decoded (decode-ui-state response)]
    (update-state! el
                   (fn [state]
                     (-> state
                         (merge decoded)
                         (assoc :saving? false)))))
  (set-status! el :success "Configuration saved."))

(defn save-config! [el]
  (let [state @(state-atom el)
        form (:form state)
        payload {:path (-> state :meta :config-path)
                 :config (form->config form)}]
    (update-state! el #(assoc % :saving? true :status nil))
    (-> (fetch-json "/ui/config"
                    {:method "POST"
                     :headers {:content-type "application/json"}
                     :body (js/JSON.stringify (clj->js payload))})
        (.then (fn [resp]
                 (handle-config-response! el resp)))
        (.catch (fn [err]
                  (update-state! el #(assoc % :saving? false))
                  (set-status! el :error (str "Save failed: " (.-message err))))))))

(defn send-chat! [el message]
  (update-state! el update :chat conj {:author :user :message message})
  (-> (fetch-json "/ui/chat"
                  {:method "POST"
                   :headers {:content-type "application/json"}
                   :body (js/JSON.stringify (clj->js {:message message}))})
      (.then (fn [resp]
               (let [reply (or (:reply resp) "Saved")]
                 (update-state! el update :chat conj {:author :system :message reply}))))
      (.catch (fn [err]
                (update-state! el update :chat conj {:author :system
                                                     :message (str "Error: " (.-message err))})
                (set-status! el :error (str "Chat failed: " (.-message err)))))))

(defn refresh-state! [el]
  (update-state! el #(assoc % :loading? true :error nil))
  (-> (fetch-json "/ui/state")
      (.then (fn [resp]
               (let [decoded (decode-ui-state resp)]
                 (update-state! el
                                (fn [state]
                                  (-> state
                                      (merge decoded)
                                      (assoc :loading? false :status nil)))))))
      (.catch (fn [err]
                (update-state! el #(assoc % :loading? false :error (.-message err)))))))

(defonce defined? (atom false))

(defn define-component! []
  (when-not @defined?
    (let [cls (js* "(class extends HTMLElement {})")]
      (aset (.-prototype cls) "connectedCallback"
            (fn []
              (this-as this
                (when-not (state-atom this)
                  (aset this "__state" (atom initial-state))
                  (render! this)
                  (refresh-state! this)))))
      (aset (.-prototype cls) "disconnectedCallback"
            (fn []
              (this-as this
                (when-let [state (state-atom this)]
                  (reset! state initial-state)
                  (aset this "__state" nil)))))
      (.define js/customElements "mcp-dev-app" cls)
      (reset! defined? true))))

(defn init []
  (define-component!))
