import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Fix for Monaco Web Workers
self.MonacoEnvironment = {
  getWorker: function (_moduleId, label) {
    let workerPath;
    switch (label) {
      case 'json':
        workerPath = 'monaco-editor/esm/vs/language/json/json.worker?worker';
        break;
      case 'css':
      case 'scss':
      case 'less':
        workerPath = 'monaco-editor/esm/vs/language/css/css.worker?worker';
        break;
      case 'html':
      case 'handlebars':
      case 'razor':
        workerPath = 'monaco-editor/esm/vs/language/html/html.worker?worker';
        break;
      case 'typescript':
      case 'javascript':
        workerPath = 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
        break;
      default:
        workerPath = 'monaco-editor/esm/vs/editor/editor.worker?worker';
        break;
    }
    return new Worker(new URL(workerPath, import.meta.url), { type: 'module' });
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
