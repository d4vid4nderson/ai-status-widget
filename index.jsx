import { React, css, run } from "uebersicht";

const OPENAI_URL = "https://status.openai.com/api/v2/summary.json";
const ANTHROPIC_URL = "https://status.claude.com/api/v2/summary.json";
const OPENAI_STATUS_PAGE = "https://status.openai.com/";
const ANTHROPIC_STATUS_PAGE = "https://status.claude.com/";
const POSITION_STORAGE_KEY = "ai-status-widget:position";

const INDICATOR_MAP = {
  none: { level: "green", label: "Operational" },
  minor: { level: "yellow", label: "Minor issues" },
  major: { level: "red", label: "Major outage" },
  critical: { level: "red", label: "Critical outage" },
};

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

const OPENAI_MODEL_GROUPS = [
  { label: "GPT‑5.2", models: ["GPT-5.2", "GPT-5.2 pro"] },
  { label: "GPT‑5.x", models: ["GPT-5.1", "GPT-5", "GPT-5 mini", "GPT-5 nano"] },
  { label: "Codex", models: ["GPT-5.2-Codex"] },
  { label: "Realtime", models: ["gpt-realtime", "gpt-realtime-mini"] },
  { label: "Audio", models: ["gpt-audio", "gpt-audio-mini"] },
];

const ANTHROPIC_COMPONENTS = [
  { key: "claude.ai", label: "claude.ai" },
  { key: "platform.claude.com (formerly console.anthropic.com)", label: "platform.claude.com" },
  { key: "Claude API (api.anthropic.com)", label: "Claude API" },
  { key: "Claude Code", label: "Claude Code" },
];

const OPENAI_COMPONENTS = [
  { key: "Chat Completions", label: "Chat Completions" },
  { key: "Embeddings", label: "Embeddings" },
  { key: "Files", label: "Files" },
  { key: "Batch", label: "Batch" },
  { key: "Fine-tuning", label: "Fine-tuning" },
  { key: "Moderations", label: "Moderations" },
  { key: "Image Generation", label: "Image Generation" },
  { key: "Compliance API", label: "Compliance API" },
  { key: "Search", label: "Search" },
];

const levelFromIndicator = (indicator) => {
  if (!indicator) return { level: "unknown", label: "Unknown" };
  return INDICATOR_MAP[indicator] || { level: "unknown", label: indicator };
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

export const refreshFrequency = 120000; // 2 minutes

export const className = `
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

export const initialState = {
  openai: null,
  anthropic: null,
  openaiComponents: [],
  anthropicComponents: [],
  lastUpdated: null,
  error: null,
};

const fetchJson = (url) =>
  fetch(url, { cache: "no-store" }).then((response) => {
    if (!response.ok) throw new Error(`Request failed: ${url}`);
    return response.json();
  });

export const command = async (dispatch) => {
  try {
    const [openaiRes, anthropicRes] = await Promise.all([
      fetchJson(OPENAI_URL),
      fetchJson(ANTHROPIC_URL),
    ]);

    const openaiStatus = levelFromIndicator(openaiRes?.status?.indicator);
    const anthropicStatus = levelFromIndicator(anthropicRes?.status?.indicator);

    dispatch({
      type: "UPDATE",
      openai: openaiStatus,
      anthropic: anthropicStatus,
      openaiComponents: openaiRes?.components || [],
      anthropicComponents: anthropicRes?.components || [],
      lastUpdated: new Date().toISOString(),
      error: null,
    });
  } catch (error) {
    dispatch({
      type: "ERROR",
      error: error?.message || "Failed to fetch status",
    });
  }
};

export const updateState = (event, previousState) => {
  if (event.type === "UPDATE") {
    return {
      ...previousState,
      openai: event.openai,
      anthropic: event.anthropic,
      openaiComponents: event.openaiComponents,
      anthropicComponents: event.anthropicComponents,
      lastUpdated: event.lastUpdated,
      error: null,
    };
  }
  if (event.type === "ERROR") {
    return {
      ...previousState,
      error: event.error,
    };
  }
  return previousState;
};

const containerClass = css`
  position: absolute;
  width: 320px;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
`;

const widgetClass = css`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 18px 18px 0 0;
  padding: 14px;
  color: var(--text);
  font-family: "Avenir Next", "Helvetica Neue", sans-serif;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
  max-height: 600px;
  display: flex;
  flex-direction: column;
`;

const scrollableContentClass = css`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 520px;
  padding-right: 4px;
  margin-right: -4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.4);
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const serviceContainerClass = css`
  background: var(--row-bg);
  border-radius: 12px;
  margin-bottom: 10px;
`;

const rowClass = css`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 14px;
`;

const dotClass = css`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const toggleButtonClass = css`
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  opacity: 0.7;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;

  &:hover {
    opacity: 1;
  }

  &.open {
    transform: rotate(180deg);
  }
