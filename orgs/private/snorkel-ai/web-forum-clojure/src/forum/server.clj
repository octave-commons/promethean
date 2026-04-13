(ns forum.server
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [ring.adapter.jetty :refer [run-jetty]]
            [ring.middleware.cookies :refer [wrap-cookies]]
            [ring.middleware.json :refer [wrap-json-body]]
            [ring.middleware.keyword-params :refer [wrap-keyword-params]]
            [ring.middleware.params :refer [wrap-params]]
            [ring.util.response :as resp]
            [compojure.core :refer [defroutes GET POST context]]
            [compojure.route :as route]
            [next.jdbc :as jdbc]
            [next.jdbc.sql :as sql]
            [next.jdbc.result-set :as rs]
            [cheshire.core :as json]
            [buddy.hashers :as hashers])
  (:import [java.util UUID]))

(def db-file "/app/data/forum.sqlite")

(defonce datasource
  (delay
    (io/make-parents db-file)
    (jdbc/get-datasource {:jdbcUrl (str "jdbc:sqlite:" db-file)})))

(def jdbc-opts {:builder-fn rs/as-unqualified-lower-maps})

(defn now-ms [] (System/currentTimeMillis))

(defn init-db! []
  (let [ds @datasource]
    (jdbc/execute! ds ["PRAGMA foreign_keys = ON"])
    (doseq [ddl ["CREATE TABLE IF NOT EXISTS users (\n id INTEGER PRIMARY KEY AUTOINCREMENT,\n screen_name TEXT NOT NULL,\n email TEXT NOT NULL UNIQUE,\n password_hash TEXT NOT NULL,\n role TEXT NOT NULL DEFAULT 'user',\n created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),\n updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))\n);"
                 "CREATE TABLE IF NOT EXISTS sessions (\n id TEXT PRIMARY KEY,\n user_id INTEGER NOT NULL,\n created_at INTEGER NOT NULL,\n expires_at INTEGER NOT NULL,\n revoked_at INTEGER,\n FOREIGN KEY(user_id) REFERENCES users(id)\n);"
                 "CREATE TABLE IF NOT EXISTS groups (\n id INTEGER PRIMARY KEY AUTOINCREMENT,\n name TEXT NOT NULL,\n type TEXT NOT NULL,\n owner_user_id INTEGER NOT NULL,\n created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),\n updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),\n deleted_at TEXT,\n FOREIGN KEY(owner_user_id) REFERENCES users(id)\n);"
                 "CREATE TABLE IF NOT EXISTS memberships (\n id INTEGER PRIMARY KEY AUTOINCREMENT,\n user_id INTEGER NOT NULL,\n group_id INTEGER NOT NULL,\n member_role TEXT NOT NULL DEFAULT 'member',\n created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),\n FOREIGN KEY(user_id) REFERENCES users(id),\n FOREIGN KEY(group_id) REFERENCES groups(id)\n);"
                 "CREATE UNIQUE INDEX IF NOT EXISTS idx_memberships_unique ON memberships(user_id, group_id);"
                 "CREATE TABLE IF NOT EXISTS threads (\n id INTEGER PRIMARY KEY AUTOINCREMENT,\n group_id INTEGER,\n author_user_id INTEGER NOT NULL,\n title TEXT NOT NULL,\n created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),\n updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),\n locked_at TEXT,\n pinned_at TEXT,\n deleted_at TEXT,\n FOREIGN KEY(group_id) REFERENCES groups(id),\n FOREIGN KEY(author_user_id) REFERENCES users(id)\n);"
                 "CREATE TABLE IF NOT EXISTS messages (\n id INTEGER PRIMARY KEY AUTOINCREMENT,\n thread_id INTEGER NOT NULL,\n author_user_id INTEGER NOT NULL,\n content TEXT NOT NULL,\n created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),\n edited_at TEXT,\n deleted_at TEXT,\n FOREIGN KEY(thread_id) REFERENCES threads(id),\n FOREIGN KEY(author_user_id) REFERENCES users(id)\n);"
                 "CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);"
                 "CREATE INDEX IF NOT EXISTS idx_threads_group ON threads(group_id);"]]
      (jdbc/execute! ds [ddl]))))

