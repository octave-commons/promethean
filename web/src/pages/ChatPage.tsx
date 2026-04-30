import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  addSessionMessage,
  createSession,
  forkSession,
  getSession,
  getSessionPromptCacheKey,
  listModels,
  listSessions,
  runChatCompletion,
  searchSessionHistory,
  type SearchResult,
  type SessionListItem,
  type SessionMessage,
  type SessionRecord,
} from "../lib/api";
import { useStoredState } from "../lib/use-stored-state";

const DEFAULT_MODELS = [
  "gpt-5.3-codex",
  "openai/gpt-5.3-codex",
  "ollama/qwen3-vl:2b",
];

const LS_CHAT_MODEL = "open-hax-proxy.ui.chat.model";
const LS_CHAT_ACTIVE_SESSION = "open-hax-proxy.ui.chat.activeSessionId";

function validateString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function firstTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (typeof part === "object" && part !== null && "text" in part && typeof part.text === "string") {
        const type = typeof (part as Record<string, unknown>).type === "string" ? (part as Record<string, unknown>).type : "";
        if (type === "reasoning" || type === "thinking" || type === "reasoning_content" || type === "reasoning_details") {
          return "";
        }
        return part.text;
      }

      return "";
    })
    .join("");
}

function firstReasoningContent(message: unknown): string {
  if (!isRecord(message)) {
    return "";
  }

  const direct = firstTextContent(message.reasoning_content);
  if (direct.length > 0) {
    return direct;
  }

  const fallback = firstTextContent(message.reasoning);
  if (fallback.length > 0) {
    return fallback;
  }

  const content = message.content;
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (!isRecord(part)) {
        return "";
      }

      const type = typeof part.type === "string" ? part.type : "";
      if (type === "reasoning" || type === "thinking" || type === "summary_text" || type === "reasoning_content" || type === "reasoning_details") {
        return typeof part.text === "string" ? part.text : "";
      }

      return "";
    })
    .join("");
}

