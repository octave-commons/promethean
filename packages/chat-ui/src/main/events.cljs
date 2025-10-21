(ns chat-ui.main.events
  (:require [re-frame.core :as rf]
            [chat-ui.db.core :as db]
            [cljs.core.async :refer [<! go]]))

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
   (assoc db :sessions sessions)))

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
    :fx [[::load-sessions-fx]]}))

(rf/reg-fx
 :load-sessions-fx
 (fn [_]
   (go
     (let [response (<! (db/get-sessions))]
       (if (:success response)
         (rf/dispatch [:set-sessions (:data response)])
         (rf/dispatch [:set-error (:error response)]))
       (rf/dispatch [:set-loading false])))))

(rf/reg-event-fx
 :select-session
 (fn [{:keys [db]} [session-id]]
   {:db (assoc db :loading? true :current-session nil :messages [] :error nil)
    :fx [[::load-session-fx session-id]]}))

(rf/reg-fx
 :load-session-fx
 (fn [session-id]
   (go
     (let [session-response (<! (db/get-session session-id))
           messages-response (<! (db/get-messages session-id))]
       (if (:success session-response)
         (do
           (rf/dispatch [:set-current-session (:data session-response)])
           (if (:success messages-response)
             (rf/dispatch [:set-messages (:data messages-response)])
             (rf/dispatch [:set-error (:error messages-response)])))
         (rf/dispatch [:set-error (:error session-response)]))
       (rf/dispatch [:set-loading false])))))

(rf/reg-event-fx
 :delete-session
 (fn [{:keys [db]} [session-id]]
   {:db (assoc db :loading? true :error nil)
    :fx [[::delete-session-fx session-id]]}))

(rf/reg-fx
 :delete-session-fx
 (fn [session-id]
   (go
     (let [response (<! (db/delete-session session-id))]
       (if (:success response)
         (do
           (rf/dispatch [:load-sessions])
           (when (= session-id (get-in db [:current-session :id]))
             (rf/dispatch [:set-current-session nil])
             (rf/dispatch [:set-messages []])))
         (rf/dispatch [:set-error (:error response)]))
       (rf/dispatch [:set-loading false])))))

(rf/reg-event-fx
 :delete-message
 (fn [{:keys [db]} [session-id message-id]]
   {:db (assoc db :loading? true :error nil)
    :fx [[::delete-message-fx session-id message-id]]}))

(rf/reg-fx
 :delete-message-fx
 (fn [session-id message-id]
   (go
     (let [response (<! (db/delete-message session-id message-id))]
       (if (:success response)
         (rf/dispatch [:select-session session-id])
         (rf/dispatch [:set-error (:error response)]))
       (rf/dispatch [:set-loading false])))))