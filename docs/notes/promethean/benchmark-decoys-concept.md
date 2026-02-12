Yeah — **decoys** are the “wrong tools” you *intentionally* include in the tool list for a case, so the model has to **choose**, not just “use any tool”.

They turn a benchmark from *“can it tool-call at all?”* into *“can it pick the right tool under pressure?”*.

---

## What a decoy is (in this benchmark)

A case can optionally include:

```clj
{:tools ["add" "mul" "search_web" "sum" "calculator"]}
```

That means: **only these tools** are exposed to the model for that case.

So if the correct answer requires `mul`, the others are **decoys**.

---

## Why decoys matter

Without decoys, you’re mostly measuring:

* *does the model tool-call?*
* *does it format tool args correctly?*

With decoys, you measure:

* ✅ **tool selection accuracy**
* ✅ resistance to “call a generic helper tool”
* ✅ robustness under ambiguity
* ✅ ability to avoid wasting calls

---

## Good decoy categories

### 1) Same-domain decoys (hard)

Tools that *look* relevant but aren’t correct.

Example: math prompt

* correct: `mul`
* decoys: `add`, `sub`, `pow`, `eval_expression`

These force the model to understand the task, not just “math ⇒ any math tool”.

---

### 2) “Too powerful” decoys (very hard)

Tools that can solve *anything* but shouldn’t be used.

Examples:

* `search_web`
* `general_reasoner`
* `code_interpreter`
* `ask_user`

These expose *bad habits*: models calling a universal tool instead of the correct specialized one.

---

### 3) Nearly-identical tools (evil)

Tools whose names/descriptions overlap:

* `get_weather`
* `weather_forecast`
* `current_temperature`
* `weather_by_zip`

This tests reading tool schemas + picking the most precise match.

---

### 4) Argument-shape traps

Decoy tool expects a similar schema but different meaning:

* correct: `get_stock_quote {:ticker "AAPL"}`
* decoy: `get_crypto_price {:symbol "AAPL"}`

This catches “pattern matching” behavior.

---

### 5) Irrelevant noise (easy but useful)

Throw in 2–4 unrelated tools to simulate real environments:

* `create_file`
* `send_email`
* `summarize_text`

This tests *not tool-calling impulsively*.

---

## Example case with decoys (tool-choice benchmark)

```clj
{:id "choice.mul.decoy"
 :prompt "Compute 7 times 9. Use tools if available."
 :tools ["add" "mul" "search_web" "sum"]
 :expect {:choose {:tool "mul"
                   :arguments-subset {:a 7 :b 9}
                   :policy :best
                   :wrong_first_penalty 0.70
                   :extra_calls_penalty 0.80}
          :no_extras true
          :final {:contains "63"}}}
```

This asserts:

* it should pick `mul`
* don’t call some other tool first (`wrong_first_penalty`)
* don’t spam extra calls (`extra_calls_penalty` / `:no_extras`)

---

## How to design decoy sets

A good rule of thumb:

* **2 “same-domain” decoys**
* **1 “too powerful” decoy**
* **1 irrelevant tool**
* **+ the correct tool**

So ~5 tools per case feels like “real life” without being chaotic.

---

## “Decoy pressure” dial (difficulty knob)

You can scale difficulty by growing the tool list:

| difficulty | tools per case | decoy type              |
| ---------- | -------------: | ----------------------- |
| easy       |            3–4 | irrelevant + 1 similar  |
| normal     |            5–7 | 2 similar + 1 powerful  |
| hard       |           8–12 | near-duplicates + traps |
| brutal     |            15+ | realistic toolbelt      |

---

## The trick that makes decoys *actually* work

**Descriptions must overlap just enough** to tempt mistakes.

Bad decoy:

* “Totally unrelated tool, clearly not for math”

Good decoy:

* “Compute a result from two numbers” (but is actually `add`)

That’s what forces real selection.

---

If you want, I’ll add a small helper that **automatically generates decoy tool lists** from your registered tools using tags like `:domain :math` or `:capability :general`, so you can build 100+ choice cases with consistent difficulty.
