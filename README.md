# Symmetry & Degeneracy in Quantum States

Here is a link to my [code](https://colab.research.google.com/drive/1z8qYA28eLUI7AMXBuLH5bUqU3V3AYJ6c?usp=sharing)!

## Overview

<img align="right" width="280" height="220" src="/_includes/pic.jpg">

Square -> Rectangle Deformation in 2D Infinite Potential Well

This project demonstrates how geometric symmetry produces degeneracy in quantum energy spectra, and how breaking that symmetry lifts degeneracy, using the 2D infinite potential well. We will compare the energy levels of a square well ($L_x = L_y$) to a rectangular well ($L_x \neq L_y$) and understand how degenerate multiplets split as the aspect ratio $L_x/L_y$ varies.

The objective is to understand more about the fundamentals of symmetry in physics:
- Symmetry (exchange symmetry $L_x = L_y$): degeneracy
- Symmetry breaking ($L_x \neq L_y$): degeneracy splitting

## Physics Background

### Energy Spectrum and Degeneracy

The energy eigenvalues: 

$$
E_{n_x,n_y} = \frac{\pi^2 \hbar^2}{2m}
\left(
\frac{n_x^2}{L_x^2} + \frac{n_y^2}{L_y^2}
\right)
$$

The energy of a square well:

$E_{n_x,n_y} \propto n_x^2 + n_y^2$

The energy for a rectangular well:

$$
E_{n_x,n_y} \propto 
\left(
\frac{n_x^2}{L_x^2} + \frac{n_y^2}{L_y^2}
\right)
$$


### 2D Infinite Well Eigenstates

For a paticle of mass $m$ in a 2D infinite well of side lengths $L_x, L_y$,

$$
V(x,y) =
\begin{cases}
0, & 0 < x < L_x,\; 0 < y < L_y \\
\infty, & \text{otherwise}
\end{cases}
$$


The eigenfunctions are

$$\psi_{n_x,n_y}(x,y) =
\sqrt{\frac{4}{L_x L_y}}
\sin\left(\frac{n_x \pi x}{L_x}\right)
\sin\left(\frac{n_y \pi y}{L_y}\right),
\quad n_x, n_y \in \mathbb{N}.
$$

## What this code does
- Computes the lowest $K$ energy levels for the 2D infinite well
- Detects degeneracy clusters (energies equal within a tolerance)
- Sweeps aspect ratio $r = L_x / L_y$ and tracks splitting of previously degenerate levels.
- Creates plots of
  - energy level diagram (square vs. rectangle)
  - degeneracy histogram
  - splitting curves $E(r)$ for selected multiplets
- Results:
  - Square: $r = 1$
    - Example: $E_{1,2} = E_{2,1}$
  - Rectangle: $r \neq 1$
    - Example: $E_{1,2} \neq E_{2,1}$
  
$$
E_{1,2}(r) \propto \frac{1^2}{(r L_y)^2} + \frac{2^2}{L_y^2},
\qquad
E_{2,1}(r) \propto \frac{2^2}{(r L_y)^2} + \frac{1^2}{L_y^2}.
$$

