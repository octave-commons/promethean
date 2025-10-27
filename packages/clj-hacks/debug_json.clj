(require '[clj-hacks.mcp.adapter-mcp-json :as json-adapter])
(require '[babashka.fs :as fs])
(require '[cheshire.core :as json])

(let [tmp (fs/create-temp-file {:prefix "test-json-" :suffix ".json"})
      path (str tmp)
      test-data {:mcp {:mcp-servers {:test {:command "echo"}}
                   :http {:transport :http
                          :base-url "http://localhost:8900"
                          :tools ["test"]
                          :endpoints {:analytics {:tools ["query"]
                                              :include-help? true
                                              :meta {:title "Analytics"}}}}}
                   :rest {}}]
  (try
    ;; Write the data
    (println "Writing data:")
    (println test-data)
    (json-adapter/write-full path test-data)
    
    ;; Read it back and check
    (println "\nWritten file content:")
    (println (slurp path))
    
    (println "\nTrying to read back...")
    (let [result (json-adapter/read-full path)]
      (println "Read result:")
      (println result))
    
    (catch Exception e
      (println "Error:" (.getMessage e))
      (println "Data:" (ex-data e)))
    (finally
      (fs/delete-if-exists tmp))))