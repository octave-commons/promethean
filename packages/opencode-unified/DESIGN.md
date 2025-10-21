 f
# Opencode CLJS Electron (Spacemacs-style) – Starter Scaffold

Below is a complete, multi-file starter you can paste into a new repo. It includes:

* Electron main & preload
* Shadow-CLJS builds for **renderer** (browser), **main process** (node), and **preload** (node)
* Re-frame app with **frames/splits**, **views**, **leader-key keymaps** (Spacemacs-style), **which-key** hint popup
* **Plugin system** (ClojureScript-friendly): discover plugins from a directory, dynamically import them, and expose a tiny API to register commands, views, and keymaps
* Opencode client wiring (SDK): sessions/sidebar, chat, agents, files, models

> Tip: search for `TODO(` comments to customize.

---

## File tree

```
.
├─ package.json
├─ shadow-cljs.edn
├─ deps.edn
├─ electron/
│  ├─ main.cljs
│  └─ preload.cljs
├─ public/
│  └─ index.html
├─ src/
│  └─ app/
│     ├─ core.cljs
│     ├─ state.cljs
│     ├─ ui.cljs
│     ├─ opencode_api.cljs
│     ├─ layout.cljs
│     ├─ keymap.cljs
│     ├─ plugins.cljs
│     └─ which_key.cljs
└─ plugins/
   └─ sample-scratchpad/
      ├─ manifest.json
      └─ src/sample_scratchpad/core.cljs
```

---

## `package.json`

```json
{
  "name": "opencode-cljs-electron",
  "version": "0.1.0",
  "private": true,
  "description": "Spacemacs-like Opencode client in ClojureScript (Electron)",
  "main": "dist/main.js",
  "license": "MIT",
  "scripts": {
    "dev": "shadow-cljs watch renderer preload main",
    "electron": "cross-env NODE_ENV=development electron .",
    "start": "run-p dev electron",
    "build:app": "shadow-cljs release renderer preload main",
    "pack": "npm run build:app && electron-builder --dir",
    "dist": "npm run build:app && electron-builder"
  },
  "dependencies": {
    "@opencode-ai/sdk": "^0.18.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "electron": "^32.2.0",
    "electron-builder": "^24.13.3",
    "shadow-cljs": "^2.28.20",
    "npm-run-all": "^4.1.5",
    "cross-env": "^7.0.3"
  },
  "build": {
    "appId": "ai.opencode.client",
    "files": [
      "dist/**/*",
      "public/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "mac": { "category": "public.app-category.developer-tools" },
    "win": { "target": ["nsis"] },
    "linux": { "target": ["AppImage"], "category": "Development" }
  }
}
```

---

## `shadow-cljs.edn`

```clojure
{:source-paths ["src" "electron" "plugins/sample-scratchpad/src"]
 :dependencies [[reagent/reagent "1.2.0"]
                [re-frame/re-frame "1.4.3"]]
 :builds
 {:renderer {:target :browser
            :output-dir "dist/renderer"
            :asset-path "/renderer"
            :modules {:main {:entries [app.core]}}
            :devtools {:http-root "public" :http-port 8080}}
  :main     {:target :node-script
            :output-to "dist/main.js"
            :main electron.main/start}
  :preload  {:target :node-script
            :output-to "dist/preload.js"
            :main electron.preload/start}}}
```

---

## `deps.edn`

```clojure
{:paths ["src" "electron" "plugins/sample-scratchpad/src" "public"]
 :deps {reagent/reagent {:mvn/version "1.2.0"}
        re-frame/re-frame {:mvn/version "1.4.3"}
        thheller/shadow-cljs {:mvn/version "2.28.20"}}}
```

---

