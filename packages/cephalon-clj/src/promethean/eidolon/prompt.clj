(ns promethean.eidolon.prompt
  (:require [clojure.string :as str]))

(def core-template
  "{system_defined_embedding_prompt}
Persistantly
{persistent_memories}
Recently
{recent_memories}
As it relates to {agent_name}:
{latest_memory}
categories:
{generated_tags}")

(defn join-mems [mems]
  (->> mems (map (fn [{:keys [role content]}] (str (or role "unknown") ": " (or content ""))))
       (str/join "

")))

(defn render [{:keys [system-defined persistent recent agent-name latest tags]}]
  (-> core-template
      (str/replace "{system_defined_embedding_prompt}" (or system-defined ""))
      (str/replace "{persistent_memories}" (or (join-mems persistent) ""))
      (str/replace "{recent_memories}" (or (join-mems recent) ""))
      (str/replace "{agent_name}" (or agent-name ""))
      (str/replace "{latest_memory}" (or latest ""))
      (str/replace "{generated_tags}" (or (str/join ", " tags) ""))))