(defn json-response [status body]
  (-> (resp/response (json/generate-string body))
      (resp/status status)
      (resp/header "Content-Type" "application/json")))

(defn ok [data] (json-response 200 {:ok true :data data}))

(defn error-response
  ([status code message] (error-response status code message {}))
  ([status code message details]
   (json-response status {:ok false :error {:code code :message message :details details}})))

(defn set-sid-cookie [resp sid]
  (assoc resp :cookies {"sid" {:value sid :http-only true :path "/"}}))

(defn clear-sid-cookie [resp]
  (assoc resp :cookies {"sid" {:value "" :path "/" :max-age 0}}))

(defn user-public [u]
  {:id (:id u) :screen_name (:screen_name u) :role (:role u) :created_at (:created_at u)})

(defn fetch-session [sid]
  (when sid
    (let [now (now-ms)
          ds @datasource
          session (first (jdbc/execute! ds
                                         ["SELECT s.id, s.user_id, s.expires_at, s.revoked_at, u.screen_name, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.revoked_at IS NULL AND s.expires_at > ?" sid now]
                                         jdbc-opts))]
      (when session
        {:sid (:id session)
         :user {:id (:user_id session)
                :screen_name (:screen_name session)
                :role (:role session)}}))))

(defn create-session! [user-id]
  (let [sid (str (UUID/randomUUID))
        now (now-ms)
        expires (+ now (* 1000 60 60 24 7))]
    (sql/insert! @datasource :sessions {:id sid :user_id user-id :created_at now :expires_at expires})
    sid))

(defn revoke-session! [sid]
  (when sid
    (jdbc/execute! @datasource ["UPDATE sessions SET revoked_at = ? WHERE id = ?" (now-ms) sid])))

(defn fetch-user-by-email [email]
  (first (jdbc/execute! @datasource ["SELECT * FROM users WHERE email = ?" email] jdbc-opts)))

(defn fetch-user [id]
  (first (jdbc/execute! @datasource ["SELECT id, screen_name, role, created_at FROM users WHERE id = ?" id] jdbc-opts)))

(defn membership? [user-id group-id]
  (boolean (seq (jdbc/execute! @datasource ["SELECT 1 FROM memberships WHERE user_id = ? AND group_id = ? LIMIT 1" user-id group-id]))))

(defn fetch-group [group-id]
  (first (jdbc/execute! @datasource ["SELECT * FROM groups WHERE id = ?" group-id] jdbc-opts)))

(defn group-readable? [user-id group]
  (when group
    (or (= "public" (:type group))
        (membership? user-id (:id group)))))

(defn owner? [user-id group-id]
  (boolean (seq (jdbc/execute! @datasource ["SELECT 1 FROM groups WHERE id = ? AND owner_user_id = ?" group-id user-id]))))

(defn threads-allowed? [user-id thread]
  (if-let [gid (:group_id thread)]
    (group-readable? user-id (fetch-group gid))
    true))

(defn ensure-json-body [req]
  (or (:body-params req) {}))

(defn non-empty-str? [s]
  (and (string? s) (not (str/blank? s))))

(defn respond-unauth [] (error-response 401 "auth_required" "Authentication required"))

