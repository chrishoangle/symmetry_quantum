# Symmetry & Degeneracy in 2D Quantum Wells

**Computational demonstration of exchange symmetry producing degeneracy in the 2D infinite potential well, and how deformation breaks symmetry to lift degeneracy.**

[![Interactive Demo](https://img.shields.io/badge/View-Interactive%20Demo-blue?style=for-the-badge)](https://chrishoangle.github.io/symmetry_quantum)

## Overview

In quantum mechanics, symmetries of a physical system often lead to degeneracies in the energy spectrum. This project computationally demonstrates how exchange symmetry in a **2D infinite square well** produces degenerate energy levels, and how deforming the geometry into a rectangle breaks that symmetry, causing degenerate multiplets to split.

### The Physics

For a particle confined to a 2D infinite potential well with dimensions $L_x$ and $L_y$, the dimensionless energy spectrum is:

$$\tilde{E}_{n_x,n_y}(r) = \frac{n_x^2}{r^2} + n_y^2$$

where $r = L_x / L_y$ is the aspect ratio and we normalize $L_y = 1$.

#### At $r = 1$ (Square Well)
- **Exchange symmetry** $(x \leftrightarrow y)$ implies $(n_x, n_y) \leftrightarrow (n_y, n_x)$
- States with $n_x \neq n_y$ become **degenerate**: $E_{n_x,n_y} = E_{n_y,n_x}$
- Example: $(1,2)$ and $(2,1)$ have identical energy

#### At $r \neq 1$ (Rectangular Well)
- Symmetry is broken; exchange partners are no longer equivalent
- Degenerate multiplets **split smoothly** as $r$ deviates from 1
- Splitting magnitude increases with $|r - 1|$

### Key Results

- ✅ Verified exchange symmetry produces degeneracy at $r=1$
- ✅ Demonstrated continuous degeneracy lifting under deformation
- ✅ Quantified splitting patterns across 40+ energy levels
- ✅ Interactive visualization shows real-time spectral evolution

---

## 🎯 Interactive Visualization

**[Live Demo](https://chrishoangle.github.io/symmetry_quantum)**

The interactive widget lets you:
- 🎚️ **Adjust aspect ratio slider** — watch energy levels update in real-time
- 📊 **Toggle visualizations** — energy diagrams, splitting curves, or both
- 🔴 **Highlight degeneracies** — red circles mark degenerate states
- 📋 **Inspect degeneracy clusters** — table showing all multiplets at current $r$

#### Three Complementary Views

1. **Energy Level Diagram**
   - Scatter plot of lowest ~40 energy levels
   - Red circles = degenerate states, blue = non-degenerate
   - Hover for state labels and degeneracy counts

2. **Splitting Curves**
   - Line plot tracking individual states across the $r$ range [0.6, 1.4]
   - Shows how degenerate pairs diverge smoothly from $r=1$
   - Demonstrates continuous evolution of spectral structure

3. **Degeneracy Table**
   - Lists all degeneracy clusters at current $r$
   - Displays energy, constituent states, and multiplet size

---

## 📂 Project Structure

```
symmetry_quantum/
├── README.md                          # This file
├── SETUP.md                           # Detailed setup guide
├── package.json                       # React/Node dependencies
├── src/
│   ├── index.js                       # React entry point
│   ├── index.css                      # Styling
│   └── components/
│       └── QuantumDegeneracyWidget.jsx    # Interactive React widget
├── python/
│   └── spectrum_generation.py        # Python implementation (spectrum computation)
├── public/
│   └── index.html                    # HTML template
├── docs/
│   └── index.html                    # GitHub Pages entry point
└── .gitignore
```

---

## 🛠️ Setup & Usage

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation

```bash
git clone https://github.com/chrishoangle/symmetry_quantum.git
cd symmetry_quantum
npm install
```

### Running Locally

```bash
npm start
```

Opens the interactive widget in your browser at `http://localhost:3000`.

### Python Spectrum Generation

If you want to regenerate or extend the spectral data:

```bash
cd python
python spectrum_generation.py
```

Outputs:
- Energy spectra for various aspect ratios
- Degeneracy cluster tables
- Plotting data for splitting curves

---

## 🧮 Implementation Details

### Computational Approach

1. **Spectrum Generation**
   - Enumerate eigenstates $(n_x, n_y)$ up to a basis cutoff ($n_{\max} = 12$)
   - Compute dimensionless energies $\tilde{E} = n_x^2 / r^2 + n_y^2$
   - Sort by energy; examine lowest $k = 40$ levels

2. **Degeneracy Detection**
   - Group consecutive energy levels within numerical tolerance ($\epsilon = 10^{-9}$)
   - Identify multiplets; map states to clusters
   - Track exchange-symmetry pairs across parameter sweep

3. **Visualization**
   - Pre-compute spectra for 150 aspect ratio values (0.6 to 1.4)
   - Interactive React component renders charts on-demand
   - Uses Recharts for scalable, responsive plotting

### Technology Stack

- **Frontend**: React, Recharts (charting)
- **Computation**: JavaScript (NumPy-style calculations in-browser)
- **Python** (original): NumPy, SciPy, Matplotlib, Pandas
- **Deployment**: GitHub Pages

---

## 📊 Example Results

### At $r = 1.0$ (Square)
- Lowest 12 levels include several degenerate pairs
- Example: $(1,2), (2,1), (1,3), (3,1), (2,3), (3,2)$ form three doublets

### At $r = 0.8$ (Rectangle, wider)
- Doublets split; $(1,2)$ and $(2,1)$ energies diverge
- Splitting magnitude: $\Delta E \approx 0.3$ (dimensionless units)

### At $r = 1.2$ (Rectangle, taller)
- Similar splitting in opposite direction
- Symmetry breaking produces systematic energy-level shifts

---

## 🔗 References & Context

**Concepts**
- Symmetry and degeneracy in quantum mechanics (Griffiths, *Introduction to Quantum Mechanics*)
- Group theory and spectral analysis
- Perturbation theory and symmetry breaking

**Related Work**
- 2D particle in a box (textbook problem)
- Degenerate perturbation theory
- Energy-level diagrams under parameter variation

---

## 📝 Author

**Christopher Le**  
UCLA Physics, Applied Mathematics, Statistics & Data Science (Class of 2026)  
[GitHub](https://github.com/chrishoangle) | [LinkedIn](https://linkedin.com/in/chrishoangle)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Feedback, bug reports, and improvements welcome! Please open an issue or pull request.

---

### Citation

If you use this work in research or education, please cite:

```bibtex
@software{le2026symmetry,
  author = {Le, Christopher},
  title = {Symmetry and Degeneracy in 2D Quantum Wells},
  url = {https://github.com/chrishoangle/symmetry_quantum},
  year = {2026}
}
```
