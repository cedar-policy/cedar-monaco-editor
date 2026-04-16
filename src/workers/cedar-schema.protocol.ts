import type { CedarEditorDiagnostic } from '../types';

export interface SchemaValidateRequest {
  type: 'validate';
  id: number;
  content: string;
}

export interface SchemaValidateResponse {
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

export type CedarSchemaWorkerMessage = SchemaValidateRequest | InitRequest;
export type CedarSchemaWorkerResponse = SchemaValidateResponse | InitResponse;
