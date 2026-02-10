
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("Imperial Bazi Pro: Engine Initializing...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Mount point #root not found in document.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
    console.log("Imperial Bazi Pro: Render complete.");
  } catch (err) {
    console.error("Failed to render App:", err);
    if (rootElement) {
        rootElement.innerHTML = `<div style="color:red; padding:20px;">Render Error: ${err.message}</div>`;
    }
  }
}
