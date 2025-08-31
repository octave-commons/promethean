---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Reduce MongoDB RAM Usage"
conversation_id: 6897f0b3-a7b8-8330-b374-730b3be73c0c
create_time: 08/09/2025 at 8:07 PM
update_time: 08/11/2025 at 4:32 PM
---

# Title: Reduce MongoDB RAM Usage

Created: 08/09/2025 at 8:07 PM
Last Updated: 08/11/2025 at 4:32 PM
Chat URL: https://chat.openai.com/c/6897f0b3-a7b8-8330-b374-730b3be73c0c


>[!nexus_user] **User** - 08/09/2025 at 8:06 PM
> Yo mongo db is taking up a lot of ram....
<!-- UID: e3584add-005e-45df-9033-9083d05d7b5c -->




>[!nexus_agent] **Assistant** - 08/09/2025 at 8:07 PM
> Yep, MongoDB loves RAM by design (WiredTiger will happily grab ~50% of system memory for its cache). You can tame it. Quick, practical checklist:
> 
> # Diagnose fast
> - See actual RSS vs cache:
>  ```bash
>  ps aux --sort -rss | head
>  pidof mongod | xargs -I{} pmap -x {} | tail -n1
>  mongosh --eval 'db.serverStatus().wiredTiger.cache'
>  ```
>  Look at `maximum bytes configured` (WT cache target) and `bytes currently in the cache`.
> 
> - Check workload symptoms:
>  ```bash
>  mongosh --eval 'db.adminCommand({serverStatus:1}).connections'
>  mongosh --eval 'db.currentOp().inprog.filter(op=>op.desc||op.ns).slice(0,10)'
>  mongosh --eval 'db.getProfilingStatus()'
>  ```
> 
> # Quick ways to reduce RAM
> 1. **Cap WiredTiger cache size** (most impactful)
>  - Edit `/etc/mongod.conf`:
>  ```yaml
>  storage:
>  wiredTiger:
>  engineConfig:
>  cacheSizeGB: 2 # pick a number that leaves RAM for everything else
>  ```
>  - Restart: `sudo systemctl restart mongod`
>  - Re-check with the `serverStatus().wiredTiger.cache` call.
> 
> 2. **Disable Transparent Huge Pages (THP)** (helps stability & sometimes RAM spikes)
>  - Immediate (non-persistent):
>  ```bash
>  echo never | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
>  echo never | sudo tee /sys/kernel/mm/transparent_hugepage/defrag
>  ```
>  - Persist via systemd or `/etc/default/grub` later if it helps.
> 
> 3. **Force big ops to spill to disk**
>  - In your code/CLI, use `allowDiskUse: true` on aggregations:
>  ```js
>  db.collection.aggregate(pipeline, { allowDiskUse: true })
>  ```
>  - Avoid massive in-memory sorts/group stages without indexes.
> 
> 4. **Right-size your data model**
>  - Create/verify indexes so queries touch fewer pages:
>  ```bash
>  mongosh --eval 'db.COL.getIndexes()'
>  mongosh --eval 'db.COL.validate({full:true})'
>  ```
>  - Consider **capped collections** for logs/metrics.
>  - Use **TTL indexes** to auto-expire old docs:
>  ```js
>  db.logs.createIndex({ ts: 1 }, { expireAfterSeconds: 7*24*3600 })
>  ```
> 
> 5. **Compression sanity**
>  - Default is Snappy; Zstd can reduce footprint on disk (cache may still hold compressed pages efficiently). For new collections:
>  ```js
>  db.createCollection("X", { storageEngine: { wiredTiger: { configString: "block_compressor=zstd" } } })
>  ```
>  (Changing existing collections requires `collMod` or dump/restore.)
> 
> 6. **Connection & cursor hygiene**
>  - Make sure clients close cursors; set reasonable `maxPoolSize` in drivers.
>  - Long-running change streams or idle cursors keep memory around.
> 
> 7. **OS page cache pressure (optional)**
>  - If OS cache is huge and you need to reclaim (temporary fix):
>  ```bash
>  sudo sync; echo 3 | sudo tee /proc/sys/vm/drop_caches
>  ```
>  (Disruptive for performance; only for emergencies.)
> 
> # If you want a target suggestion
> - On a dev laptop with 16 GB RAM: set `cacheSizeGB: 2–4`.
> - On a box with many other services (PM2, Node, Python): start at **2 GB**, watch swap/pressure with `htop` and `vmstat 1`.
> 
> If you paste your `serverStatus().wiredTiger.cache` output and your RAM size, I’ll tune a concrete value for `cacheSizeGB` and call out any red flags in the workload.
<!-- UID: 7a8a9543-f149-42c3-82b2-aa6fce42427d -->

