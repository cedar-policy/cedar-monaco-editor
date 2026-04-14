import {
  Diagnostic,
  DiagnosticSeverity,
  Position,
  Range,
} from 'vscode-languageserver-protocol';
import type { DetailedError } from '@cedar-policy/cedar-wasm';

/**
 * Convert a byte offset to a line/character Position in the given text.
 */
export function offsetToPosition(text: string, offset: number): Position {
  let line = 0;
  let lastNewline = -1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') {
      line++;
      lastNewline = i;
    }
  }
  return { line, character: offset - lastNewline - 1 };
}

/**
 * Convert cedar-wasm DetailedErrors into LSP Diagnostics.
 */
export function cedarErrorsToDiagnostics(errors: DetailedError[], textContent: string): Diagnostic[] {
  return errors.map((error) => {
    let range: Range;
    if (error.sourceLocations && error.sourceLocations.length > 0) {
      const loc = error.sourceLocations[0];
      range = {
        start: offsetToPosition(textContent, loc.start),
        end: offsetToPosition(textContent, loc.end),
      };
    } else {
      range = {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 },
      };
    }

    const severity =
      error.severity === 'warning' || error.message.toLowerCase().includes('warning')
        ? DiagnosticSeverity.Warning
        : DiagnosticSeverity.Error;

    return { range, message: error.message, severity };
  });
}

/** Backward-compatible alias */
export const detailedErrorsToDiagnostics = cedarErrorsToDiagnostics;
