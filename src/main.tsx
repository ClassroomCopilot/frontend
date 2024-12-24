import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const isDevMode = import.meta.env.VITE_DEV === 'true';

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