(defroutes routes
  (GET "/healthz" _ (json-response 200 {:ok true}))

  (context "/api" []
    (context "/auth" []
      (POST "/signup" req
        (let [{:keys [screen_name email password]} (ensure-json-body req)
              screen-name (some-> screen_name str/trim)
              email (some-> email str/trim)
              password (some-> password str/trim)]
          (cond
            (not (non-empty-str? screen-name)) (error-response 400 "invalid_request" "screen_name required")
            (not (non-empty-str? email)) (error-response 400 "invalid_request" "email required")
            (not (non-empty-str? password)) (error-response 400 "invalid_request" "password required")
            (fetch-user-by-email email) (error-response 409 "email_exists" "Email already registered")
            :else (let [pwd (hashers/derive password)
                        inserted (sql/insert! @datasource :users {:screen_name screen-name :email email :password_hash pwd :role "user"} {:return-keys true :builder-fn rs/as-unqualified-lower-maps})
                        user-id (:id inserted)
                        sid (create-session! user-id)]
                    (-> (ok {:user (user-public (assoc inserted :id user-id))})
                        (set-sid-cookie sid))))))
      (POST "/login" req
        (let [{:keys [email password]} (ensure-json-body req)
              email (some-> email str/trim)
              password (some-> password str/trim)
              user (and email (fetch-user-by-email email))]
          (cond
            (or (not (non-empty-str? email)) (not (non-empty-str? password))) (error-response 400 "invalid_request" "email and password required")
            (nil? user) (error-response 401 "invalid_credentials" "Invalid email or password")
            (not (hashers/check password (:password_hash user))) (error-response 401 "invalid_credentials" "Invalid email or password")
            :else (let [sid (create-session! (:id user))]
                    (-> (ok {:user (user-public user)})
                        (set-sid-cookie sid))))))
      (POST "/logout" req
        (let [sid (get-in req [:cookies "sid" :value])]
          (revoke-session! sid)
          (-> (ok {}) clear-sid-cookie)))
      (GET "/session" req
        (if-let [session (fetch-session (get-in req [:cookies "sid" :value]))]
          (ok {:user (:user session)})
          (ok {:user nil}))))

    (context "/users" []
      (GET "/list" req
        (if-let [user (:current-user req)]
          (let [q (some-> (get-in req [:params :q]) str/trim)
                limit-param (some-> (get-in req [:params :limit]) Integer/parseInt)
                limit (-> (or limit-param 50) (max 1) (min 100))
                pattern (when (non-empty-str? q) (str "%" q "%"))
                sql-str (str "SELECT id, screen_name, created_at FROM users"
                             (when pattern " WHERE screen_name LIKE ? OR email LIKE ?")
                             " ORDER BY created_at DESC LIMIT ?")
                params (cond-> [limit]
                          pattern (-> (conj pattern) (conj pattern)))]
            (let [rows (jdbc/execute! @datasource (into [sql-str] (reverse params)) jdbc-opts)]
              (ok {:users (map user-public rows)})))
          (respond-unauth)))
      (GET "/:id" [id :as req]
        (if (:current-user req)
          (if-let [u (fetch-user (Long/parseLong id))]
            (ok {:user (user-public u)})
            (error-response 404 "not_found" "User not found"))
          (respond-unauth))))

    (context "/groups" []
      (POST "/create" req
        (if-let [user (:current-user req)]
          (let [{:keys [name type]} (ensure-json-body req)
                name (some-> name str/trim)
                type (some-> type str/trim)]
            (cond
              (not (non-empty-str? name)) (error-response 400 "invalid_request" "name required")
              (not (#{"public" "private"} type)) (error-response 400 "invalid_request" "type must be public or private")
              :else (let [group (sql/insert! @datasource :groups {:name name :type type :owner_user_id (:id user)} {:return-keys true :builder-fn rs/as-unqualified-lower-maps})
                          gid (:id group)]
                      (sql/insert! @datasource :memberships {:user_id (:id user) :group_id gid :member_role "owner"})
                      (ok {:group {:id gid :name name :type type :owner_user_id (:id user) :created_at (:created_at group)}}))))
          (respond-unauth)))

      (GET "/list" req
        (if-let [user (:current-user req)]
          (let [type-param (or (get-in req [:params :type]) "all")
                member-of (get-in req [:params :member_of])
                user-id (:id user)
                join-clause (if (= "me" member-of)
                              "JOIN memberships m ON m.group_id = g.id AND m.user_id = ?"
                              "LEFT JOIN memberships m ON m.group_id = g.id AND m.user_id = ?")
                wheres (cond-> []
                          (and type-param (not= "all" type-param)) (conj "g.type = ?")
                          (not= "me" member-of) (conj "(g.type = 'public' OR m.user_id IS NOT NULL)"))
                sql-str (str "SELECT g.id, g.name, g.type, g.owner_user_id, g.created_at FROM groups g "
                             join-clause
                             (when (seq wheres) (str " WHERE " (str/join " AND " wheres)))
                             " ORDER BY g.created_at DESC")
                params (cond-> [user-id]
                          (and type-param (not= "all" type-param)) (conj type-param))
                rows (jdbc/execute! @datasource (into [sql-str] params) jdbc-opts)]
            (ok {:groups rows}))
          (respond-unauth)))

      (POST "/:id/invite" [id :as req]
        (if-let [user (:current-user req)]
          (let [gid (Long/parseLong id)
                group (fetch-group gid)]
            (cond
              (nil? group) (error-response 404 "not_found" "Group not found")
              (not (owner? (:id user) gid)) (error-response 403 "forbidden" "Only owners can invite")
              :else (let [{:keys [user_id]} (ensure-json-body req)
                          target-id (some-> user_id long)]
                      (if-not target-id
                        (error-response 400 "invalid_request" "user_id required")
                        (do
                          (when-not (membership? target-id gid)
                            (sql/insert! @datasource :memberships {:user_id target-id :group_id gid :member_role "member"}))
                          (ok {})))))
          (respond-unauth)))

      (POST "/:id/remove" [id :as req]
        (if-let [user (:current-user req)]
          (let [gid (Long/parseLong id)
                group (fetch-group gid)]
            (cond
              (nil? group) (error-response 404 "not_found" "Group not found")
              (not (owner? (:id user) gid)) (error-response 403 "forbidden" "Only owners can remove members")
              :else (let [{:keys [user_id]} (ensure-json-body req)
                          target-id (some-> user_id long)]
                      (if-not target-id
                        (error-response 400 "invalid_request" "user_id required")
                        (do
                          (jdbc/execute! @datasource ["DELETE FROM memberships WHERE user_id = ? AND group_id = ?" target-id gid])
                          (ok {})))))
          (respond-unauth)))))

    (context "/threads" []
      (GET "/list" req
        (if-let [user (:current-user req)]
          (let [uid (:id user)
                params (:params req)
                group-id (some-> (:group_id params) Long/parseLong)
                q (some-> (:q params) str/trim)
                cursor (some-> (:cursor params) Long/parseLong)
                limit (-> (some-> (:limit params) Integer/parseInt) (or 20) (max 1) (min 50))
                query-limit (inc limit)
                group (when group-id (fetch-group group-id))]
            (cond
              (and group-id (nil? group)) (error-response 404 "not_found" "Group not found")
              (and group-id (not (group-readable? uid group))) (error-response 403 "forbidden" "Access denied")
              :else
              (let [sql-str (StringBuilder.)
                    _ (.append sql-str "SELECT t.id, t.group_id, t.title, t.created_at, t.updated_at FROM threads t ")
                    _ (.append sql-str "LEFT JOIN groups g ON t.group_id = g.id ")
                    _ (.append sql-str "LEFT JOIN memberships m ON m.group_id = t.group_id AND m.user_id = ? ")
                    conditions (cond-> ["(t.group_id IS NULL OR g.type = 'public' OR m.user_id IS NOT NULL)"]
                                 group-id (conj "t.group_id = ?")
                                 q (conj "t.title LIKE ?")
                                 cursor (conj "t.id < ?"))
                    params (cond-> [uid]
                               group-id (conj group-id)
                               q (conj (str "%" q "%"))
                               cursor (conj cursor))]
                (.append sql-str "WHERE ")
                (.append sql-str (str/join " AND " conditions))
                (.append sql-str " ORDER BY t.id DESC LIMIT ?")
                (let [rows (jdbc/execute! @datasource (into [(str sql-str) query-limit] params) jdbc-opts)
                      threads (take limit rows)
                      next-cursor (when (> (count rows) limit) (:id (last threads)))]
                  (ok {:threads threads :next_cursor next-cursor})))))
          (respond-unauth)))

      (POST "/create" req
        (if-let [user (:current-user req)]
          (let [{:keys [group_id title content]} (ensure-json-body req)
                uid (:id user)
                gid (when (some? group_id) (long group_id))
                title (some-> title str/trim)
                content (some-> content str/trim)
                group (when gid (fetch-group gid))]
            (cond
              (not (non-empty-str? title)) (error-response 400 "invalid_request" "title required")
              (not (non-empty-str? content)) (error-response 400 "invalid_request" "content required")
              (and gid (nil? group)) (error-response 404 "not_found" "Group not found")
              (and gid (not (membership? uid gid))) (error-response 403 "forbidden" "Membership required to post in group")
              :else (let [thread (sql/insert! @datasource :threads {:group_id gid :author_user_id uid :title title} {:return-keys true :builder-fn rs/as-unqualified-lower-maps})
                          tid (:id thread)]
                      (sql/insert! @datasource :messages {:thread_id tid :author_user_id uid :content content})
                      (ok {:thread_id tid}))))
          (respond-unauth)))

      (GET "/view/:id" [id :as req]
        (if-let [user (:current-user req)]
          (let [tid (Long/parseLong id)
                thread (first (jdbc/execute! @datasource
                                             ["SELECT t.*, u.screen_name as author_name FROM threads t JOIN users u ON u.id = t.author_user_id WHERE t.id = ?" tid]
                                             jdbc-opts))]
            (cond
              (nil? thread) (error-response 404 "not_found" "Thread not found")
              (not (threads-allowed? (:id user) thread)) (error-response 403 "forbidden" "Access denied")
              :else (let [msg-cursor (some-> (get-in req [:params :cursor]) Long/parseLong)
                          limit (-> (some-> (get-in req [:params :limit]) Integer/parseInt) (or 50) (max 1) (min 100))
                          msgs-sql (str "SELECT m.id, m.content, m.created_at, m.edited_at, u.id as author_id, u.screen_name as author_name FROM messages m JOIN users u ON u.id = m.author_user_id WHERE m.thread_id = ? "
                                         (when msg-cursor "AND m.id < ? ")
                                         "ORDER BY m.id ASC LIMIT ?")
                          params (cond-> [tid]
                                     msg-cursor (conj msg-cursor)
                                     true (conj (inc limit)))
                          rows (jdbc/execute! @datasource (into [msgs-sql] params) jdbc-opts)
                          messages (take limit rows)
                          next-cursor (when (> (count rows) limit) (:id (last messages)))]
                      (ok {:thread {:id (:id thread)
                                    :group_id (:group_id thread)
                                    :title (:title thread)
                                    :created_at (:created_at thread)
                                    :updated_at (:updated_at thread)
                                    :locked_at (:locked_at thread)
                                    :pinned_at (:pinned_at thread)
                                    :author {:id (:author_user_id thread) :screen_name (:author_name thread)}}
                               :messages (map (fn [m] {:id (:id m)
                                                       :content (:content m)
                                                       :created_at (:created_at m)
                                                       :edited_at (:edited_at m)
                                                       :author {:id (:author_id m) :screen_name (:author_name m)}}) messages)
                               :next_cursor next-cursor})))))
          (respond-unauth)))

      (POST "/:id/reply" [id :as req]
        (if-let [user (:current-user req)]
          (let [tid (Long/parseLong id)
                thread (first (jdbc/execute! @datasource ["SELECT * FROM threads WHERE id = ?" tid] jdbc-opts))
                content (some-> (:content (ensure-json-body req)) str/trim)
                uid (:id user)]
            (cond
              (nil? thread) (error-response 404 "not_found" "Thread not found")
              (not (threads-allowed? uid thread)) (error-response 403 "forbidden" "Access denied")
              (some? (:locked_at thread)) (error-response 409 "locked" "Thread locked")
              (not (non-empty-str? content)) (error-response 400 "invalid_request" "content required")
              (and (:group_id thread) (not (membership? uid (:group_id thread)))) (error-response 403 "forbidden" "Membership required to post")
              :else (do
                      (sql/insert! @datasource :messages {:thread_id tid :author_user_id uid :content content})
                      (jdbc/execute! @datasource ["UPDATE threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?" tid])
                      (ok {:thread_id tid}))))
          (respond-unauth)))))

  (route/not-found (error-response 404 "not_found" "Not found")))

(defn wrap-auth [handler]
  (fn [req]
    (let [sid (get-in req [:cookies "sid" :value])
          session (fetch-session sid)
          req' (cond-> req
                 session (assoc :current-user (:user session))
                 sid (assoc :session-id sid))]
      (handler req'))))

(def app
  (-> routes
      (wrap-json-body {:keywords? true :bigdecimals? true})
      wrap-keyword-params
      wrap-params
      wrap-auth
      wrap-cookies))

(defn -main [& _]
  (init-db!)
  (println "Starting server on http://localhost:3000")
  (run-jetty app {:port 3000 :join? false}))
