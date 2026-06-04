export type SchemaInput = string | { type: 'cedarJson'; value: string } | { type: 'cedarFormat'; value: string };

export interface CedarEditorDiagnostic {
  message: string;
  severity: 'error' | 'warning' | 'info';
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}
