import type { CedarEditorDiagnostic } from '../types';

export interface PolicyValidateRequest {
  type: 'validate';
  id: number;
  content: string;
  schema?: string;
}

export interface PolicyValidateResponse {
  type: 'validate-response';
  id: number;
  diagnostics: CedarEditorDiagnostic[];
}

export interface PolicyFormatRequest {
  type: 'format';
  id: number;
  content: string;
}

export interface PolicyFormatResponse {
  type: 'format-response';
  id: number;
  formatted: string | null;
}

export interface InitRequest {
  type: 'init';
}

export interface InitResponse {
  type: 'init-response';
  ready: boolean;
}

export type CedarPolicyWorkerMessage = PolicyValidateRequest | PolicyFormatRequest | InitRequest;
export type CedarPolicyWorkerResponse = PolicyValidateResponse | PolicyFormatResponse | InitResponse;
