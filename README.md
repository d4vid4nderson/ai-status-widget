# AI Service Health Widget (Übersicht)

A lightweight desktop widget for macOS Übersicht that shows live service health for **OpenAI** and **Anthropic**, with expandable model/component details, drag-to-move positioning, and light/dark themes.

## Features
- Live status for OpenAI and Anthropic (Statuspage API)
- Expandable model/component lists
- Drag-and-drop positioning (header drag)
- Light/Dark mode toggle
- Manual refresh button (smooth fetch, no hard reload)
- Auto refresh every 2 minutes
- Footer shows **Last updated** (successful fetch) and **Last checked** (attempt)

## Requirements
- macOS
- Übersicht (download:  
  ```
  https://tracesof.net/uebersicht/
  ```
  )

## Install
1. Download or clone this repo.
2. Copy the widget folder into your Übersicht widgets directory.

### Copy (recommended)
```bash
mkdir -p "/Users/$USER/Library/Application Support/Übersicht/widgets"
cp -R "/Users/$USER/Downloads/ai-status-widget" "/Users/$USER/Library/Application Support/Übersicht/widgets/"
```

> Note: On some systems the folder name appears as `Übersicht` (combined-umlaut).
> If the widget doesn’t appear, confirm the actual folder name under:
> `/Users/$USER/Library/Application Support/`

## Enable
1. Open Übersicht.
2. Find **AI Service Health** in the widget list.
3. Enable it.

## Update after changes
```bash
cp "/Users/$USER/Downloads/ai-status-widget/index.jsx" \
   "/Users/$USER/Library/Application Support/Übersicht/widgets/ai-status-widget/index.jsx"
```

If your folder is named `Übersicht`:
```bash
cp "/Users/$USER/Downloads/ai-status-widget/index.jsx" \
   "/Users/$USER/Library/Application Support/Übersicht/widgets/ai-status-widget/index.jsx"
```

## Uninstall
1. Disable the widget in Übersicht.
2. Remove the widget folder:
```bash
rm -rf "/Users/$USER/Library/Application Support/Übersicht/widgets/ai-status-widget"
```

If your folder is named `Übersicht`:
```bash
rm -rf "/Users/$USER/Library/Application Support/Übersicht/widgets/ai-status-widget"
```

## Usage
- **Move:** drag the header.
- **Expand:** click “Show” on OpenAI/Anthropic.
- **Theme:** toggle sun/moon in the footer.
- **Refresh:** click the download icon in the footer.

## Notes
- Status data is fetched from:
  - OpenAI: `https://status.openai.com/api/v2/summary.json`
  - Anthropic: `https://status.claude.com/api/v2/summary.json`
- Refresh interval is 2 minutes (`refreshFrequency = 120000`).

## Troubleshooting
- **Widget not showing:** verify the widget lives in the correct `Übersicht/widgets` folder and is enabled.
- **Footer times look wrong:** “Last updated” only changes on successful fetch. “Last checked” changes on every attempt.
- **No data:** verify your network and try the manual refresh button.

