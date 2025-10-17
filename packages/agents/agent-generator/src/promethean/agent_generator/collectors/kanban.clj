(ns promethean.agent-generator.collectors.kanban
  "Kanban board data collector"
  (:require [promethean.agent-generator.collectors.protocol :as protocol]
            [promethean.agent-generator.platform.features :as features]
            [clojure.string :as str]))

(defrecord KanbanCollector [config]
  protocol/Collector
  (collect! [this config]
    (let [kanban-config (merge (:kanban config) config)
          board-file (:board-file kanban-config)
          api-endpoint (:api-endpoint kanban-config)]
      (cond
        ;; Try API endpoint first if available
        api-endpoint (collect-from-api api-endpoint kanban-config)
        
        ;; Fall back to file-based collection
        (and board-file 
             (features/feature-available? :file-system)
             ((features/use-feature! :file-system) board-file))
        (collect-from-file board-file kanban-config)
        
        ;; No data source available
        :else (protocol/error-result ["No kanban data source available"]))))

  (available? [this]
    (let [kanban-config (merge (:kanban config) config)]
      (or (:api-endpoint kanban-config)
          (and (:board-file kanban-config)
               (features/feature-available? :file-system)))))

  (validate [this data]
    (and (map? data)
         (or (contains? data :tasks)
             (contains? data :board))
         (every? string? (keys data))))

  (collector-name [this] "kanban")
  (collector-priority [this] 10))

(defn collect-from-api [api-endpoint config]
  "Collect kanban data from API endpoint"
  (try
    (let [http-impl (features/use-feature! :http-client)
          response (http-impl api-endpoint)]
      (if (:success response)
        (let [json-impl (features/use-feature! :json-processing)
              data (json-impl (:body response))]
          (protocol/success-result (process-kanban-data data config)
                                  {:source :api
                                   :endpoint api-endpoint}))
        (protocol/error-result [(str "API request failed: " (:error response))])))
    (catch Exception e
      (protocol/error-result [(str "API collection failed: " (.getMessage e))]))))

(defn collect-from-file [board-file config]
  "Collect kanban data from markdown file"
  (try
    (let [file-impl (features/use-feature! :file-system)
          content (file-impl board-file)]
      (if content
        (let [parsed (parse-kanban-markdown content)]
          (protocol/success-result (process-kanban-data parsed config)
                                  {:source :file
                                   :file board-file}))
        (protocol/error-result [(str "Empty kanban file: " board-file)])))
    (catch Exception e
      (protocol/error-result [(str "File collection failed: " (.getMessage e))]))))

(defn parse-kanban-markdown [content]
  "Parse kanban board from markdown content"
  (let [lines (str/split-lines content)
        sections (parse-sections lines)]
    {:board sections
     :raw content
     :lines (count lines)}))

(defn parse-sections [lines]
  "Parse markdown sections into structured data"
  (loop [remaining lines
         current-section nil
         sections {}
         in-code-block? false]
    (if (empty? remaining)
      sections
      (let [line (first remaining)]
        (cond
          ;; Code block detection
          (str/starts-with? line "```")
          (recur (rest remaining)
                 current-section
                 sections
                 (not in-code-block?))
          
          ;; Skip lines in code blocks
          in-code-block?
          (recur (rest remaining) current-section sections in-code-block?)
          
          ;; Section header detection
          (str/starts-with? line "#")
          (let [section-name (str/trim (subs line 1))]
            (recur (rest remaining)
                   section-name
                   (assoc sections section-name [])
                   false))
          
          ;; Content line
          current-section
          (recur (rest remaining)
                 current-section
                 (update sections current-section conj line)
                 false)
          
          ;; Line before first section
          :else
          (recur (rest remaining) current-section sections false))))))

(defn process-kanban-data [data config]
  "Process raw kanban data into structured format"
  (let [board-data (:board data)
        processed {:raw-data data
                   :statistics (extract-statistics board-data)
                   :active-tasks (extract-active-tasks board-data)
                   :columns (extract-columns board-data)
                   :metadata (extract-metadata board-data)}]
    (if (:include-statistics config)
      (assoc processed :statistics-detailed (detailed-statistics board-data))
      processed)))

