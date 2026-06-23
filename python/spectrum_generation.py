# -*- coding: utf-8 -*-
"""
Symmetry & Degeneracy in 2D Infinite Potential Well
Square → Rectangle deformation via aspect ratio (r = L_x / L_y)

This module provides spectrum computation, degeneracy detection, and 
visualization for the 2D infinite well with variable aspect ratio.

Author: Christopher Le
Year: 2025-2026
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from dataclasses import dataclass
from typing import List, Tuple, Dict

def spectrum_2d_infinite_well(nmax: int, r: float) -> pd.DataFrame:
    """
    Compute the 2D infinite well energy spectrum.
    
    Returns a DataFrame of states (nx, ny) with dimensionless energies:
        E~(nx, ny; r) = nx^2 / r^2 + ny^2
    
    Assumes Ly = 1, Lx = r.
    
    Args:
        nmax: Maximum quantum number (cutoff for basis)
        r: Aspect ratio L_x / L_y
    
    Returns:
        DataFrame with columns [nx, ny, E], sorted by energy
    """
    rows = []
    for nx in range(1, nmax + 1):
        for ny in range(1, nmax + 1):
            E = (nx**2) / (r**2) + (ny**2)
            rows.append((nx, ny, E))
    
    df = pd.DataFrame(rows, columns=["nx", "ny", "E"])
    df = df.sort_values("E", kind="mergesort").reset_index(drop=True)
    return df


def cluster_degeneracies(energies: np.ndarray, tol: float = 1e-10) -> List[List[int]]:
    """
    Group sorted energies into clusters where adjacent energies differ by <= tol.
    
    Args:
        energies: Sorted array of energy values
        tol: Tolerance for grouping (default 1e-10)
    
    Returns:
        List of clusters, each cluster is a list of indices into the energies array
    """
    if len(energies) == 0:
        return []
    
    clusters = []
    start = 0
    for i in range(1, len(energies)):
        if abs(energies[i] - energies[i-1]) > tol:
            clusters.append(list(range(start, i)))
            start = i
    clusters.append(list(range(start, len(energies))))
    return clusters


def degeneracy_table(df: pd.DataFrame, k: int, tol: float = 1e-10) -> pd.DataFrame:
    """
    For the lowest k energies, return a table describing degeneracy clusters.
    
    Args:
        df: DataFrame from spectrum_2d_infinite_well
        k: Number of lowest levels to examine
        tol: Tolerance for grouping (default 1e-10)
    
    Returns:
        DataFrame with cluster_id, degeneracy, E, and states for each cluster
    """
    sub = df.iloc[:k].copy()
    clusters = cluster_degeneracies(sub["E"].to_numpy(), tol=tol)

    out_rows = []
    for c_id, idxs in enumerate(clusters):
        states = sub.loc[idxs, ["nx", "ny"]].to_numpy().tolist()
        E0 = float(sub.loc[idxs[0], "E"])
        out_rows.append({
            "cluster_id": c_id,
            "degeneracy": len(idxs),
            "E": E0,
            "states": str([(s[0], s[1]) for s in states])
        })
    
    return pd.DataFrame(out_rows)


def plot_levels_with_degeneracy(df: pd.DataFrame, k: int, tol: float = 1e-10, 
                                title: str = "", figsize: Tuple[int, int] = (10, 6)):
    """
    Plot the lowest k energy levels, colored by degeneracy.
    
    Args:
        df: DataFrame from spectrum_2d_infinite_well
        k: Number of lowest levels to plot
        tol: Tolerance for degeneracy detection
        title: Plot title
        figsize: Figure size (width, height)
    """
    sub = df.iloc[:k].copy()
    clusters = cluster_degeneracies(sub["E"].to_numpy(), tol=tol)

    # Map index -> degeneracy size
    deg_size = np.zeros(k, dtype=int)
    for idxs in clusters:
        for i in idxs:
            deg_size[i] = len(idxs)

    plt.figure(figsize=figsize)
    x = np.arange(1, k+1)
    scatter = plt.scatter(x, sub["E"], c=deg_size, cmap="RdYlBu_r", s=50, alpha=0.7)
    plt.colorbar(scatter, label="Degeneracy")
    plt.xlabel("Level index (sorted)")
    plt.ylabel("Dimensionless energy $\\tilde{E}$")
    plt.title(title or f"Lowest {k} energy levels (colored by degeneracy)")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()


def plot_splitting_curves(df_r1: pd.DataFrame, k: int, r_values: np.ndarray, 
                          nmax: int, figsize: Tuple[int, int] = (12, 7)):
    """
    Plot degeneracy splitting as aspect ratio varies.
    
    For each degenerate multiplet at r=1, tracks its constituent states 
    across the parameter sweep and plots energy vs. aspect ratio.
    
    Args:
        df_r1: Spectrum at r=1
        k: Number of lowest levels (at r=1) to examine
        r_values: Array of aspect ratio values to sweep
        nmax: Basis cutoff for full spectrum computation
        figsize: Figure size
    """
    clusters = cluster_degeneracies(df_r1.iloc[:k]["E"].to_numpy(), tol=1e-10)
    
    plt.figure(figsize=figsize)
    
    # Only plot degenerate clusters
    degenerate_clusters = [c for c in clusters if len(c) > 1]
    colors = plt.cm.tab10(np.linspace(0, 1, len(degenerate_clusters)))
    
    for cluster_idx, (color, idxs) in enumerate(zip(colors, degenerate_clusters)):
        states_in_cluster = df_r1.iloc[idxs][["nx", "ny"]].values.tolist()
        for (nx, ny) in states_in_cluster:
            E_curve = (nx**2)/(r_values**2) + (ny**2)
            plt.plot(r_values, E_curve, color=color, label=f"({nx},{ny})", alpha=0.8)
    
    plt.axvline(1.0, linestyle="--", color="black", linewidth=2, label="Square (r=1)")
    plt.xlabel("Aspect ratio $r = L_x / L_y$", fontsize=12)
    plt.ylabel("Dimensionless energy $\\tilde{E}(r)$", fontsize=12)
    plt.title("Degeneracy splitting under rectangle deformation", fontsize=14)
    plt.legend(ncols=3, fontsize=9, loc="best")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()


def swap_pair_demo(nx: int, ny: int, r_values: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Compute energy curves for exchange-symmetric pair (nx, ny) and (ny, nx).
    
    Args:
        nx, ny: Quantum numbers
        r_values: Array of aspect ratio values
    
    Returns:
        Tuple of energy arrays E1 and E2 for (nx,ny) and (ny,nx) respectively
    """
    E1 = (nx**2)/(r_values**2) + (ny**2)
    E2 = (ny**2)/(r_values**2) + (nx**2)
    return E1, E2


