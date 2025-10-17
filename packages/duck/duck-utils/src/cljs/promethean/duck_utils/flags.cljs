(ns promethean.duck-utils.flags
  (:require [goog.object :as gobj]))

(defn parse-bool
  "Parse a string value to boolean, returning defaultValue if parsing fails."
  [value default-value]
  (if (not= (js* "typeof ~{}" value) "string")
    default-value
    (let [normalized (-> value
                         .trim
                         .toLowerCase)]
      (cond
        (= normalized "true") true
        (= normalized "false") false
        :else default-value))))

;; Environment variable access (will be undefined in browser environments)
(def ^:private process-env (when (exists? js/process)
                             (gobj/get js/process "env")))

(def HAS-BLOBS (parse-bool (when process-env
                             (gobj/get process-env "DUCK_USE_BLOBS"))
                           false))

(def STT-TTS-ENABLED (parse-bool (when process-env
                                    (gobj/get process-env "STT_TTS_ENABLED"))
                                  false))

(def flags
  #js {:HAS-BLOBS HAS-BLOBS
       :STT_TTS_ENABLED STT-TTS-ENABLED})

;; Export for ES module compatibility
(goog/exportSymbol "parseBool" parse-bool)
(goog/exportSymbol "HAS_BLOBS" HAS-BLOBS)
(goog/exportSymbol "STT_TTS_ENABLED" STT-TTS-ENABLED)
(goog/exportSymbol "flags" flags)
