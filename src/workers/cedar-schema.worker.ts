import type { CedarEditorDiagnostic } from '../types';
import type {
  CedarSchemaWorkerMessage,
  SchemaValidateRequest,
  SchemaValidateResponse,
} from './cedar-schema.protocol';

type CedarWasm = typeof import('@cedar-policy/cedar-wasm');

const ctx = self as unknown as { onmessage: ((event: MessageEvent) => void) | null; postMessage(msg: unknown): void };

let cedarWasm: CedarWasm | null = null;

function offsetToPosition(text: string, offset: number): { lineNumber: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') { line++; col = 1; } else { col++; }
  }
  return { lineNumber: line, column: col };
}

function convertErrors(
  errors: Array<{ message: string; sourceLocations?: Array<{ start: number; end: number }> }>,
  content: string,
): CedarEditorDiagnostic[] {
  return errors.map((err) => {
    const loc = err.sourceLocations?.[0];
    if (loc) {
      const start = offsetToPosition(content, loc.start);
      const end = offsetToPosition(content, loc.end);
      return { message: err.message, severity: 'error', startLineNumber: start.lineNumber, startColumn: start.column, endLineNumber: end.lineNumber, endColumn: end.column };
    }
    return { message: err.message, severity: 'error', startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 };
  });
}

function handleValidate(msg: SchemaValidateRequest): SchemaValidateResponse {
  try {
    // Pass content as a raw string — string input means Cedar human-readable schema syntax
    const result = cedarWasm!.checkParseSchema(msg.content);
    const diagnostics: CedarEditorDiagnostic[] = result.type === 'failure'
      ? convertErrors(result.errors, msg.content)
      : [];
    return { type: 'validate-response', id: msg.id, diagnostics };
  } catch (e) {
    return { type: 'validate-response', id: msg.id, diagnostics: [{ message: String(e), severity: 'error', startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }] };
  }
}

ctx.onmessage = async (event: MessageEvent<CedarSchemaWorkerMessage>) => {
  const msg = event.data;
  if (msg.type === 'init') {
    try {
      cedarWasm = await import('@cedar-policy/cedar-wasm');
      ctx.postMessage({ type: 'init-response', ready: true });
    } catch {
      ctx.postMessage({ type: 'init-response', ready: false });
    }
    return;
  }
  if (msg.type === 'validate') { ctx.postMessage(handleValidate(msg)); }
};
