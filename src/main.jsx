import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import RootErrorBoundary from './components/RootErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </RootErrorBoundary>
  </StrictMode>,
);

