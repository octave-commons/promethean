(ns main.subs
  (:require [re-frame.core :as rf]))

(rf/reg-sub
 :sessions
 (fn [db _]
   (:sessions db)))

(rf/reg-sub
 :current-session
 (fn [db _]
   (:current-session db)))

(rf/reg-sub
 :messages
 (fn [db _]
   (:messages db)))

(rf/reg-sub
 :loading?
 (fn [db _]
   (:loading? db)))

(rf/reg-sub
 :error
 (fn [db _]
   (:error db)))

(rf/reg-sub
 :session-count
 :<- [:sessions]
 (fn [sessions _]
   (count sessions)))

(rf/reg-sub
 :message-count
 :<- [:messages]
 (fn [messages _]
   (count messages)))