---




>[!nexus_user] **User** - 08/09/2025 at 8:08 PM
> err@err-Stealth-16-AI-Studio-A1VGG:~$ ps aux --sort -rss | head
> pidof mongod | xargs -I{} pmap -x {} | tail -n1
> mongosh --eval 'db.serverStatus().wiredTiger.cache'
> USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
> mongodb 602263 8.1 34.8 17360388 11346124 ? Ssl 18:47 6:30 /usr/bin/mongod --config /etc/mongod.conf
> err 4449 27.1 3.7 2615364 1226872 ? Ssl 11:35 139:04 emacs --daemon
> err 678719 50.1 3.7 1220082432 1205796 ? Rl 19:57 5:14 /snap/obsidian/47/obsidian --type=renderer --enable-crash-reporter=f91b7d63-f636-401f-82d1-85380eb5f5e3,no_channel --user-data-dir=/home/err/snap/obsidian/47/.config/obsidian --standard-schemes=app --secure-schemes=app --fetch-schemes=app --streaming-schemes=app --code-cache-schemes=app --app-path=/snap/obsidian/47/resources/app.asar --no-sandbox --no-zygote --node-integration-in-worker --no-sandbox --lang=en-US --num-raster-threads=4 --enable-main-frame-before-activation --renderer-client-id=4 --time-ticks-at-unix-epoch=-1754757189819006 --launch-time-ticks=30266271807 --shared-files=v8_context_snapshot_data:100 --field-trial-handle=3,i,11688027716270687902,1750705611476851013,262144 --enable-features=SharedArrayBuffer --disable-features=SpareRendererForSitePerProcess --variations-seed-version
> err 132853 107 3.4 4732124 1133788 ? SLl 12:42 481:27 obs
> err 21487 6.5 2.1 3499248 684364 ? Sl 11:46 32:49 /snap/firefox/6626/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:44709 -prefMapHandle 1:274423 -jsInitHandle 2:242012 -parentBuildID 20250804234830 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {85167a8b-d476-4281-8d27-fc94596f0830} -parentPid 20318 -crashReporter 6 -crashHelperPid 20394 -greomni /snap/firefox/6626/usr/lib/firefox/omni.ja -appomni /snap/firefox/6626/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6626/usr/lib/firefox/browser 10 tab
> err 506011 4.9 2.0 4371588 681240 ? Sl 17:29 7:51 /snap/firefox/6626/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:44790 -prefMapHandle 1:274423 -jsInitHandle 2:242012 -parentBuildID 20250804234830 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {7e17fd13-3a42-4f41-9fa0-dc8147bcf5eb} -parentPid 20318 -crashReporter 6 -crashHelperPid 20394 -greomni /snap/firefox/6626/usr/lib/firefox/omni.ja -appomni /snap/firefox/6626/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6626/usr/lib/firefox/browser 68 tab
> err 20666 18.5 2.0 4089804 672772 ? Sl 11:46 93:00 /snap/firefox/6626/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:35526 -prefMapHandle 1:274423 -jsInitHandle 2:242012 -parentBuildID 20250804234830 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {5418a733-3a0b-447d-b1cb-10becf84f413} -parentPid 20318 -crashReporter 6 -crashHelperPid 20394 -greomni /snap/firefox/6626/usr/lib/firefox/omni.ja -appomni /snap/firefox/6626/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6626/usr/lib/firefox/browser 6 tab
> err 263443 1.7 1.8 1952556 603652 ? Ssl 13:53 6:28 PM2 v6.0.8: God Daemon (/home/err/.pm2)
> err 88307 0.2 1.5 1645536 518016 ? Sl 12:10 1:17 node /home/err/devel/promethean/services/ts/markdown-graph/node_modules/typescript/lib/tsserver.js
> 602263: /usr/bin/mongod --config /etc/mongod.conf
> {
>  'application thread time evicting (usecs)': 0,
>  'application threads page read from disk to cache count': 1944,
>  'application threads page read from disk to cache time (usecs)': 89316,
>  'application threads page write from cache to disk count': 33599,
>  'application threads page write from cache to disk time (usecs)': 1821893,
>  'bytes allocated for updates': 347249685,
>  'bytes belonging to page images in the cache': Long('12261571764'),
>  'bytes belonging to the history store table in the cache': 502,
>  'bytes currently in the cache': Long('12612824868'),
>  'bytes dirty in the cache cumulative': 97039442,
>  'bytes not belonging to page images in the cache': 351253104,
>  'bytes read into cache': 127110852,
>  'bytes written from cache': Long('40714132104'),
>  'checkpoint blocked page eviction': 207,
>  'checkpoint of history store file blocked non-history store page eviction': 0,
>  'eviction calls to get a page': 16649,
>  'eviction calls to get a page found queue empty': 2270,
>  'eviction calls to get a page found queue empty after locking': 831,
>  'eviction currently operating in aggressive mode': 0,
>  'eviction empty score': 0,
>  'eviction gave up due to detecting a disk value without a timestamp behind the last update on the chain': 0,
>  'eviction gave up due to detecting a tombstone without a timestamp ahead of the selected on disk update': 0,
>  'eviction gave up due to detecting a tombstone without a timestamp ahead of the selected on disk update after validating the update chain': 0,
>  'eviction gave up due to detecting update chain entries without timestamps after the selected on disk update': 0,
>  'eviction gave up due to needing to remove a record from the history store but checkpoint is running': 0,
>  'eviction gave up due to no progress being made': 0,
>  'eviction passes of a file': 2811,
>  'eviction server candidate queue empty when topping up': 1893,
>  'eviction server candidate queue not empty when topping up': 71473,
>  'eviction server evicting pages': 0,
>  'eviction server skips dirty pages during a running checkpoint': 1367,
>  'eviction server skips internal pages as it has an active child.': 41209,
>  'eviction server skips metadata pages with history': 0,
>  'eviction server skips pages that are written with transactions greater than the last running': 41,
>  'eviction server skips pages that previously failed eviction and likely will again': 0,
>  'eviction server skips pages that we do not want to evict': 3208514,
>  'eviction server skips tree that we do not want to evict': 59529,
>  'eviction server skips trees because there are too many active walks': 0,
>  'eviction server skips trees that are being checkpointed': 0,
>  'eviction server skips trees that are configured to stick in cache': 21243,
>  'eviction server skips trees that disable eviction': 0,
>  'eviction server skips trees that were not useful before': 293081,
>  'eviction server slept, because we did not make progress with eviction': 73033,
>  'eviction server unable to reach eviction goal': 0,
>  'eviction server waiting for a leaf page': 632962,
>  'eviction state': 32,
>  'eviction walk most recent sleeps for checkpoint handle gathering': 0,
>  'eviction walk target pages histogram - 0-9': 1846,
>  'eviction walk target pages histogram - 10-31': 457,
>  'eviction walk target pages histogram - 128 and higher': 0,
>  'eviction walk target pages histogram - 32-63': 52,
>  'eviction walk target pages histogram - 64-128': 456,
>  'eviction walk target pages reduced due to history store cache pressure': 0,
>  'eviction walk target strategy both clean and dirty pages': 44,
>  'eviction walk target strategy only clean pages': 292,
>  'eviction walk target strategy only dirty pages': 2475,
>  'eviction walks abandoned': 140,
>  'eviction walks gave up because they restarted their walk twice': 2124,
>  'eviction walks gave up because they saw too many pages and found no candidates': 315,
>  'eviction walks gave up because they saw too many pages and found too few candidates': 168,
>  'eviction walks random search fails to locate a page, results in a null position': 11,
>  'eviction walks reached end of tree': 4689,
>  'eviction walks restarted': 0,
>  'eviction walks started from root of tree': 2657,
>  'eviction walks started from saved location in tree': 154,
>  'eviction worker thread active': 4,
>  'eviction worker thread created': 0,
>  'eviction worker thread evicting pages': 13446,
>  'eviction worker thread removed': 0,
>  'eviction worker thread stable number': 0,
>  'files with active eviction walks': 0,
>  'files with new eviction walks started': 2565,
>  'force re-tuning of eviction workers once in a while': 0,
>  'forced eviction - do not retry count to evict pages selected to evict during reconciliation': 0,
>  'forced eviction - history store pages failed to evict while session has history store cursor open': 0,
>  'forced eviction - history store pages selected while session has history store cursor open': 0,
>  'forced eviction - history store pages successfully evicted while session has history store cursor open': 0,
>  'forced eviction - pages evicted that were clean count': 0,
>  'forced eviction - pages evicted that were clean time (usecs)': 0,
>  'forced eviction - pages evicted that were dirty count': 5322,
>  'forced eviction - pages evicted that were dirty time (usecs)': 515628,
>  'forced eviction - pages selected because of a large number of updates to a single item': 0,
>  'forced eviction - pages selected because of too many deleted items count': 0,
>  'forced eviction - pages selected count': 5329,
>  'forced eviction - pages selected unable to be evicted count': 7,
>  'forced eviction - pages selected unable to be evicted time': 6,
>  'hazard pointer blocked page eviction': 40,
>  'hazard pointer check calls': 18775,
>  'hazard pointer check entries walked': 25530,
>  'hazard pointer maximum array length': 2,
>  'history store table insert calls': 2,
>  'history store table insert calls that returned restart': 0,
>  'history store table max on-disk size': 0,
>  'history store table on-disk size': 12288,
>  'history store table reads': 0,
>  'history store table reads missed': 0,
>  'history store table reads requiring squashed modifies': 0,
>  'history store table resolved updates without timestamps that lose their durable timestamp': 0,
>  'history store table truncation by rollback to stable to remove an unstable update': 0,
>  'history store table truncation by rollback to stable to remove an update': 0,
>  'history store table truncation to remove all the keys of a btree': 0,
>  'history store table truncation to remove an update': 0,
>  'history store table truncation to remove range of updates due to an update without a timestamp on data page': 0,
>  'history store table truncation to remove range of updates due to key being removed from the data page during reconciliation': 0,
>  'history store table truncations that would have happened in non-dryrun mode': 0,
>  'history store table truncations to remove an unstable update that would have happened in non-dryrun mode': 0,
>  'history store table truncations to remove an update that would have happened in non-dryrun mode': 0,
>  'history store table updates without timestamps fixed up by reinserting with the fixed timestamp': 0,
>  'history store table writes requiring squashed modifies': 0,
>  'in-memory page passed criteria to be split': 16004,
>  'in-memory page splits': 5334,
>  'internal page split blocked its eviction': 0,
>  'internal pages evicted': 223,
>  'internal pages queued for eviction': 304,
>  'internal pages seen by eviction walk': 42949,
>  'internal pages seen by eviction walk that are already queued': 1212,
>  'internal pages split during eviction': 4,
>  'leaf pages split during eviction': 5453,
>  'locate a random in-mem ref by examining all entries on the root page': 348,
>  'maximum bytes configured': Long('16110321664'),
>  'maximum milliseconds spent at a single eviction': 8,
>  'maximum page size seen at eviction': 7609268,
>  'modified pages evicted': 11365,
>  'modified pages evicted by application threads': 0,
>  'multi-block reconciliation blocked whilst checkpoint is running': 54,
>  'operations timed out waiting for space in cache': 0,
>  'overflow keys on a multiblock row-store page blocked its eviction': 0,
>  'overflow pages read into cache': 0,
>  'page split during eviction deepened the tree': 0,
>  'page written requiring history store records': 2,
>  'pages considered for eviction that were brought in by pre-fetch': 0,
>  'pages currently held in the cache': 13875,
>  'pages dirtied due to obsolete time window by eviction': 0,
>  'pages evicted by application threads': 0,
>  'pages evicted in parallel with checkpoint': 936,
>  'pages queued for eviction': 13955,
>  'pages queued for eviction post lru sorting': 19779,
>  'pages queued for urgent eviction': 47,
>  'pages queued for urgent eviction during walk': 47,
>  'pages queued for urgent eviction from history store due to high dirty content': 0,
>  'pages read into cache': 1949,
>  'pages read into cache after truncate': 0,
>  'pages read into cache after truncate in prepare state': 0,
>  'pages read into cache by checkpoint': 0,
>  'pages removed from the ordinary queue to be queued for urgent eviction': 0,
>  'pages requested from the cache': 3385954,
>  'pages requested from the cache due to pre-fetch': 0,
>  'pages seen by eviction walk': 3301833,
>  'pages seen by eviction walk that are already queued': 33002,
>  'pages selected for eviction unable to be evicted': 1357,
>  'pages selected for eviction unable to be evicted because of active children on an internal page': 79,
>  'pages selected for eviction unable to be evicted because of failure in reconciliation': 54,
>  'pages selected for eviction unable to be evicted because of race between checkpoint and updates without timestamps': 0,
>  'pages walked for eviction': 6722229,
>  'pages written from cache': 52531,
>  'pages written requiring in-memory restoration': 2449,
>  'percentage overhead': 8,
>  'recent modification of a page blocked its eviction': 0,
>  'reverse splits performed': 0,
>  'reverse splits skipped because of VLCS namespace gap restrictions': 0,
>  'the number of times full update inserted to history store': 2,
>  'the number of times reverse modify inserted to history store': 0,
>  'total milliseconds spent inside reentrant history store evictions in a reconciliation': 0,
>  'tracked bytes belonging to internal pages in the cache': 2061354,
>  'tracked bytes belonging to leaf pages in the cache': Long('12610763514'),
>  'tracked dirty bytes in the cache': 283156498,
>  'tracked dirty internal page bytes in the cache': 582047,
>  'tracked dirty leaf page bytes in the cache': 282574450,
>  'tracked dirty pages in the cache': 45,
>  'uncommitted truncate blocked page eviction': 0,
>  'unmodified pages evicted': 6053
> }
> err@err-Stealth-16-AI-Studio-A1VGG:~$
> err@err-Stealth-16-AI-Studio-A1VGG:~$ mongosh --eval 'db.adminCommand({serverStatus:1}).connections'
> mongosh --eval 'db.currentOp().inprog.filter(op=>op.desc||op.ns).slice(0,10)'
> mongosh --eval 'db.getProfilingStatus()'
> {
>  current: 26,
>  available: 51174,
>  totalCreated: 1256,
>  rejected: 0,
>  active: 9,
>  queuedForEstablishment: Long('0'),
>  establishmentRateLimit: {
>  rejected: Long('0'),
>  exempted: Long('0'),
>  interruptedDueToClientDisconnect: Long('0')
>  },
>  threaded: 26,
>  exhaustIsMaster: Long('0'),
>  exhaustHello: Long('6'),
>  awaitingTopologyChanges: Long('7'),
>  loadBalanced: Long('0')
> }
> [
>  {
>  type: 'op',
>  host: 'err-Stealth-16-AI-Studio-A1VGG:27017',
>  desc: 'conn1258',
>  connectionId: 1258,
>  client: '127.0.0.1:58002',
>  appName: 'mongosh 2.5.6',
>  clientMetadata: {
>  application: { name: 'mongosh 2.5.6' },
>  driver: { name: 'nodejs|mongosh', version: '6.16.0|2.5.6' },
>  platform: 'Node.js v20.19.4, LE',
>  os: {
>  name: 'linux',
>  architecture: 'x64',
>  version: '3.10.0-327.22.2.el7.x86_64',
>  type: 'Linux'
>  }
>  },
>  active: true,
>  currentOpTime: '2025-08-09T20:08:26.830-05:00',
>  isFromUserConnection: true,
>  threaded: true,
>  opid: 1462274,
>  lsid: {
>  id: UUID('18095dfe-5728-4b6c-a1a1-bac0fc5f6941'),
>  uid: Binary.createFromBase64('47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=', 0)
>  },
>  secs_running: Long('0'),
>  microsecs_running: Long('1053'),
>  op: 'command',
>  ns: 'admin.$cmd.aggregate',
>  redacted: false,
>  command: {
>  aggregate: 1,
>  pipeline: [
>  {
>  '$currentOp': {
>  allUsers: true,
>  idleConnections: false,
>  truncateOps: false
>  }
>  },
>  { '$match': {} }
>  ],
>  cursor: {},
>  lsid: { id: UUID('18095dfe-5728-4b6c-a1a1-bac0fc5f6941') },
>  '$db': 'admin'
>  },
>  queryFramework: 'classic',
>  numYields: 0,
>  queues: {
>  ingress: { admissions: 1, totalTimeQueuedMicros: Long('0') },
>  execution: { admissions: 0, totalTimeQueuedMicros: Long('0') }
>  },
>  currentQueue: null,
>  locks: {},
>  waitingForLock: false,
>  lockStats: {},
>  waitingForFlowControl: false,
>  flowControlStats: {}
>  },
>  {
>  type: 'op',
>  host: 'err-Stealth-16-AI-Studio-A1VGG:27017',
>  desc: 'conn22',
>  connectionId: 22,
>  client: '127.0.0.1:55290',
>  clientMetadata: {
>  driver: { name: 'nodejs', version: '6.18.0' },
>  platform: 'Node.js v22.18.0, LE',
>  os: {
>  name: 'linux',
>  architecture: 'x64',
>  version: '6.14.0-27-generic',
>  type: 'Linux'
>  }
>  },
>  active: true,
>  currentOpTime: '2025-08-09T20:08:26.830-05:00',
>  isFromUserConnection: true,
>  threaded: true,
>  opid: 35299,
>  secs_running: Long('1'),
>  microsecs_running: Long('1045554'),
>  op: 'command',
>  ns: 'admin.$cmd',
>  redacted: false,
>  command: {
>  hello: 1,
>  maxAwaitTimeMS: 10000,
>  topologyVersion: {
>  processId: ObjectId('6897de27eaad69ff4d4ded38'),
>  counter: Long('0')
>  },
>  '$db': 'admin'
>  },
>  numYields: 0,
>  queues: {
>  ingress: { admissions: 1, totalTimeQueuedMicros: Long('0') },
>  execution: { admissions: 0, totalTimeQueuedMicros: Long('0') }
>  },
>  currentQueue: null,
>  locks: {},
>  waitingForLock: false,
>  lockStats: {},
>  waitingForFlowControl: false,
>  flowControlStats: {}
>  },
>  {
>  type: 'op',
>  host: 'err-Stealth-16-AI-Studio-A1VGG:27017',
>  desc: 'conn851',
>  connectionId: 851,
>  client: '127.0.0.1:43500',
>  clientMetadata: {
>  driver: { name: 'PyMongo|c', version: '4.13.2' },
>  os: {
>  type: 'Linux',
>  name: 'Linux',
>  architecture: 'x86_64',
>  version: '6.14.0-27-generic'
>  },
>  platform: 'CPython 3.12.1.final.0'
>  },
>  active: true,
>  currentOpTime: '2025-08-09T20:08:26.830-05:00',
>  isFromUserConnection: true,
>  threaded: true,
>  opid: 995480,
>  secs_running: Long('2'),
>  microsecs_running: Long('2883521'),
>  op: 'command',
>  ns: 'admin.$cmd',
>  redacted: false,
>  command: {
>  hello: 1,
>  topologyVersion: {
>  processId: ObjectId('6897de27eaad69ff4d4ded38'),
>  counter: Long('0')
>  },
>  maxAwaitTimeMS: 10000,
>  '$db': 'admin'
>  },
>  numYields: 0,
>  queues: {
>  ingress: { admissions: 1, totalTimeQueuedMicros: Long('0') },
>  execution: { admissions: 0, totalTimeQueuedMicros: Long('0') }
>  },
>  currentQueue: null,
>  locks: {},
>  waitingForLock: false,
>  lockStats: {},
>  waitingForFlowControl: false,
>  flowControlStats: {}
>  },
>  {
>  type: 'op',
>  host: 'err-Stealth-16-AI-Studio-A1VGG:27017',
>  desc: 'conn861',
>  connectionId: 861,
>  client: '127.0.0.1:38320',
>  clientMetadata: {
>  driver: { name: 'nodejs', version: '6.18.0' },
>  platform: 'Node.js v22.18.0, LE',
>  os: {
>  name: 'linux',
>  architecture: 'x64',
>  version: '6.14.0-27-generic',
>  type: 'Linux'
>  }
>  },
>  active: true,
>  currentOpTime: '2025-08-09T20:08:26.830-05:00',
>  isFromUserConnection: true,
>  threaded: true,
>  opid: 1006741,
>  secs_running: Long('6'),
>  microsecs_running: Long('6217537'),
>  op: 'command',
>  ns: 'admin.$cmd',
>  redacted: false,
>  command: {
>  hello: 1,
>  maxAwaitTimeMS: 10000,
>  topologyVersion: {
>  processId: ObjectId('6897de27eaad69ff4d4ded38'),
>  counter: Long('0')
>  },
>  '$db': 'admin'
>  },
>  numYields: 0,
>  queues: {
>  ingress: { admissions: 1, totalTimeQueuedMicros: Long('0') },
>  execution: { admissions: 0, totalTimeQueuedMicros: Long('0') }
>  },
>  currentQueue: null,
>  locks: {},
>  waitingForLock: false,
>  lockStats: {},
>  waitingForFlowControl: false,
>  flowControlStats: {}
>  },
>  {
>  type: 'op',
>  host: 'err-Stealth-16-AI-Studio-A1VGG:27017',
>  desc: 'conn15',
>  connectionId: 15,
>  client: '127.0.0.1:55220',
>  clientMetadata: {
>  driver: { name: 'PyMongo|c', version: '4.13.2' },
>  os: {
>  type: 'Linux',
>  name: 'Linux',
>  architecture: 'x86_64',
>  version: '6.14.0-27-generic'
>  },
>  platform: 'CPython 3.12.1.final.0'
>  },
>  active: true,
>  currentOpTime: '2025-08-09T20:08:26.830-05:00',
>  isFromUserConnection: true,
>  threaded: true,
>  opid: 28131,
>  secs_running: Long('4'),
>  microsecs_running: Long('4409890'),
>  op: 'command',
>  ns: 'admin.$cmd',
>  redacted: false,
>  command: {
>  hello: 1,
>  topologyVersion: {
>  processId: ObjectId('6897de27eaad69ff4d4ded38'),
>  counter: Long('0')
>  },
>  maxAwaitTimeMS: 10000,
>  '$db': 'admin'
>  },
>  numYields: 0,
>  queues: {
>  ingress: { admissions: 1, totalTimeQueuedMicros: Long('0') },
>  execution: { admissions: 0, totalTimeQueuedMicros: Long('0') }
>  },
>  currentQueue: null,
>  locks: {},
>  waitingForLock: false,
>  lockStats: {},
>  waitingForFlowControl: false,
>  flowControlStats: {}
>  },
>  {
>  type: 'op',
>  host: 'err-Stealth-16-AI-Studio-A1VGG:27017',
>  desc: 'conn866',
>  connectionId: 866,
>  client: '127.0.0.1:38370',
>  clientMetadata: {
>  driver: { name: 'nodejs', version: '6.18.0' },
>  platform: 'Node.js v22.18.0, LE',
>  os: {
>  name: 'linux',
>  architecture: 'x64',
>  version: '6.14.0-27-generic',
>  type: 'Linux'
>  }
>  },
>  active: true,
>  currentOpTime: '2025-08-09T20:08:26.830-05:00',
>  isFromUserConnection: true,
>  threaded: true,
>  opid: 1011861,
>  secs_running: Long('2'),
>  microsecs_running: Long('2660514'),
>  op: 'command',
>  ns: 'admin.$cmd',
>  redacted: false,
>  command: {
>  hello: 1,
>  maxAwaitTimeMS: 10000,
>  topologyVersion: {
>  processId: ObjectId('6897de27eaad69ff4d4ded38'),
>  counter: Long('0')
>  },
>  '$db': 'admin'
>  },
>  numYields: 0,
>  queues: {
>  ingress: { admissions: 1, totalTimeQueuedMicros: Long('0') },
>  execution: { admissions: 0, totalTimeQueuedMicros: Long('0') }
>  },
>  currentQueue: null,
>  locks: {},
>  waitingForLock: false,
>  lockStats: {},
>  waitingForFlowControl: false,
>  flowControlStats: {}
>  },
>  {
>  type: 'op',
>  host: 'err-Stealth-16-AI-Studio-A1VGG:27017',
>  desc: 'conn882',
>  connectionId: 882,
>  client: '127.0.0.1:41668',
>  clientMetadata: {
>  driver: { name: 'nodejs', version: '6.18.0' },
>  platform: 'Node.js v22.18.0, LE',
>  os: {
>  name: 'linux',
>  architecture: 'x64',
>  version: '6.14.0-27-generic',
>  type: 'Linux'
>  }
>  },
>  active: true,
>  currentOpTime: '2025-08-09T20:08:26.830-05:00',
>  isFromUserConnection: true,
>  threaded: true,
>  opid: 1029265,
>  secs_running: Long('3'),
>  microsecs_running: Long('3216617'),
>  op: 'command',
>  ns: 'admin.$cmd',
>  redacted: false,
>  command: {
>  hello: 1,
>  maxAwaitTimeMS: 10000,
>  topologyVersion: {
>  processId: ObjectId('6897de27eaad69ff4d4ded38'),
>  counter: Long('0')
>  },
>  '$db': 'admin'
>  },
>  numYields: 0,
>  queues: {
>  ingress: { admissions: 1, totalTimeQueuedMicros: Long('0') },
>  execution: { admissions: 0, totalTimeQueuedMicros: Long('0') }
>  },
>  currentQueue: null,
>  locks: {},
>  waitingForLock: false,
>  lockStats: {},
>  waitingForFlowControl: false,
>  flowControlStats: {}
>  },
>  {
>  type: 'op',
>  host: 'err-Stealth-16-AI-Studio-A1VGG:27017',
>  desc: 'Checkpointer',
>  active: true,
>  currentOpTime: '2025-08-09T20:08:26.830-05:00',
>  isFromUserConnection: false,
>  opid: 4176,
>  op: 'none',
>  ns: '',
>  redacted: false,
>  command: {},
>  numYields: 0,
>  queues: {
>  ingress: { admissions: 0, totalTimeQueuedMicros: Long('0') },
>  execution: { admissions: 0, totalTimeQueuedMicros: Long('0') }
>  },
>  currentQueue: null,
>  locks: {},
>  waitingForLock: false,
>  lockStats: {},
>  waitingForFlowControl: false,
>  flowControlStats: {}
>  },
>  {
>  type: 'op',
>  host: 'err-Stealth-16-AI-Studio-A1VGG:27017',
>  desc: 'JournalFlusher',
>  active: true,
>  currentOpTime: '2025-08-09T20:08:26.830-05:00',
>  isFromUserConnection: false,
>  opid: 3072,
>  op: 'none',
>  ns: '',
>  redacted: false,
>  command: {},
>  numYields: 0,
>  queues: {
>  ingress: { admissions: 0, totalTimeQueuedMicros: Long('0') },
>  execution: { admissions: 0, totalTimeQueuedMicros: Long('0') }
>  },
>  currentQueue: null,
>  locks: {},
>  waitingForLock: false,
>  lockStats: {},
>  waitingForFlowControl: false,
>  flowControlStats: {}
>  }
> ]
> { was: 0, slowms: 100, sampleRate: 1, ok: 1 }
<!-- UID: 30e3c9aa-435b-463c-b2cb-38f8abb3f27b -->