`;

const externalLinkClass = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  opacity: 0.5;
  transition: opacity 0.2s ease;
  margin-left: 6px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    opacity: 1;
  }
`;

const detailClass = css`
  padding: 0 12px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const detailRowClass = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--detail-row-bg);
  border-radius: 10px;
  font-size: 12px;
`;

const detailSectionClass = css`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text);
  opacity: 0.6;
  margin: 4px 2px -2px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;

  &:hover {
    opacity: 0.8;
    background: var(--detail-row-bg);
  }

  svg {
    transition: transform 0.2s ease;
  }

  &.open svg {
    transform: rotate(180deg);
  }
`;

const smallDotClass = css`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const tinyDotClass = css`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const footerClass = css`
  background: var(--footer-bg);
  border-radius: 0 0 18px 18px;
  padding: 0 14px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28);
  font-family: "Avenir Next", "Helvetica Neue", sans-serif;
`;

const buttonClass = css`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: var(--button-bg);
  color: var(--button-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    background: var(--button-bg-hover);
    color: var(--button-text-hover);
  }

  &.spinning svg {
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Widget = (props) => {
  const { openai, anthropic, openaiComponents, anthropicComponents, lastUpdated, error } = props;

  // Use simple useState - position will reset on refresh but that's ok
  const [position, setPosition] = React.useState({ top: 25, left: 25 });
  const [theme, setTheme] = React.useState("dark");
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [openaiOpen, setOpenaiOpen] = React.useState(false);
  const [anthropicOpen, setAnthropicOpen] = React.useState(false);
  const [openModelGroups, setOpenModelGroups] = React.useState({});

  const onMouseDown = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startTop = position.top;
    const startLeft = position.left;

    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setPosition({
        top: startTop + deltaY,
        left: startLeft + deltaX,
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const formatTime = (iso) => {
    if (!iso) return "—";
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDotColor = (level) => {
    switch (level) {
      case "green": return "#10b981";
      case "yellow": return "#f59e0b";
      case "red": return "#ef4444";
      default: return "#94a3b8";
    }
  };

  const themeVars = theme === "light"
    ? {
        "--text": "#0b1014",
        "--card-bg": "rgba(248, 250, 252, 0.98)",
        "--card-border": "rgba(15, 23, 42, 0.08)",
        "--row-bg": "rgba(226, 232, 240, 0.8)",
        "--detail-bg": "rgba(226, 232, 240, 0.7)",
        "--detail-row-bg": "rgba(203, 213, 225, 0.85)",
        "--title-text": "#0f172a",
        "--footer-bg": "rgba(203, 213, 225, 0.9)",
        "--footer-text": "rgba(30, 41, 59, 0.8)",
        "--button-bg": "rgba(226, 232, 240, 0.95)",
        "--button-bg-hover": "rgba(203, 213, 225, 0.95)",
        "--button-text": "rgba(30, 41, 59, 0.8)",
        "--button-text-hover": "rgba(30, 41, 59, 0.95)",
      }
    : {
        "--text": "#f8fafc",
        "--card-bg": "rgba(33, 35, 38, 0.95)",
        "--card-border": "rgba(255, 255, 255, 0.08)",
        "--row-bg": "rgba(55, 58, 62, 0.75)",
        "--detail-bg": "rgba(55, 58, 62, 0.55)",
        "--detail-row-bg": "rgba(72, 76, 81, 0.7)",
        "--title-text": "#f8fafc",
        "--footer-bg": "rgba(86, 90, 96, 0.95)",
        "--footer-text": "rgba(226, 232, 240, 0.8)",
        "--button-bg": "rgba(112, 116, 122, 0.95)",
        "--button-bg-hover": "rgba(120, 124, 130, 0.95)",
        "--button-text": "rgba(226, 232, 240, 0.8)",
        "--button-text-hover": "rgba(226, 232, 240, 0.95)",
      };

  return (
    <div className={containerClass} style={{ top: position.top, left: position.left, ...themeVars }}>
      <div className={widgetClass}>
        <div
          style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '12px',
            cursor: 'move',
            userSelect: 'none',
            color: 'var(--title-text)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
          }}
          onMouseDown={onMouseDown}
          title="Drag to move"
        >
          <span>AI Service Health</span>
          <span style={{
            fontSize: '9px',
            fontWeight: '500',
            opacity: 0.5,
            letterSpacing: '0.05em',
          }}>
            v2.0
          </span>
        </div>
        <div className={scrollableContentClass}>
        <div className={serviceContainerClass}>
          <div className={rowClass}>
            <span
              className={dotClass}
              style={{
                background: getDotColor(openai?.level),
                boxShadow: `0 0 8px ${getDotColor(openai?.level)}99`,
              }}
            />
            <span style={{ flex: 1, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
              OpenAI
              <span
                className={externalLinkClass}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  run(`open "${OPENAI_STATUS_PAGE}"`);
                }}
                title="View OpenAI status page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v6"/>
                  <path d="M10 14 21 3"/>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                </svg>
              </span>
            </span>
            <button
              className={`${toggleButtonClass} ${openaiOpen ? "open" : ""}`}
              onClick={() => setOpenaiOpen(!openaiOpen)}
              title={openaiOpen ? "Hide details" : "Show details"}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          {openaiOpen && (
            <div className={detailClass}>
              {OPENAI_MODEL_GROUPS.map((group) => (
                <React.Fragment key={group.label}>
                  <div
                    className={`${detailSectionClass} ${openModelGroups[group.label] ? "open" : ""}`}
                    onClick={() => {
                      setOpenModelGroups(prev => ({
                        ...prev,
                        [group.label]: !prev[group.label]
                      }));
                    }}
                  >
                    <span
                      className={smallDotClass}
                      style={{
                        background: getDotColor(openai?.level),
                        boxShadow: `0 0 4px ${getDotColor(openai?.level)}99`,
                      }}
                    />
                    <span style={{ flex: 1 }}>{group.label}</span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  {openModelGroups[group.label] && group.models.map((modelName) => (
                    <div key={modelName} className={detailRowClass}>
                      <span
                        className={tinyDotClass}
                        style={{
                          background: getDotColor(openai?.level),
                          boxShadow: `0 0 4px ${getDotColor(openai?.level)}99`,
                        }}
                      />
                      <span style={{ flex: 1 }}>{modelName}</span>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
                        {openai?.label || "Unknown"}
                      </span>
                    </div>
                  ))}
                </React.Fragment>
              ))}
              <div
                className={`${detailSectionClass} ${openModelGroups['APIs'] ? "open" : ""}`}
                onClick={() => {
                  setOpenModelGroups(prev => ({
                    ...prev,
                    'APIs': !prev['APIs']
                  }));
                }}
              >
                <span
                  className={smallDotClass}
                  style={{
                    background: getDotColor(openai?.level),
                    boxShadow: `0 0 4px ${getDotColor(openai?.level)}99`,
                  }}
                />
                <span style={{ flex: 1 }}>APIs &amp; Services</span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {openModelGroups['APIs'] && OPENAI_COMPONENTS.map((item) => {
                const match = openaiComponents?.find(
                  (c) => c.name?.toLowerCase() === item.key.toLowerCase()
                );
                const level = componentLevel(match?.status);
                return (
                  <div key={item.key} className={detailRowClass}>
                    <span
                      className={tinyDotClass}
                      style={{
                        background: getDotColor(level.level),
                        boxShadow: `0 0 4px ${getDotColor(level.level)}99`,
                      }}
                    />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
                      {level.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={serviceContainerClass} style={{ marginBottom: 0 }}>
          <div className={rowClass}>
            <span
              className={dotClass}
              style={{
                background: getDotColor(anthropic?.level),
                boxShadow: `0 0 8px ${getDotColor(anthropic?.level)}99`,
              }}
            />
            <span style={{ flex: 1, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
              Anthropic
              <span
                className={externalLinkClass}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  run(`open "${ANTHROPIC_STATUS_PAGE}"`);
                }}
                title="View Anthropic status page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v6"/>
                  <path d="M10 14 21 3"/>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                </svg>
              </span>
            </span>
            <button
              className={`${toggleButtonClass} ${anthropicOpen ? "open" : ""}`}
              onClick={() => setAnthropicOpen(!anthropicOpen)}
              title={anthropicOpen ? "Hide details" : "Show details"}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          {anthropicOpen && (
            <div className={detailClass}>
              {ANTHROPIC_COMPONENTS.map((item) => {
                const match = anthropicComponents?.find(
                  (c) => c.name?.toLowerCase() === item.key.toLowerCase()
                );
                const level = componentLevel(match?.status);
                return (
                  <div key={item.key} className={detailRowClass}>
                    <span
                      className={tinyDotClass}
                      style={{
                        background: getDotColor(level.level),
                        boxShadow: `0 0 4px ${getDotColor(level.level)}99`,
                      }}
                    />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
                      {level.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {error && (
          <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '8px' }}>
            Error: {error}
          </div>
        )}
        </div>
      </div>
      <div className={footerClass}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--footer-text)' }}>
          Last updated: {formatTime(lastUpdated)}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={buttonClass}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
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
            >
              <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
          </button>
          <button
            className={`${buttonClass} ${isRefreshing ? "spinning" : ""}`}
            onClick={() => {
              if (isRefreshing) return;
              setIsRefreshing(true);
              setTimeout(() => setIsRefreshing(false), 900);
            }}
            title="Refresh status"
            disabled={isRefreshing}
          >
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
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const render = (props) => <Widget {...props} />;
