import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './theme.css';
import { initPerformance } from './services/performance';

// Initialize performance monitoring
initPerformance();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);