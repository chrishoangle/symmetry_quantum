import React, { useState, useMemo } from 'react';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function QuantumDegeneracyWidget() {
  const [aspectRatio, setAspectRatio] = useState(1.0);
  const [viewMode, setViewMode] = useState('levels'); // 'levels', 'splitting', 'both'
  const [nmax] = useState(12);
  const [k] = useState(40);

  // Compute energy spectrum for a given r
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

  // Detect degeneracy clusters
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

  // Pre-compute r-sweep data for splitting curves
  const splittingData = useMemo(() => {
    const rVals = Array.from({ length: 150 }, (_, i) => 0.6 + (i / 149) * 0.8); // 0.6 to 1.4
    const spectrumAtR1 = computeSpectrum(1.0, nmax);
    const clusters = detectDegeneracies(spectrumAtR1.slice(0, k), 1e-9);
    
    // Track only degenerate clusters (degeneracy > 1)
    const trackedStates = [];
    for (let cluster of clusters) {
      if (cluster.length > 1) {
        trackedStates.push(...cluster);
      }
    }

    const data = rVals.map(r => {
      const point = { r };
      trackedStates.forEach((state, idx) => {
        const E = (state.nx * state.nx) / (r * r) + (state.ny * state.ny);
        point[`E_${idx}`] = E;
      });
      return point;
    });

    return { data, trackedStates };
  }, []);

  // Current spectrum
  const currentSpectrum = useMemo(() => {
    return computeSpectrum(aspectRatio, nmax).slice(0, k);
  }, [aspectRatio]);

  // Current degeneracies
  const currentDegeneracies = useMemo(() => {
    const clusters = detectDegeneracies(currentSpectrum, 1e-9);
    return clusters.map((cluster, id) => ({
      id,
      deg: cluster.length,
      E: cluster[0].E,
      states: cluster.map(s => s.label).join(', ')
    }));
  }, [currentSpectrum]);

  // Data for level diagram
  const levelDiagramData = currentSpectrum.map((state, idx) => {
    const cluster = currentDegeneracies.find(c => c.states.includes(state.label));
    return {
      index: idx + 1,
      E: state.E,
      label: state.label,
      degeneracy: cluster ? cluster.deg : 1
    };
  });

  // Splitting curve data
  const splittingCurveData = splittingData.data;
  const trackedStates = splittingData.trackedStates;

  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0, color: '#2c3e50' }}>
        2D Infinite Well: Degeneracy Splitting
      </h2>
      
      {/* Controls */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #ecf0f1' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#34495e' }}>
          Aspect Ratio r = L_x / L_y: {aspectRatio.toFixed(3)}
        </label>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.01"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(parseFloat(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
          ← Rectangle | Square (r=1.0) | Rectangle →
        </div>
      </div>

      {/* View mode selector */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {['levels', 'splitting', 'both'].map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: viewMode === mode ? '#3498db' : '#ecf0f1',
              color: viewMode === mode ? 'white' : '#2c3e50',
              cursor: 'pointer',
              fontWeight: viewMode === mode ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {mode === 'levels' && '📊 Energy Levels'}
            {mode === 'splitting' && '📈 Splitting Curves'}
            {mode === 'both' && '🔄 Both'}
          </button>
        ))}
      </div>

      {/* Energy Level Diagram */}
      {(viewMode === 'levels' || viewMode === 'both') && (
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: 'white', borderRadius: '6px' }}>
          <h3 style={{ marginTop: 0, color: '#34495e' }}>Energy Levels (r = {aspectRatio.toFixed(3)})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
              <XAxis dataKey="index" label={{ value: 'Level Index', position: 'insideBottomRight', offset: -10 }} />
              <YAxis label={{ value: 'Energy Ẽ', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{ backgroundColor: 'white', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                        <p style={{ margin: '2px 0', fontSize: '12px' }}>Level: {data.index}</p>
                        <p style={{ margin: '2px 0', fontSize: '12px' }}>E: {data.E.toFixed(3)}</p>
                        <p style={{ margin: '2px 0', fontSize: '12px' }}>State: {data.label}</p>
                        <p style={{ margin: '2px 0', fontSize: '12px', fontWeight: 'bold', color: '#e74c3c' }}>
                          Deg: {data.degeneracy}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                dataKey="E"
                data={levelDiagramData}
                fill="#3498db"
                shape={(props) => {
                  const { cx, cy, payload } = props;
                  const radius = payload.degeneracy > 1 ? 6 : 3;
                  const color = payload.degeneracy > 1 ? '#e74c3c' : '#3498db';
                  return (
                    <circle cx={cx} cy={cy} r={radius} fill={color} opacity={0.7} />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '10px' }}>
            Red circles = degenerate states (deg &gt; 1) | Blue circles = non-degenerate
          </p>
        </div>
      )}

      {/* Splitting Curves */}
      {(viewMode === 'splitting' || viewMode === 'both') && (
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: 'white', borderRadius: '6px' }}>
          <h3 style={{ marginTop: 0, color: '#34495e' }}>Degeneracy Splitting (Exchange Symmetry Pairs)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={splittingCurveData} margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
              <XAxis dataKey="r" label={{ value: 'Aspect Ratio r', position: 'insideBottomRight', offset: -10 }} />
              <YAxis label={{ value: 'Energy Ẽ', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              {trackedStates.slice(0, 7).map((state, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={`E_${idx}`}
                  stroke={colors[idx % colors.length]}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                  name={state.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '10px' }}>
            Vertical line marks r=1 (square). At r=1, pairs like (n_x, n_y) and (n_y, n_x) are degenerate.
          </p>
        </div>
      )}

      {/* Degeneracy Table */}
      <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ marginTop: 0, color: '#34495e' }}>Degeneracy Clusters (r = {aspectRatio.toFixed(3)})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#ecf0f1', borderBottom: '2px solid #bdc3c7' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Cluster</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Degeneracy</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Energy Ẽ</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>States</th>
              </tr>
            </thead>
            <tbody>
              {currentDegeneracies.slice(0, 12).map((cluster, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: cluster.deg > 1 ? '#fff5f5' : '#ffffff',
                    borderBottom: '1px solid #ecf0f1'
                  }}
                >
                  <td style={{ padding: '8px' }}>{cluster.id}</td>
                  <td style={{ padding: '8px', fontWeight: cluster.deg > 1 ? 'bold' : 'normal', color: cluster.deg > 1 ? '#e74c3c' : '#2c3e50' }}>
                    {cluster.deg}
                  </td>
                  <td style={{ padding: '8px' }}>{cluster.E.toFixed(4)}</td>
                  <td style={{ padding: '8px', fontSize: '11px', fontFamily: 'monospace' }}>{cluster.states}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Physics Explanation */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf8ff', borderLeft: '4px solid #3498db', borderRadius: '4px' }}>
        <h4 style={{ marginTop: 0, color: '#2980b9' }}>💡 Physics Insight</h4>
        <p style={{ margin: '5px 0', fontSize: '13px', color: '#2c3e50' }}>
          <strong>At r=1 (square):</strong> Exchange symmetry (x ↔ y) makes states (n_x, n_y) and (n_y, n_x) degenerate (same energy).
        </p>
        <p style={{ margin: '5px 0', fontSize: '13px', color: '#2c3e50' }}>
          <strong>At r≠1 (rectangle):</strong> This symmetry breaks, and degenerate pairs split smoothly. The larger the deviation from r=1, the larger the splitting.
        </p>
        <p style={{ margin: '5px 0', fontSize: '13px', color: '#2c3e50' }}>
          <strong>Example:</strong> States (1,2) and (2,1) coincide at r=1 but diverge as you move the slider away from center.
        </p>
      </div>
    </div>
  );
}
