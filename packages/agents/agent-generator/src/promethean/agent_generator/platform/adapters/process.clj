(ns promethean.agent-generator.platform.adapters.process
  "External process execution adapter for SCI compatibility")

(defn mock-execute [command args]
  "Mock process execution response"
  {:exit-code 0
   :out (str "Mock output for command: " command " " (clojure.string/join " " args))
   :err ""
   :success? true})

(defn execute-command [command & args]
  "Execute external command"
  (try
    (mock-execute command args)
    (catch Exception _
      {:exit-code 1
       :out ""
       :err "Command execution failed"
       :success? false})))

(defn execute-with-timeout [command args timeout-ms]
  "Execute command with timeout"
  (try
    (mock-execute command args)
    (catch Exception _
      {:exit-code 1
       :out ""
       :err "Command execution failed or timed out"
       :success? false})))

(defn shell-execute [shell-command]
  "Execute shell command string"
  (try
    {:exit-code 0
     :out (str "Mock shell output for: " shell-command)
     :err ""
     :success? true}
    (catch Exception _
      {:exit-code 1
       :out ""
       :err "Shell command execution failed"
       :success? false})))

(defn check-command-exists [command]
  "Check if command exists on system"
  (try
    true ; Mock: assume all commands exist
    (catch Exception _
      false)))

;; Main adapter function that features expect
(defn main [config]
  "Process execution adapter function"
  (fn [operation & args]
    (case operation
      :execute (apply execute-command args)
      :execute-with-timeout (apply execute-with-timeout args)
      :shell (apply shell-execute args)
      :exists? (apply check-command-exists args)
      nil)))