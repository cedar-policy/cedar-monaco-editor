import type { CedarEditorDiagnostic } from '../types';
import type { CedarJsonWorkerMessage, ValidateRequest, ValidateResponse } from './cedar-json.protocol';

type CedarWasm = typeof import('@cedar-policy/cedar-wasm');

// Worker global scope — postMessage and onmessage are available globally
const ctx: {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage(message: unknown): void;
} = self as never;

let cedarWasm: CedarWasm | null = null;

/**
 * Convert a character offset to a line/column position within text.
 */
function offsetToPosition(text: string, offset: number): { lineNumber: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { lineNumber: line, column: col };
}

/**
 * Convert cedar-wasm DetailedError array to editor diagnostics.
 */
function convertErrors(
  errors: Array<{ message: string; sourceLocations?: Array<{ start: number; end: number }> }>,
  content: string,
  severity: 'error' | 'warning' | 'info' = 'error'
): CedarEditorDiagnostic[] {
  return errors.map((err) => {
    const loc = err.sourceLocations?.[0];
    if (loc) {
      const start = offsetToPosition(content, loc.start);
      const end = offsetToPosition(content, loc.end);
      return {
        message: err.message,
        severity,
        startLineNumber: start.lineNumber,
        startColumn: start.column,
        endLineNumber: end.lineNumber,
        endColumn: end.column,
      };
    }
    // No source location — mark the first line
    return {
      message: err.message,
      severity,
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    };
  });
}

/**
 * Create a single diagnostic for a JSON parse error.
 */
function jsonParseDiagnostic(e: unknown): CedarEditorDiagnostic[] {
  const message = e instanceof Error ? e.message : String(e);
  return [{
    message,
    severity: 'error',
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: 1,
    endColumn: 1,
  }];
}

function validateSchema(content: string): CedarEditorDiagnostic[] {
  // checkParseSchema accepts a Schema which can be a JSON string
  const result = cedarWasm!.checkParseSchema(content);
  if (result.type === 'success') return [];
  return convertErrors(result.errors, content);
}

function validateEntities(content: string, schemaStr?: string): CedarEditorDiagnostic[] {
  // Parse entities JSON to ensure it's valid
  const entities = JSON.parse(content);
  const schema = schemaStr ? JSON.parse(schemaStr) : undefined;
  const result = cedarWasm!.checkParseEntities({ entities, schema });
  if (result.type === 'success') return [];
  return convertErrors(result.errors, content);
}

function validateContext(content: string, schemaStr?: string, action?: { type: string; id: string }): CedarEditorDiagnostic[] {
  const context = JSON.parse(content);
  const schema = schemaStr ? JSON.parse(schemaStr) : undefined;
  const actionUid = action ? { __entity: action } : undefined;
  const result = cedarWasm!.checkParseContext({ context, schema, action: actionUid });
  if (result.type === 'success') return [];
  return convertErrors(result.errors, content);
}

function handleValidate(msg: ValidateRequest): ValidateResponse {
  const { id, mode, content, schema, action } = msg;
  try {
    let diagnostics: CedarEditorDiagnostic[];
    switch (mode) {
      case 'json':
        // Monaco handles JSON syntax validation
        diagnostics = [];
        break;
      case 'schema':
        diagnostics = validateSchema(content);
        break;
      case 'entities':
        diagnostics = validateEntities(content, schema);
        break;
      case 'context':
        diagnostics = validateContext(content, schema, action);
        break;
    }
    return { type: 'validate-response', id, diagnostics };
  } catch (e) {
    return { type: 'validate-response', id, diagnostics: jsonParseDiagnostic(e) };
  }
}

ctx.onmessage = async (event: MessageEvent<CedarJsonWorkerMessage>) => {
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

  if (msg.type === 'validate') {
    ctx.postMessage(handleValidate(msg));
  }
};
