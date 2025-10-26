(ns app.opencode
  "Opencode SDK integration for ClojureScript Electron app"
  (:require [clojure.walk :as walk]
            [clojure.string :as str]
            [app.state :as state]
            [app.buffers :as buffers]
            [reagent.core :as r]))

;; Opencode API state
(defonce opencode-state
  (r/atom {:connected? false
           :api-endpoint "http://localhost:3000"
           :session-id nil
           :available-tools []
           :active-agents []
           :last-error nil}))

;; Tool execution tracking
(defonce tool-executions
  (r/atom {}))

;; Agent communication tracking
(defonce agent-communications
  (r/atom {}))

;; Opencode API wrapper functions
(defn opencode-api-call
  "Make API call to Opencode server"
  [method path & [data]]
  (let [endpoint (str (:api-endpoint @opencode-state) path)]
    (-> (js/fetch endpoint
                  (clj->js {:method method
                            :headers {"Content-Type" "application/json"
                                      "X-Session-ID" (or (:session-id @opencode-state) "")}
                            :body (when data (js/JSON.stringify (clj->js data)))}))
        (.then #(.json %))
        (.then (fn [response]
                 (let [result (js->clj response :keywordize-keys true)]
                   (if (:error result)
                     (do
                       (swap! opencode-state assoc :last-error (:error result))
                       {:error (:error result)})
                     result))))
        (.catch (fn [error]
                  (swap! opencode-state assoc :last-error (.-message error))
                  {:error (.-message error)})))))

;; Connection management
(defn connect-to-opencode
  "Connect to Opencode server"
  [endpoint]
  (swap! opencode-state assoc :api-endpoint endpoint)
  (opencode-api-call "GET" "/api/status"))

(defn disconnect-from-opencode
  "Disconnect from Opencode server"
  []
  (swap! opencode-state assoc 
         :connected? false
         :session-id nil
         :available-tools []
         :active-agents []))

;; Session management
(defn create-session
  "Create new Opencode session"
  []
  (opencode-api-call "POST" "/api/sessions"
                     {:app-name "Opencode ClojureScript Editor"
                      :version "1.0.0"
                      :capabilities ["file-editing" "agent-communication" "tool-execution"]}))

(defn join-session
  "Join existing Opencode session"
  [session-id]
  (opencode-api-call "POST" (str "/api/sessions/" session-id "/join")))

;; Tool management
(defn list-available-tools
  "Get list of available Opencode tools"
  []
  (opencode-api-call "GET" "/api/tools"))

(defn execute-tool
  "Execute an Opencode tool"
  [tool-name parameters & [options]]
  (let [execution-id (random-uuid)]
    (swap! tool-executions assoc execution-id 
           {:tool-name tool-name
            :parameters parameters
            :status "running"
            :started-at (js/Date.)
            :options options})
    
    (-> (opencode-api-call "POST" "/api/tools/execute"
                           {:tool-name tool-name
                            :parameters parameters
                            :execution-id (str execution-id)
                            :options options})
        (.then (fn [result]
                 (swap! tool-executions update execution-id 
                        merge {:status "completed"
                               :result result
                               :completed-at (js/Date.)})
                 result))
        (.catch (fn [error]
                  (swap! tool-executions update execution-id
                         merge {:status "failed"
                                :error (.-message error)
                                :completed-at (js/Date.)})
                  {:error (.-message error)})))))

;; Agent management
(defn list-active-agents
  "Get list of active Opencode agents"
  []
  (opencode-api-call "GET" "/api/agents"))

(defn spawn-agent
  "Spawn a new Opencode agent"
  [agent-type prompt & [options]]
  (opencode-api-call "POST" "/api/agents/spawn"
                     {:agent-type agent-type
                      :prompt prompt
                      :options options}))

(defn send-agent-message
  "Send message to an Opencode agent"
  [agent-id message & [message-type]]
  (opencode-api-call "POST" (str "/api/agents/" agent-id "/message")
                     {:message message
                      :message-type (or message-type "instruction")
                      :priority "medium"}))

(defn get-agent-status
  "Get status of an Opencode agent"
  [agent-id]
  (opencode-api-call "GET" (str "/api/agents/" agent-id "/status")))

;; File operations through Opencode
(defn opencode-read-file
  "Read file using Opencode file operations"
  [file-path]
  (execute-tool "serena_read_file" {:relative_path file-path}))

(defn opencode-write-file
  "Write file using Opencode file operations"
  [file-path content]
  (execute-tool "serena_create_text_file" {:relative_path file-path
                                           :content content}))

(defn opencode-search-code
  "Search code using Opencode tools"
  [pattern & [options]]
  (execute-tool "serena_search_for_pattern" 
                (merge {:substring_pattern pattern} options)))

;; Buffer integration with Opencode
(defn open-buffer-with-opencode
  "Open buffer using Opencode file operations"
  [file-path]
  (-> (opencode-read-file file-path)
      (.then (fn [result]
               (if (:error result)
                 (buffers/create-buffer 
                   file-path 
                   (str "Error loading file: " (:error result)))
                 (buffers/create-buffer file-path (:content result)))))))

(defn save-buffer-with-opencode
  "Save buffer using Opencode file operations"
  [buffer-id]
  (let [buffer (get @state/buffers buffer-id)]
    (when buffer
      (-> (opencode-write-file (:path buffer) (:content buffer))
          (.then (fn [result]
                   (if (:error result)
                     (swap! state/buffers update buffer-id assoc 
                            :saved? false
                            :error (:error result))
                     (swap! state/buffers update buffer-id assoc 
                            :saved? true
                            :error nil
                            :last-saved (js/Date.)))))))))

;; Agent communication integration
(defn create-agent-chat-buffer
  "Create buffer for agent communication"
  [agent-id agent-type]
  (let [buffer-path (str "agent://" agent-id)
        initial-content (str "# Agent Chat: " agent-type " (" agent-id ")\n\n"
                            "---\n\n"
                            "Type your message below and press C-c C-c to send.\n\n")]
    (buffers/create-buffer buffer-path initial-content {:agent-id agent-id
                                                       :agent-type agent-type
                                                       :buffer-type :agent-chat})))

(defn send-buffer-content-to-agent
  "Send buffer content to agent"
  [buffer-id]
  (let [buffer (get @state/buffers buffer-id)
        agent-id (:agent-id (:metadata buffer))]
    (when agent-id
      (let [content (:content buffer)
            lines (str/split content #"\n")
            message-lines (take-while #(not= % "---") (drop 3 lines))
            message (str/join "\n" message-lines)]
        (-> (send-agent-message agent-id message)
            (.then (fn [result]
                     (if (:error result)
                       (swap! state/buffers update buffer-id assoc 
                              :error (:error result))
                       (swap! state/buffers update buffer-id assoc 
                              :content (str content "\n\nAgent: " (:result result) "\n\n---\n\n")
                              :error nil)))))))))

;; Tool execution UI integration
(defn create-tool-execution-buffer
  "Create buffer to display tool execution results"
  [tool-name parameters execution-id]
  (let [buffer-path (str "tool://" tool-name "/" execution-id)
        initial-content (str "# Tool Execution: " tool-name "\n\n"
                            "Execution ID: " execution-id "\n\n"
                            "Parameters:\n```json\n" 
                            (js/JSON.stringify (clj->js parameters) nil 2)
                            "\n```\n\n"
                            "Status: Running...\n\n"
                            "---\n\n"
                            "Results will appear below.\n\n")]
    (buffers/create-buffer buffer-path initial-content {:tool-name tool-name
                                                       :execution-id execution-id
                                                       :buffer-type :tool-execution})))

(defn update-tool-execution-buffer
  "Update tool execution buffer with results"
  [execution-id]
  (let [execution (get @tool-executions execution-id)
        buffer-path (str "tool://" (:tool-name execution) "/" execution-id)
        buffer-id (:id (buffers/find-buffer-by-path buffer-path))]
    (when (and buffer-id execution)
      (let [status-line (case (:status execution)
                          "running" "Status: Running..."
                          "completed" (str "Status: Completed\n\nResult:\n```json\n"
                                          (js/JSON.stringify (clj->js (:result execution)) nil 2)
                                          "\n```\n\n")
                          "failed" (str "Status: Failed\n\nError: " (:error execution) "\n\n"))
            updated-content (str "# Tool Execution: " (:tool-name execution) "\n\n"
                                "Execution ID: " execution-id "\n\n"
                                "Parameters:\n```json\n" 
                                (js/JSON.stringify (clj->js (:parameters execution)) nil 2)
                                "\n```\n\n"
                                status-line
                                "---\n\n"
                                (when (:result execution)
                                  (:result execution))
                                "\n\n")]
        (swap! state/buffers update buffer-id assoc :content updated-content)))))

;; Opencode command palette integration
(defn opencode-commands
  "Get Opencode-specific commands for command palette"
  []
  [{:name "Connect to Opencode"
    :description "Connect to Opencode server"
    :action #(connect-to-opencode "http://localhost:3000")}
   {:name "Disconnect from Opencode"
    :description "Disconnect from Opencode server"
    :action disconnect-from-opencode}
   {:name "List Available Tools"
    :description "Show available Opencode tools"
    :action #(-> (list-available-tools)
                 (.then (fn [result]
                          (when-not (:error result)
                            (js/alert (str "Available tools:\n" 
                                          (str/join "\n" (map :name result))))))))}
   {:name "Spawn Agent"
    :description "Spawn a new Opencode agent"
    :action #(let [agent-type (js/prompt "Agent type (e.g., 'general', 'code-reviewer'):")
                    prompt (js/prompt "Agent prompt:")]
                (when (and agent-type prompt)
                  (-> (spawn-agent agent-type prompt)
                      (.then (fn [result]
                               (when-not (:error result)
                                 (create-agent-chat-buffer (:agent-id result) agent-type)))))))}
   {:name "Execute Tool"
    :description "Execute an Opencode tool"
    :action #(let [tool-name (js/prompt "Tool name:")
                    parameters (js/prompt "Parameters (JSON):")]
                (when (and tool-name parameters)
                  (try
                    (let [parsed-params (js/JSON.parse parameters)]
                      (-> (execute-tool tool-name (js->clj parsed-params :keywordize-keys true))
                          (.then (fn [result]
                                   (create-tool-execution-buffer tool-name 
                                                                (js->clj parsed-params :keywordize-keys true)
                                                                (:execution-id result))))))
                    (catch js/Error e
                      (js/alert (str "Invalid JSON: " (.-message e)))))))}])

