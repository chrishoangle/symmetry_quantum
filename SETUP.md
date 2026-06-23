# Setup & Deployment Guide

## 📦 Project Structure

```
symmetry_quantum/
├── README.md                              # Main documentation
├── SETUP.md                               # This file
├── package.json                           # React/Node dependencies
├── .gitignore                             # Git ignore rules
├── public/
│   └── index.html                         # React app template
├── src/
│   ├── index.js                           # React entry point
│   ├── index.css                          # Styling
│   └── components/
│       └── QuantumDegeneracyWidget.jsx    # Main interactive component
├── python/
│   └── spectrum_generation.py             # Python spectrum computation
└── docs/
    └── index.html                         # GitHub Pages static site
```

---

## 🚀 Quick Start

### 1. **Create the GitHub Repository**

Go to [github.com/new](https://github.com/new) and create a new repository:
- **Repository name**: `symmetry_quantum`
- **Description**: `Interactive visualization of symmetry and degeneracy in 2D quantum wells`
- **Visibility**: Public
- **Initialize with**: None (we'll push existing files)

### 2. **Clone Locally**

```bash
git clone https://github.com/chrishoangle/symmetry_quantum.git
cd symmetry_quantum
```

### 3. **Create Project Structure**

If cloning an empty repo, create these directories:

```bash
mkdir -p public src/components python docs
```

### 4. **Add Files**

Copy the files from this setup into their respective locations:

```
public/
  └── index.html                          (from public_index.html)

src/
  ├── index.js                            (from src_index.js)
  ├── index.css                           (from src_index.css)
  └── components/
      └── QuantumDegeneracyWidget.jsx     (from QuantumDegeneracyWidget.jsx)

python/
  └── spectrum_generation.py              (from spectrum_generation.py)

docs/
  └── index.html                          (from docs_index.html)

./
  ├── README.md
  ├── SETUP.md (this file)
  ├── package.json
  └── .gitignore
```

---

## 💻 Local Development

### Install Dependencies

```bash
npm install
```

This installs:
- `react` and `react-dom` (18.2.0)
- `recharts` (2.10.0) — for interactive charts
- `react-scripts` (5.0.1) — build tools

### Run the Development Server

```bash
npm start
```

The app opens automatically at `http://localhost:3000` with hot reloading.

### Build for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` directory.

---

## 🐍 Python Spectrum Generation

The Python module allows you to regenerate or extend spectral data independently.

### Prerequisites

```bash
pip install numpy scipy pandas matplotlib
```

### Run Spectrum Analysis

```bash
cd python
python spectrum_generation.py
```

Generates:
- Energy spectra for r ∈ [0.7, 1.3]
- Degeneracy cluster tables
- Splitting curve visualizations
- Exchange pair demonstrations

### Use in Your Own Scripts

```python
from spectrum_generation import (
    spectrum_2d_infinite_well,
    cluster_degeneracies,
    degeneracy_table,
    plot_levels_with_degeneracy,
    plot_splitting_curves
)

# Compute spectrum
df = spectrum_2d_infinite_well(nmax=12, r=1.0)

# Find degeneracies
deg_table = degeneracy_table(df, k=40)
print(deg_table)

# Visualize
plot_levels_with_degeneracy(df, k=40, title="My Spectrum")
```

---

## 🌐 Deploy to GitHub Pages

GitHub Pages hosts your static site directly from the `docs/` directory.

### Steps

1. **Push code to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit: Add quantum degeneracy project"
   git push origin main
   ```

2. **Enable GitHub Pages**

   Go to your repository → **Settings** → **Pages**
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/ (root)` or `/docs`

3. **Your site is live!**

   Visit: `https://chrishoangle.github.io/symmetry_quantum`

### Important: Linking to the Interactive Demo

The static `docs/index.html` currently shows installation instructions. To deploy the React app:

**Option A: Build & Deploy** (recommended)
```bash
npm run build
cp -r build/* docs/
git add docs/
git commit -m "Deploy React build to GitHub Pages"
git push origin main
```

**Option B: Use GitHub Actions** (automatic)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci && npm run build
      - run: cp -r build/* docs/
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "Auto-deploy: React build"
          file_pattern: "docs/"
```

---

## 📋 File Checklist

Before pushing to GitHub, verify all files are in place:

```
✓ README.md                    (Main documentation)
✓ SETUP.md                     (This file)
✓ package.json                 (Dependencies)
✓ .gitignore                   (Git rules)
✓ public/index.html            (React template)
✓ src/index.js                 (React entry)
✓ src/index.css                (Styling)
✓ src/components/
  ✓ QuantumDegeneracyWidget.jsx (Main widget)
✓ python/spectrum_generation.py (Python code)
✓ docs/index.html              (GitHub Pages)
```

---

## 🔄 Git Workflow

### First-Time Setup

```bash
git config --global user.name "Christopher Le"
git config --global user.email "ichrisle2004@g.ucla.edu"
```

### Regular Commits

```bash
# Make changes...
git add .
git commit -m "Add X feature / Fix Y bug / Update Z"
git push origin main
```

### Create a Branch (optional)

```bash
git checkout -b feature/new-visualization
# Make changes...
git add .
git commit -m "Add new feature"
git push origin feature/new-visualization
# Create PR on GitHub
```

---

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
npm start -- --port 3001
```

**npm not found?**
Install [Node.js](https://nodejs.org/) (includes npm)

**GitHub Pages not updating?**
- Clear browser cache (Ctrl+Shift+Delete)
- Wait 1-2 minutes for deployment
- Check "Actions" tab for build status

**Python import errors?**
```bash
pip install numpy scipy pandas matplotlib --upgrade
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Recharts Gallery](https://recharts.org/examples)
- [GitHub Pages Docs](https://pages.github.com)
- [NumPy Docs](https://numpy.org/doc)

---

## 💡 Tips

1. **Update dependencies regularly**
   ```bash
   npm update
   ```

2. **Keep a clean commit history**
   - Write descriptive commit messages
   - One feature per commit

3. **Use branches for major changes**
   - Keeps `main` stable
   - Easy to review via pull requests

4. **Document as you go**
   - Add comments to complex code
   - Update README with new features

---

**Questions?** Check the main README.md or open an issue on GitHub!
