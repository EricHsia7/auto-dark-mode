# Auto Dark Mode

**Auto Dark Mode** is a userscript that automatically applies a dark theme to any website. It analyzes the page's styles, inverts colors intelligently, and provides a control panel for toggling stylesheets.

## Features

- Automatically darkens websites based on their existing styles.
- Smart color inversion for backgrounds, text, and borders.
- Control panel to enable/disable specific stylesheets.
- Floating button to open the control panel.
- Respects system dark mode preference (`prefers-color-scheme`).
- Exclusion list for sites where dark mode should not be applied (e.g., Google, YouTube, GitHub).

## Installation

1. Install a userscript manager.
    > You can use [@quoid/userscripts](https://github.com/quoid/userscripts) on Safari.
2. [Download the latest release](https://erichsia7.github.io/auto-dark-mode/auto-dark-mode.user.js) or add the script via the userscript manager.

## Development

### Prerequisites

- Node.js (v20.x recommended)
- npm

### Build

```sh
npm install
npx webpack --mode=production
```

The output will be in the `dist/` directory.

### Project Structure

- `src/` - Source TypeScript and CSS files
- `config/` - Userscript metadata and exclusion list
- `dist/` - Built userscript output
- `.github/workflows/` - GitHub Actions CI/CD

### Main Files

- `src/index.ts`: Entry point, initializes the script.
- `src/initialize.ts`: Handles style extraction, inversion, and UI setup.
- `src/lib/styles.ts`: Style processing and inversion logic.
- `src/interface/control-panel/`: Control panel UI and styles.
- `src/interface/button/`: Floating button UI.