(defn extract-statistics [board-data]
  "Extract basic statistics from kanban board"
  (let [task-lines (filter task-line? (flatten (vals board-data)))]
    {:total-tasks (count task-lines)
     :sections (count board-data)
     :last-updated (extract-last-updated board-data)}))

(defn extract-active-tasks [board-data]
  "Extract currently active tasks"
  (let [task-lines (filter task-line? (flatten (vals board-data)))
        active-tasks (filter active-task? task-lines)]
    (map parse-task-line active-tasks)))

(defn extract-columns [board-data]
  "Extract column information from board"
  (reduce-kv 
    (fn [acc section-name section-content]
      (let [task-count (count (filter task-line? section-content))]
        (assoc acc section-name {:task-count task-count
                                 :content section-content})))
    {}
    board-data))

(defn extract-metadata [board-data]
  "Extract metadata from kanban board"
  {:sections (keys board-data)
   :total-lines (reduce + (map count (vals board-data)))
   :has-tasks (some #(some task-line? %) (vals board-data))})

(defn task-line? [line]
  "Check if line represents a task"
  (and (string? line)
       (or (str/starts-with? line "- [")
           (str/starts-with? line "* [")
           (str/starts-with? line "  - [")
           (str/starts-with? line "  * ["))))

(defn active-task? [task-line]
  "Check if task is active"
  (and (task-line? task-line)
       (or (str/includes? task-line "[ ]")
           (str/includes? task-line "[-]"))))

(defn parse-task-line [task-line]
  "Parse task line into structured data"
  (let [cleaned (str/trim task-line)
        status (cond
                 (str/includes? cleaned "[x]") :done
                 (str/includes? cleaned "[X]") :done
                 (str/includes? cleaned "[-]") :in-progress
                 (str/includes? cleaned "[ ]") :todo
                 :else :unknown)
        title (str/replace cleaned #"^[\s\-\*]*\[[^\]]*\]\s*" "")]
    {:title title
     :status status
     :raw task-line
     :priority (extract-priority title)
     :tags (extract-tags title)}))

(defn extract-priority [title]
  "Extract priority from task title"
  (cond
    (str/includes? (str/lower-case title) "p0") :P0
    (str/includes? (str/lower-case title) "p1") :P1
    (str/includes? (str/lower-case title) "p2") :P2
    (str/includes? (str/lower-case title) "p3") :P3
    (str/includes? (str/lower-case title) "critical") :P0
    (str/includes? (str/lower-case title) "high") :P1
    (str/includes? (str/lower-case title) "medium") :P2
    (str/includes? (str/lower-case title) "low") :P3
    :else :P2))

(defn extract-tags [title]
  "Extract tags from task title"
  (let [tag-pattern #"#(\w+)"
        matches (re-seq tag-pattern title)]
    (map second matches)))

(defn extract-last-updated [board-data]
  "Extract last updated timestamp from board"
  ;; Look for timestamp patterns in the content
  (let [all-content (str/join "\n" (flatten (vals board-data)))
          timestamp-patterns [#"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)"
                              #"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"
                              #"(\d{4}-\d{2}-\d{2})"]]
    (some #(second (re-find % all-content)) timestamp-patterns)))

(defn detailed-statistics [board-data]
  "Extract detailed statistics from kanban board"
  (let [task-lines (filter task-line? (flatten (vals board-data)))
        parsed-tasks (map parse-task-line task-lines)]
    {:by-status (group-by :status parsed-tasks)
     :by-priority (group-by :priority parsed-tasks)
     :completion-rate (/ (count (filter #(= :done (:status %)) parsed-tasks))
                        (count parsed-tasks))
     :all-tags (distinct (mapcat :tags parsed-tasks))}))

(defn create-kanban-collector [config]
  "Create kanban collector instance"
  (->KanbanCollector config))