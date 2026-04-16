import type { CedarEditorDiagnostic } from '../types';
import type {
  CedarPolicyWorkerMessage,
  PolicyValidateRequest,
  PolicyValidateResponse,
  PolicyFormatRequest,
  PolicyFormatResponse,
} from './cedar-policy.protocol';

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

function handleValidate(msg: PolicyValidateRequest): PolicyValidateResponse {
  try {
    const result = cedarWasm!.checkParsePolicySet({ staticPolicies: msg.content });
    const diagnostics: CedarEditorDiagnostic[] = result.type === 'failure'
      ? convertErrors(result.errors, msg.content)
      : [];
    return { type: 'validate-response', id: msg.id, diagnostics };
  } catch (e) {
    return { type: 'validate-response', id: msg.id, diagnostics: [{ message: String(e), severity: 'error', startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }] };
  }
}

function handleFormat(msg: PolicyFormatRequest): PolicyFormatResponse {
  try {
    const result = cedarWasm!.formatPolicies({ policyText: msg.content, lineWidth: 80, indentWidth: 2 });
    return { type: 'format-response', id: msg.id, formatted: result.type === 'success' ? result.formatted_policy : null };
  } catch {
    return { type: 'format-response', id: msg.id, formatted: null };
  }
}

ctx.onmessage = async (event: MessageEvent<CedarPolicyWorkerMessage>) => {
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
  if (msg.type === 'format') { ctx.postMessage(handleFormat(msg)); }
};
