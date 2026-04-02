# FindX — VS Code-style Search for Chrome

FindX brings the power of VS Code's search bar to any webpage. Highlight all matches, navigate between them, and filter with case sensitivity, whole word, or full regex support.

## Screenshots

**Basic search — highlights all matches instantly**
![Basic search](https://raw.githubusercontent.com/sulmanazhar2/findx-chrome-extension/master/screenshots/01-basic-search.png)

**Whole word match — "web" won't match "website" or "webkit"**
![Whole word match](https://raw.githubusercontent.com/sulmanazhar2/findx-chrome-extension/master/screenshots/02-whole-word.png)

**Regex search — find all years from the 1900s with `\b19\d{2}\b`**
![Regex search](https://raw.githubusercontent.com/sulmanazhar2/findx-chrome-extension/master/screenshots/03-regex-years.png)

**Case sensitive — "ECMAScript" won't match "ecmascript"**
![Case sensitive](https://raw.githubusercontent.com/sulmanazhar2/findx-chrome-extension/master/screenshots/04-case-sensitive.png)

**No results state**
![No results](https://raw.githubusercontent.com/sulmanazhar2/findx-chrome-extension/master/screenshots/05-no-results.png)

---

## Features

- **Instant highlighting** — all matches highlighted as you type
- **Match counter** — shows current position e.g. `4 of 83`
- **Navigate matches** — `Enter` / `Shift+Enter` or arrow buttons
- **Case sensitive** toggle (`Aa`)
- **Whole word** match toggle (`ab`)
- **Regular expression** support (`.*`)
- **Keyboard shortcut** — `Cmd+Shift+F` (Mac) / `Ctrl+Shift+F` (Windows)
- **Esc to close** — clears all highlights cleanly
- VS Code dark theme UI — non-intrusive overlay in the top-right corner

## Installation

### From the Chrome Web Store
*(Coming soon)*

### Load unpacked (developer mode)
1. Clone this repo
   ```bash
   git clone https://github.com/sulmanazhar2/findx-chrome-extension.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the cloned folder

## Usage

| Action | Shortcut |
|---|---|
| Open / close FindX | `Cmd+Shift+F` (Mac) · `Ctrl+Shift+F` (Win) |
| Next match | `Enter` or `▼` button |
| Previous match | `Shift+Enter` or `▲` button |
| Close | `Esc` or `×` button |
| Toggle case sensitive | `Aa` button |
| Toggle whole word | `ab` button |
| Toggle regex | `.*` button |

## Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/sulmanazhar2/findx-chrome-extension/issues) on GitHub. Include the page URL and what you searched for if relevant.

## License

[MIT](LICENSE)
