(ns app.events
  (:require [re-frame.core :as rf]
            [app.opencode.client :as opencode]))

(rf/reg-event-db
 ::initialize-db
 (fn [_ _]
   {:sessions []
    :loading? false
    :error nil
    :show-create-modal? false
    :selected-session nil
    :client nil}))

(rf/reg-event-fx
 ::initialize-client
 (fn [{:keys [db]} [_ config]]
   {:db (assoc db :loading? true)
    :fx [[:dispatch [::opencode/create-client config]]]}))

(rf/reg-event-fx
 ::client-created
 (fn [{:keys [db]} [_ client]]
   {:db (assoc db :client client :loading? false)
    :fx [[:dispatch [::load-sessions]]]}))

(rf/reg-event-fx
 ::load-sessions
 (fn [{:keys [db]} _]
   (if-let [client (:client db)]
     {:db (assoc db :loading? true)
      :fx [[:dispatch [::opencode/list-sessions client]]]}
     {:db (assoc db :error "No client available")})))

(rf/reg-event-db
 ::sessions-loaded
 (fn [db [_ sessions]]
   (-> db
       (assoc :sessions sessions)
       (assoc :loading? false))))

(rf/reg-event-fx
 ::create-session
 (fn [{:keys [db]} [_ session-data]]
   (if-let [client (:client db)]
     {:db (assoc db :loading? true)
      :fx [[:dispatch [::opencode/create-session client session-data]]]}
     {:db (assoc db :error "No client available")})))

(rf/reg-event-fx
 ::session-created
 (fn [{:keys [db]} [_ session]]
   {:db (-> db
            (update :sessions conj session)
            (assoc :loading? false
                   :show-create-modal? false))
    :fx [[:dispatch [::load-sessions]]]}))

(rf/reg-event-fx
 ::delete-session
 (fn [{:keys [db]} [_ session-id]]
   (if-let [client (:client db)]
     {:db (assoc db :loading? true)
      :fx [[:dispatch [::opencode/delete-session client session-id]]]}
     {:db (assoc db :error "No client available")})))

(rf/reg-event-db
 ::session-deleted
 (fn [db [_ session-id]]
   (-> db
       (update :sessions (fn [sessions] 
                           (filterv #(not= (:id %) session-id) sessions)))
       (assoc :loading? false))))

(rf/reg-event-db
 ::show-create-modal
 (fn [db [_ show?]]
   (assoc db :show-create-modal? show?)))

(rf/reg-event-db
 ::select-session
 (fn [db [_ session]]
   (assoc db :selected-session session)))

(rf/reg-event-db
 ::set-error
 (fn [db [_ error]]
   (assoc db :error error)))

(rf/reg-event-fx
 ::send-prompt
 (fn [{:keys [db]} [_ session-id prompt]]
   (if-let [client (:client db)]
     {:db (assoc db :loading? true)
      :fx [[:dispatch [::opencode/send-prompt client session-id prompt]]]}
     {:db (assoc db :error "No client available")})))

;; Opencode client events
(rf/reg-event-fx
 ::opencode/create-client
 (fn [{:keys [db]} [_ config]]
   (let [client (opencode/create-client config)]
     {:fx [[:dispatch [::client-created client]]]})))

(rf/reg-event-fx
 ::opencode/list-sessions
 (fn [{:keys [db]} [_ client]]
   (-> (opencode/list-sessions client)
       (.then (fn [sessions]
                (rf/dispatch [::sessions-loaded sessions])))
       (.catch (fn [error]
                 (rf/dispatch [::set-error (.-message error)]))))))

(rf/reg-event-fx
 ::opencode/create-session
 (fn [{:keys [db]} [_ client session-data]]
   (-> (opencode/create-session client session-data)
       (.then (fn [session]
                (rf/dispatch [::session-created session])))
       (.catch (fn [error]
                 (rf/dispatch [::set-error (.-message error)]))))))

(rf/reg-event-fx
 ::opencode/delete-session
 (fn [{:keys [db]} [_ client session-id]]
   (-> (opencode/delete-session client session-id)
       (.then (fn [_]
                (rf/dispatch [::session-deleted session-id])))
       (.catch (fn [error]
                 (rf/dispatch [::set-error (.-message error)]))))))

(rf/reg-event-fx
 ::opencode/send-prompt
 (fn [{:keys [db]} [_ client session-id prompt]]
   (-> (opencode/send-prompt client session-id prompt)
       (.then (fn [_]
                (rf/dispatch [::load-sessions])))
       (.catch (fn [error]
                 (rf/dispatch [::set-error (.-message error)]))))))