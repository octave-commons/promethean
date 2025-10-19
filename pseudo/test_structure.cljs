;; Test structure
(def test-keybindings
  {:leader {:bindings {"SPC" {:name "Leader"
                              :bindings {"h" {:name "Help"
                                             :bindings {"b" {:name "Describe bindings"
                                                            :handler #(println "test")}}}}}}}})