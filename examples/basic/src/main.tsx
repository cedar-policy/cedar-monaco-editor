import React from 'react';
import ReactDOM from 'react-dom/client';
import * as monaco from 'monaco-editor';
import { configureCedarEditors } from 'cedar-monaco-editor';
import { App } from './App';

configureCedarEditors({
  monaco,
  policyWorkerFactory: () => new Worker(
    new URL('cedar-monaco-editor/src/workers/cedar-policy.worker.ts', import.meta.url),
    { type: 'module' },
  ),
  schemaWorkerFactory: () => new Worker(
    new URL('cedar-monaco-editor/src/workers/cedar-schema.worker.ts', import.meta.url),
    { type: 'module' },
  ),
  jsonWorkerFactory: () => new Worker(
    new URL('cedar-monaco-editor/src/workers/cedar-json.worker.ts', import.meta.url),
    { type: 'module' },
  ),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