function toOpenAiMessages(messages: SessionMessage[]): Array<{ readonly role: string; readonly content: string }> {
  return messages
    .filter((message) => message.role === "system" || message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

export function ChatPage(): JSX.Element {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [activeSession, setActiveSession] = useState<SessionRecord | null>(null);
  const [draft, setDraft] = useState("");
  const [model, setModel] = useStoredState(LS_CHAT_MODEL, "ollama/qwen3-vl:2b", validateString);
  const [modelOptions, setModelOptions] = useState<string[]>(DEFAULT_MODELS);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSource, setSearchSource] = useState("none");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [storedActiveSessionId, setStoredActiveSessionId] = useStoredState(LS_CHAT_ACTIVE_SESSION, "", validateString);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const copyResetTimerRef = useRef<number | null>(null);

  const refreshSessions = useCallback(async () => {
    const next = await listSessions();
    setSessions(next);
    if (!activeSession && next.length > 0) {
      const preferred = storedActiveSessionId.trim();
      const desired = preferred.length > 0 && next.some((session) => session.id === preferred)
        ? preferred
        : next[0]?.id;
      if (desired) {
        const loaded = await getSession(desired);
        setActiveSession(loaded);
        setStoredActiveSessionId(loaded.id);
      }
    }
  }, [activeSession, setStoredActiveSessionId, storedActiveSessionId]);

  const refreshModelOptions = useCallback(async () => {
    const next = await listModels();
    if (next.length === 0) {
      setModelOptions(DEFAULT_MODELS);
      return;
    }

    setModelOptions(next);
    // Preserve stored/model selection if possible; otherwise fall back to the first option.
    const normalized = model.trim();
    if (normalized.length === 0) {
      setModel(next[0] ?? "gpt-5.3-codex");
    }
  }, [model, setModel]);

  useEffect(() => {
    void refreshSessions().catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    });
  }, [refreshSessions]);

  useEffect(() => {
    void refreshModelOptions().catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    });
  }, [refreshModelOptions]);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
        copyResetTimerRef.current = null;
      }
    };
  }, []);

  const loadSession = async (sessionId: string) => {
    const session = await getSession(sessionId);
    setActiveSession(session);
    setStoredActiveSessionId(session.id);
  };

  const createNewSession = async () => {
    const session = await createSession("New chat");
    setActiveSession(session);
    setStoredActiveSessionId(session.id);
    await refreshSessions();
  };

  const runSearch = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = searchQuery.trim();
    if (normalized.length === 0) {
      setSearchSource("none");
      setSearchResults([]);
      return;
    }

    const payload = await searchSessionHistory(normalized, 10);
    setSearchSource(payload.source);
    setSearchResults(payload.results);
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (text.length === 0 || sending) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      let session = activeSession;
      if (!session) {
        session = await createSession("New chat");
        setStoredActiveSessionId(session.id);
      }

      await addSessionMessage(session.id, {
        role: "user",
        content: text,
        model,
      });

      const latest = await getSession(session.id);
      const response = await runChatCompletion({
        model,
        stream: false,
        prompt_cache_key: await getSessionPromptCacheKey(latest.id),
        messages: toOpenAiMessages(latest.messages),
      });

      const choices = Array.isArray(response.choices) ? response.choices : [];
      const firstChoice = choices.length > 0 ? choices[0] : null;
      const firstChoiceMessage =
        firstChoice && typeof firstChoice === "object" && firstChoice !== null
          ? (firstChoice as { readonly message?: unknown }).message
          : undefined;
      const assistantContent = isRecord(firstChoiceMessage)
        ? firstTextContent(firstChoiceMessage.content)
        : "";
      const reasoningContent = firstReasoningContent(firstChoiceMessage);
      const messageContent = assistantContent.length > 0
        ? assistantContent
        : reasoningContent.length > 0
          ? "(Reasoning trace only)"
          : "(No text returned)";

      await addSessionMessage(session.id, {
        role: "assistant",
        content: messageContent,
        reasoningContent: reasoningContent.length > 0 ? reasoningContent : undefined,
        model,
      });

      const updated = await getSession(session.id);
      setActiveSession(updated);
      setStoredActiveSessionId(updated.id);
      setDraft("");
      await refreshSessions();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : String(sendError));
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async (message: SessionMessage) => {
    try {
      const content = message.reasoningContent && message.reasoningContent.trim().length > 0
        ? `${message.content}\n\n[Reasoning trace]\n${message.reasoningContent}`
        : message.content;
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(message.id);

      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }

      copyResetTimerRef.current = window.setTimeout(() => {
        setCopiedMessageId((current) => (current === message.id ? null : current));
        copyResetTimerRef.current = null;
      }, 1200);
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : String(copyError));
    }
  };

  const handleFork = async (messageId?: string) => {
    if (!activeSession) {
      return;
    }

    const forked = await forkSession(activeSession.id, messageId);
    setActiveSession(forked);
    setStoredActiveSessionId(forked.id);
    await refreshSessions();
  };

  const groupedMessages = useMemo(() => activeSession?.messages ?? [], [activeSession]);
  const messageCount = activeSession?.messages.length ?? 0;
  const availableModels = useMemo(() => {
    const options = [...modelOptions];
    const normalizedModel = model.trim();
    if (normalizedModel.length > 0 && !options.includes(normalizedModel)) {
      options.unshift(normalizedModel);
    }

    return options;
  }, [model, modelOptions]);

  useEffect(() => {
    if (!threadRef.current || messageCount === 0) {
      return;
    }

    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messageCount]);

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Sessions</h2>
          <button type="button" onClick={() => void createNewSession()}>
            New
          </button>
        </div>

        <form className="chat-search-form" onSubmit={(event) => void runSearch(event)}>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            placeholder="Semantic search history"
          />
          <button type="submit">Search</button>
        </form>

        {searchResults.length > 0 && (
          <div className="chat-search-results">
            <p>
              Search source: <strong>{searchSource}</strong>
            </p>
            {searchResults.map((result) => (
              <button
                key={`${result.sessionId}:${result.messageId}`}
                type="button"
                className="chat-search-result"
                onClick={() => void loadSession(result.sessionId)}
              >
                <strong>{result.sessionTitle}</strong>
                <span>{result.content}</span>
              </button>
            ))}
          </div>
        )}

        <div className="chat-session-list">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              className={session.id === activeSession?.id ? "chat-session-item chat-session-item-active" : "chat-session-item"}
              onClick={() => void loadSession(session.id)}
            >
              <strong>{session.title}</strong>
              <span>{session.lastMessagePreview || "No messages yet"}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-main">
        <header className="chat-main-header">
          <div>
            <h2>{activeSession?.title ?? "No session selected"}</h2>
            {activeSession?.forkedFromSessionId && (
              <p>
                Forked from {activeSession.forkedFromSessionId}
              </p>
            )}
          </div>

          <div className="chat-main-controls">
            <select
              value={model}
              onChange={(event) => setModel(event.currentTarget.value)}
            >
              {availableModels.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="chat-main-control-buttons">
              <button
                type="button"
                onClick={() => void refreshModelOptions().catch((nextError) => {
                  setError(nextError instanceof Error ? nextError.message : String(nextError));
                })}
              >
                Refresh models
              </button>
              <button type="button" onClick={() => void handleFork()} disabled={!activeSession}>
                Fork latest
              </button>
            </div>
          </div>
        </header>

        <div className="chat-thread" ref={threadRef}>
          {groupedMessages.map((message) => (
            <article
              key={message.id}
              className={message.role === "user" ? "chat-message chat-message-user" : "chat-message chat-message-assistant"}
            >
              <header>
                <strong>{message.role}</strong>
                <div>
                  <button type="button" onClick={() => void handleCopy(message)}>
                    {copiedMessageId === message.id ? "Copied" : "Copy"}
                  </button>
                  <button type="button" onClick={() => void handleFork(message.id)}>
                    Fork here
                  </button>
                </div>
              </header>
              <p>{message.content}</p>
              {message.reasoningContent && message.reasoningContent.trim().length > 0 && (
                <details className="chat-reasoning">
                  <summary>Reasoning trace</summary>
                  <pre>{message.reasoningContent}</pre>
                </details>
              )}
            </article>
          ))}
        </div>

        <form className="chat-input-form" onSubmit={(event) => void sendMessage(event)}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Send a message..."
            rows={4}
          />
          <button type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
        </form>

        {error && <p className="chat-error">{error}</p>}
      </section>
    </div>
  );
}
