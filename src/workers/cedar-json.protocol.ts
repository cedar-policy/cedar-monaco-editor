import type { CedarEditorDiagnostic } from '../types';

export type ValidateMode =
  | { type: 'json' }
  | { type: 'schema' }
  | { type: 'entities' }
  | { type: 'context'; action: { type: string; id: string } };

export interface ValidateRequest {
  type: 'validate';
  id: number;
  mode: ValidateMode;
  content: string;
  schema?: string;
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
