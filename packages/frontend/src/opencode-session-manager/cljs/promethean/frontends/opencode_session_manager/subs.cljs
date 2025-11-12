(ns app.subs
  (:require [re-frame.core :as rf]))

(rf/reg-sub
 ::sessions
 (fn [db _]
   (:sessions db)))

(rf/reg-sub
 ::loading?
 (fn [db _]
   (:loading? db)))

(rf/reg-sub
 ::error
 (fn [db _]
   (:error db)))

(rf/reg-sub
 ::show-create-modal?
 (fn [db _]
   (:show-create-modal? db)))

(rf/reg-sub
 ::selected-session
 (fn [db _]
   (:selected-session db)))

(rf/reg-sub
 ::client
 (fn [db _]
   (:client db)))

(rf/reg-sub
 ::session-count
 :<- [::sessions]
 (fn [sessions _]
   (count sessions)))

(rf/reg-sub
 ::sessions-by-date
 :<- [::sessions]
 (fn [sessions _]
   (sort-by :createdAt > sessions)))