;; Auto-save integration with Opencode
(defn setup-opencode-auto-save
  "Set up auto-save using Opencode file operations"
  []
  (add-watch state/buffers :opencode-auto-save
    (fn [_ _ old-buffers new-buffers]
      (doseq [[buffer-id buffer] new-buffers]
        (when (and (not (:saved? buffer))
                   (:path buffer)
                   (not (str/starts-with? (:path buffer) "agent:"))
                   (not (str/starts-with? (:path buffer) "tool:"))
                   (not= (:content buffer) 
                          (:content (get old-buffers buffer-id))))
          (save-buffer-with-opencode buffer-id))))))

;; Initialize Opencode integration
(defn init-opencode
  "Initialize Opencode SDK integration"
  []
  (println "Initializing Opencode SDK integration...")
  
  ;; Try to connect to default endpoint
  (-> (connect-to-opencode "http://localhost:3000")
      (.then (fn [result]
               (if (:error result)
                 (println "Opencode not available:" (:error result))
                 (do
                   (println "Connected to Opencode")
                   (swap! opencode-state assoc :connected? true)
                   (-> (create-session)
                       (.then (fn [session-result]
                                (if (:error session-result)
                                  (println "Failed to create session:" (:error session-result))
                                  (do
                                     (swap! opencode-state assoc :session-id (:session-id session-result))
                                     (println "Opencode session created:" (:session-id session-result)))))))))))
  
  ;; Set up auto-save
  (setup-opencode-auto-save)
  
  ;; Add Opencode commands to command palette
  (swap! state/command-palette concat (opencode-commands)))

;; Export functions for use in other modules
(defn get-opencode-state []
  @opencode-state)

(defn get-tool-executions []
  @tool-executions)

(defn get-agent-communications []
  @agent-communications))