def main():
    """
    Main demonstration: compute spectra and generate plots.
    """
    print("=" * 70)
    print("2D Infinite Well: Symmetry & Degeneracy Analysis")
    print("=" * 70)
    
    # Parameters
    nmax = 12      # Basis cutoff
    k = 40         # Number of lowest levels to examine
    tol = 1e-10    # Tolerance for degeneracy detection
    
    # 1. Compute spectrum at r=1 (square)
    print("\n[1] Computing spectrum at r = 1.0 (square well)...")
    df_sq = spectrum_2d_infinite_well(nmax=nmax, r=1.0)
    deg_sq = degeneracy_table(df_sq, k=k, tol=tol)
    
    print(f"\nFirst 15 levels at r=1:")
    print(deg_sq.head(15))
    
    # Count degeneracies
    degenerate_count = (deg_sq["degeneracy"] > 1).sum()
    print(f"\nDegenerate multiplets in lowest {k} levels: {degenerate_count}")
    print(f"Total degenerate states: {(deg_sq[deg_sq['degeneracy'] > 1]['degeneracy']).sum()}")
    
    # 2. Plot energy levels at r=1
    print("\n[2] Plotting energy levels at r=1...")
    plot_levels_with_degeneracy(df_sq, k=k, tol=tol, 
                                title="Square well (r=1): Degeneracies visible")
    
    # 3. Compute r-sweep for splitting curves
    print("\n[3] Computing spectral evolution under deformation...")
    r_values = np.linspace(0.7, 1.3, 250)
    
    print(f"[4] Plotting degeneracy splitting ({len(r_values)} r-values)...")
    plot_splitting_curves(df_sq.iloc[:k], k=k, r_values=r_values, nmax=nmax)
    
    # 4. Detailed demonstration of exchange pair
    print("\n[5] Exchange-symmetric pair demo: (1,2) and (2,1)...")
    r_vals_demo = np.linspace(0.8, 1.2, 200)
    E12, E21 = swap_pair_demo(1, 2, r_vals_demo)
    
    plt.figure(figsize=(10, 6))
    plt.plot(r_vals_demo, E12, "b-", linewidth=2, label="$E_{1,2}(r)$")
    plt.plot(r_vals_demo, E21, "r--", linewidth=2, label="$E_{2,1}(r)$")
    plt.axvline(1.0, linestyle=":", color="gray", linewidth=2, alpha=0.7)
    plt.axhline(5.0, linestyle="--", color="green", linewidth=1, alpha=0.5)  # At r=1
    plt.xlabel("Aspect ratio $r = L_x / L_y$", fontsize=12)
    plt.ylabel("Dimensionless energy $\\tilde{E}$", fontsize=12)
    plt.title("Exchange symmetry: Degeneracy at r=1, splitting for r≠1", fontsize=14)
    plt.legend(fontsize=11)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()
    
    print("\n" + "=" * 70)
    print("Analysis complete!")
    print("=" * 70)
    print("\nKey findings:")
    print("• At r=1: exchange symmetry (x ↔ y) produces degeneracy for n_x ≠ n_y")
    print("• For r≠1: symmetry breaks and degenerate pairs split smoothly")
    print("• Splitting magnitude increases with |r - 1|")
    print("=" * 70)


if __name__ == "__main__":
    main()
