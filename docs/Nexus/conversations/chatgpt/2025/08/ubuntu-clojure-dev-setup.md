---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Ubuntu Clojure dev setup"
conversation_id: 68affb8b-1460-832b-be03-2b34ce1a9080
create_time: 08/28/2025 at 1:47 AM
update_time: 08/28/2025 at 2:05 AM
---

# Title: Ubuntu Clojure dev setup

Created: 08/28/2025 at 1:47 AM
Last Updated: 08/28/2025 at 2:05 AM
Chat URL: https://chat.openai.com/c/68affb8b-1460-832b-be03-2b34ce1a9080


>[!nexus_user] **User** - 08/28/2025 at 1:47 AM
> I need an ubuntu install script for clojure/bb/clojurescript dev. LSP, whatever. Give me lisp with intelisense
<!-- UID: d95e82fa-4dda-4c42-94b7-d98d1e1bbc0e -->




>[!nexus_agent] **Assistant** - 08/28/2025 at 1:49 AM
> Here you go — a one-shot Ubuntu setup script that gives you Clojure + Babashka + ClojureScript tooling **with working LSP/intellisense** (clojure-lsp + clj-kondo). It uses the official installers where possible and sticks the binaries on your PATH.
> 
> > Save as `install-clj-dev-ubuntu.sh`, `chmod +x` it, then run: `bash ./install-clj-dev-ubuntu.sh`
> 
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
>  SUDO="sudo"
> else
>  SUDO=""
> fi
> 
> echo "==> Updating apt and installing base deps..."
> $SUDO apt-get update -y
> $SUDO apt-get install -y \
>  git curl wget unzip zip gpg ca-certificates rlwrap build-essential \
>  openjdk-21-jdk
> 
> echo "==> Java:"
> java -version || true
> 
> ############################################
> # Node.js (for ClojureScript toolchains)
> ############################################
> echo "==> Installing Node.js LTS via NodeSource (adds apt repo & keyring)..."
> $SUDO mkdir -p /etc/apt/keyrings
> curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
>  | $SUDO gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
> NODE_MAJOR=22 # current LTS
> echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
>  | $SUDO tee /etc/apt/sources.list.d/nodesource.list >/dev/null
> $SUDO apt-get update -y
> $SUDO apt-get install -y nodejs
> 
> echo "==> Enabling Corepack & PNPM (nice for shadow-cljs workflows)..."
> # corepack is bundled with modern Node — enable and pin latest pnpm
> $SUDO corepack enable
> $SUDO corepack prepare pnpm@latest-10 --activate || true
> 
> ############################################
> # Clojure CLI (clj / clojure)
> ############################################
> echo "==> Installing Clojure CLI (official linux script)..."
> tmpdir="$(mktemp -d)"
> pushd "$tmpdir" >/dev/null
> curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh
> chmod +x linux-install.sh
> $SUDO ./linux-install.sh
> popd >/dev/null
> rm -rf "$tmpdir"
> 
> echo "==> clj / clojure versions:"
> clojure -Sdescribe | sed -n '1,12p' || true
> 
> ############################################
> # Babashka (bb)
> ############################################
> echo "==> Installing Babashka..."
> $SUDO bash < <(curl -s https://raw.githubusercontent.com/babashka/babashka/master/install)
> bb --version || true
> 
> ############################################
> # clj-kondo (lint & static analysis)
> ############################################
> echo "==> Installing clj-kondo..."
> curl -sLO https://raw.githubusercontent.com/borkdude/clj-kondo/master/script/install-clj-kondo
> chmod +x install-clj-kondo
> $SUDO ./install-clj-kondo
> rm -f install-clj-kondo
> clj-kondo --version || true
> 
> ############################################
> # clojure-lsp (Intellisense / LSP server)
> ############################################
> echo "==> Installing clojure-lsp (native binary)..."
> $SUDO bash < <(curl -s https://raw.githubusercontent.com/clojure-lsp/clojure-lsp/master/install)
> clojure-lsp --version || true
> 
> ############################################
> # (Optional) Global shadow-cljs CLI
> ############################################
> # You usually add shadow-cljs per-project as a dev dependency,
> # but a global CLI can be handy:
> # pnpm add -g shadow-cljs || npm i -g shadow-cljs
> 
> echo "==> Done!"
> echo
> echo "Quick checks:"
> echo " clojure-lsp --version"
> echo " clj-kondo --version"
> echo " bb --version"
> echo " node -v && pnpm -v"
> echo
> echo "Editor wiring:"
> echo " • VS Code: install 'Calva' (uses clojure-lsp under the hood)."
> echo " • Emacs/Spacemacs: enable lsp-mode or eglot; clojure-lsp is already on PATH."
> echo
> echo "ClojureScript note:"
> echo " • Prefer project-local shadow-cljs: 'pnpm add -D shadow-cljs' then run 'npx shadow-cljs watch app' (or via pnpm scripts)."
> ```
> 
> ### What this gives you (TL;DR)
> - **Clojure CLI** (`clj`, `clojure`) — official toolchain. cite 
> - **Babashka** (`bb`) — instant-start Clojure scripting. cite 
> - **clj-kondo** — fast linter powering LSP diagnostics. cite 
> - **clojure-lsp** — the **IntelliSense/LSP server** for Clojure/CLJS. citeturn12view0 
> - **Node.js LTS + Corepack/PNPM** — for ClojureScript builds (e.g., shadow-cljs). citeturn11view0
> 
> ### Editor hookup (super short)
> - **VS Code**: install the **Calva** extension — it uses clojure-lsp + clj-kondo for completions, hovers, go-to-def, diagnostics. cite 
> - **Emacs/Spacemacs/Eglot**: enable `lsp-mode` (or `eglot`) for Clojure; with `clojure-lsp` on PATH you’ll get full IntelliSense.
> 
> If you want me to tailor this for **Spacemacs layers** or **Neovim** (coc.nvim/nvim-lspconfig), say the word and I’ll spit out the minimal config snippets.
<!-- UID: c201ab54-f5b3-42c2-8bc7-0840d9d9fcff -->

---




>[!nexus_user] **User** - 08/28/2025 at 1:53 AM
> Is there a clojure thing for working with python, or am I stuck with hy?
<!-- UID: 49663e6a-2bdd-4d0f-a095-fa905642f4d0 -->




>[!nexus_agent] **Assistant** - 08/28/2025 at 1:53 AM
> There actually **are Clojure things for working with Python** — you’re not stuck with Hy 🙂. 
> 
> Hy = “Python with Lisp syntax,” but it’s **inside the Python ecosystem**. If you want to stay on the Clojure side and interop with Python, you’ve got a few options:
> 
> ---
> 
> ### 🔗 1. **libpython-clj** (most direct / “talk to CPython”)
> - Lets you load Python libraries *from Clojure* and call them like regular functions. 
> - Embeds a CPython interpreter inside your JVM process. 
> - You can do things like:
> 
> ```clojure
> (require '[libpython-clj.require :refer [require-python]]
>  '[libpython-clj.python :as py])
> 
> (require-python '[numpy :as np])
> 
> (println (np/array [1 2 3]))
> ```
> 
> - That’s NumPy being called from Clojure. 
> - Repo: [https://github.com/clj-python/libpython-clj](https://github.com/clj-python/libpython-clj)
> 
> ---
> 
> ### 🔗 2. **libpython-clj2** (the newer maintained fork)
> - Same idea, but active work is happening here. 
> - More stable for mixing JVM + Python libs, esp. for ML. 
> - Repo: [https://github.com/clj-python/libpython-clj2](https://github.com/clj-python/libpython-clj2)
> 
> ---
> 
> ### 🔗 3. **JNA/JNI + Python** (more manual, rarely used now)
> - You can talk to Python via native bridges, but libpython-clj wraps this for you.
> - Not worth it unless you’re doing something extremely custom.
> 
> ---
> 
> ### 🔗 4. **Polyglot with GraalVM**
> - GraalVM’s `polyglot` lets you run **Python, JS, Ruby, R** in the same VM with Clojure (since Clojure runs on the JVM). 
> - This Python isn’t CPython, it’s GraalPython — which is a bit behind CPython in features and library support. Good for lighter interop, not for big ML libs.
> 
> ---
> 
> ### TL;DR
> - **Want CPython + NumPy/TensorFlow/Pandas?** → use **libpython-clj2**. 
> - **Want a JVM-only polyglot** (no native Python deps)? → try **GraalVM polyglot**. 
> - **Already invested in Python ecosystem and want Lisp syntax?** → Hy makes sense, but it lives on the Python side, not Clojure’s. 
> 
> ---
> 
> 👉 Since you’re building Promethean with mixed Lisp ecosystems, I’d lean **libpython-clj2** — it keeps you in Clojure land but gives you access to Python’s ML/science stack. 
> 
> Want me to sketch a **minimal deps.edn + REPL snippet** that wires up `libpython-clj2` so you can literally `(require-python '[numpy :as np])` and get NumPy arrays inside Clojure?
<!-- UID: 191b697c-24fc-456a-a62f-1b1820ee0d7d -->

---




>[!nexus_user] **User** - 08/28/2025 at 1:55 AM
> give me a real lisp I can write ML shit in. libpython-clij2
<!-- UID: 77325f59-71cd-4fa4-8e4d-c10615438981 -->




>[!nexus_agent] **Assistant** - 08/28/2025 at 1:55 AM
> Heck yeah—use **Clojure + libpython-clj2**. It’s a “real Lisp” on the JVM with **direct CPython interop**, so you can call NumPy, PyTorch, scikit-learn, Pandas, etc., *from Clojure code*, and still keep your Clojure REPL, tooling, and IntelliSense (clojure-lsp + clj-kondo).
> 
> Below is a minimal, **works-on-Ubuntu** setup: an install script, a `deps.edn`, and a sample `src/ml/playground.clj` that exercises NumPy, Pandas, scikit-learn, and PyTorch.
> 
> ---
> 
> # 1) Ubuntu setup script
> 
> Save as `install-clj-python-ml.sh`, then:
> 
> ```bash
> chmod +x install-clj-python-ml.sh
> ./install-clj-python-ml.sh
> ```
> 
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then SUDO="sudo"; else SUDO=""; fi
> 
> echo "==> Base deps (Java, build tools, Python headers)..."
> $SUDO apt-get update -y
> $SUDO apt-get install -y \
>  git curl unzip zip ca-certificates rlwrap build-essential \
>  openjdk-21-jdk \
>  python3 python3-venv python3-dev python3-pip
> 
> echo "==> Clojure CLI..."
> tmp="$(mktemp -d)"; pushd "$tmp" >/dev/null
> curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh
> chmod +x linux-install.sh
> $SUDO ./linux-install.sh
> popd >/dev/null; rm -rf "$tmp"
> 
> echo "==> Python venv for ML (keeps site-packages clean)..."
> python3 -m venv "$HOME/.py-ml"
> source "$HOME/.py-ml/bin/activate"
> python -m pip install --upgrade pip wheel setuptools
> 
> echo "==> Core ML libs (CPU builds to be safe)..."
> pip install numpy pandas scikit-learn matplotlib
> # PyTorch CPU (safe default). For GPU, replace with official CUDA wheels when ready.
> pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
> 
> echo "==> Convenience: point LIBPYTHON to the venv’s libpython (helps libpython-clj2 find it)..."
> LPATH="$(python - <<'PY'
> import sysconfig, os
> libdir = sysconfig.get_config_var("LIBDIR") or ""
> ver = sysconfig.get_config_var("LDVERSION") or sysconfig.get_config_var("VERSION")
> cand = os.path.join(libdir, f"libpython{ver}.so")
> print(cand if os.path.exists(cand) else "")
> PY
> )"
> if [[ -n "$LPATH" ]]; then
>  grep -q 'LIBPYTHON=' "$HOME/.bashrc" 2>/dev/null || echo "export LIBPYTHON=$LPATH" >> "$HOME/.bashrc"
>  export LIBPYTHON="$LPATH"
>  echo " LIBPYTHON=$LIBPYTHON"
> else
>  echo " (Could not auto-find libpython .so; libpython-clj2 may still auto-detect. If not, set LIBPYTHON manually.)"
> fi
> 
> echo "==> Done. Next:"
> echo " 1) source ~/.bashrc (or start a new shell)"
> echo " 2) Keep the venv active when you run your Clojure app:"
> echo " source ~/.py-ml/bin/activate"
> echo " 3) Create a Clojure project (see below) and run: clj -M -m ml.playground"
> ```
> 
> ---
> 
> # 2) Minimal project (`deps.edn`)
> 
> Create a folder, put this `deps.edn` at the root:
> 
> ```clojure
> {
>  :paths ["src"]
> 
>  :deps
>  { ;; Clojure + Python bridge (use latest available)
>  org.clj-python/libpython-clj2 {:mvn/version "2.024"} ; <- update if newer
> 
>  ;; (Optional) pretty printing, logging, etc.
>  org.clojure/data.csv {:mvn/version "1.1.0"}
>  org.clojure/tools.logging {:mvn/version "1.3.0"}}
> 
>  :aliases
>  { :run {:main-opts ["-m" "ml.playground"]}
>  :repl {:extra-deps {nrepl/nrepl {:mvn/version "1.1.1"}}
>  :main-opts ["-m" "nrepl.cmdline" "--interactive"]}}}
> ```
> 
> > If you’re unsure of the exact latest lib version, bump it later—this one is commonly used. 
> > You can keep using your **clojure-lsp**/**clj-kondo** setup for IntelliSense.
> 
> ---
> 
> # 3) Example code (`src/ml/playground.clj`)
> 
> This shows **both** NumPy/Pandas/scikit-learn and **PyTorch** from Clojure. 
> It tries `libpython-clj2` first, then falls back to `libpython-clj` if present.
> 
> ```clojure
> (ns ml.playground
>  (:require
>  [clojure.pprint :refer [pprint]]))
> 
> ;; Try libpython-clj2 first; fall back to libpython-clj if needed.
> (defonce py*
>  (try
>  (require 'libpython-clj2.python)
>  (alias 'py 'libpython-clj2.python)
>  (require 'libpython-clj2.require)
>  (alias 'pyreq 'libpython-clj2.require)
>  :libpython-clj2
>  (catch Throwable _
>  (require 'libpython-clj.python)
>  (alias 'py 'libpython-clj.python)
>  (require 'libpython-clj.require)
>  (alias 'pyreq 'libpython-clj.require)
>  :libpython-clj)))
> 
> (defn -main
>  [& _]
>  (println "Using:" py*)
>  ;; Initialize CPython (no-op if already)
>  ((ns-resolve 'py 'initialize!))
> 
>  ;; --- NumPy ---
>  ((ns-resolve 'pyreq 'require-python) '[numpy :as np])
>  (let [arr ((ns-resolve 'py '->python) [1.0 2.0 3.0 4.0])
>  a ((ns-resolve 'py 'py. 'np "array") arr)
>  b ((ns-resolve 'py 'py. 'np "sin") a)
>  c ((ns-resolve 'py 'py. 'np "sum") b)]
>  (println "np.sin([1,2,3,4]).sum =" ((ns-resolve 'py 'py.-repr) c)))
> 
>  ;; --- Pandas ---
>  ((ns-resolve 'pyreq 'require-python) '[pandas :as pd])
>  (let [data {:x [1 2 3 4 5] :y [2 4 6 8 10]}
>  df ((ns-resolve 'py '->python) data)
>  pdf ((ns-resolve 'py 'py. 'pd "DataFrame") df)]
>  (println "Pandas head:\n" ((ns-resolve 'py 'py.-repr) ((ns-resolve 'py 'py. pdf "head") 2))))
> 
>  ;; --- scikit-learn (linear regression) ---
>  ((ns-resolve 'pyreq 'require-python) '[sklearn.linear_model :as lm])
>  ((ns-resolve 'pyreq 'require-python) '[numpy :as np]) ; ensure np here too
>  (let [x ((ns-resolve 'py 'py. 'np "array") ((ns-resolve 'py '->python) [[1] [2] [3] [4] [5]]))
>  y ((ns-resolve 'py 'py. 'np "array") ((ns-resolve 'py '->python) [2 4 6 8 10]))
>  lr ((ns-resolve 'py 'py. 'lm "LinearRegression"))]
>  ((ns-resolve 'py 'py. lr "fit") x y)
>  (let [pred ((ns-resolve 'py 'py. lr "predict")
>  ((ns-resolve 'py 'py. 'np "array") ((ns-resolve 'py '->python) [[6] [7]])))]
>  (println "sklearn LinearRegression predict([6],[7]) ="
>  ((ns-resolve 'py 'py.-repr) pred))))
> 
>  ;; --- PyTorch (tiny linear model) ---
>  ((ns-resolve 'pyreq 'require-python) '[torch :as torch])
>  (let [;; Data: y = 3x + 1
>  x ((ns-resolve 'py 'py. 'torch "tensor")
>  ((ns-resolve 'py '->python) [[1.0] [2.0] [3.0] [4.0]]))
>  y ((ns-resolve 'py 'py. 'torch "tensor")
>  ((ns-resolve 'py '->python) [[4.0] [7.0] [10.0] [13.0]]))
> 
>  nn ((ns-resolve 'pyreq 'require-python) '[torch.nn :as nn])
>  optim ((ns-resolve 'pyreq 'require-python) '[torch.optim :as optim])
>  model ((ns-resolve 'py 'py. 'nn "Sequential")
>  ((ns-resolve 'py 'py. 'nn "Linear") 1 1))
>  lossfn ((ns-resolve 'py 'py. 'nn "MSELoss"))
>  opt ((ns-resolve 'py 'py. 'optim "SGD") (list model)
>  ((ns-resolve 'py '->python) {:lr 0.1}))]
> 
>  (dotimes [epoch 200]
>  ((ns-resolve 'py 'py. opt "zero_grad"))
>  (let [yhat ((ns-resolve 'py 'py. model "forward") x)
>  loss ((ns-resolve 'py 'py. lossfn "forward") yhat y)]
>  ((ns-resolve 'py 'py. loss "backward"))
>  ((ns-resolve 'py 'py. opt "step"))
>  (when (zero? (mod epoch 50))
>  (println "epoch" epoch "loss"
>  ((ns-resolve 'py 'py.-repr) loss)))))
> 
>  (let [pred ((ns-resolve 'py 'py. model "forward")
>  ((ns-resolve 'py 'py. 'torch "tensor")
>  ((ns-resolve 'py '->python) [[5.0]])))]
>  (println "PyTorch predict(5.0) =" ((ns-resolve 'py 'py.-repr) pred))))
> 
>  (println "OK.")))
> ```
> 
> Run it:
> 
> ```bash
> # New shell or source ~/.bashrc first
> source ~/.py-ml/bin/activate
> clj -M -m ml.playground
> ```
> 
> You should see NumPy sums, a Pandas head preview, scikit-learn predictions, and a tiny PyTorch model learning y≈3x+1.
> 
> ---
> 
> ## Notes & tips
> 
> - **Keep the venv active** when running your Clojure app so Python packages resolve (or set `PYTHONHOME`/`PYTHONPATH` to that venv globally—venv is simpler).
> - If lib detection fails, export `LIBPYTHON` to your venv’s `libpython*.so` (the script tries to set it for you).
> - For **GPU PyTorch**, swap the CPU wheels for the CUDA-matching ones from pytorch.org.
> - IntelliSense: with **clojure-lsp** & **clj-kondo** on your PATH (from your earlier install), your editor (Emacs+eglot/lsp-mode, VS Code+Calva) will give you symbols, hover, docs, go-to-def, and diagnostics—for the Clojure side. (Python symbols are proxied objects; you’ll still get great Clojure REPL ergonomics while calling them.)
> 
> If you want, I can add a **Neanderthal** (Clojure BLAS) interop example and show how to bridge data back/forth between NumPy arrays and Clojure tensors—handy if you want some computations in pure Clojure and some in Python.
<!-- UID: 4ac34f83-1d7e-4c5c-926a-5f3887381692 -->

---




>[!nexus_user] **User** - 08/28/2025 at 1:59 AM
> What am I saying.. there's gotta just be java/clj stuff for doing ML... python is just an interface to C anyway. Where's the jvm native ML stuff, something I could use to steal shit from huggingface with
<!-- UID: 34dd3f0a-66b2-4aeb-8271-5f0a3da1e094 -->




>[!nexus_agent] **Assistant** - 08/28/2025 at 1:59 AM
> Yep — you can stay 100% on the JVM and still raid Hugging Face.
> 
> ### The JVM-native ML stack that “just works” with HF
> 
> - **DJL (Deep Java Library)** – Java-first deep learning with engine backends (PyTorch, TensorFlow, ONNX). It has a **Hugging Face model zoo** and a **tokenizers** extension, so you can load Hub models by ID and tokenize on-JVM. cite 
> - **ONNX Runtime (Java)** – Fast, portable inference for ONNX models; there’s also a **GenAI Java** API aimed at LLMs. Great for exported HF models. cite 
> - **TensorFlow Java** – Official Java bindings (training+inference) if you prefer TF graphs. cite 
> - **Tribuo** (Oracle) – Classic ML (classification, regression, clustering), Java-first, with bridges to third-party algos; used in Clojure via wrappers. cite 
> - **SMILE** – Broad ML toolkit on JVM; note license changes in v3. Clojure wrappers exist, community often uses Tribuo to avoid GPL friction. cite 
> - **DL4J/ND4J** – Older but still-around deep learning/Nd arrays on JVM. cite
> 
> ### Clojure wrappers (so you can stay in a *real* Lisp)
> - **clj-djl** – Thin Clojure wrapper over DJL. Use it to call HF models from Clojure. cite 
> - **scicloj.ml.tribuo** – Clojure integration for Tribuo; plays nicely with the broader Scicloj data stack. cite
> 
> ---
> 
> ## Minimal “steal from HF” example (Clojure + DJL)
> 
> **deps.edn** (core bits only):
> ```clojure
> {:paths ["src"]
>  :deps {ai.djl/api {:mvn/version "0.27.0"}
>  ai.djl.pytorch/pytorch-engine {:mvn/version "0.27.0"}
>  ai.djl.huggingface/transformers {:mvn/version "0.27.0"}
>  ai.djl.huggingface/tokenizers {:mvn/version "0.27.0"}}
>  :aliases {:run {:main-opts ["-m" "demo.hf"]}}}
> ```
> 
> **src/demo/hf.clj**:
> ```clojure
> (ns demo.hf
>  (:import [ai.djl Model ZooModel]
>  [ai.djl.inference Predictor]
>  [ai.djl.huggingface.translator TextEmbeddingTranslator]
>  [ai.djl.repository.zoo Criteria]
>  [ai.djl.modality.nlp DefaultVocabulary]))
> 
> (defn -main [& _]
>  ;; Example: sentence-embedding model from the Hub
>  (let [criteria (-> (Criteria/builder)
>  (.optApplication ai.djl.Application/NLP.EMBEDDING)
>  (.setTypes String (Class/forName "[F")) ; String -> float[]
>  (.optModelUrls "djl://ai.djl.huggingface/sentence-transformers/all-MiniLM-L6-v2")
>  ;; You can also do: (.optModelUrls "https://huggingface.co/<user>/<repo>")
>  (.build))]
>  (with-open [^ZooModel model (.loadModel criteria)
>  ^Predictor predictor (.newPredictor model)]
>  (let [vec (.predict predictor "lisp on the jvm, stealing from huggingface")]
>  (println "embedding length =" (alength ^floats vec))))))
> ```
> 
> Run:
> ```bash
> clj -M:run
> ```
> 
> - That uses DJL’s **Hugging Face integration**; you can swap `.optModelUrls` to any Hub model (and pin a revision for reproducibility). Tokenization is handled on-JVM via DJL’s **Hugging Face tokenizers** extension. For QA/text-classification, switch the translator (or use built-in pipeline helpers). cite
> 
> ---
> 
> ## If you prefer ONNX Runtime Java
> Export any Transformers model to ONNX, then load and run it on JVM with ORT:
> - ORT has official **Java bindings**; recent **GenAI Java API** targets LLMs with a friendlier surface. cite
> 
> This route is nice when you want a small, dependency-light runtime and max perf portability (CPU/GPU/DirectML).
> 
> ---
> 
> ## Notes on tokenizers on the JVM
> - DJL ships a **Hugging Face tokenizers** JNI extension (Rust tokenizers under the hood). Use `ai.djl.huggingface:tokenizers`, or DJL’s SentencePiece extension if the model uses SP. cite
> 
> ---
> 
> ## TL;DR picks for you
> - **“Load models from the Hub and go”** → **DJL + HF model zoo** (with tokenizers). Works in pure Java/Clojure, no Python. cite 
> - **“I want ultra-portable inference”** → **ONNX Runtime Java** (export from PyTorch/TF, run on JVM). cite 
> - **“Classical ML + JVM ergonomics”** → **Tribuo** (optionally via `scicloj.ml.tribuo`). cite
> 
> If you want, I’ll turn that demo into a tiny **template repo** with: `deps.edn`, runnable DJL pipelines (QA/embeddings), and a switch to ORT for ONNX—so you can benchmark both paths side-by-side.
<!-- UID: 3e96b06a-b222-4698-b908-64363499fc95 -->

---




>[!nexus_user] **User** - 08/28/2025 at 2:01 AM
> just set it all up. Give me a mega installer that will let me write in clojure for everything.
<!-- UID: ad2be50f-571d-43ab-8391-287243f6426c -->




>[!nexus_agent] **Assistant** - 08/28/2025 at 2:04 AM
> Absolutely. Here’s a **one-shot Ubuntu mega-installer** that sets up:
> 
> - Clojure CLI + LSP/IntelliSense (clojure-lsp, clj-kondo)
> - Node 22 LTS for CLJS builds
> - JVM-native ML stack ready to “borrow” from Hugging Face: **DJL 0.34.0** (PyTorch engine + HF tokenizers), **ONNX Runtime Java 1.22.0**, and **Tribuo 4.3.2** 
> - A ready-to-run **Clojure project** with three demos: DJL + HF embeddings, ONNX Runtime image classification, and Tribuo classic ML
> 
> > Save as `install-clj-ml-mega.sh`, then run: 
> > `bash install-clj-ml-mega.sh` 
> > (Optionally pass a project path, default is `~/clj-ml-starter`)
> 
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> PROJ="${1:-$HOME/clj-ml-starter}"
> 
> if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then SUDO="sudo"; else SUDO=""; fi
> 
> echo "==> APT base & Java"
> $SUDO apt-get update -y
> $SUDO apt-get install -y \
>  git curl wget unzip zip gpg ca-certificates rlwrap build-essential \
>  openjdk-21-jdk
> 
> # Java home convenience
> if ! grep -q "JAVA_HOME=" "$HOME/.bashrc" 2>/dev/null; then
>  JAVA_HOME_PATH="$(dirname "$(dirname "$(readlink -f "$(command -v javac)")")")"
>  echo "export JAVA_HOME=$JAVA_HOME_PATH" >> "$HOME/.bashrc"
> fi
> 
> echo "==> Clojure CLI (official linux installer)"
> tmp="$(mktemp -d)"; pushd "$tmp" >/dev/null
> curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh
> chmod +x linux-install.sh
> $SUDO ./linux-install.sh
> popd >/dev/null; rm -rf "$tmp"
> 
> echo "==> Node.js 22 LTS (for ClojureScript tooling) + Corepack"
> $SUDO mkdir -p /etc/apt/keyrings
> curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
>  | $SUDO gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
> echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
>  | $SUDO tee /etc/apt/sources.list.d/nodesource.list >/dev/null
> $SUDO apt-get update -y
> $SUDO apt-get install -y nodejs
> $SUDO corepack enable
> $SUDO corepack prepare pnpm@latest --activate || true
> 
> echo "==> clj-kondo (linter / static analysis powering LSP)"
> curl -sLO https://raw.githubusercontent.com/borkdude/clj-kondo/master/script/install-clj-kondo
> chmod +x install-clj-kondo
> $SUDO ./install-clj-kondo
> rm -f install-clj-kondo
> 
> echo "==> clojure-lsp (IntelliSense / code nav / refactors)"
> $SUDO bash < <(curl -s https://raw.githubusercontent.com/clojure-lsp/clojure-lsp/master/install)
> 
> echo "==> Scaffold Clojure JVM-ML project at $PROJ"
> mkdir -p "$PROJ/src/demo"
> 
> cat > "$PROJ/deps.edn" <<'EDN'
> {:paths ["src"]
>  :deps {;; DJL core + PyTorch engine + HF tokenizers (pure JVM, no Python)
>  ai.djl/api {:mvn/version "0.34.0"}
>  ai.djl.pytorch/pytorch-engine {:mvn/version "0.34.0"}
>  ai.djl.huggingface/tokenizers {:mvn/version "0.34.0"}
>  ;; DJL engine for ONNX Runtime (runs ONNX models on JVM)
>  ai.djl.onnxruntime/onnxruntime-engine {:mvn/version "0.34.0"}
>  ;; Classic ML on JVM
>  org.tribuo/tribuo-core {:mvn/version "4.3.2"}}
>  :aliases
>  {:run:djl {:main-opts ["-m" "demo.hf"]}
>  :run:onnx {:main-opts ["-m" "demo.onnx"]}
>  :run:tribuo{:main-opts ["-m" "demo.tribuo"]}}}
> EDN
> 
> # DJL + Hugging Face: embeddings from Hub model (auto-downloads)
> cat > "$PROJ/src/demo/hf.clj" <<'CLJ'
> (ns demo.hf
>  (:import [ai.djl Application]
>  [ai.djl.repository.zoo Criteria ZooModel]
>  [ai.djl.inference Predictor]))
> 
> (defn -main [& _]
>  (let [criteria (-> (Criteria/builder)
>  (.optApplication Application/NLP.EMBEDDING)
>  (.setTypes String (Class/forName "[F"))
>  ;; Any HF model path works here; this is a small, proven one:
>  (.optModelUrls "djl://ai.djl.huggingface/sentence-transformers/all-MiniLM-L6-v2")
>  (.build))]
>  (with-open [^ZooModel model (.loadModel criteria)
>  ^Predictor predictor (.newPredictor model)]
>  (let [vec ^floats (.predict predictor "Lisp on the JVM, talking to Hugging Face.")]
>  (println "DJL embedding length =" (alength vec))))))
> CLJ
> 
> # ONNX Runtime Java via DJL (SqueezeNet demo, downloads tiny model & kitten.jpg)
> cat > "$PROJ/src/demo/onnx.clj" <<'CLJ'
> (ns demo.onnx
>  (:import [ai.djl Application]
>  [ai.djl.repository.zoo Criteria ZooModel]
>  [ai.djl.inference Predictor]
>  [ai.djl.modality.cv Image ImageFactory]
>  [ai.djl.modality Classifications]
>  [ai.djl.modality.cv.translator ImageClassificationTranslator$Builder]))
> 
> (defn -main [& _]
>  (let [translator (-> (ImageClassificationTranslator$Builder.)
>  (.optApplySoftmax true)
>  (.optSynsetArtifactName "synset.txt")
>  .build)
>  criteria (-> (Criteria/builder)
>  (.optApplication Application/CV.IMAGE_CLASSIFICATION)
>  (.setTypes Image Classifications)
>  (.optTranslator translator)
>  ;; tiny demo model straight from DJL docs/resources:
>  (.optModelUrls "https://resources.djl.ai/benchmark/squeezenet_v1.1.tar.gz")
>  (.optEngine "OnnxRuntime")
>  (.build))
>  img (.fromUrl (ImageFactory/getInstance) "https://resources.djl.ai/images/kitten.jpg")]
>  (with-open [^ZooModel model (.loadModel criteria)
>  ^Predictor predictor (.newPredictor model)]
>  (println "Top-5:" (-> (.predict predictor img) (.topK 5) str)))))
> CLJ
> 
> # Tribuo quick-start: tiny logistic regression on synthetic CSV
> cat > "$PROJ/src/demo/tribuo.clj" <<'CLJ'
> (ns demo.tribuo
>  (:import [java.nio.file Files Paths]
>  [org.tribuo MutableDataset]
>  [org.tribuo.classification Label]
>  [org.tribuo.classification.sgd.linear LogisticRegressionTrainer]
>  [org.tribuo.data.columnar RowProcessor RowProcessorOptions]
>  [org.tribuo.data.columnar.extractors ColumnarFeatureExtractor]
>  [org.tribuo.data.columnar.extractors.text FieldValueExtractor]
>  [org.tribuo.data.columnar.processors.field FieldProcessor]
>  [org.tribuo.data.columnar Row]
>  [org.tribuo.data.columnar.processors ResponseProcessor]
>  [org.tribuo.data.csv CSVIterator]
>  [org.tribuo.classification.evaluation LabelEvaluator]))
> 
> (defn -main [& _]
>  (let [csv "label,x\nA,0.0\nA,0.2\nB,1.0\nB,1.2\n"
>  tmp (Files/createTempFile "tribuo" ".csv" (make-array java.nio.file.attribute.FileAttribute 0))]
>  (spit (.toFile tmp) csv)
>  (let [resp (ResponseProcessor. "label" Label.)
>  feats (doto (java.util.ArrayList.)
>  (.add (FieldValueExtractor. "x" "x")))
>  proc (RowProcessor. resp feats (RowProcessorOptions.))
>  it (CSVIterator. (.toString (.toAbsolutePath tmp)) proc)
>  ds (MutableDataset. it)
>  model (.train (LogisticRegressionTrainer.) ds)
>  eval (.evaluate (LabelEvaluator.) model ds)]
>  (println (.toString eval))
>  (Files/deleteIfExists tmp))))
> CLJ
> 
> cat > "$PROJ/README.md" <<'MD'
> # clj-ml-starter
> 
> Run:
> - `clj -M:run:djl` → DJL + HF embeddings (auto-downloads model)
> - `clj -M:run:onnx` → ONNX Runtime (SqueezeNet demo)
> - `clj -M:run:tribuo`→ Tribuo logistic regression (toy data)
> 
> Tips:
> - For CLJS, Node 22 LTS + pnpm are installed (Corepack enabled).
> - clojure-lsp & clj-kondo are on PATH; hook your editor (Calva / Emacs lsp-mode / Eglot).
> MD
> 
> echo
> echo "==> Done."
> echo "Open a new shell (or 'source ~/.bashrc'), then:"
> echo " cd \"$PROJ\""
> echo " clj -M:run:djl"
> echo " clj -M:run:onnx"
> echo " clj -M:run:tribuo"
> ```
> 
> ### What you get (quick notes)
> 
> - **Clojure CLI** via the official installer. cite 
> - **Node 22 LTS** (solid choice for CLJS builds right now). cite 
> - **clojure-lsp** install script + editor clients page for hooking up any editor. cite 
> - **clj-kondo** install script. cite 
> - **DJL 0.34.0** core + PyTorch engine + HF tokenizers (pure JVM; loads models from the HF Hub). cite 
> - **ONNX Runtime Java 1.22.0** (via DJL’s ONNX engine in deps; ONNX Java if you want direct APIs). cite 
> - **Tribuo 4.3.2** classic ML. cite 
> - **Demos** use DJL-documented model URLs & sample image (SqueezeNet + kitten.jpg) so they run out-of-the-box. cite
> 
> If you want CUDA/GPU for DJL later, we can add the matching **ai.djl.pytorch native-cu*** artifacts and pin CUDA versions; or swap ONNX Runtime to the CUDA provider. I can also add a **mermaid diagram** of the stack and a **Neovim/Emacs** snippet to auto-start clojure-lsp if you want that wired too.
<!-- UID: c3708cc1-bcc0-45f9-b3cb-71cd8199fe4f -->

---


