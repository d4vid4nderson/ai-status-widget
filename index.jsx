import { React, css } from "uebersicht";

const OPENAI_URL = "https://status.openai.com/api/v2/summary.json";
const ANTHROPIC_URL = "https://status.claude.com/api/v2/summary.json";
const POSITION_STORAGE_KEY = "ai-status-widget:position";
const THEME_STORAGE_KEY = "ai-status-widget:theme";

const OPENAI_MODELS = [
  "GPT-5.2",
  "GPT-5.2 pro",
  "GPT-5.1",
  "GPT-5",
  "GPT-5 mini",
  "GPT-5 nano",
  "GPT-5.2-Codex",
  "gpt-realtime",
  "gpt-realtime-mini",
  "gpt-audio",
  "gpt-audio-mini",
];

const INDICATOR_MAP = {
  none: { level: "green", label: "Operational" },
  minor: { level: "yellow", label: "Minor issues" },
  major: { level: "red", label: "Major outage" },
  critical: { level: "red", label: "Critical outage" },
};

const ANTHROPIC_COMPONENTS = [
  { key: "claude.ai", label: "claude.ai" },
  { key: "platform.claude.com (formerly console.anthropic.com)", label: "platform.claude.com" },
  { key: "Claude API (api.anthropic.com)", label: "Claude API" },
  { key: "Claude Code", label: "Claude Code" },
];

const OPENAI_COMPONENTS = [
  { key: "Chat Completions", label: "Chat Completions" },
  { key: "Realtime", label: "Realtime" },
  { key: "Embeddings", label: "Embeddings" },
  { key: "Files", label: "Files" },
  { key: "Batch", label: "Batch" },
  { key: "Fine-tuning", label: "Fine-tuning" },
  { key: "Moderations", label: "Moderations" },
  { key: "Audio", label: "Audio" },
  { key: "Image Generation", label: "Image Generation" },
  { key: "Compliance API", label: "Compliance API" },
  { key: "Search", label: "Search" },
  { key: "Codex", label: "Codex" },
];

const OPENAI_MODEL_GROUPS = [
  { label: "GPT‑5.2", models: ["GPT-5.2", "GPT-5.2 pro"] },
  { label: "GPT‑5.x", models: ["GPT-5.1", "GPT-5", "GPT-5 mini", "GPT-5 nano"] },
  { label: "Codex", models: ["GPT-5.2-Codex"] },
  { label: "Realtime", models: ["gpt-realtime", "gpt-realtime-mini"] },
  { label: "Audio", models: ["gpt-audio", "gpt-audio-mini"] },
];

const levelFromIndicator = (indicator) => {
  if (!indicator) return { level: "unknown", label: "Unknown" };
  return INDICATOR_MAP[indicator] || { level: "unknown", label: "Unknown" };
};

const componentLevel = (status) => {
  switch (status) {
    case "operational":
      return { level: "green", label: "Operational" };
    case "degraded_performance":
      return { level: "yellow", label: "Degraded" };
    case "partial_outage":
      return { level: "yellow", label: "Partial outage" };
    case "major_outage":
      return { level: "red", label: "Major outage" };
    case "under_maintenance":
      return { level: "yellow", label: "Maintenance" };
    default:
      return { level: "unknown", label: "Unknown" };
  }
};

const fetchJson = (url) =>
  fetch(url, { cache: "no-store" }).then((response) => {
    if (!response.ok) throw new Error(`Request failed: ${url}`);
    return response.json();
  });

export const refreshFrequency = 120000;

export const className = ``;

export const initialState = {
  statuses: {},
  lastUpdated: null,
  lastChecked: null,
  error: null,
};

export const command = async (dispatch) => {
  try {
    const [openaiRes, anthropicRes] = await Promise.all([
      fetchJson(OPENAI_URL),
      fetchJson(ANTHROPIC_URL),
    ]);

    const openaiStatus = levelFromIndicator(openaiRes?.status?.indicator);
    const anthropicStatus = levelFromIndicator(anthropicRes?.status?.indicator);

    dispatch({
      type: "STATUS_UPDATE",
      statuses: {
        openai: {
          name: "OpenAI",
          ...openaiStatus,
          description: openaiRes?.status?.description || "",
          components: openaiRes?.components || [],
        },
        anthropic: {
          name: "Anthropic",
          ...anthropicStatus,
          description: anthropicRes?.status?.description || "",
          components: anthropicRes?.components || [],
        },
      },
      lastUpdated: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      error: null,
    });
  } catch (error) {
    dispatch({
      type: "STATUS_ERROR",
      error: error?.message || "Failed to update status.",
      lastChecked: new Date().toISOString(),
    });
  }
};