>[!nexus_agent] **Assistant** - 08/09/2025 at 8:08 PM
> Nice—those numbers tell the story.
> 
> - **WT cache target:** `maximum bytes configured: 16110321664` ≈ **15.0 GB**
> - **WT cache in use:** `bytes currently in the cache: 12612824868` ≈ **11.7 GB**
> - **Process RSS:** ~**10.8–11.3 GB**
> 
> So MongoDB is doing exactly what it’s designed to do: eat RAM. Let’s cap it.
> 
> # Do this
> 1. **Pin the WiredTiger cache** (biggest win)
>  ```bash
>  # /etc/mongod.conf
>  storage:
>  wiredTiger:
>  engineConfig:
>  cacheSizeGB: 2 # try 2 GB on a dev laptop; 4 GB if you need more perf
>  ```
>  Then:
>  ```bash
>  sudo systemctl restart mongod
>  mongosh --eval 'db.serverStatus().wiredTiger.cache'
>  ```
>  You should see `maximum bytes configured` drop to ~2–4 GB.
> 
> 2. **(Good hygiene) Disable Transparent Huge Pages**
>  ```bash
>  echo never | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
>  echo never | sudo tee /sys/kernel/mm/transparent_hugepage/defrag
>  ```
>  Make it persistent later if it helps.
> 
> 3. **(Optional) Lower swap aggressiveness**
>  ```bash
>  echo 1 | sudo tee /proc/sys/vm/swappiness
>  # persist via /etc/sysctl.d/99-mongo.conf -> vm.swappiness=1
>  ```
> 
> # Quick reads from your dump
> - Connections are tame: `current: 26`, `active: 9`. Not a leak.
> - Eviction is working; no “unable to reach eviction goal” issues.
> - Your ~15 GB default cache target implies the box likely has ~32 GB RAM (Mongo defaults to ~50%). That’s why it’s crowding your Emacs/OBS/Obsidian stack.
> 
> # If you want extra guardrails
> You can also hard-cap with systemd cgroups (last resort—OOM risk if too tight):
> ```ini
> # /etc/systemd/system/mongod.service.d/override.conf
> [Service]
> MemoryMax=6G
> ```
> Then `sudo systemctl daemon-reload && sudo systemctl restart mongod`.
> 
> ---
> 
> If you set `cacheSizeGB` to **2 GB**, run the `serverStatus().wiredTiger.cache` again and paste the top lines—I'll sanity-check the new target and make sure eviction stays healthy.
<!-- UID: 23e6ad8b-2ce9-4fab-9bfa-69d22c0aea4c -->

---


