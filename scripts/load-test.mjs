#!/usr/bin/env node

const baseUrl = process.env.DEV_PROXY_URL ?? "http://127.0.0.1:8795";
const model = process.env.LOAD_TEST_MODEL ?? "gpt-5.4";
const concurrency = parsePositiveInt(process.env.LOAD_TEST_CONCURRENCY, 16);
const totalRequests = parsePositiveInt(process.env.LOAD_TEST_REQUESTS, concurrency);
const timeoutMs = parsePositiveInt(process.env.LOAD_TEST_TIMEOUT_MS, 60000);
const content = process.env.LOAD_TEST_CONTENT ?? "Reply with exactly OK.";
const authToken = process.env.DEV_PROXY_AUTH_TOKEN ?? process.env.LOAD_TEST_AUTH_TOKEN;

function parsePositiveInt(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function percentile(values, ratio) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index] ?? 0;
}

async function sendRequest(index) {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  timeout.unref?.();

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: `${content} [req ${index}]` }],
        stream: false,
      }),
      signal: controller.signal,
    });
    const elapsedMs = performance.now() - startedAt;
    const responseText = await response.text();

    if (!response.ok) {
      return {
        ok: false,
        elapsedMs,
        status: response.status,
        error: responseText.slice(0, 400),
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (error) {
      return {
        ok: false,
        elapsedMs,
        status: response.status,
        error: `invalid JSON response: ${String(error)}`,
      };
    }

    const assistantContent = parsed?.choices?.[0]?.message?.content;
    if (typeof assistantContent !== "string" || assistantContent.length === 0) {
      return {
        ok: false,
        elapsedMs,
        status: response.status,
        error: "missing assistant content",
      };
    }

    return {
      ok: true,
      elapsedMs,
      status: response.status,
      content: assistantContent,
    };
  } catch (error) {
    const elapsedMs = performance.now() - startedAt;
    return {
      ok: false,
      elapsedMs,
      status: 0,
      error: String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const queue = Array.from({ length: totalRequests }, (_, index) => index + 1);
  const results = [];
  const startedAt = performance.now();

  async function worker() {
    while (queue.length > 0) {
      const next = queue.shift();
      if (next === undefined) {
        return;
      }
      results.push(await sendRequest(next));
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, totalRequests) }, () => worker()));
  const totalElapsedMs = performance.now() - startedAt;

  const successCount = results.filter((result) => result.ok).length;
  const failureResults = results.filter((result) => !result.ok);
  const elapsedValues = results.map((result) => result.elapsedMs);
  const summary = {
    baseUrl,
    model,
    concurrency,
    totalRequests,
    successCount,
    failureCount: failureResults.length,
    totalElapsedMs: Math.round(totalElapsedMs),
    latencyMs: {
      min: Math.round(Math.min(...elapsedValues)),
      avg: Math.round(elapsedValues.reduce((sum, value) => sum + value, 0) / elapsedValues.length),
      p50: Math.round(percentile(elapsedValues, 0.5)),
      p95: Math.round(percentile(elapsedValues, 0.95)),
      max: Math.round(Math.max(...elapsedValues)),
    },
  };

  console.log(JSON.stringify(summary, null, 2));

  if (failureResults.length > 0) {
    for (const failure of failureResults.slice(0, 5)) {
      console.error(`FAIL status=${failure.status} elapsedMs=${Math.round(failure.elapsedMs)} error=${failure.error}`);
    }
    process.exitCode = 1;
  }
}

await main();
