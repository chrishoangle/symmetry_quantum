import React from 'react';
import ReactDOM from 'react-dom/client';
import QuantumDegeneracyWidget from './components/QuantumDegeneracyWidget';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QuantumDegeneracyWidget />
  </React.StrictMode>
);
