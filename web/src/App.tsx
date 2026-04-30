import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";

import { getProxyUiSettings, getSavedAuthToken, saveAuthToken, saveProxyUiSettings } from "./lib/api";
import { ChatPage } from "./pages/ChatPage";
import { CredentialsPage } from "./pages/CredentialsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HostsPage } from "./pages/HostsPage";
import { ToolsPage } from "./pages/ToolsPage";
import { ImagesPage } from "./pages/ImagesPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";

function navClass(isActive: boolean): string {
  return isActive ? "nav-link nav-link-active" : "nav-link";
}

export function App(): JSX.Element {
  const [tokenInput, setTokenInput] = useState(() => getSavedAuthToken());
  const [savedToken, setSavedToken] = useState(() => getSavedAuthToken());
  const [showSaved, setShowSaved] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const [fastModeSaving, setFastModeSaving] = useState(false);
  const [fastModeMessage, setFastModeMessage] = useState<string | null>(null);

  useEffect(() => {
    void getProxyUiSettings()
      .then((settings) => {
        setFastMode(settings.fastMode);
      })
      .catch((error) => {
        setFastModeMessage(error instanceof Error ? error.message : String(error));
      });
  }, []);

  const handleSaveToken = () => {
    const trimmed = tokenInput.trim();
    saveAuthToken(trimmed);
    setSavedToken(trimmed);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleFastModeToggle = async (nextValue: boolean) => {
    setFastMode(nextValue);
    setFastModeSaving(true);
    setFastModeMessage(null);

    try {
      const saved = await saveProxyUiSettings({ fastMode: nextValue });
      setFastMode(saved.fastMode);
      setFastModeMessage(saved.fastMode ? "Fast mode enabled for the current tenant." : "Fast mode disabled for the current tenant.");
    } catch (error) {
      setFastMode(!nextValue);
      setFastModeMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setFastModeSaving(false);
    }
  };

  const location = useLocation();
  const isDashboard = location.pathname === "/" || location.pathname === "";

  const hasUnsavedChanges = tokenInput.trim() !== savedToken.trim();
  const hasStoredToken = savedToken.trim().length > 0;

  return (
    <div className={`shell-root${isDashboard ? " shell-root-dashboard" : ""}`}>
      <header className="shell-header">
        <div className="shell-brand">
          <h1>Open Hax Proxy Console</h1>
          <p>Usage, chat, credentials, and tools in one control surface.</p>
        </div>

        <div className="shell-auth">
          <label htmlFor="proxy-token">Proxy Token</label>
          <div className="shell-auth-row">
            <input
              id="proxy-token"
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.currentTarget.value)}
              placeholder="Bearer token for /api and /v1"
            />
            <button type="button" onClick={handleSaveToken} disabled={!hasUnsavedChanges}>
              Save
            </button>
          </div>
          <small>
              {showSaved
                ? "Token saved in browser storage."
                : hasStoredToken
                  ? hasUnsavedChanges
                    ? "Unsaved changes."
                    : "Token is stored for this browser."
                  : "No token set (works only if proxy allows unauthenticated access)."}
          </small>

          <div className="shell-settings-card">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={fastMode}
                disabled={fastModeSaving}
                onChange={(event) => {
                  void handleFastModeToggle(event.currentTarget.checked);
                }}
              />
              Fast mode for current tenant (priority tier)
            </label>
            <small>
              Applies `service_tier: \"priority\"` to proxied Responses requests for the active tenant unless a request already sets its own tier.
            </small>
            {fastModeMessage && <small>{fastModeMessage}</small>}
          </div>
        </div>
      </header>

      <nav className="shell-nav">
        <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
          Dashboard
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => navClass(isActive)}>
          Chat
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => navClass(isActive)}>
          Analytics
        </NavLink>
        <NavLink to="/hosts" className={({ isActive }) => navClass(isActive)}>
          Hosts
        </NavLink>
        <NavLink to="/images" className={({ isActive }) => navClass(isActive)}>
          Images
        </NavLink>
        <NavLink to="/credentials" className={({ isActive }) => navClass(isActive)}>
          Credentials
        </NavLink>
        <NavLink to="/tools" className={({ isActive }) => navClass(isActive)}>
          Tools + MCP
        </NavLink>
      </nav>

      <main className="shell-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/hosts" element={<HostsPage />} />
          <Route path="/images" element={<ImagesPage />} />
          <Route path="/credentials" element={<CredentialsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}
