import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';

// Links shown in the header. Set PORTFOLIO_URL when the portfolio link is final.
const GITHUB_URL = 'https://github.com/chrishoangle';
const REPO_URL = 'https://github.com/chrishoangle/symmetry_quantum';
const PORTFOLIO_URL = null;

const LIGHT = {
  text: '#1f2937', muted: '#6b7280', grid: '#e5e7eb',
  single: '#2563eb', degen: '#c2410c', guide: '#374151', tooltipBg: '#ffffff',
};
const DARK = {
  text: '#f3f4f6', muted: '#9ca3af', grid: '#374151',
  single: '#60a5fa', degen: '#fb923c', guide: '#d1d5db', tooltipBg: '#1f2937',
};

// Follows the operating system's light/dark setting.
function usePrefersDark() {
  const [dark, setDark] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return dark;
}

const fmt2 = (v) => Number(v).toFixed(2);

export default function QuantumDegeneracyWidget() {
  const [aspectRatio, setAspectRatio] = useState(1.0);
  const [nmax] = useState(12);
  const [k] = useState(40);
  const dark = usePrefersDark();
  const C = dark ? DARK : LIGHT;

  // Energy E(nx, ny; r) = nx^2 / r^2 + ny^2 (Ly = 1, Lx = r), sorted ascending.
  const computeSpectrum = (r, nmax) => {
    const states = [];
    for (let nx = 1; nx <= nmax; nx++) {
      for (let ny = 1; ny <= nmax; ny++) {
        const E = (nx * nx) / (r * r) + (ny * ny);
        states.push({ nx, ny, E, label: `(${nx},${ny})` });
      }
    }
    states.sort((a, b) => a.E - b.E);
    return states;
  };

  // Group adjacent sorted energies whose gap is <= tol.
  const detectDegeneracies = (states, tol = 1e-9) => {
    const clusters = [];
    let start = 0;
    for (let i = 1; i < states.length; i++) {
      if (Math.abs(states[i].E - states[i - 1].E) > tol) {
        clusters.push(states.slice(start, i));
        start = i;
      }
    }
    clusters.push(states.slice(start));
    return clusters;
  };

  // Track every state that is degenerate at r = 1 across r in [0.6, 1.4].
  const splittingData = useMemo(() => {
    const rVals = Array.from({ length: 150 }, (_, i) => 0.6 + (i / 149) * 0.8);
    const spectrumAtR1 = computeSpectrum(1.0, nmax);
    const clusters = detectDegeneracies(spectrumAtR1.slice(0, k), 1e-9);

    const trackedStates = [];
    for (const cluster of clusters) {
      if (cluster.length > 1) trackedStates.push(...cluster);
    }

    const data = rVals.map((r) => {
      const point = { r };
      trackedStates.forEach((state, idx) => {
        point[`E_${idx}`] = (state.nx * state.nx) / (r * r) + (state.ny * state.ny);
      });
      return point;
    });

    return { data, trackedStates };
  }, [nmax, k]);

  const currentSpectrum = useMemo(
    () => computeSpectrum(aspectRatio, nmax).slice(0, k),
    [aspectRatio, nmax, k]
  );

  const currentDegeneracies = useMemo(() => {
    const clusters = detectDegeneracies(currentSpectrum, 1e-9);
    return clusters.map((cluster, idx) => ({
      id: idx + 1, // display from 1
      deg: cluster.length,
      E: cluster[0].E,
      states: cluster.map((s) => s.label).join(', '),
    }));
  }, [currentSpectrum]);

  // Map each state label to its cluster size, instead of searching strings.
  const degByLabel = useMemo(() => {
    const m = {};
    for (const c of currentDegeneracies) {
      c.states.split(', ').forEach((lbl) => { m[lbl] = c.deg; });
    }
    return m;
  }, [currentDegeneracies]);

  const levelDiagramData = currentSpectrum.map((state, idx) => ({
    index: idx + 1,
    E: state.E,
    label: state.label,
    degeneracy: degByLabel[state.label] || 1,
  }));

  const splittingCurveData = splittingData.data;
  const trackedStates = splittingData.trackedStates;
  const lineColors = ['#2563eb', '#c2410c', '#059669', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];

  const panel = {
    background: C.tooltipBg, border: `1px solid ${C.grid}`, borderRadius: 8, padding: 16,
  };

  return (
    <div className="app">
      <header className="site-header">
        <div>
          <h1>Symmetry and Degeneracy in 2D Quantum Wells</h1>
          <p className="byline">Christopher Le</p>
        </div>
        <nav className="site-links" aria-label="Links">
          <a href={GITHUB_URL}>GitHub</a>
          <a href={REPO_URL}>Repository</a>
          {PORTFOLIO_URL && <a href={PORTFOLIO_URL}>Portfolio</a>}
        </nav>
      </header>

      <section className="panel" style={panel}>
        <label htmlFor="ar" style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: C.text }}>
          Aspect ratio r = L_x / L_y: {aspectRatio.toFixed(3)}
        </label>
        <input
          id="ar"
          type="range"
          min="0.5"
          max="1.5"
          step="0.01"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
          Rectangle ← Square (r = 1) → Rectangle
        </div>
      </section>

      <section className="charts">
        <div className="panel" style={panel}>
          <h2 className="panel-title" style={{ color: C.text }}>
            Energy levels at r = {aspectRatio.toFixed(3)}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 16, bottom: 24, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="index" name="Level" tick={{ fill: C.muted, fontSize: 12 }}
                label={{ value: 'Level (sorted by energy)', position: 'insideBottom', offset: -12, fill: C.muted, fontSize: 12 }} />
              <YAxis dataKey="E" name="Energy" tickFormatter={fmt2} tick={{ fill: C.muted, fontSize: 12 }}
                label={{ value: 'Energy (dimensionless)', angle: -90, position: 'insideLeft', fill: C.muted, fontSize: 12 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: C.tooltipBg, color: C.text, border: `1px solid ${C.grid}`, padding: 8, borderRadius: 4, fontSize: 12 }}>
                      <div>Level {d.index}</div>
                      <div>State {d.label}</div>
                      <div>Energy {d.E.toFixed(3)}</div>
                      <div>Degeneracy {d.degeneracy}</div>
                    </div>
                  );
                }}
              />
              <Scatter
                data={levelDiagramData}
                shape={(props) => {
                  const { cx, cy, payload } = props;
                  const degen = payload.degeneracy > 1;
                  return <circle cx={cx} cy={cy} r={degen ? 6 : 3.5}
                    fill={degen ? C.degen : C.single} opacity={0.85} />;
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="legend" style={{ color: C.muted }}>
            <span><i className="swatch" style={{ background: C.degen }} /> Degenerate: two or more states share one energy</span>
            <span><i className="swatch" style={{ background: C.single }} /> Single state</span>
          </div>
        </div>

        <div className="panel" style={panel}>
          <h2 className="panel-title" style={{ color: C.text }}>Splitting curves</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={splittingCurveData} margin={{ top: 28, right: 16, bottom: 24, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="r" type="number" domain={[0.6, 1.4]} tickFormatter={fmt2}
                tick={{ fill: C.muted, fontSize: 12 }}
                label={{ value: 'Aspect ratio r', position: 'insideBottom', offset: -12, fill: C.muted, fontSize: 12 }} />
              <YAxis tickFormatter={fmt2} tick={{ fill: C.muted, fontSize: 12 }}
                label={{ value: 'Energy (dimensionless)', angle: -90, position: 'insideLeft', fill: C.muted, fontSize: 12 }} />
              <Tooltip
                labelFormatter={(v) => `r = ${Number(v).toFixed(3)}`}
                formatter={(v, name) => [Number(v).toFixed(3), name]}
                contentStyle={{ background: C.tooltipBg, border: `1px solid ${C.grid}`, color: C.text, fontSize: 12 }}
              />
              <ReferenceLine x={1} stroke={C.guide} strokeDasharray="5 5"
                label={{ value: 'r = 1 (square)', position: 'top', fill: C.muted, fontSize: 12 }} />
              {trackedStates.slice(0, 7).map((state, idx) => (
                <Line
                  key={`${state.nx}-${state.ny}`}
                  type="monotone"
                  dataKey={`E_${idx}`}
                  stroke={lineColors[idx % lineColors.length]}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                  name={state.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="legend" style={{ color: C.muted }}>
            Curves that meet at r = 1 are states with the same energy there.
          </div>
        </div>
      </section>

      <section className="panel" style={panel}>
        <details>
          <summary style={{ cursor: 'pointer', color: C.text, fontWeight: 600 }}>
            Raw data: degeneracy clusters at r = {aspectRatio.toFixed(3)}
          </summary>
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table className="raw">
              <thead>
                <tr style={{ color: C.muted }}>
                  <th>Cluster</th><th>Degeneracy</th><th>Energy</th><th>States (nx, ny)</th>
                </tr>
              </thead>
              <tbody>
                {currentDegeneracies.map((c) => (
                  <tr key={c.id} style={{ color: c.deg > 1 ? C.degen : C.text }}>
                    <td>{c.id}</td>
                    <td>{c.deg}</td>
                    <td>{c.E.toFixed(4)}</td>
                    <td className="mono">{c.states}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="panel" style={panel}>
        <h2 className="panel-title" style={{ color: C.text }}>Physics note</h2>
        <p style={{ color: C.text }}>
          At r = 1 (square), exchanging x and y leaves the box unchanged, so states (n_x, n_y) and (n_y, n_x) have the same energy.
        </p>
        <p style={{ color: C.text }}>
          At r ≠ 1 (rectangle), that symmetry is broken and these pairs separate. The farther r moves from 1, the larger the gap.
        </p>
      </section>
    </div>
  );
}
