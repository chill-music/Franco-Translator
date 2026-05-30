# FrancoAr — Egyptian Franco ↔ Arabic Translator

**FrancoAr** is a free, open-source bidirectional translator between Egyptian Arabic script and Franco-Arabic (Arabizi). It runs entirely in the browser with no accounts, sign-ups, or API keys required.

![FrancoAr Screenshot](https://via.placeholder.com/800x450?text=FrancoAr+Screenshot)

## ✨ Features

- **Bidirectional Translation** — Franco → Arabic and Arabic → Franco with a single click
- **Auto-Detection** — Automatically detects whether input is Arabic script or Franco text
- **Egyptian Dialect Native** — Handles Egyptian-specific mappings: ق = 2, ج = g, not j
- **Smart Spelling Variants** — Understands 7abibi, 7abeeby, habibi, and many more alternate spellings
- **Real-Time Translation** — Instant results as you type, no submit button needed
- **Confidence Scoring** — Shows how confident the engine is in each translation
- **Translation History** — Saves recent translations for quick re-use
- **Quick Reference Guide** — Built-in Franco number-to-letter mapping table
- **Dark & Light Themes** — Easy on the eyes in any environment
- **Bilingual UI** — Full English and Arabic interface
- **Privacy First** — All processing happens locally; no data sent to any server

## 🔗 Live Demo

Visit the live app: **[francoar.github.io](https://francoar.github.io/)**

## 🚀 How to Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/francoar.git
cd francoar

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Production Build

```bash
npm run build
npm run preview  # Preview the production build locally
```

## 🌐 Deploy on GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to "GitHub Actions"
4. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

5. Push to `main` — the site will be live at `https://<username>.github.io/francoar/`

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 6 |
| Styling | Custom CSS with CSS Variables |
| Fonts | Google Fonts (Cairo + Inter) |
| Deployment | GitHub Pages (static) |

## 📁 Project Structure

```
francoar/
├── public/
│   ├── favicon.svg          # App favicon
│   └── sitemap.xml          # SEO sitemap
├── src/
│   ├── components/
│   │   ├── GuidePanel.jsx   # Franco reference guide overlay
│   │   ├── HistoryPanel.jsx # Translation history list
│   │   ├── Icons.jsx        # SVG icon components
│   │   └── TranslatorPanel.jsx # Input/output panel
│   ├── hooks/
│   │   ├── useHistory.js    # History state management
│   │   ├── useTheme.js      # Theme toggle logic
│   │   └── useTranslation.js # Translation engine + auto-translate
│   ├── lib/
│   │   ├── constants.js     # Named constants
│   │   ├── dictionary.js    # Translation dictionaries
│   │   ├── i18n.js          # Multilingual UI strings
│   │   ├── storage.js       # Safe localStorage utilities
│   │   └── translator.js    # Translation engine
│   ├── App.jsx              # Main application component
│   ├── index.css            # All styles
│   └── main.jsx             # React entry point
├── index.html               # HTML shell with SEO meta tags
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies and scripts
```

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

Built for Egyptians, by Egyptians. Special thanks to the Franco-Arabic community for maintaining and evolving this unique digital language.
