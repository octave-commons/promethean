(rf/reg-fx
 :load-sessions-fx
 (fn [_]
   (js/console.log "load-sessions-fx called")
   (-> (db/get-sessions)
       (.then (fn [response]
                (js/console.log "API response:" response)
                (if (:success response)
                  (do
                    (rf/dispatch [:set-sessions (:data response)])
                    (rf/dispatch [:set-loading false]))
                  (do
                    (rf/dispatch [:set-error (:error response)])
                    (rf/dispatch [:set-loading false]))))))))