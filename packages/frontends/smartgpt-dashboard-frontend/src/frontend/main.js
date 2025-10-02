// Minimal dashboard bootstrap that delegates to <api-docs>
import "/wc/components.js";
import "/components/file-explorer.js";

const byId = (id) => document.getElementById(id);
let authCookieName = "smartgpt_auth";
const auth = {
  get token() {
    return localStorage.getItem("bridgeToken") || "";
  },
  set token(v) {
    v
      ? localStorage.setItem("bridgeToken", v)
      : localStorage.removeItem("bridgeToken");
  },
  setCookie(v) {
    if (!v) return;
    document.cookie = `${encodeURIComponent(
      authCookieName,
    )}=${encodeURIComponent(v)}; Path=/; SameSite=Lax`;
  },
  clearCookie() {
    document.cookie = `${encodeURIComponent(
      authCookieName,
    )}=; Path=/; Max-Age=0`;
  },
};

async function refreshAuth() {
  const pill = byId("auth-indicator");
  try {
    const headers = auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
    const res = await fetch("/bridge/auth/me", { headers });

    const js = await res.json().catch(() => ({}));
    if (js?.cookie) authCookieName = js.cookie;
    pill.classList.remove("ok", "bad", "warn");
    pill.classList.add(js?.auth ? "ok" : "warn");
    pill.textContent = js?.auth ? "auth: on" : "auth: off";
    if (js?.auth && auth.token) auth.setCookie(auth.token);
  } catch {
    pill.classList.remove("ok");
    pill.classList.add("warn");
    pill.textContent = "auth: unknown";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const tokenInput = byId("auth-token");
  tokenInput.value = auth.token;
  byId("save-token").addEventListener("click", async () => {
    auth.token = tokenInput.value.trim();
    await refreshAuth();
  });
  byId("clear-token").addEventListener("click", async () => {
    auth.token = "";
    auth.clearCookie();
    await refreshAuth();
  });
  await refreshAuth();
});
