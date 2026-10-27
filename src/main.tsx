import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { setupConnectivitySync, startPeriodicSync } from './shared/lib/sync';

// Start offline sync listeners
setupConnectivitySync();
startPeriodicSync(30000);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
