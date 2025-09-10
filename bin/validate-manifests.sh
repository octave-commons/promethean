#!/usr/bin/env bash
set -euo pipefail

# 1) non-string dep specs (the pnpm .startsWith crash)
find . -name package.json -print0 | xargs -0 jq -e '
  def bad(k):
    (.[k] // {}) | to_entries[]
    | select(.value|type!="string")
    | error("Non-string in " + k + " for " + .key + " in " + input_filename);
  bad("dependencies"), bad("devDependencies"),
  bad("optionalDependencies"), bad("peerDependencies")
' >/dev/null

# 2) overrides location & shape: only allowed at workspace root, values must be strings
root_pkg="$(git rev-parse --show-toplevel 2>/dev/null || pwd)/package.json"
# any overrides in non-root packages?
rg -n --glob '!package.json' -g '**/package.json' '"overrides"\s*:\s*\{' >/dev/null && {
  echo "Error: 'overrides' found outside root package.json" >&2; rg -n -g '**/package.json' '"overrides"\s*:\s*\{'; exit 1; }

# nested maps inside overrides (e.g., { "jsdom": { "tough-cookie": "..." } })
jq -e '
  .pnpm?.overrides as $o
  | if $o == null then empty else
      ($o | to_entries[] | select(.value|type!="string"))
      | error("Nested object under pnpm.overrides in " + input_filename)
    end
' "$root_pkg" >/dev/null

# 3) duplicate keys inside a single JSON (catches copy/paste errors)
# jq trick: explode and count repeated keys at the top level & key sub-objects we care about
dup_keys=$(
  awk 'BEGIN{FS="";} {print} END{}' </dev/null >/dev/null 2>&1 # noop to keep pipefail happy
  node -e '
    const fs=require("fs"); const path=require("path");
    const glob=require("glob");
    function dupes(obj){
      const keys=Object.keys(obj);
      const seen=new Set(), dups=new Set();
      for(const k of keys){ if(seen.has(k)) dups.add(k); else seen.add(k); }
      return [...dups];
    }
    let bad=false;
    for(const file of glob.sync("**/package.json",{ignore:["**/node_modules/**"]})){
      const raw=fs.readFileSync(file,"utf8");
      // detect dupes by manual scan (JSON.parse would collapse them)
      const topKeys=[]; let depth=0, inStr=false, esc=false, key="", readingKey=false;
      for(let i=0;i<raw.length;i++){
        const c=raw[i];
        if(inStr){ if(esc){esc=false;} else if(c==="\\"){esc=true;} else if(c===\'"\'){inStr=false;} continue; }
        if(c===\'"\'){inStr=true; key=""; readingKey=true; continue;}
        if(readingKey){
          if(c===\'"\'){readingKey=false;}
          else key+=c;
          continue;
        }
        if(c==="{"){ depth++; }
        if(c==="}"){ depth--; }
        if(c===":" && depth===1 && key){ topKeys.push(key); key=""; }
      }
      const d = new Set(topKeys.filter((k,i)=>topKeys.indexOf(k)!==i));
      if(d.size){ bad=true; console.error(`Duplicate top-level keys in ${file}: ${[...d].join(", ")}`); }
    }
    process.exit(bad?1:0);
  ' 2>&1
)
[ -n "${dup_keys:-}" ] && { echo "$dup_keys" >&2; exit 1; }

echo "OK: package.json manifests look sane."
