(ns clj-hacks.tasks
  (:require [clj-hacks.automation :as automation]))

(def project-dir automation/project-dir)

(def prepare! automation/prepare!)
(def build automation/build)
(def lint automation/lint)
(def test automation/test)