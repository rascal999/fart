import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import Prism CSS before any other styles
import 'prismjs/themes/prism-tomorrow.css';
import './utils/prism';

// Add global styles for Prism
const style = document.createElement('style');
style.textContent = `
  pre[class*="language-"] {
    background: transparent !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
  }
  code[class*="language-"] {
    background: transparent !important;
    text-shadow: none !important;
    white-space: pre-wrap !important;
    word-break: break-word !important;
  }
  .token.operator {
    background: transparent !important;
  }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
