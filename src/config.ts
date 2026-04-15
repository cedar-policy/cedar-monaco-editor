import { loader } from '@monaco-editor/react';

export type WorkerFactory = () => Worker;

export interface CedarMonacoConfig {
  monaco?: typeof import('monaco-editor');
  policyWorkerFactory?: WorkerFactory;
  schemaWorkerFactory?: WorkerFactory;
  jsonWorkerFactory?: WorkerFactory;
}

let config: CedarMonacoConfig = {};

export function configureCedarEditors(c: CedarMonacoConfig) {
  config = c;
  if (c.monaco) {
    loader.config({ monaco: c.monaco });
  }
}

export function getConfig(): CedarMonacoConfig {
  return config;
}
