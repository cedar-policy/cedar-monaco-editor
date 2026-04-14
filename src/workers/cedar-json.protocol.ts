import type { CedarEditorDiagnostic } from '../types';

export interface ValidateRequest {
  type: 'validate';
  id: number;
  mode: 'json' | 'schema' | 'entities' | 'context';
  content: string;
  schema?: string;
  action?: { type: string; id: string };
}

export interface ValidateResponse {
  type: 'validate-response';
  id: number;
  diagnostics: CedarEditorDiagnostic[];
}

export interface InitRequest {
  type: 'init';
}

export interface InitResponse {
  type: 'init-response';
  ready: boolean;
}

export type CedarJsonWorkerMessage = ValidateRequest | InitRequest;
export type CedarJsonWorkerResponse = ValidateResponse | InitResponse;
