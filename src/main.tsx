import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from './services/initService';
import App from './App';
import './index.css';

const isDevMode = import.meta.env.VITE_DEV === 'true';

// Initialize the app before rendering
initializeApp();

// In development, React.StrictMode causes components to render twice
// This is intentional and helps catch certain bugs, but can be disabled
// if double-mounting is causing issues with initialization
const AppWithStrictMode = isDevMode ? (
  <React.StrictMode>
    <App />
  </React.StrictMode>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  AppWithStrictMode
);
