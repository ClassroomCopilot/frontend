import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const isDev = import.meta.env.VITE_DEV === 'true';

const AppWithStrictMode = isDev ? (
  <React.StrictMode>
    <App />
  </React.StrictMode>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  AppWithStrictMode
);