## `public/index.html`

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src *; img-src 'self' data:;" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OpenCode • Spacemacs UI</title>
    <style>
      html, body, #app { height: 100%; margin: 0; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
      .which-key { position: fixed; bottom: 10px; left: 10px; right: 10px; background: #111; color: #eee; padding: 8px 10px; border-radius: 8px; opacity: 0.95; max-height: 40vh; overflow: auto; font-size: 12px; }
      .statusbar { position: fixed; bottom: 0; left: 0; right: 0; height: 22px; background: #222; color: #aaa; display:flex; align-items:center; padding: 0 8px; font-size: 12px; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/renderer/main.js"></script>
  </body>
</html>
```

---

## `electron/main.cljs`

```clojure
(ns electron.main
  (:require [clojure.string :as str]
            [goog.object :as gobj]
            [cljs.nodejs :as nodejs]))

(nodejs/enable-util-print!)

(def electron (js/require "electron"))
(def app (.-app electron))
(def BrowserWindow (.-BrowserWindow electron))
(def ipcMain (.-ipcMain electron))
(def path (js/require "path"))
(def fs (js/require "fs"))

(defonce win* (atom nil))

(defn user-data-path [] (.getPath app "userData"))
(defn plugin-dir [] (.join path (user-data-path) "plugins"))

(defn ensure-plugin-dir! []
  (let [dir (plugin-dir)]
    (when-not (.existsSync fs dir)
      (.mkdirSync fs dir #js {:recursive true}))
    dir))

(defn create-window []
  (let [preload (.join path (.cwd js/process) "dist" "preload.js")
        w (BrowserWindow. (clj->js {:width 1400 :height 900
                                    :title "OpenCode • Spacemacs UI"
                                    :webPreferences {:contextIsolation true
                                                     :nodeIntegration false
                                                     :preload preload}}))]
    (reset! win* w)
    (let [url (str "file://" (.join path (.cwd js/process) "public" "index.html"))]
      (.loadURL w url))
    #_(.openDevTools (.-webContents w))
    (.on w "closed" #(reset! win* nil))))

(defn register-ipc! []
  ;; Provide renderer with essential paths and list of plugin module entry URLs
  (.handle ipcMain "paths" (fn [_]
                               (clj->js {:userData (user-data-path)
                                         :plugins  (plugin-dir)})))
  (.handle ipcMain "plugins:list"
           (fn [_]
             (ensure-plugin-dir!)
             (let [dir (plugin-dir)
                   items (.readdirSync fs dir)
                   manifests (->> items
                                  (map (fn [name]
                                         (let [m (.join path dir name "manifest.json")]
                                           (when (.existsSync fs m)
                                             (try
                                               (let [txt (.readFileSync fs m "utf8")
                                                     data (js/JSON.parse txt)
                                                     entry (or (gobj/get data "entry") "dist/index.js")
                                                     url (str "file://" (.join path dir name entry))]
                                                 (clj->js {:id name :manifest data :url url}))
                                               (catch :default e
                                                 (js/console.error "Bad manifest" m e) nil))))))
                                  (filter identity)
                                  clj->js)]
               manifests)))
  (.handle ipcMain "fs:readFile" (fn [_ path]
                                    (.readFileSync fs path "utf8"))))

(defn start []
  (.on app "window-all-closed" (fn [] (when (not= (.-platform js/process) "darwin") (.quit app))))
  (.whenReady app (fn []
                    (ensure-plugin-dir!)
                    (register-ipc!)
                    (create-window)
                    (.on app "activate" (fn [] (when (nil? @win*) (create-window)))))))
```

---

## `electron/preload.cljs`

```clojure
(ns electron.preload)

(def electron (js/require "electron"))
(def contextBridge (.-contextBridge electron))
(def ipcRenderer (.-ipcRenderer electron))

(defn start []
  (.exposeInMainWorld contextBridge "native"
    #js {:paths (fn [] (.invoke ipcRenderer "paths"))
         :listPlugins (fn [] (.invoke ipcRenderer "plugins:list"))
         :readFile (fn [path] (.invoke ipcRenderer "fs:readFile" path))
         :import (fn [url] (js/Promise.resolve (js/eval (str "import('" url "')"))))}))
```

> The `:import` uses dynamic `import()` via `eval` to avoid bundler rewriting; adjust if you prefer a native `import()` shim.

---

## `src/app/opencode_api.cljs`

```clojure
(ns app.opencode-api
  (:require ["@opencode-ai/sdk" :refer [createOpencodeClient]]))

(defonce client* (atom nil))

(defn init! [{:keys [base-url]}]
  (when-not @client*
    (reset! client* (createOpencodeClient #js {:baseUrl base-url})))
  @client*)

(defn client [] @client*)

;; sessions
(defn list-sessions! []        (.list (.-session (client))))
(defn session-messages! [id]   (.messages (.-session (client)) #js {:path #js {:id id}}))
(defn send-prompt! [id text & [{:keys [model]}]]
  (.prompt (.-session (client))
           #js {:path #js {:id id}
                :body (clj->js (cond-> {:parts [{:type "text" :text text}]}
                                 model (assoc :model model)))}))

;; agents
(defn list-agents! [] (.agents (.-app (client))))

;; files
(defn find-files! [query] (.files (.-find (client)) #js {:query #js {:query query}}))
(defn read-file! [path]   (.read  (.-file (client)) #js {:query #js {:path path}}))
(defn file-status! []     (.status (.-file (client))))

;; models/providers
(defn list-providers! [] (.providers (.-config (client))))
```

---

## `src/app/layout.cljs` (frames/splits manager)

```clojure
(ns app.layout
  (:require [re-frame.core :as rf]
            [clojure.string :as str]
            [reagent.core :as r]))

;; Tree-based tiling layout inspired by Emacs/Spacemacs splits
;; Node = {:type :split :dir :row|:col :ratio 0.5 :a node :b node}
;;     | {:type :leaf :id <uuid> :view <view-id> :params {...}}

(defn new-leaf [view params]
  {:type :leaf :id (random-uuid) :view view :params params})

(rf/reg-event-db :layout/init
  (fn [db _]
    (assoc db :layout {:root (new-leaf :chat nil) :focus nil})))

(defn- focus-first [node]
  (if (= (:type node) :leaf) (:id node) (recur (:a node))))

(rf/reg-event-db :layout/set
  (fn [db [_ root]] (assoc db :layout {:root root :focus (focus-first root)})))

(rf/reg-sub :layout/root (fn [db _] (get-in db [:layout :root])))
(rf/reg-sub :layout/focus (fn [db _] (get-in db [:layout :focus])))

(defn- split [node dir]
  (if (= (:type node) :leaf)
    {:type :split :dir dir :ratio 0.5 :a node :b (new-leaf :empty nil)}
    (update node :b #(split % dir))))

(defn- replace-node [root id f]
  (if (= (:type root) :leaf)
    (if (= (:id root) id) (f root) root)
    (-> root (update :a #(replace-node % id f)) (update :b #(replace-node % id f)))))

(rf/reg-event-db :layout/split
  (fn [db [_ dir]]
    (let [focus (get-in db [:layout :focus])
          root  (get-in db [:layout :root])
          newr  (replace-node root focus #(split % dir))]
      (assoc-in db [:layout :root] newr))))

(rf/reg-event-db :layout/close
  (fn [db _]
    ;; naive close: replace focused leaf with :empty
    (let [fid (get-in db [:layout :focus])
          root (get-in db [:layout :root])
          newr (replace-node root fid (fn [_] (new-leaf :empty nil)))]
      (assoc-in db [:layout :root] newr))) )

(rf/reg-event-db :layout/focus
  (fn [db [_ id]] (assoc-in db [:layout :focus] id)))

;; View registry
(defonce views* (atom {}))
(defn register-view! [id render-fn]
  (swap! views* assoc id render-fn))

(defn view [id params]
  (let [v (get @views* id)]
    (if v [v params] [:div.p-4.text-gray-400 (str "No view: " id)])))

(defn- node->style [dir ratio]
  (if (= dir :row)
    {:display :flex :flex-direction :row}
    {:display :flex :flex-direction :column}))

(defn- split-render [{:keys [dir ratio a b]}]
  [:div {:style (node->style dir ratio)}
   [:div {:style {:flex ratio :borderRight (when (= dir :row) "1px solid #eee")
                  :borderBottom (when (= dir :col) "1px solid #eee")}}
    [render a]]
   [:div {:style {:flex (- 1 ratio)}} [render b]]])

(defn- leaf-render [{:keys [id view params]}]
  (let [focus @(rf/subscribe [:layout/focus])
        focused? (= id focus)]
    [:div {:on-click #(rf/dispatch [:layout/focus id])
           :style {:height "100%" :outline (when focused? "2px solid #7c3aed")}}
     [view view params]]))

(defn render [node]
  (case (:type node)
    :split [split-render node]
    :leaf  [leaf-render node]
    [:div "???"]))
```

---

## `src/app/keymap.cljs` (leader key + which-key)

```clojure
(ns app.keymap
  (:require [re-frame.core :as rf]
            [reagent.core :as r]
            [clojure.string :as str]))

;; Config
(rf/reg-event-db :keymap/config
  (fn [db [_ cfg]] (assoc db :keymap (merge {:leader " " :delay 500} cfg))))
(rf/reg-sub :keymap/config (fn [db _] (get db :keymap {:leader " " :delay 500})))

;; Command registry
(defonce commands* (atom {}))
(defn register-command! [id f meta] (swap! commands* assoc id {:f f :meta meta}))

;; Keymap tree: {"SPC" {"f" {"f" {:cmd :files/search}}}}
(defonce keymap* (atom {}))
(defn register-keymap! [tree] (swap! keymap* merge tree))

;; State
(defonce state* (r/atom {:seq [] :timer nil}))

(defn- clear! [] (swap! state* assoc :seq []))

(defn- start-timer! [delay]
  (let [t (js/setTimeout (fn [] (clear!)) delay)]
    (swap! state* assoc :timer t)))

(defn- which-key-items [m]
  (->> m (map (fn [[k v]] {:key k :next (keys v) :leaf (:cmd v)}))))

(rf/reg-sub :which-key
  (fn [_ _]
    (let [seq (:seq @state*)
          node (reduce (fn [acc k] (get acc k {})) @keymap* seq)
          opts (keys node)]
      {:seq seq :node node :opts opts})))

(defn- resolve-node [node ks]
  (reduce (fn [acc k] (get acc k)) node ks))

(defn- run-cmd! [cmd]
  (when-let [{:keys [f]} (get @commands* cmd)] (f)))

(defn- normalize [e]
  (cond
    (= (.-key e) " ") "SPC"
    :else (.-key e)))

(defn install-global-listener! []
  (let [handler (fn [e]
                  (let [{:keys [leader delay]} @(rf/subscribe [:keymap/config])
                        key (normalize e)
                        seq (:seq @state*)]
                    (when (= key "SPC") (.preventDefault e))
                    (if (or (= key "SPC") (seq seq))
                      (do
                        (swap! state* update :seq conj key)
                        (js/clearTimeout (:timer @state*))
                        (start-timer! delay)
                        (let [node (resolve-node @keymap* (:seq @state*))]
                          (when-let [cmd (:cmd node)]
                            (.preventDefault e)
                            (clear!)
                            (run-cmd! cmd)))))))]
    (.addEventListener js/window "keydown" handler)
    #(.-removeEventListener js/window "keydown" handler)))
```

---

## `src/app/which_key.cljs` (visual hint)

```clojure
(ns app.which-key
  (:require [re-frame.core :as rf]
            [clojure.string :as str]))

(defn root []
  (let [{:keys [seq node opts]} @(rf/subscribe [:which-key])]
    (when (seq seq)
      [:div.which-key
       [:div [:strong "Keys:"] " " (str/join " " seq)]
       [:div {:style {:display :grid :gridTemplateColumns "repeat(4, minmax(0,1fr))" :gap "6px"}}
        (for [k opts]
          ^{:key k}
          [:div [:code k]])]])))
```

---

## `src/app/plugins.cljs` (plugin discovery & activation)

```clojure
(ns app.plugins
  (:require [re-frame.core :as rf]
            [app.keymap :as km]
            [app.layout :as layout]))

(defonce registry* (atom {}))
(rf/reg-event-db :plugins/init (fn [db _] (assoc db :plugins {:loaded [] :errors []})))
(rf/reg-sub :plugins (fn [db _] (:plugins db)))

(defn- activate! [{:keys [id url manifest]}]
  (-> (.import (.-native js/window) url)
      (.then (fn [mod]
               (let [ctx #js {:registerCommand (fn [id f meta] (km/register-command! (keyword id) f meta))
                               :registerKeymap (fn [tree] (km/register-keymap! (js->clj tree :keywordize-keys false)))
                               :registerView (fn [id rf] (layout/register-view! (keyword id) (fn [_] (rf))))}
                     deactivate (when (.-activate mod) (.activate mod ctx))]
                 (swap! registry* assoc id {:deactivate deactivate})
                 (rf/dispatch [:plugins/loaded id]))))
      (.catch (fn [e]
                (js/console.error "Plugin load failed" id e)
                (rf/dispatch [:plugins/error (str id) (str e)])))))

(rf/reg-event-db :plugins/loaded (fn [db [_ id]] (update-in db [:plugins :loaded] conj id)))
(rf/reg-event-db :plugins/error (fn [db [_ id msg]] (update-in db [:plugins :errors] conj {:id id :msg msg})))

(rf/reg-event-fx :plugins/load-all
  (fn [_ _]
    (-> (.listPlugins (.-native js/window))
        (.then (fn [items]
                 (doseq [p (js->clj items :keywordize-keys true)] (activate! p))))
        (.catch (fn [e] (js/console.error e))))
    {}))
```

---

## `src/app/state.cljs` (app state — trimmed to the essentials)

```clojure
(ns app.state
  (:require [re-frame.core :as rf]
            [app.opencode-api :as api]))

(rf/reg-event-db :init (fn [_ _] {:base-url "http://localhost:4096" :loading? true :error nil}))

(rf/reg-event-fx :boot
  (fn [{:keys [db]} _]
    (api/init! {:base-url (:base-url db)})
    {:db (assoc db :loading? false)
     :dispatch-n [[:layout/init]
                  [:models/load]
                  [:agents/load]
                  [:files/status]
                  [:plugins/init]
                  [:plugins/load-all]]}))

;; (Sessions/models/files/agents/chat) — implement from earlier blueprint as needed.
```

---

## `src/app/ui.cljs` (root UI + dock panels)

```clojure
(ns app.ui
  (:require [re-frame.core :as rf]
            [app.layout :as layout]
            [app.which-key :as which-key]))

(defn statusbar []
  [:div.statusbar
   [:div "SPC opens leader • "] [:div {:style {:marginLeft "8px"}} (str "Plugins: " (count (:loaded @(rf/subscribe [:plugins]))))]])

(defn root []
  (let [root @(rf/subscribe [:layout/root])]
    [:div {:style {:height "100%" :display :flex :flexDirection :column}}
     [:div {:style {:flex 1}} [layout/render root]]
     [which-key/root]
     [statusbar]]))
```

---

## `src/app/core.cljs` (mount & keymaps)

```clojure
(ns app.core
  (:require [reagent.dom.client :as rdom]
            [re-frame.core :as rf]
            [app.state]
            [app.keymap :as km]
            [app.ui :as ui]
            [app.layout :as layout]))

(defonce root* (atom nil))

(defn ^:export start []
  (rf/dispatch-sync [:init])
  (rf/dispatch [:boot])

  ;; Default keymaps (Spacemacs-y)
  (km/register-keymap! {"SPC" {"w" {"/" {:cmd :layout/split-row}
                                     "-" {:cmd :layout/split-col}
                                     "c" {:cmd :layout/close}}
                              "b" {"s" {:cmd :buffer/scratch}}}})

  (km/register-command! :layout/split-row #(rf/dispatch [:layout/split :row]) {:title "Split right"})
  (km/register-command! :layout/split-col #(rf/dispatch [:layout/split :col])  {:title "Split below"})
  (km/register-command! :layout/close     #(rf/dispatch [:layout/close])       {:title "Close pane"})

  (km/install-global-listener!)

  ;; Views
  (layout/register-view! :empty (fn [_] [:div {:style {:height "100%" :display :flex :alignItems :center :justifyContent :center :color "#aaa"}} "Empty pane"]))
  (layout/register-view! :chat  (fn [_] [:div.p-4 "Chat view (wire session messages here)"]))

  (let [el (.getElementById js/document "app")
        r (rdom/create-root el)]
    (reset! root* r)
    (rdom/render r [ui/root])))

(defn ^:dev/after-load reload [] (when-let [r @root*] (rdom/render r [ui/root])))
```

---

## Sample plugin: `plugins/sample-scratchpad/manifest.json`

```json
{
  "name": "sample-scratchpad",
  "entry": "dist/index.js",
  "version": "0.1.0"
}
```

### `plugins/sample-scratchpad/src/sample_scratchpad/core.cljs`

```clojure
(ns sample-scratchpad.core)

(defn scratch-view []
  [:div {:style {:height "100%" :padding "8px"}}
   [:h3 "Scratchpad"]
   [:textarea {:style {:width "100%" :height "80%"}}]])

(defn ^:export activate [ctx]
  ;; register a view
  (.registerView ctx "scratch" (fn [] (scratch-view)))
  ;; register a command exposed under SPC b s
  (.registerCommand ctx "buffer/scratch" (fn [] (js/console.log "open scratch")) #js {:title "Open scratch"})
  ;; register a keymap chord
  (.registerKeymap ctx #js {"SPC" {"b" {"s" #js {:cmd "buffer/scratch"}}}})
  ;; return deactivate if needed
  (fn [] (js/console.log "scratchpad deactivated")))
```

> Build the plugin with its own `shadow-cljs.edn` to output `plugins/sample-scratchpad/dist/index.js`, or compile together by keeping it in the top-level `source-paths` (already set) and adding a small build in the main `shadow-cljs.edn` if preferred.

---

### How users install plugins

1. Create a folder under the app’s plugin dir (printed in DevTools or resolved via `native.paths()`): `~/Library/Application Support/opencode-cljs-electron/plugins/<my-plugin>` (platform varies).

2. Place a `manifest.json` with at least `{ "entry": "dist/index.js" }` and the compiled JS module at that path.

3. On app start (or via a soon-to-add “Reload plugins” command), the loader discovers, imports, and runs `export function activate(ctx) { ... }`.

---

That’s the scaffolding. Wire the Opencode panels (sessions/agents/files/models/chat) into views within `layout` and add more commands to match your muscle memory.

---

# Evil-mode (hjkl) Navigation + Text Buffers + Chat split (input ≠ log)

This adds a minimal **Evil-mode** for text navigation, a unified **buffer** model ("everything is text"), and a **chat** split where *input* and *message log* are separate buffers you can move between with Vim keys. Also adds **Ctrl-w h/j/k/l** window focus moves.

## New files

```
src/app/evil.cljs
src/app/buffers.cljs
```

## Update files

* `src/app/layout.cljs` → focus-by-direction + open-buffer helpers
* `src/app/keymap.cljs` → adds Ctrl‑w chord and integrates evil mode
* `src/app/core.cljs` → registers buffer view + default chords
* `src/app/state.cljs` → minimal chat buffers wiring (input/log)

---

## `src/app/evil.cljs`

```clojure
(ns app.evil
  (:require [re-frame.core :as rf]))

;; --- State
(rf/reg-event-db :evil/init (fn [db _] (assoc db :evil {:mode :normal})))
(rf/reg-sub :evil/mode (fn [db _] (get-in db [:evil :mode] :normal)))

(rf/reg-event-db :evil/insert (fn [db _] (assoc-in db [:evil :mode] :insert)))
(rf/reg-event-db :evil/normal (fn [db _] (assoc-in db [:evil :mode] :normal)))
(rf/reg-event-db :evil/toggle (fn [db _] (update-in db [:evil :mode] {:normal :insert :insert :normal})))

;; --- Caret movement helpers for <textarea>
(defn- clamp [x lo hi] (max lo (min hi x)))

(defn- line-start [s pos]
  (let [i (.lastIndexOf s "
" (max 0 (dec pos)))]
    (inc i)))

(defn- line-end [s pos]
  (let [i (.indexOf s "
" pos)]
    (if (= -1 i) (.-length s) i)))

(defn- column [s pos]
  (- pos (line-start s pos)))

(defn- goto-col [s line-start-pos col]
  (+ line-start-pos (clamp col 0 (- (line-end s line-start-pos) line-start-pos))))

(defn move-left! [^js el]
  (let [p (.-selectionStart el)]
    (set! (.-selectionStart el) (max 0 (dec p)))
    (set! (.-selectionEnd el) (.-selectionStart el))))

(defn move-right! [^js el]
  (let [p (.-selectionStart el)
        n (.-value el)]
    (set! (.-selectionStart el) (min (.-length n) (inc p)))
    (set! (.-selectionEnd el) (.-selectionStart el))))

(defn move-up! [^js el]
  (let [s (.-value el)
        p (.-selectionStart el)
        col (column s p)
        cur-start (line-start s p)
        prev-end (max 0 (dec cur-start))
        prev-start (line-start s prev-end)
        new-pos (goto-col s prev-start col)]
    (set! (.-selectionStart el) new-pos)
    (set! (.-selectionEnd el) new-pos)))

(defn move-down! [^js el]
  (let [s (.-value el)
        p (.-selectionStart el)
        col (column s p)
        cur-end (line-end s p)
        next-start (min (.-length s) (inc cur-end))
        new-pos (goto-col s next-start col)]
    (set! (.-selectionStart el) new-pos)
    (set! (.-selectionEnd el) new-pos)))

(defn handle-key! [^js e ^js el]
  (let [mode @(rf/subscribe [:evil/mode])
        k (.-key e)]
    (cond
      ;; universal escape -> normal mode
      (= k "Escape") (do (.preventDefault e) (rf/dispatch [:evil/normal]))
      ;; insert switch
      (and (= mode :normal) (= k "i")) (do (.preventDefault e) (rf/dispatch [:evil/insert]))
      ;; hjkl in normal mode
      (= mode :normal)
      (case k
        "h" (do (.preventDefault e) (move-left! el))
        "l" (do (.preventDefault e) (move-right! el))
        "j" (do (.preventDefault e) (move-down! el))
        "k" (do (.preventDefault e) (move-up! el))
        nil)
      :else nil)))
```

---

## `src/app/buffers.cljs` (Everything is a buffer)

```clojure
(ns app.buffers
  (:require [re-frame.core :as rf]
            [reagent.core :as r]
            [app.evil :as evil]))

;; Buffer = {:id uuid :name string :content string :editable? bool :meta {}}
(rf/reg-event-db :buffers/init
  (fn [db _]
    (assoc db :buffers {:by-id {} :order [] :focused nil})))

(rf/reg-sub :buffers/by-id (fn [db _] (get-in db [:buffers :by-id])))
(rf/reg-sub :buffers/order (fn [db _] (get-in db [:buffers :order])))
(rf/reg-sub :buffers/focused (fn [db _] (get-in db [:buffers :focused])))
(rf/reg-sub :buffer (fn [db [_ id]] (get-in db [:buffers :by-id id])))
(rf/reg-sub :buffer/content (fn [db [_ id]] (get-in db [:buffers :by-id id :content])))

(defn- ensure-id [] (random-uuid))

(rf/reg-event-db :buffer/new
  (fn [db [_ {:keys [name content editable? meta id]}]]
    (let [id (or id (ensure-id))
          buf {:id id :name (or name (str id)) :content (or content "") :editable? (boolean editable?) :meta meta}]
      (-> db
          (assoc-in [:buffers :by-id id] buf)
          (update-in [:buffers :order] conj id)))))

(rf/reg-event-db :buffer/set
  (fn [db [_ id new-content]]
    (assoc-in db [:buffers :by-id id :content] (or new-content ""))))

(rf/reg-event-db :buffer/append-line
  (fn [db [_ id line]]
    (let [cur (get-in db [:buffers :by-id id :content] "")
          nl (if (or (empty? cur) (.endsWith ^String cur "
")) "" "
")]
      (assoc-in db [:buffers :by-id id :content] (str cur nl line)))))

(rf/reg-event-db :buffer/focus
  (fn [db [_ id]] (assoc-in db [:buffers :focused] id)))

;; --- Text buffer view
(defn text-buffer [{:keys [id]}]
  (let [buf @(rf/subscribe [:buffer id])
        v* (r/atom nil)]
    (fn [{:keys [id]}]
      (let [{:keys [content editable? name]} @(rf/subscribe [:buffer id])]
        [:div {:style {:height "100%" :display :flex :flexDirection :column}}
         [:div {:style {:fontSize 12 :padding "4px 8px" :background "#f5f5f5" :borderBottom "1px solid #eee"}}
          name]
         (if editable?
           [:textarea {:ref #(reset! v* %)
                       :style {:flex 1 :width "100%"}
                       :value content
                       :on-focus #(rf/dispatch [:buffers/focus id])
                       :on-keydown (fn [e] (evil/handle-key! e @v*))
                       :on-change #(rf/dispatch [:buffer/set id (.. % -target -value)])}]
           [:textarea {:readOnly true
                       :ref #(reset! v* %)
                       :style {:flex 1 :width "100%" :background "#fafafa"}
                       :value content
                       :on-focus #(rf/dispatch [:buffers/focus id])
                       :on-keydown (fn [e] (evil/handle-key! e @v*))}])]))))

;; helper to create + open buffer in focused pane
(rf/reg-event-fx :buffer/create-and-open
  (fn [{:keys [db]} [_ spec]]
    (let [id (or (:id spec) (random-uuid))]
      {:db (-> db
               (update-in [:buffers :by-id] assoc id (merge {:id id :name (str id) :content "" :editable? false} spec))
               (update-in [:buffers :order] conj id))
       :dispatch [:layout/open-buffer id]})))
```

---

## `src/app/layout.cljs` (append helpers + directional focus)

```clojure
;; ... existing ns + requires ...

(rf/reg-event-fx
 :layout/open-buffer
 (fn [{:keys [db]} [_ buf-id]]
   (let [fid (get-in db [:layout :focus])]
     {:db (update-in db [:layout :root]
                     (fn replace-node [n]
                       (if (= (:type n) :leaf)
                         (if (= (:id n) fid)
                           (assoc n :view :buffer :params {:buffer-id buf-id})
                           n)
                         (-> n (update :a replace-node) (update :b replace-node)))))})))

(defn- neighbor [dir fid]
  (let [nodes (array-seq (.querySelectorAll js/document "[data-leaf-id]"))
        current (.querySelector js/document (str "[data-leaf-id='" fid "']"))
        cbox (.getBoundingClientRect current)
        cx (+ (.-left cbox) (/ (.-width cbox) 2))
        cy (+ (.-top cbox) (/ (.-height cbox) 2))
        score (fn [el]
                (let [b (.getBoundingClientRect el)
                      ex (+ (.-left b) (/ (.-width b) 2))
                      ey (+ (.-top b) (/ (.-height b) 2))
                      dx (- ex cx) dy (- ey cy)]
                  (case dir
                    :left  (if (neg? dx) (Math/sqrt (+ (* dx dx) (* dy dy))) ##Inf)
                    :right (if (pos? dx) (Math/sqrt (+ (* dx dx) (* dy dy))) ##Inf)
                    :up    (if (neg? dy) (Math/sqrt (+ (* dx dx) (* dy dy))) ##Inf)
                    :down  (if (pos? dy) (Math/sqrt (+ (* dx dx) (* dy dy))) ##Inf)))] )
        candidates (remove #(= (.getAttribute % "data-leaf-id") (str fid)) nodes)
        best (first (sort-by score candidates))]
    (some-> best (.getAttribute "data-leaf-id") uuid)))

(rf/reg-event-db :layout/focus-dir
  (fn [db [_ dir]]
    (if-let [n (neighbor dir (get-in db [:layout :focus]))]
      (assoc-in db [:layout :focus] n)
      db)))

;; Update leaf-render to mark DOM nodes
(defn- leaf-render [{:keys [id view params]}]
  (let [focus @(rf/subscribe [:layout/focus])
        focused? (= id focus)]
    [:div {:on-click #(rf/dispatch [:layout/focus id])
           :data-leaf-id (str id)
           :style {:height "100%" :outline (when focused? "2px solid #7c3aed")}}
     [view view params]]))

;; Register a :buffer view renderer
(require '[app.buffers :as buffers])
(defn buffer-view [_ {:keys [buffer-id]}]
  [buffers/text-buffer {:id buffer-id}])

(register-view! :buffer buffer-view)
```

---

## `src/app/keymap.cljs` (Ctrl‑w window moves + evil integration)

```clojure
;; ...existing requires/state...

(defonce cw-state* (r/atom false))

(defn install-global-listener! []
  (let [handler (fn [e]
                  (let [{:keys [leader delay]} @(rf/subscribe [:keymap/config])
                        key (normalize e)]
                    ;; — Evil global ESC
                    (when (= key "Escape") (rf/dispatch [:evil/normal]))

                    ;; Ctrl-w chord for window nav
                    (cond
                      (and (.-ctrlKey e) (= key "w"))
                      (do (.preventDefault e) (reset! cw-state* true))

                      @cw-state*
                      (do (.preventDefault e)
                          (case key
                            "h" (rf/dispatch [:layout/focus-dir :left])
                            "j" (rf/dispatch [:layout/focus-dir :down])
                            "k" (rf/dispatch [:layout/focus-dir :up])
                            "l" (rf/dispatch [:layout/focus-dir :right])
                            nil)
                          (reset! cw-state* false))

                      :else
                      (when (or (= key "SPC") (seq (:seq @state*)))
                        (swap! state* update :seq conj key)
                        (js/clearTimeout (:timer @state*))
                        (start-timer! delay)
                        (let [node (resolve-node @keymap* (:seq @state*))]
                          (when-let [cmd (:cmd node)]
                            (.preventDefault e)
                            (clear!)
                            (run-cmd! cmd)))))))]
    (.addEventListener js/window "keydown" handler)
    #(.-removeEventListener js/window "keydown" handler)))
```

---

## `src/app/state.cljs` (chat buffers wiring)

```clojure
;; Add after boot: initialize evil + buffers
(rf/reg-event-fx :boot
  (fn [{:keys [db]} _]
    ;; ... existing init ...
    {:db (assoc db :loading? false)
     :dispatch-n [[:layout/init]
                  [:evil/init]
                  [:buffers/init]
                  [:plugins/init]
                  [:plugins/load-all]]}))

;; Example: open chat buffers (Input + Log) for current session
(rf/reg-event-fx :chat/open-buffers
  (fn [{:keys [db]} [_ {:keys [session-id]}]]
    (let [sid (or session-id (:selected-session db))
          log-id (random-uuid)
          in-id  (random-uuid)
          log-name (str "Chat Log [" sid "]")
          in-name  (str "Chat Input [" sid "]")]
      {:dispatch-n [[:buffer/create-and-open {:id log-id :name log-name :editable? false :content ""}]
                    [:layout/split :col]
                    [:buffer/create-and-open {:id in-id :name in-name :editable? true :content ""}]]})))

;; Helpers to reflect messages into log buffer
(rf/reg-event-fx :chat/append-log
  (fn [_ [_ log-id {:keys [role text]}]]
    {:dispatch [:buffer/append-line log-id (str "[" (or role "assistant") "] " text)]}))
```

---

## `src/app/core.cljs` (register default chords & views)

```clojure
;; after (km/install-global-listener!) and view regs

;; Spacemacs-like leader window cmds (kept)
(km/register-keymap! {"SPC" {"w" {"/" {:cmd :layout/split-row}
                                   "-" {:cmd :layout/split-col}
                                   "c" {:cmd :layout/close}
                                   "h" {:cmd :layout/left}
                                   "j" {:cmd :layout/down}
                                   "k" {:cmd :layout/up}
                                   "l" {:cmd :layout/right}}
                             "c" {"o" {:cmd :chat/open}}}})

(km/register-command! :layout/left  #(rf/dispatch [:layout/focus-dir :left])  {:title "Focus left"})
(km/register-command! :layout/down  #(rf/dispatch [:layout/focus-dir :down])  {:title "Focus down"})
(km/register-command! :layout/up    #(rf/dispatch [:layout/focus-dir :up])    {:title "Focus up"})
(km/register-command! :layout/right #(rf/dispatch [:layout/focus-dir :right]) {:title "Focus right"})
(km/register-command! :chat/open    #(rf/dispatch [:chat/open-buffers {}])    {:title "Open chat input+log"})

;; Ensure :buffer view is registered (via layout.cljs change)
```

---

## How to use (muscle memory)

* **Modes**: Start in *Normal*. `i` → *Insert*. `Esc` → *Normal*.
* **Text navigation** in buffers (input and log): `h j k l` (Normal mode).
* **Window movement**: `Ctrl-w h/j/k/l` or `SPC w h/j/k/l`.
* **Split**: `SPC w /` (vertical/right) • `SPC w -` (horizontal/below) • `SPC w c` (close).
* **Chat as buffers**: `SPC c o` to open *Chat Log* (read-only) and *Chat Input* (editable) as two panes.

> Everything—files, chat logs, chat input, even plugin UIs—can be represented as text buffers using `:buffer/create-and-open` and rendered with `text-buffer`.

### Notes

* This is a **minimal** Evil: it focuses on hjkl and mode switching; you can add word motions, search (`/`), and y/d/p later.
* For huge logs, consider virtualizing the read-only textarea or paging.
* If your plugin wants a buffer: call `ctx.registerView` to mount a component, or append text lines via the `:buffer/append-line` event.

````



---

# Add‑ons: Evil motions, Plugin **hot reload**, Buffer management, and **Persistent workspaces**

This section layers on four big features:

1) **Evil motions**: `w b e 0 $ gg G` (Normal mode) in any text buffer.
2) **Plugin hot reload**: file‑watch the plugins dir; auto‑reload on change; manual `SPC p r` reload.
3) **Buffer management**: buffer list (`SPC b b`), switch, kill (`SPC b d`), rename (`SPC b r`).
4) **Persistent workspaces + buffers**: save/load named workspaces (`SPC w s`, `SPC w l`), auto‑save on exit.

Below are patches/new files to drop into the scaffold.

---

## `package.json` — add watcher
```diff
   "devDependencies": {
     "electron": "^32.2.0",
     "electron-builder": "^24.13.3",
     "shadow-cljs": "^2.28.20",
     "npm-run-all": "^4.1.5",
-    "cross-env": "^7.0.3"
+    "cross-env": "^7.0.3",
+    "chokidar": "^3.6.0"
   }
````

---

## `electron/main.cljs` — plugin watch + fs write

```clojure
(ns electron.main
  (:require [clojure.string :as str]
            [goog.object :as gobj]
            [cljs.nodejs :as nodejs]))

(nodejs/enable-util-print!)

(def electron (js/require "electron"))
(def app (.-app electron))
(def BrowserWindow (.-BrowserWindow electron))
(def ipcMain (.-ipcMain electron))
(def path (js/require "path"))
(def fs (js/require "fs"))
(def chokidar (js/require "chokidar"))

(defonce win* (atom nil))

(defn user-data-path [] (.getPath app "userData"))
(defn plugin-dir [] (.join path (user-data-path) "plugins"))
(defn workspace-dir [] (.join path (user-data-path) "workspaces"))
(defn state-file [] (.join path (user-data-path) "state.json"))

(defn ensure-dir! [p]
  (when-not (.existsSync fs p) (.mkdirSync fs p #js {:recursive true})) p)

(defn ensure-plugin-dir! [] (ensure-dir! (plugin-dir)))
(defn ensure-workspace-dir! [] (ensure-dir! (workspace-dir)))

(defn create-window []
  (let [preload (.join path (.cwd js/process) "dist" "preload.js")
        w (BrowserWindow. (clj->js {:width 1400 :height 900
                                    :title "OpenCode • Spacemacs UI"
                                    :webPreferences {:contextIsolation true
                                                     :nodeIntegration false
                                                     :preload preload}}))]
    (reset! win* w)
    (let [url (str "file://" (.join path (.cwd js/process) "public" "index.html"))]
      (.loadURL w url))
    (.on w "closed" #(reset! win* nil))))

(defn list-plugin-manifests []
  (ensure-plugin-dir!)
  (let [dir (plugin-dir)
        items (.readdirSync fs dir)]
    (->> items
         (map (fn [name]
                (let [m (.join path dir name "manifest.json")]
                  (when (.existsSync fs m)
                    (try
                      (let [txt (.readFileSync fs m "utf8")
                            data (js/JSON.parse txt)
                            entry (or (gobj/get data "entry") "dist/index.js")
                            url (str "file://" (.join path dir name entry))]
                        (clj->js {:id name :manifest data :url url}))
                      (catch :default _ nil))))))
         (filter identity)
         clj->js)))

(defn register-ipc! []
  (.handle ipcMain "paths" (fn [_]
                               (clj->js {:userData (user-data-path)
                                         :plugins  (plugin-dir)
                                         :workspaces (workspace-dir)})))
  (.handle ipcMain "plugins:list" (fn [_] (list-plugin-manifests)))
  ;; filesystem helpers
  (.handle ipcMain "fs:readFile" (fn [_ p] (.readFileSync fs p "utf8")))
  (.handle ipcMain "fs:writeFile" (fn [_ p data]
                                     (ensure-dir! (.dirname path p))
                                     (.writeFileSync fs p data "utf8")
                                     true))
  ;; state helpers
  (.handle ipcMain "state:read" (fn [_]
                                   (try (.readFileSync fs (state-file) "utf8")
                                        (catch :default _ nil))))
  (.handle ipcMain "state:write" (fn [_ data]
                                    (.writeFileSync fs (state-file) data "utf8") true)))

(defn start-plugin-watch! []
  (ensure-plugin-dir!)
  (let [w (chokidar.watch (plugin-dir) #js {:ignoreInitial true})]
    (.on w "all" (fn [_ _]
                    (when-let [win @win*]
                      (.send (.-webContents win) "plugins:changed"))))))

(defn start []
  (.on app "window-all-closed" (fn [] (when (not= (.-platform js/process) "darwin") (.quit app))))
  (.whenReady app (fn []
                    (ensure-plugin-dir!)
                    (ensure-workspace-dir!)
                    (register-ipc!)
                    (start-plugin-watch!)
                    (create-window)
                    (.on app "activate" (fn [] (when (nil? @win*) (create-window)))))))
```

---

## `electron/preload.cljs` — expose write + plugin change event

```clojure
(ns electron.preload)

(def electron (js/require "electron"))
(def contextBridge (.-contextBridge electron))
(def ipcRenderer (.-ipcRenderer electron))

(defn start []
  (.exposeInMainWorld contextBridge "native"
    #js {:paths (fn [] (.invoke ipcRenderer "paths"))
         :listPlugins (fn [] (.invoke ipcRenderer "plugins:list"))
         :readFile (fn [path] (.invoke ipcRenderer "fs:readFile" path))
         :writeFile (fn [path data] (.invoke ipcRenderer "fs:writeFile" path data))
         :readState (fn [] (.invoke ipcRenderer "state:read"))
         :writeState (fn [data] (.invoke ipcRenderer "state:write" data))
         :onPluginsChanged (fn [f] (.on ipcRenderer "plugins:changed" (fn [_] (f))))
         :import (fn [url] (js/Promise.resolve (js/eval (str "import('" url "')"))))}))
```

---

# Part 2: Evil + Visual + Yank/Delete/Change (Compact)

This continues where the main scaffold stopped (at `src/app/evil.cljs`). It provides a compact, working `evil.cljs` with:

* Normal/Insert/Visual modes
* Motions: `hjkl`, `w/b/e`, `0/$`, `gg/G`
* Yank operator + paste: `y`, `yy`, `yw`, `y$`, `yG`, `p/P`
* Delete/Change operators: `d{motion}` / `dd` / `dG`, and `c{motion}` (enters Insert)
* Visual mode selections (`v`, `V`) with `y/d/c`

It also shows tiny glue changes for `preload.cljs` (clipboard) and `buffers.cljs` (key handler).

---

## 1) `src/app/evil.cljs`

```clojure
(ns app.evil
  (:require [re-frame.core :as rf]))

;; ===== Mode state =====
(rf/reg-event-db :evil/init   (fn [db _] (assoc db :evil {:mode :normal :visual nil})))
(rf/reg-sub      :evil/mode   (fn [db _] (get-in db [:evil :mode] :normal)))
(rf/reg-sub      :evil/visual (fn [db _] (get-in db [:evil :visual])))
(rf/reg-event-db :evil/insert (fn [db _] (assoc-in db [:evil :mode] :insert)))
(rf/reg-event-db :evil/normal (fn [db _] (assoc db :evil {:mode :normal :visual nil})))
(rf/reg-event-db :evil/visual-on  (fn [db [_ m]] (assoc db :evil {:mode :visual :visual {:line? (= m :line)}})))
(rf/reg-event-db :evil/visual-off (fn [db _] (assoc db :evil {:mode :normal :visual nil})))

;; ===== Text helpers =====
(defn- clamp [x lo hi] (max lo (min hi x)))
(defn- line-start [^string s pos] (inc (.lastIndexOf s "\n" (max 0 (dec pos)))))
(defn- line-end   [^string s pos] (let [i (.indexOf s "\n" pos)] (if (= -1 i) (.-length s) i)))
(defn- column     [^string s pos] (- pos (line-start s pos)))
(defn- goto-col   [^string s ls col] (+ ls (clamp col 0 (- (line-end s ls) ls))))
(defn- setpos! [^js el p] (set! (.-selectionStart el) p) (set! (.-selectionEnd el) p))
(defn- setrange! [^js el a b] (set! (.-selectionStart el) (min a b)) (set! (.-selectionEnd el) (max a b)))

(defn- wordch? [ch] (boolean (re-matches #"[A-Za-z0-9_]" (str ch))))
(defn- next-word [^string s pos]
  (let [n (.-length s)]
    (loop [i (min n (max 0 pos)) seen? false]
      (cond
        (>= i n) n
        (and seen? (not (wordch? (.charAt s i)))) i
        :else (recur (inc i) (or seen? (wordch? (.charAt s i))))))))
(defn- prev-word [^string s pos]
  (loop [i (max 0 (dec pos)) seen? false]
    (cond
      (<= i 0) 0
      (and seen? (not (wordch? (.charAt s i)))) (inc i)
      :else (recur (dec i) (or seen? (wordch? (.charAt s i)))))))
(defn- end-word [^string s pos]
  (let [n (.-length s)]
    (loop [i (min n (max 0 pos)) in? false]
      (cond
        (>= i n) (dec n)
        (and in? (not (wordch? (.charAt s i)))) (dec i)
        :else (recur (inc i) (or in? (wordch? (.charAt s i))))))))

;; ===== Motions =====
(defn move-left!  [^js el] (setpos! el (max 0 (dec (.-selectionStart el)))))
(defn move-right! [^js el] (let [s (.-value el)] (setpos! el (min (.-length s) (inc (.-selectionStart el))))))
(defn move-up!    [^js el]
  (let [s (.-value el) p (.-selectionStart el) col (column s p)
        prev-start (line-start s (max 0 (dec (line-start s p))))]
    (setpos! el (goto-col s prev-start col))))
(defn move-down!  [^js el]
  (let [s (.-value el) p (.-selectionStart el) col (column s p)
        next-start (min (.-length s) (inc (line-end s p)))]
    (setpos! el (goto-col s next-start col))))
(defn move-bol! [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (line-start s p))))
(defn move-eol! [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (line-end   s p))))
(defn move-w!   [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (next-word s (inc p)))))
(defn move-b!   [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (prev-word s p))))
(defn move-e!   [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (inc (end-word s p)))))
(defn goto-start! [^js el] (setpos! el 0))
(defn goto-end!   [^js el] (setpos! el (.-length (.-value el))))

;; ===== Registers & clipboard =====
(defonce reg* (atom {:text "" :linewise? false}))
(defonce g-prev* (atom 0))
(defn- clip-write! [s] (try (.clipWrite (.-native js/window) s) (catch :default _ nil)))
(defn- yank! [txt line?] (reset! reg* {:text txt :linewise? line?}) (clip-write! txt))

;; ===== Operators =====
(defonce op* (atom nil)) ;; {:op :y|:d|:c, :anchor pos}

(defn- yank-range! [^js el a b line?]
  (let [s (.-value el) lo (min a b) hi (max a b)
        txt (.substring s lo hi)
        txt' (if (and line? (not (.endsWith txt "\n"))) (str txt "\n") txt)]
    (yank! txt' line?)
    (setpos! el a)))

(defn- delete-range! [^js el a b line?]
  (when-not (.-readOnly el)
    (let [s (.-value el) lo (min a b) hi (max a b)
          txt (.substring s lo hi)
          txt' (if (and line? (not (.endsWith txt "\n"))) (str txt "\n") txt)
          out (str (.substring s 0 lo) (.substring s hi (.-length s)))]
      (yank! txt' line?)
      (set! (.-value el) out)
      (setpos! el lo))))

(defn- change-range! [^js el a b line?]
  (delete-range! el a b line?)
  (rf/dispatch [:evil/insert]))

(defn- delete-line! [^js el]
  (let [s (.-value el) p (.-selectionStart el) ls (line-start s p) le (line-end s p)
        hi (min (.-length s) (inc le))]
    (delete-range! el ls hi true)))

(defn- change-line! [^js el]
  (let [s (.-value el) p (.-selectionStart el) ls (line-start s p) le (line-end s p)
        hi (min (.-length s) (inc le))]
    (change-range! el ls hi true)))

(defn- paste! [^js el before?]
  (when-not (.-readOnly el)
    (let [{:keys [text linewise?]} @reg*
          text (or text "") p (.-selectionStart el) s (.-value el)]
      (if linewise?
        (let [target (if before? (line-start s p) (min (.-length s) (inc (line-end s p))))
              v (.-value el)
              out (str (.substring v 0 target) text (.substring v target (.-length v)))]
          (set! (.-value el) out) (setpos! el (+ target (.-length text))))
        (let [idx (if before? p (inc p)) v (.-value el)
              out (str (.substring v 0 idx) text (.substring v idx (.-length v)))]
          (set! (.-value el) out) (setpos! el (+ idx (.-length text))))))))

(defn- apply-op-motion! [^js el {:keys [op anchor]} k]
  (let [s (.-value el)
        tgt (case k
              ("y" "d" "c") :line
              "w" (next-word s (inc anchor))
              "b" (prev-word s anchor)
              "e" (inc (end-word s anchor))
              "0" (line-start s anchor)
              "$" (line-end s anchor)
              "G" (.-length s)
              nil)]
    (when tgt
      (case op
        :y (if (= tgt :line)
             (yank-range! el (line-start s anchor) (inc (line-end s anchor)) true)
             (yank-range! el anchor tgt false))
        :d (if (= tgt :line) (delete-line! el) (delete-range! el anchor tgt false))
        :c (if (= tgt :line) (change-line! el) (change-range! el anchor tgt false))))))

;; ===== Visual mode =====
(defonce v-anchor* (atom nil))
(defn- visual-start! [^js el line?]
  (reset! v-anchor* (.-selectionStart el))
  (rf/dispatch [:evil/visual-on (if line? :line :char)])
  (if line?
    (let [s (.-value el) a @v-anchor*] (setrange! el (line-start s a) (inc (line-end s a))))
    (setrange! el @v-anchor* (.-selectionStart el))))
(defn- visual-update! [^js el]
  (let [mode @(rf/subscribe [:evil/mode]) v @(rf/subscribe [:evil/visual])]
    (when (= mode :visual)
      (let [s (.-value el) a @v-anchor* p (.-selectionStart el)]
        (if (:line? v)
          (setrange! el (line-start s (min a p)) (inc (line-end s (max a p))))
          (setrange! el a p))))))
(defn- visual-exit! [] (reset! v-anchor* nil) (rf/dispatch [:evil/visual-off]))

;; ===== gg helper =====
(defn handle-gg! [^js e ^js el]
  (when (= (.-key e) "g")
    (let [now (.now js/Date)]
      (if (< (- now @g-prev*) 350)
        (do (.preventDefault e)
            (goto-start! el)
            (when (= @(rf/subscribe [:evil/mode]) :visual) (visual-update! el))
            (reset! g-prev* 0))
        (reset! g-prev* now)))))

;; ===== Main key handler =====
(defn handle-key! [^js e ^js el]
  (let [mode @(rf/subscribe [:evil/mode]) k (.-key e) op @op* ro? (.-readOnly el)]
    (cond
      ;; mode switches
      (= k "Escape") (do (.preventDefault e) (reset! op* nil) (visual-exit!) (rf/dispatch [:evil/normal]))
      (and (= mode :normal) (= k "i")) (do (.preventDefault e) (reset! op* nil) (rf/dispatch [:evil/insert]))
      (and (= mode :normal) (= k "v")) (do (.preventDefault e) (visual-start! el false))
      (and (= mode :normal) (= k "V")) (do (.preventDefault e) (visual-start! el true))

      ;; operator-pending resolution
      (and (= mode :normal) op) (do (.preventDefault e) (apply-op-motion! el op k) (reset! op* nil))

      ;; Visual mode
      (= mode :visual)
      (case k
        ;; motions
        "h" (do (.preventDefault e) (move-left! el)  (visual-update! el))
        "l" (do (.preventDefault e) (move-right! el) (visual-update! el))
        "j" (do (.preventDefault e) (move-down! el)  (visual-update! el))
        "k" (do (.preventDefault e) (move-up! el)    (visual-update! el))
        "0" (do (.preventDefault e) (move-bol! el)   (visual-update! el))
        "$" (do (.preventDefault e) (move-eol! el)   (visual-update! el))
        "w" (do (.preventDefault e) (move-w! el)     (visual-update! el))
        "b" (do (.preventDefault e) (move-b! el)     (visual-update! el))
        "e" (do (.preventDefault e) (move-e! el)     (visual-update! el))
        "G" (do (.preventDefault e) (goto-end! el)   (visual-update! el))
        ;; ops on selection
        "y" (do (.preventDefault e)
                (let [s (.-selectionStart el) epos (.-selectionEnd el)
                      line? (get-in @(rf/subscribe [:evil/visual]) [:line?])
                      txt (.substring (.-value el) (min s epos) (max s epos))
                      txt' (if (and line? (not (.endsWith txt "\n"))) (str txt "\n") txt)]
                  (yank! txt' line?) (visual-exit!)))
        "d" (do (.preventDefault e) (when-not ro? (delete-range! el (.-selectionStart el) (.-selectionEnd el) (get-in @(rf/subscribe [:evil/visual]) [:line?]))) (visual-exit!))
        "c" (do (.preventDefault e) (when-not ro? (change-range! el (.-selectionStart el) (.-selectionEnd el) (get-in @(rf/subscribe [:evil/visual]) [:line?]))) (visual-exit!))
        nil)

      ;; Normal mode (start ops / motions / paste)
      (= mode :normal)
      (case k
        ;; start ops
        "y" (do (.preventDefault e) (reset! op* {:op :y :anchor (.-selectionStart el)}))
        "d" (do (.preventDefault e) (reset! op* {:op :d :anchor (.-selectionStart el)}))
        "c" (do (.preventDefault e) (reset! op* {:op :c :anchor (.-selectionStart el)}))
        ;; linewise shortcuts
        "Y" (do (.preventDefault e) (let [s (.-value el) p (.-selectionStart el)] (yank-range! el (line-start s p) (inc (line-end s p)) true)))
        "D" (do (.preventDefault e) (when-not ro? (let [s (.-value el) p (.-selectionStart el)] (delete-range! el p (line-end s p) false))))
        "C" (do (.preventDefault e) (when-not ro? (let [s (.-value el) p (.-selectionStart el)] (change-range! el p (line-end s p) false))))
        ;; paste
        "p" (do (.preventDefault e) (paste! el false))
        "P" (do (.preventDefault e) (paste! el true))
        ;; motions
        "h" (do (.preventDefault e) (move-left! el))
        "l" (do (.preventDefault e) (move-right! el))
        "j" (do (.preventDefault e) (move-down! el))
        "k" (do (.preventDefault e) (move-up! el))
        "0" (do (.preventDefault e) (move-bol! el))
        "$" (do (.preventDefault e) (move-eol! el))
        "w" (do (.preventDefault e) (move-w! el))
        "b" (do (.preventDefault e) (move-b! el))
        "e" (do (.preventDefault e) (move-e! el))
        "G" (do (.preventDefault e) (goto-end! el))
        nil)
      :else nil)))
```

---

## 2) `electron/preload.cljs` — add clipboard helpers

Append to your exposed API (or merge if you’ve already edited):

```clojure
(def clipboard (.-clipboard electron))

(.exposeInMainWorld contextBridge "native"
  #js { ;; ...existing methods...
       :clipWrite (fn [s] (.writeText clipboard s))
       :clipRead  (fn [] (.readText clipboard)) })
```

---

## 3) `src/app/buffers.cljs` — call both handlers on the textarea

Ensure your `text-buffer` textarea uses **both** handlers (gg + main):

```clojure
:on-keydown (fn [e]
              (evil/handle-gg! e @v*)
              (evil/handle-key! e @v*))
```

That’s it. With this compact `evil.cljs`, you get Visual, yank/paste, and delete/change across any text buffer while keeping the main scaffold slim.
# Part 2: Evil + Visual + Yank/Delete/Change (Compact)

This continues where the main scaffold stopped (at `src/app/evil.cljs`). It provides a compact, working `evil.cljs` with:

* Normal/Insert/Visual modes
* Motions: `hjkl`, `w/b/e`, `0/$`, `gg/G`
* Yank operator + paste: `y`, `yy`, `yw`, `y$`, `yG`, `p/P`
* Delete/Change operators: `d{motion}` / `dd` / `dG`, and `c{motion}` (enters Insert)
* Visual mode selections (`v`, `V`) with `y/d/c`

It also shows tiny glue changes for `preload.cljs` (clipboard) and `buffers.cljs` (key handler).

---

## 1) `src/app/evil.cljs`

```clojure
(ns app.evil
  (:require [re-frame.core :as rf]))

;; ===== Mode state =====
(rf/reg-event-db :evil/init   (fn [db _] (assoc db :evil {:mode :normal :visual nil})))
(rf/reg-sub      :evil/mode   (fn [db _] (get-in db [:evil :mode] :normal)))
(rf/reg-sub      :evil/visual (fn [db _] (get-in db [:evil :visual])))
(rf/reg-event-db :evil/insert (fn [db _] (assoc-in db [:evil :mode] :insert)))
(rf/reg-event-db :evil/normal (fn [db _] (assoc db :evil {:mode :normal :visual nil})))
(rf/reg-event-db :evil/visual-on  (fn [db [_ m]] (assoc db :evil {:mode :visual :visual {:line? (= m :line)}})))
(rf/reg-event-db :evil/visual-off (fn [db _] (assoc db :evil {:mode :normal :visual nil})))

;; ===== Text helpers =====
(defn- clamp [x lo hi] (max lo (min hi x)))
(defn- line-start [^string s pos] (inc (.lastIndexOf s "\n" (max 0 (dec pos)))))
(defn- line-end   [^string s pos] (let [i (.indexOf s "\n" pos)] (if (= -1 i) (.-length s) i)))
(defn- column     [^string s pos] (- pos (line-start s pos)))
(defn- goto-col   [^string s ls col] (+ ls (clamp col 0 (- (line-end s ls) ls))))
(defn- setpos! [^js el p] (set! (.-selectionStart el) p) (set! (.-selectionEnd el) p))
(defn- setrange! [^js el a b] (set! (.-selectionStart el) (min a b)) (set! (.-selectionEnd el) (max a b)))

(defn- wordch? [ch] (boolean (re-matches #"[A-Za-z0-9_]" (str ch))))
(defn- next-word [^string s pos]
  (let [n (.-length s)]
    (loop [i (min n (max 0 pos)) seen? false]
      (cond
        (>= i n) n
        (and seen? (not (wordch? (.charAt s i)))) i
        :else (recur (inc i) (or seen? (wordch? (.charAt s i))))))))
(defn- prev-word [^string s pos]
  (loop [i (max 0 (dec pos)) seen? false]
    (cond
      (<= i 0) 0
      (and seen? (not (wordch? (.charAt s i)))) (inc i)
      :else (recur (dec i) (or seen? (wordch? (.charAt s i)))))))
(defn- end-word [^string s pos]
  (let [n (.-length s)]
    (loop [i (min n (max 0 pos)) in? false]
      (cond
        (>= i n) (dec n)
        (and in? (not (wordch? (.charAt s i)))) (dec i)
        :else (recur (inc i) (or in? (wordch? (.charAt s i))))))))

;; ===== Motions =====
(defn move-left!  [^js el] (setpos! el (max 0 (dec (.-selectionStart el)))))
(defn move-right! [^js el] (let [s (.-value el)] (setpos! el (min (.-length s) (inc (.-selectionStart el))))))
(defn move-up!    [^js el]
  (let [s (.-value el) p (.-selectionStart el) col (column s p)
        prev-start (line-start s (max 0 (dec (line-start s p))))]
    (setpos! el (goto-col s prev-start col))))
(defn move-down!  [^js el]
  (let [s (.-value el) p (.-selectionStart el) col (column s p)
        next-start (min (.-length s) (inc (line-end s p)))]
    (setpos! el (goto-col s next-start col))))
(defn move-bol! [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (line-start s p))))
(defn move-eol! [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (line-end   s p))))
(defn move-w!   [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (next-word s (inc p)))))
(defn move-b!   [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (prev-word s p))))
(defn move-e!   [^js el] (let [s (.-value el) p (.-selectionStart el)] (setpos! el (inc (end-word s p)))))
(defn goto-start! [^js el] (setpos! el 0))
(defn goto-end!   [^js el] (setpos! el (.-length (.-value el))))

;; ===== Registers & clipboard =====
(defonce reg* (atom {:text "" :linewise? false}))
(defonce g-prev* (atom 0))
(defn- clip-write! [s] (try (.clipWrite (.-native js/window) s) (catch :default _ nil)))
(defn- yank! [txt line?] (reset! reg* {:text txt :linewise? line?}) (clip-write! txt))

;; ===== Operators =====
(defonce op* (atom nil)) ;; {:op :y|:d|:c, :anchor pos}

(defn- yank-range! [^js el a b line?]
  (let [s (.-value el) lo (min a b) hi (max a b)
        txt (.substring s lo hi)
        txt' (if (and line? (not (.endsWith txt "\n"))) (str txt "\n") txt)]
    (yank! txt' line?)
    (setpos! el a)))

(defn- delete-range! [^js el a b line?]
  (when-not (.-readOnly el)
    (let [s (.-value el) lo (min a b) hi (max a b)
          txt (.substring s lo hi)
          txt' (if (and line? (not (.endsWith txt "\n"))) (str txt "\n") txt)
          out (str (.substring s 0 lo) (.substring s hi (.-length s)))]
      (yank! txt' line?)
      (set! (.-value el) out)
      (setpos! el lo))))

(defn- change-range! [^js el a b line?]
  (delete-range! el a b line?)
  (rf/dispatch [:evil/insert]))

(defn- delete-line! [^js el]
  (let [s (.-value el) p (.-selectionStart el) ls (line-start s p) le (line-end s p)
        hi (min (.-length s) (inc le))]
    (delete-range! el ls hi true)))

(defn- change-line! [^js el]
  (let [s (.-value el) p (.-selectionStart el) ls (line-start s p) le (line-end s p)
        hi (min (.-length s) (inc le))]
    (change-range! el ls hi true)))

(defn- paste! [^js el before?]
  (when-not (.-readOnly el)
    (let [{:keys [text linewise?]} @reg*
          text (or text "") p (.-selectionStart el) s (.-value el)]
      (if linewise?
        (let [target (if before? (line-start s p) (min (.-length s) (inc (line-end s p))))
              v (.-value el)
              out (str (.substring v 0 target) text (.substring v target (.-length v)))]
          (set! (.-value el) out) (setpos! el (+ target (.-length text))))
        (let [idx (if before? p (inc p)) v (.-value el)
              out (str (.substring v 0 idx) text (.substring v idx (.-length v)))]
          (set! (.-value el) out) (setpos! el (+ idx (.-length text))))))))

(defn- apply-op-motion! [^js el {:keys [op anchor]} k]
  (let [s (.-value el)
        tgt (case k
              ("y" "d" "c") :line
              "w" (next-word s (inc anchor))
              "b" (prev-word s anchor)
              "e" (inc (end-word s anchor))
              "0" (line-start s anchor)
              "$" (line-end s anchor)
              "G" (.-length s)
              nil)]
    (when tgt
      (case op
        :y (if (= tgt :line)
             (yank-range! el (line-start s anchor) (inc (line-end s anchor)) true)
             (yank-range! el anchor tgt false))
        :d (if (= tgt :line) (delete-line! el) (delete-range! el anchor tgt false))
        :c (if (= tgt :line) (change-line! el) (change-range! el anchor tgt false))))))

;; ===== Visual mode =====
(defonce v-anchor* (atom nil))
(defn- visual-start! [^js el line?]
  (reset! v-anchor* (.-selectionStart el))
  (rf/dispatch [:evil/visual-on (if line? :line :char)])
  (if line?
    (let [s (.-value el) a @v-anchor*] (setrange! el (line-start s a) (inc (line-end s a))))
    (setrange! el @v-anchor* (.-selectionStart el))))
(defn- visual-update! [^js el]
  (let [mode @(rf/subscribe [:evil/mode]) v @(rf/subscribe [:evil/visual])]
    (when (= mode :visual)
      (let [s (.-value el) a @v-anchor* p (.-selectionStart el)]
        (if (:line? v)
          (setrange! el (line-start s (min a p)) (inc (line-end s (max a p))))
          (setrange! el a p))))))
(defn- visual-exit! [] (reset! v-anchor* nil) (rf/dispatch [:evil/visual-off]))

;; ===== gg helper =====
(defn handle-gg! [^js e ^js el]
  (when (= (.-key e) "g")
    (let [now (.now js/Date)]
      (if (< (- now @g-prev*) 350)
        (do (.preventDefault e)
            (goto-start! el)
            (when (= @(rf/subscribe [:evil/mode]) :visual) (visual-update! el))
            (reset! g-prev* 0))
        (reset! g-prev* now)))))

;; ===== Main key handler =====
(defn handle-key! [^js e ^js el]
  (let [mode @(rf/subscribe [:evil/mode]) k (.-key e) op @op* ro? (.-readOnly el)]
    (cond
      ;; mode switches
      (= k "Escape") (do (.preventDefault e) (reset! op* nil) (visual-exit!) (rf/dispatch [:evil/normal]))
      (and (= mode :normal) (= k "i")) (do (.preventDefault e) (reset! op* nil) (rf/dispatch [:evil/insert]))
      (and (= mode :normal) (= k "v")) (do (.preventDefault e) (visual-start! el false))
      (and (= mode :normal) (= k "V")) (do (.preventDefault e) (visual-start! el true))

      ;; operator-pending resolution
      (and (= mode :normal) op) (do (.preventDefault e) (apply-op-motion! el op k) (reset! op* nil))

      ;; Visual mode
      (= mode :visual)
      (case k
        ;; motions
        "h" (do (.preventDefault e) (move-left! el)  (visual-update! el))
        "l" (do (.preventDefault e) (move-right! el) (visual-update! el))
        "j" (do (.preventDefault e) (move-down! el)  (visual-update! el))
        "k" (do (.preventDefault e) (move-up! el)    (visual-update! el))
        "0" (do (.preventDefault e) (move-bol! el)   (visual-update! el))
        "$" (do (.preventDefault e) (move-eol! el)   (visual-update! el))
        "w" (do (.preventDefault e) (move-w! el)     (visual-update! el))
        "b" (do (.preventDefault e) (move-b! el)     (visual-update! el))
        "e" (do (.preventDefault e) (move-e! el)     (visual-update! el))
        "G" (do (.preventDefault e) (goto-end! el)   (visual-update! el))
        ;; ops on selection
        "y" (do (.preventDefault e)
                (let [s (.-selectionStart el) epos (.-selectionEnd el)
                      line? (get-in @(rf/subscribe [:evil/visual]) [:line?])
                      txt (.substring (.-value el) (min s epos) (max s epos))
                      txt' (if (and line? (not (.endsWith txt "\n"))) (str txt "\n") txt)]
                  (yank! txt' line?) (visual-exit!)))
        "d" (do (.preventDefault e) (when-not ro? (delete-range! el (.-selectionStart el) (.-selectionEnd el) (get-in @(rf/subscribe [:evil/visual]) [:line?]))) (visual-exit!))
        "c" (do (.preventDefault e) (when-not ro? (change-range! el (.-selectionStart el) (.-selectionEnd el) (get-in @(rf/subscribe [:evil/visual]) [:line?]))) (visual-exit!))
        nil)

      ;; Normal mode (start ops / motions / paste)
      (= mode :normal)
      (case k
        ;; start ops
        "y" (do (.preventDefault e) (reset! op* {:op :y :anchor (.-selectionStart el)}))
        "d" (do (.preventDefault e) (reset! op* {:op :d :anchor (.-selectionStart el)}))
        "c" (do (.preventDefault e) (reset! op* {:op :c :anchor (.-selectionStart el)}))
        ;; linewise shortcuts
        "Y" (do (.preventDefault e) (let [s (.-value el) p (.-selectionStart el)] (yank-range! el (line-start s p) (inc (line-end s p)) true)))
        "D" (do (.preventDefault e) (when-not ro? (let [s (.-value el) p (.-selectionStart el)] (delete-range! el p (line-end s p) false))))
        "C" (do (.preventDefault e) (when-not ro? (let [s (.-value el) p (.-selectionStart el)] (change-range! el p (line-end s p) false))))
        ;; paste
        "p" (do (.preventDefault e) (paste! el false))
        "P" (do (.preventDefault e) (paste! el true))
        ;; motions
        "h" (do (.preventDefault e) (move-left! el))
        "l" (do (.preventDefault e) (move-right! el))
        "j" (do (.preventDefault e) (move-down! el))
        "k" (do (.preventDefault e) (move-up! el))
        "0" (do (.preventDefault e) (move-bol! el))
        "$" (do (.preventDefault e) (move-eol! el))
        "w" (do (.preventDefault e) (move-w! el))
        "b" (do (.preventDefault e) (move-b! el))
        "e" (do (.preventDefault e) (move-e! el))
        "G" (do (.preventDefault e) (goto-end! el))
        nil)
      :else nil)))
```

---

## 2) `electron/preload.cljs` — add clipboard helpers

Append to your exposed API (or merge if you’ve already edited):

```clojure
(def clipboard (.-clipboard electron))

(.exposeInMainWorld contextBridge "native"
  #js { ;; ...existing methods...
       :clipWrite (fn [s] (.writeText clipboard s))
       :clipRead  (fn [] (.readText clipboard)) })
```

---

## 3) `src/app/buffers.cljs` — call both handlers on the textarea

Ensure your `text-buffer` textarea uses **both** handlers (gg + main):

```clojure
:on-keydown (fn [e]
              (evil/handle-gg! e @v*)
              (evil/handle-key! e @v*))
```

That’s it. With this compact `evil.cljs`, you get Visual, yank/paste, and delete/change across any text buffer while keeping the main scaffold slim.

# Part 3: Hot Reload, Buffer Management, and Persistent Workspaces (Compact)

This part builds on **Part 1 (Scaffold)** and **Part 2 (Evil/Visual/Yank/Delete/Change)**.

What you get:

* **Plugin hot reload** (auto + manual `SPC p r`).
* **Buffer management**: list/switch (`SPC b b`), kill (`SPC b d`), rename (`SPC b r`).
* **Persistent workspaces**: save/load named workspaces (`SPC w s`, `SPC w l`), auto‑save on exit, auto‑restore on start.

All snippets are **additions** or **replacements**; they avoid touching unrelated code.

---

## 0) `package.json` — add file watcher

```diff
  "devDependencies": {
    "electron": "^32.2.0",
    "electron-builder": "^24.13.3",
    "shadow-cljs": "^2.28.20",
    "npm-run-all": "^4.1.5",
    "cross-env": "^7.0.3",
+   "chokidar": "^3.6.0"
  }
```

---

## 1) `electron/main.cljs` — plugin watch + fs/state IPC helpers

```clojure
(ns electron.main
  (:require [cljs.nodejs :as nodejs]
            [goog.object :as gobj]))

(nodejs/enable-util-print!)

(def electron (js/require "electron"))
(def app (.-app electron))
(def BrowserWindow (.-BrowserWindow electron))
(def ipcMain (.-ipcMain electron))
(def path (js/require "path"))
(def fs (js/require "fs"))
(def chokidar (js/require "chokidar"))

(defonce win* (atom nil))
(defn user-data [] (.getPath app "userData"))
(defn plugin-dir [] (.join path (user-data) "plugins"))
(defn workspace-dir [] (.join path (user-data) "workspaces"))
(defn state-file [] (.join path (user-data) "state.json"))

(defn ensure-dir! [p] (when-not (.existsSync fs p) (.mkdirSync fs p #js {:recursive true})) p)

(defn list-plugin-manifests []
  (ensure-dir! (plugin-dir))
  (let [dir (plugin-dir) items (.readdirSync fs dir)]
    (->> items
         (map (fn [name]
                (let [m (.join path dir name "manifest.json")]
                  (when (.existsSync fs m)
                    (try
                      (let [txt (.readFileSync fs m "utf8")
                            data (js/JSON.parse txt)
                            entry (or (gobj/get data "entry") "dist/index.js")
                            url (str "file://" (.join path dir name entry))]
                        (clj->js {:id name :manifest data :url url}))
                      (catch :default _ nil))))))
         (filter identity)
         clj->js)))

(defn create-window []
  (let [preload (.join path (.cwd js/process) "dist" "preload.js")
        w (BrowserWindow. (clj->js {:width 1400 :height 900
                                    :title "OpenCode • Spacemacs UI"
                                    :webPreferences {:contextIsolation true
                                                     :nodeIntegration false
                                                     :preload preload}}))]
    (reset! win* w)
    (.loadURL w (str "file://" (.join path (.cwd js/process) "public" "index.html")))
    (.on w "closed" #(reset! win* nil))))

(defn register-ipc! []
  (.handle ipcMain "paths" (fn [_] (clj->js {:userData (user-data)
                                              :plugins (plugin-dir)
                                              :workspaces (workspace-dir)})))
  (.handle ipcMain "plugins:list" (fn [_] (list-plugin-manifests)))
  (.handle ipcMain "fs:readFile" (fn [_ p] (.readFileSync fs p "utf8")))
  (.handle ipcMain "fs:writeFile" (fn [_ p data]
                                     (ensure-dir! (.dirname path p))
                                     (.writeFileSync fs p data "utf8") true))
  (.handle ipcMain "state:read" (fn [_] (try (.readFileSync fs (state-file) "utf8") (catch :default _ nil))))
  (.handle ipcMain "state:write" (fn [_ data] (.writeFileSync fs (state-file) data "utf8") true)))

(defn start-plugin-watch! []
  (ensure-dir! (plugin-dir))
  (let [w (chokidar.watch (plugin-dir) #js {:ignoreInitial true})]
    (.on w "all" (fn [_ _] (when-let [W @win*] (.send (.-webContents W) "plugins:changed"))))))

(defn start []
  (.on app "window-all-closed" (fn [] (when (not= (.-platform js/process) "darwin") (.quit app))))
  (.whenReady app (fn []
                    (ensure-dir! (plugin-dir))
                    (ensure-dir! (workspace-dir))
                    (register-ipc!)
                    (start-plugin-watch!)
                    (create-window)
                    (.on app "activate" (fn [] (when (nil? @win*) (create-window)))))))
```

---

## 2) `electron/preload.cljs` — new bridge methods

```clojure
(ns electron.preload)

(def electron (js/require "electron"))
(def contextBridge (.-contextBridge electron))
(def ipcRenderer (.-ipcRenderer electron))
(def clipboard (.-clipboard electron))

(defn start []
  (.exposeInMainWorld contextBridge "native"
    #js {:paths (fn [] (.invoke ipcRenderer "paths"))
         :listPlugins (fn [] (.invoke ipcRenderer "plugins:list"))
         :readFile (fn [path] (.invoke ipcRenderer "fs:readFile" path))
         :writeFile (fn [path data] (.invoke ipcRenderer "fs:writeFile" path data))
         :readState (fn [] (.invoke ipcRenderer "state:read"))
         :writeState (fn [data] (.invoke ipcRenderer "state:write" data))
         :onPluginsChanged (fn [f] (.on ipcRenderer "plugins:changed" (fn [_] (f))))
         :clipWrite (fn [s] (.writeText clipboard s))
         :clipRead  (fn [] (.readText clipboard))
         :import (fn [url] (js/Promise.resolve (js/eval (str "import('" url "')"))))}))
```

---

## 3) `src/app/plugins.cljs` — add reload + watcher hook

```clojure
(ns app.plugins
  (:require [re-frame.core :as rf]
            [app.keymap :as km]
            [app.layout :as layout]))

(defonce registry* (atom {}))
(rf/reg-event-db :plugins/init (fn [db _] (assoc db :plugins {:loaded [] :errors []})))
(rf/reg-sub :plugins (fn [db _] (:plugins db)))

(defn- deactivate-all! []
  (doseq [[_ {:keys [deactivate]}] @registry*] (when (fn? deactivate) (deactivate)))
  (reset! registry* {}))

(defn- activate! [{:keys [id url manifest]}]
  (-> (.import (.-native js/window) (str url "?t=" (.now js/Date)))
      (.then (fn [mod]
               (let [ctx #js {:registerCommand (fn [id f meta] (km/register-command! (keyword id) f meta))
                               :registerKeymap (fn [tree] (km/register-keymap! (js->clj tree :keywordize-keys false)))
                               :registerView (fn [id rf] (layout/register-view! (keyword id) (fn [_] (rf))))}
                     deactivate (when (.-activate mod) (.activate mod ctx))]
                 (swap! registry* assoc id {:deactivate deactivate})
                 (rf/dispatch [:plugins/loaded id]))))
      (.catch (fn [e]
                (js/console.error "Plugin load failed" id e)
                (rf/dispatch [:plugins/error (str id) (str e)])))))

(rf/reg-event-db :plugins/loaded (fn [db [_ id]] (update-in db [:plugins :loaded] conj id)))
(rf/reg-event-db :plugins/error  (fn [db [_ id msg]] (update-in db [:plugins :errors] conj {:id id :msg msg})))

(rf/reg-event-fx :plugins/load-all
  (fn [_ _]
    (-> (.listPlugins (.-native js/window))
        (.then (fn [items] (doseq [p (js->clj items :keywordize-keys true)] (activate! p))))
        (.catch (fn [e] (js/console.error e)))) {}))

(rf/reg-event-fx :plugins/reload (fn [_ _] (deactivate-all!) {:dispatch [:plugins/load-all]}))

(defn install-watch! [] (.onPluginsChanged (.-native js/window) (fn [] (rf/dispatch [:plugins/reload]))))
```

*Keybinding (add in `app.core`)*:

```clojure
(km/register-keymap! {"SPC" {"p" {"r" {:cmd :plugins/reload}}}})
(km/register-command! :plugins/reload #(rf/dispatch [:plugins/reload]) {:title "Reload plugins"})
```

Call `(plugins/install-watch!)` once during boot.

---

## 4) `src/app/buffers.cljs` — buffer list/kill/rename

```clojure
(ns app.buffers
  (:require [re-frame.core :as rf]
            [reagent.core :as r]
            [app.evil :as evil]))

;; existing core omitted for brevity …

(rf/reg-event-db :buffer/kill
  (fn [db [_ id]]
    (let [db (-> db
                 (update-in [:buffers :by-id] dissoc id)
                 (update-in [:buffers :order] (fn [v] (vec (remove #(= % id) v)))))]
      (update-in db [:layout :root]
                 (fn rec [n]
                   (if (= (:type n) :leaf)
                     (if (and (= (:view n) :buffer) (= (get-in n [:params :buffer-id]) id))
                       (assoc n :view :empty :params nil)
                       n)
                     (-> n (update :a rec) (update :b rec))))))))

(rf/reg-event-db :buffer/rename (fn [db [_ id new-name]] (assoc-in db [:buffers :by-id id :name] new-name)))

(defn buffer-list []
  (let [order @(rf/subscribe [:buffers/order]) by-id @(rf/subscribe [:buffers/by-id])]
    [:div {:style {:height "100%" :display :flex :flexDirection :column}}
     [:div {:style {:fontSize 12 :padding "4px 8px" :background "#f5f5f5" :borderBottom "1px solid #eee"}} "Buffers"]
     [:div {:style {:flex 1 :overflow :auto}}
      (for [id order :let [{:keys [name]} (get by-id id)]]
        ^{:key (str id)}
        [:div {:class "hover:bg-gray-100" :style {:padding "6px 8px" :cursor :pointer}
               :on-click #(do (rf/dispatch [:layout/open-buffer id]) (rf/dispatch [:buffers/focus id]))}
         name])]]))
```

*Register view (e.g., in `app.core` or `app.layout` init):*

```clojure
(layout/register-view! :buffers (fn [_] [app.buffers/buffer-list]))
```

*Keybindings (in `app.core`):*

```clojure
(km/register-keymap! {"SPC" {"b" {"b" {:cmd :open/buffer-list}
                                   "d" {:cmd :kill/current-buffer}
                                   "r" {:cmd :rename/current-buffer}}}})
(km/register-command! :open/buffer-list #(layout/register-view! :popup (fn [_] [:div [app.buffers/buffer-list]])) {:title "Buffer list"})
(km/register-command! :kill/current-buffer #(when-let [id @(rf/subscribe [:buffers/focused])] (rf/dispatch [:buffer/kill id])) {:title "Kill buffer"})
(km/register-command! :rename/current-buffer #(when-let [id @(rf/subscribe [:buffers/focused])] (when-let [n (js/prompt "Rename buffer:")] (rf/dispatch [:buffer/rename id n]))) {:title "Rename buffer"})
```

---

## 5) `src/app/persist.cljs` — save/load workspaces + autosave

```clojure
(ns app.persist
  (:require [re-frame.core :as rf]))

(defn- write! [path s] (.writeFile (.-native js/window) path s))
(defn- read! [path] (.readFile (.-native js/window) path))
(defn- read-state! [] (.readState (.-native js/window)))
(defn- write-state! [s] (.writeState (.-native js/window) s))

(defn- workspace-path [name]
  (-> (.paths (.-native js/window))
      (.then (fn [ps] (str (.-workspaces ps) "/" name ".json")))))

(defn snapshot [db]
  (let [layout (:layout db)
        bufs (get-in db [:buffers :by-id])
        order (get-in db [:buffers :order])]
    {:layout layout :buffers bufs :order order}))

(rf/reg-event-fx :workspace/save
  (fn [{:keys [db]} [_ name]]
    (.then (workspace-path name)
           (fn [p]
             (write! p (js/JSON.stringify (clj->js {:name name :snapshot (snapshot db)})))))
    {}))

(rf/reg-event-fx :workspace/load
  (fn [_ [_ name]]
    (.then (workspace-path name)
           (fn [p]
             (.then (read! p)
                    (fn [txt]
                      (let [m (js->clj (js/JSON.parse txt) :keywordize-keys true)
                            {:keys [layout buffers order]} (:snapshot m)]
                        (rf/dispatch [:persist/apply layout buffers order]))))))
    {}))

(rf/reg-event-db :persist/apply
  (fn [db [_ layout buffers order]]
    (-> db (assoc :layout layout) (assoc-in [:buffers :by-id] buffers) (assoc-in [:buffers :order] order))))

(rf/reg-event-fx :persist/save
  (fn [{:keys [db]} _]
    (write-state! (js/JSON.stringify (clj->js {:snapshot (snapshot db)}))) {}))

(rf/reg-event-fx :persist/restore
  (fn [_ _]
    (.then (read-state!)
           (fn [txt]
             (when txt
               (let [m (js->clj (js/JSON.parse txt) :keywordize-keys true)
                     {:keys [layout buffers order]} (:snapshot m)]
                 (rf/dispatch [:persist/apply layout buffers order])))))
    {}))
```

*Keybindings (in `app.core`):*

```clojure
(km/register-keymap! {"SPC" {"w" {"s" {:cmd :workspace/save-prompt}
                                   "l" {:cmd :workspace/load-prompt}}}})
(km/register-command! :workspace/save-prompt #(when-let [n (js/prompt "Save workspace as:")] (rf/dispatch [:workspace/save n])) {:title "Save workspace"})
(km/register-command! :workspace/load-prompt #(when-let [n (js/prompt "Load workspace name:")] (rf/dispatch [:workspace/load n])) {:title "Load workspace"})
```

---

## 6) `src/app/core.cljs` — boot glue (watcher + persist)

```clojure
(ns app.core
  (:require [reagent.dom.client :as rdom]
            [re-frame.core :as rf]
            [app.state]
            [app.keymap :as km]
            [app.ui :as ui]
            [app.layout :as layout]
            [app.plugins :as plugins]
            [app.persist]))

(defonce root* (atom nil))

(defn ^:export start []
  (rf/dispatch-sync [:init])
  (rf/dispatch [:boot])

  ;; plugin watch + manual reload key
  (plugins/install-watch!)
  (km/register-keymap! {"SPC" {"p" {"r" {:cmd :plugins/reload}}}})
  (km/register-command! :plugins/reload #(rf/dispatch [:plugins/reload]) {:title "Reload plugins"})

  ;; persist: restore now, autosave on exit
  (rf/dispatch [:persist/restore])
  (.addEventListener js/window "beforeunload" (fn [_] (rf/dispatch [:persist/save])))

  ;; mount UI
  (let [el (.getElementById js/document "app")
        r (rdom/create-root el)]
    (reset! root* r)
    (rdom/render r [ui/root])))
```

---

## 7) Usage recap

* **Hot reload plugins**: edit files under the app’s `plugins/` dir → auto reload; manual: `SPC p r`.
* **Buffers**: `SPC b b` open list; click to focus/open. `SPC b d` kill current; `SPC b r` rename.
* **Workspaces**: `SPC w s` save (prompt), `SPC w l` load (prompt). Last session auto‑restores; changes auto‑save on exit.

> All buffer/workspace data is plain JSON in your userData folder. Easy to inspect, back up, or sync.
