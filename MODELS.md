# Models Configuration (models.json)

This file contains the model and component lists for the AI Service Health Widget. It's fetched automatically by the widget, allowing you to update model lists without changing the widget code.

## 📝 How to Update Models

When new models are released:

1. Edit `models.json` in this repository
2. Add/remove/update models in the appropriate section
3. Commit and push to GitHub
4. Users automatically get updates when they refresh Übersicht

**That's it!** No code changes needed.

## 🏗️ Structure

```json
{
  "version": "2.0.0",
  "lastUpdated": "2026-02-13",
  "openai": {
    "modelGroups": [...],    // Model families for display
    "components": [...]       // API service components
  },
  "anthropic": {
    "components": [...]       // Anthropic service components
  }
}
```

## 📋 Adding New Models

### For OpenAI Models

**New Model Family:**
```json
{
  "label": "GPT-6",
  "models": ["GPT-6", "GPT-6 pro", "GPT-6 mini"]
}
```

**New API Component:**
```json
{
  "key": "Video Generation",
  "label": "Video Generation"
}
```

### For Anthropic Models

**New Component:**
```json
{
  "key": "Claude Mobile",
  "label": "Claude Mobile"
}
```

## 🔄 Fallback Behavior

- Widget fetches `models.json` once on initial load
- If fetch fails, uses hardcoded fallback lists
- Models are cached in widget state
- Re-fetch not attempted on subsequent status updates

## ⚡ Performance

- **Single fetch**: Only loaded once per Übersicht session
- **Cached**: Stored in state, no repeated network requests
- **Fast**: ~1-2KB file, minimal load time
- **Reliable**: Hardcoded fallbacks ensure widget always works

## 🎯 Best Practices

1. **Keep it simple** - Only add models that actually exist
2. **Match API format** - Use exact names from status API
3. **Test locally** - Verify JSON is valid before pushing
4. **Update version** - Increment version number for tracking
5. **Add date** - Update `lastUpdated` field

## 🔍 Validation

Before committing, validate your JSON:
```bash
# Using Python
python3 -m json.tool models.json

# Using jq
jq . models.json

# Or use online: https://jsonlint.com/
```

## 📚 Example Update

**When GPT-6 is released:**

1. Open `models.json`
2. Add new model group:
```json
{
  "label": "GPT-6",
  "models": ["GPT-6", "GPT-6 turbo", "GPT-6 mini"]
}
```
3. Update version and date
4. Commit: `git commit -m "Add GPT-6 models"`
5. Push: `git push`
6. Done! Users get it automatically ✅

## 🛡️ Safety

- Invalid JSON falls back to hardcoded models
- Widget never breaks due to bad data
- Always test changes before pushing to main branch