export const updateState = (event, previousState) => {
  if (event.type === "STATUS_UPDATE") {
    return {
      ...previousState,
      statuses: event.statuses,
      lastUpdated: event.lastUpdated,
      lastChecked: event.lastChecked,
      error: null,
    };
  }

  if (event.type === "STATUS_ERROR") {
    return {
      ...previousState,
      error: event.error,
      lastUpdated: previousState.lastUpdated,
      lastChecked: event.lastChecked,
    };
  }

  return previousState;
};

const formatTime = (iso) => {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const containerClass = css`
  position: absolute;
  width: 320px;
  display: flex;
  flex-direction: column;
`;

const footerBarClass = css`
  width: 100%;
  height: 38px;
  background: var(--footer-bg);
  border-radius: 0 0 18px 18px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28);
  margin-top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  align-self: stretch;
  box-sizing: border-box;
`;

const footerTimeClass = css`
  font-size: 12px;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.8);
`;

const footerLabelClass = css`
  font-size: 11px;
  text-transform: none;
  letter-spacing: 0;
  color: var(--muted-text);
  line-height: 1.1;
  font-family: "Avenir Next", "Helvetica Neue", sans-serif;
`;

const footerTimeValueClass = css`
  font-size: 12px;
  font-weight: 600;
  color: var(--time-text);
  line-height: 1.1;
  font-family: "Avenir Next", "Helvetica Neue", sans-serif;
`;

const footerStackClass = css`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const footerActionsClass = css`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const iconButtonClass = css`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: var(--button-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--button-text);
  font-size: 16px;
  line-height: 1;
`;

const iconButtonHoverClass = css`
  &:hover {
    color: var(--button-text-hover);
    background: var(--button-bg-hover);
  }
`;

const spinClass = css`
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  &.is-spinning svg {
    animation: spin 0.9s linear infinite;
  }
`;

const themeToggleClass = css`
  width: 28px;
  height: 28px;
  padding: 0;
`;

const widgetClass = css`
  box-sizing: border-box;
  max-height: 520px;
  font-family: "Avenir Next", "Helvetica Neue", sans-serif;
  color: var(--text);
  text-align: left;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 18px 18px 0 0;
  padding: 14px 14px 16px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
  overflow: hidden;

  & * {
    box-sizing: border-box;
  }

  & .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    cursor: move;
    user-select: none;
  }

  & .header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }


  & .title {
    font-size: 16px;
    font-weight: 700;
    color: var(--title-text);
  }

  & .subtitle {
    font-size: 11px;
    color: var(--muted-text);
    margin-top: 2px;
  }

  & .time {
    font-size: 12px;
    font-weight: 600;
    color: rgba(226, 232, 240, 0.8);
  }

  & .row {
    display: grid;
    grid-template-columns: 12px 1fr auto auto;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: var(--row-bg);
    border-radius: 12px;
    font-size: 13px;
    color: var(--title-text);
    width: 100%;
  }

  & .row + .row {
    margin-top: 12px;
  }

  & .rows {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: calc(100% + 8px);
    overflow-y: scroll;
    max-height: 440px;
    padding-right: 0;
    margin-left: -4px;
    margin-right: -4px;
    scrollbar-gutter: stable;
  }

  & .rows::-webkit-scrollbar {
    width: 6px;
  }

  & .rows::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.4);
    border-radius: 999px;
  }

  & .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--label-text);
  }

  & .toggle {
    border: none;
    background: transparent;
    color: var(--label-text);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    min-width: 38px;
    text-align: right;
  }

  & .toggle:hover {
    color: var(--title-text);
  }

  & .detail {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--detail-bg);
    border-radius: 12px;
    padding: 8px 10px;
    font-size: 12px;
    color: var(--title-text);
  }

  & .detail-section {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--label-text);
    margin: 2px 2px -2px;
  }

  & .detail-row {
    display: grid;
    grid-template-columns: 10px 1fr auto;
    gap: 8px;
    align-items: center;
    padding: 6px 8px;
    border-radius: 10px;
    background: var(--detail-row-bg);
  }

  & .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  & .dot.green {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  }

  & .dot.yellow {
    background: #f59e0b;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
  }

  & .dot.red {
    background: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  }

  & .dot.unknown {
    background: #94a3b8;
    box-shadow: 0 0 8px rgba(148, 163, 184, 0.6);
  }

  & .error {
    margin-top: 10px;
    font-size: 11px;
    color: #fca5a5;
  }

`;

const StatusRow = ({ status, isOpen, onToggle, detail, showStatus = true }) => (
  <div>
    <div className="row">
      <span className={`dot ${status?.level || "unknown"}`} />
      <span>{status?.name || "Loading..."}</span>
      {onToggle ? (
        <button className="toggle" type="button" onClick={onToggle}>
          {isOpen ? "Hide" : "Show"}
        </button>
      ) : (
        <span />
      )}
      {showStatus ? <span className="label">{status?.label || ""}</span> : <span />}
    </div>
    {isOpen && detail ? <div className="detail">{detail}</div> : null}
  </div>
);

const Widget = ({ statuses, lastUpdated, lastChecked, error, dispatch }) => {
  const [position, setPosition] = React.useState({ top: 80, left: 40 });
  const [openaiOpen, setOpenaiOpen] = React.useState(false);
  const [anthropicOpen, setAnthropicOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const refreshTimerRef = React.useRef(null);
  const [theme, setTheme] = React.useState("dark");
  const dragRef = React.useRef(null);
  const dragStartRef = React.useRef(null);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(POSITION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.top === "number" && typeof parsed?.left === "number") {
          setPosition({ top: parsed.top, left: parsed.left });
        }
      }
    } catch (error) {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      }
    } catch (error) {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      // ignore
    }
  }, [theme]);

  const onDragStart = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      top: position.top,
      left: position.left,
    };
    dragRef.current = true;
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
  };

  const onDragMove = (event) => {
    if (!dragRef.current || !dragStartRef.current) return;
    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;
    setPosition({
      top: dragStartRef.current.top + deltaY,
      left: dragStartRef.current.left + deltaX,
    });
  };

  const onDragEnd = () => {
    dragRef.current = false;
    dragStartRef.current = null;
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
    try {
      window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
    } catch (error) {
      // ignore
    }
  };

  const onManualRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const minSpinMs = 900;
    const start = Date.now();
    Promise.resolve(command(dispatch)).finally(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minSpinMs - elapsed);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      refreshTimerRef.current = setTimeout(() => {
        setIsRefreshing(false);
      }, remaining);
    });
  };

  const themeVars =
    theme === "light"
      ? {
          "--text": "#0b1014",
          "--card-bg": "rgba(248, 250, 252, 0.98)",
          "--card-border": "rgba(15, 23, 42, 0.08)",
          "--row-bg": "rgba(226, 232, 240, 0.8)",
          "--detail-bg": "rgba(226, 232, 240, 0.7)",
          "--detail-row-bg": "rgba(203, 213, 225, 0.85)",
          "--muted-text": "rgba(71, 85, 105, 0.8)",
          "--label-text": "rgba(71, 85, 105, 0.8)",
          "--title-text": "#0f172a",
          "--footer-bg": "rgba(203, 213, 225, 0.9)",
          "--button-bg": "rgba(226, 232, 240, 0.95)",
          "--button-bg-hover": "rgba(203, 213, 225, 0.95)",
          "--button-text": "rgba(30, 41, 59, 0.8)",
          "--button-text-hover": "rgba(30, 41, 59, 0.95)",
          "--time-text": "rgba(30, 41, 59, 0.8)",
        }
      : {
          "--text": "#0b1014",
          "--card-bg": "rgba(33, 35, 38, 0.95)",
          "--card-border": "rgba(255, 255, 255, 0.08)",
          "--row-bg": "rgba(55, 58, 62, 0.75)",
          "--detail-bg": "rgba(55, 58, 62, 0.55)",
          "--detail-row-bg": "rgba(72, 76, 81, 0.7)",
          "--muted-text": "rgba(148, 163, 184, 0.9)",
          "--label-text": "rgba(148, 163, 184, 0.9)",
          "--title-text": "#f8fafc",
          "--footer-bg": "rgba(86, 90, 96, 0.95)",
          "--button-bg": "rgba(112, 116, 122, 0.95)",
          "--button-bg-hover": "rgba(120, 124, 130, 0.95)",
          "--button-text": "rgba(226, 232, 240, 0.8)",
          "--button-text-hover": "rgba(226, 232, 240, 0.95)",
          "--time-text": "rgba(226, 232, 240, 0.8)",
        };

  return (
    <div className={containerClass} style={{ top: position.top, left: position.left, ...themeVars }}>
      <div className={widgetClass}>
        <div className="header" onMouseDown={onDragStart} title="Drag to move">
          <div>
            <div className="title">AI Service Health</div>
            <div className="subtitle">Refreshes every 2 minutes</div>
          </div>
          <div className="header-actions" />
        </div>
        <div className="rows">
          <StatusRow
            status={statuses?.openai}
            isOpen={openaiOpen}
            onToggle={() => setOpenaiOpen((prev) => !prev)}
            showStatus={false}
            detail={[
              ...OPENAI_MODEL_GROUPS.flatMap((group) => [
                <div key={`${group.label}-label`} className="detail-section">
                  {group.label}
                </div>,
                ...group.models.map((name) => (
                  <div key={name} className="detail-row">
                    <span className={`dot ${statuses?.openai?.level || "unknown"}`} />
                    <span>{name}</span>
                    <span className="label">{statuses?.openai?.label || "Unknown"}</span>
                  </div>
                )),
              ]),
              ...(statuses?.openai?.components
                ? [
                    <div key="openai-api-label" className="detail-section">
                      APIs &amp; Codex
                    </div>,
                    ...OPENAI_COMPONENTS.map((item) => {
                      const match = statuses.openai.components.find(
                        (component) => component.name?.toLowerCase() === item.key.toLowerCase()
                      );
                      const level = componentLevel(match?.status);
                      return (
                        <div key={item.key} className="detail-row">
                          <span className={`dot ${level.level}`} />
                          <span>{item.label}</span>
                          <span className="label">{level.label}</span>
                        </div>
                      );
                    }),
                  ]
                : []),
            ]}
          />
          <StatusRow
            status={statuses?.anthropic}
            isOpen={anthropicOpen}
            onToggle={() => setAnthropicOpen((prev) => !prev)}
            showStatus={false}
            detail={
              statuses?.anthropic?.components
                ? ANTHROPIC_COMPONENTS.map((item) => {
                    const match = statuses.anthropic.components.find(
                      (component) => component.name?.toLowerCase() === item.key.toLowerCase()
                    );
                    const level = componentLevel(match?.status);
                    return (
                      <div key={item.key} className="detail-row">
                        <span className={`dot ${level.level}`} />
                        <span>{item.label}</span>
                        <span className="label">{level.label}</span>
                      </div>
                    );
                  })
                : null
            }
          />
        </div>

        {error ? <div className="error">{error}</div> : null}
      </div>
      <div className={footerBarClass}>
        <div className={footerStackClass}>
          <span className={footerLabelClass}>
            Last updated {formatTime(lastUpdated)}
          </span>
          <span className={footerTimeValueClass}>
            Last checked {formatTime(lastChecked)}
          </span>
        </div>
        <div className={footerActionsClass}>
          <button
            className={`${iconButtonClass} ${iconButtonHoverClass} ${themeToggleClass}`}
            type="button"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
          <button
            className={`${iconButtonClass} ${iconButtonHoverClass} ${spinClass} ${
              isRefreshing ? "is-spinning" : ""
            }`}
            type="button"
            title="Refresh status"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={onManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 17V3" />
                <path d="m6 11 6 6 6-6" />
                <path d="M19 21H5" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const render = (props) => <Widget {...props} />;
