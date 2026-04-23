import React from 'react';
import ReactDOM from 'react-dom/client';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import { configureCedarEditors } from '@cedar-policy/cedar-monaco-editor';
import { App } from './App';

// Monaco internal workers — load from local node_modules, not CDN
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker();
    return new editorWorker();
  },
};

// Tell @monaco-editor/react to use local monaco instead of CDN
loader.config({ monaco });

// Cedar LSP workers — bundled by Vite via ?worker suffix
import CedarPolicyWorker from '../../../src/workers/cedar-policy.worker?worker';
import CedarSchemaWorker from '../../../src/workers/cedar-schema.worker?worker';
import CedarJsonWorker from '../../../src/workers/cedar-json.worker?worker';

configureCedarEditors({
  monaco,
  policyWorkerFactory: () => new CedarPolicyWorker(),
  schemaWorkerFactory: () => new CedarSchemaWorker(),
  jsonWorkerFactory: () => new CedarJsonWorker(),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
