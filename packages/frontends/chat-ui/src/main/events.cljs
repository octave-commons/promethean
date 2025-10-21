(ns main.events
  (:require [re-frame.core :as rf]
            [db.core :as db]))

(rf/reg-event-db
 :initialize-db
 (fn [_ _]
   {:sessions []
    :current-session nil
    :messages []
    :loading? false
    :error nil}))

(rf/reg-event-db
 :set-loading
 (fn [db [loading?]]
   (assoc db :loading? loading?)))

(rf/reg-event-db
 :set-error
 (fn [db [error]]
   (assoc db :error error)))

(rf/reg-event-db
 :set-sessions
 (fn [db [sessions]]
   (js/console.log "set-sessions called with:" sessions)
   (js/console.log "Type of sessions:" (type sessions))
   (js/console.log "Is seqable?" (satisfies? ISeq sessions))
   (let [sessions-vec (if (or (vector? sessions) (nil? sessions))
                        sessions
                        (vec sessions))]
     (assoc db :sessions sessions-vec))))

(rf/reg-event-db
 :set-current-session
 (fn [db [session]]
   (assoc db :current-session session)))

(rf/reg-event-db
 :set-messages
 (fn [db [messages]]
   (assoc db :messages messages)))

(rf/reg-event-fx
 :load-sessions
 (fn [{:keys [db]} _]
   {:db (assoc db :loading? true :error nil)
    :fx [[:load-sessions-fx]]}))

(rf/reg-fx
 :load-sessions-fx
 (fn [_]
   (js/console.log "load-sessions-fx called")
   (-> (db/get-sessions)
       (.then (fn [response]
                (js/console.log "API response:" response)
                (js/console.log "Response data:" (:data response))
                (js/console.log "Response data type:" (type (:data response)))
                (if (:success response)
                  (do
                    (rf/dispatch [:set-sessions (:data response)])
                    (rf/dispatch [:set-loading false]))
                  (do
                    (rf/dispatch [:set-error (:error response)])
                    (rf/dispatch [:set-loading false])))))
       (.catch (fn [error]
                 (js/console.error "Load sessions error:" error)
                 (rf/dispatch [:set-error (str "Failed to load sessions: " error)])
                 (rf/dispatch [:set-loading false]))))))

(rf/reg-event-fx
 :select-session
 (fn [{:keys [db]} [session-id]]
   {:db (assoc db :loading? true :current-session nil :messages [] :error nil)
    :fx [[:load-session-fx session-id]]}))

(rf/reg-fx
 :load-session-fx
 (fn [session-id]
   (-> (db/get-session session-id)
       (.then (fn [session-response]
                (if (:success session-response)
                  (do
                    (rf/dispatch [:set-current-session (:data session-response)])
                    (-> (db/get-messages session-id)
                        (.then (fn [messages-response]
                                 (if (:success messages-response)
                                   (rf/dispatch [:set-messages (:data messages-response)])
                                   (rf/dispatch [:set-error (:error messages-response)]))))
                        (.finally (fn [] (rf/dispatch [:set-loading false])))))
                  (do
                    (rf/dispatch [:set-error (:error session-response)])
                    (rf/dispatch [:set-loading false]))))))))

(rf/reg-event-fx
 :delete-session
 (fn [{:keys [db]} [session-id]]
   {:db (assoc db :loading? true :error nil)
    :fx [[:delete-session-fx session-id]]}))

(rf/reg-fx
 :delete-session-fx
 (fn [session-id]
   (-> (db/delete-session session-id)
       (.then (fn [response]
                (if (:success response)
                  (do
                    (rf/dispatch [:load-sessions])
                    (rf/dispatch [:set-loading false]))
                  (do
                    (rf/dispatch [:set-error (:error response)])
                    (rf/dispatch [:set-loading false]))))))))

(rf/reg-event-fx
 :delete-message
 (fn [{:keys [db]} [session-id message-id]]
   {:db (assoc db :loading? true :error nil)
    :fx [[:delete-message-fx [session-id message-id]]]}))

(rf/reg-fx
 :delete-message-fx
 (fn [[session-id message-id]]
   (-> (db/delete-message session-id message-id)
       (.then (fn [response]
                (if (:success response)
                  (rf/dispatch [:select-session session-id])
                  (rf/dispatch [:set-error (:error response)]))
                (rf/dispatch [:set-loading false]))))))