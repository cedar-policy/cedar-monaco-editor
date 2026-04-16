import type { _Connection } from 'vscode-languageserver/lib/common/server';
import {
  TextDocumentSyncKind,
  CompletionItemKind,
} from 'vscode-languageserver-protocol';
import type {
  CompletionItem,
  TextEdit,
} from 'vscode-languageserver-protocol';
type CedarWasmModule = typeof import('@cedar-policy/cedar-wasm');
import { cedarErrorsToDiagnostics } from './diagnostics';

type Connection = _Connection;

const CEDAR_KEYWORDS = [
  'permit', 'forbid', 'when', 'unless', 'if', 'then', 'else',
  'in', 'has', 'like', 'is', 'true', 'false',
  'principal', 'action', 'resource', 'context',
];

export class CedarPolicyLSP {
  private schema: string | undefined;
  private allowTemplates = false;
  private allowMultiplePolicies = false;
  private cedarWasm!: CedarWasmModule;
  private wasmPromise!: Promise<CedarWasmModule>;
  private documents: Map<string, string> = new Map();

  constructor(private connection: Connection) {}

  init(cedarWasm: CedarWasmModule): void {
    this.cedarWasm = cedarWasm;
  }

  initAsync(wasmPromise: Promise<CedarWasmModule>): void {
    this.wasmPromise = wasmPromise;
    wasmPromise.then((wasm) => { this.cedarWasm = wasm; });
  }

  setup(): void {
    this.connection.onInitialize(() => ({
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Full,
        completionProvider: { triggerCharacters: ['.', ':'] },
        documentFormattingProvider: true,
      },
    }));

    this.connection.onDidOpenTextDocument((params) => {
      this.documents.set(params.textDocument.uri, params.textDocument.text);
      this.validateDocument(params.textDocument.uri, params.textDocument.text);
    });

    this.connection.onDidChangeTextDocument((params) => {
      if (params.contentChanges.length > 0) {
        const text = params.contentChanges[params.contentChanges.length - 1].text;
        this.documents.set(params.textDocument.uri, text);
        this.validateDocument(params.textDocument.uri, text);
      }
    });

    this.connection.onCompletion(() => this.getCompletions());

    this.connection.onDocumentFormatting(async (params) => {
      // Full sync means we need to get text from the last known state;
      // the formatting request doesn't include document text, so we
      // return empty if we can't format. The caller should track text.
      const text = this.documents.get(params.textDocument.uri);
      if (!text) return [];
      return this.formatDocument(text);
    });

    this.connection.onNotification('cedar/updateSchema', (params: { schema: string }) => {
      this.schema = params.schema;
    });

    this.connection.onNotification(
      'cedar/updateConfig',
      (params: { allowTemplates?: boolean; allowMultiplePolicies?: boolean }) => {
        if (params.allowTemplates !== undefined) this.allowTemplates = params.allowTemplates;
        if (params.allowMultiplePolicies !== undefined)
          this.allowMultiplePolicies = params.allowMultiplePolicies;
      },
    );
  }

  async validateDocument(uri: string, text: string): Promise<void> {
    if (this.wasmPromise) await this.wasmPromise;
    const result = this.cedarWasm.checkParsePolicySet({
      staticPolicies: text,
    });
    console.log('@@@@@validateDocument', uri, text, result, 'errors' in result ? result.errors.map(e => JSON.stringify(e)).join('|') : undefined);

    let diagnostics = result.type === 'failure'
      ? cedarErrorsToDiagnostics(result.errors, text)
      : [];
    console.log('diag', diagnostics);

    this.connection.sendDiagnostics({ uri, diagnostics });
  }

  async formatDocument(text: string): Promise<TextEdit[]> {
    if (this.wasmPromise) await this.wasmPromise;
    const result = this.cedarWasm.formatPolicies({
      policyText: text,
      lineWidth: 80,
      indentWidth: 2,
    });

    if (result.type === 'success') {
      const lines = text.split('\n');
      return [
        {
          range: {
            start: { line: 0, character: 0 },
            end: { line: lines.length, character: 0 },
          },
          newText: result.formatted_policy,
        },
      ];
    }
    return [];
  }

  getCompletions(): CompletionItem[] {
    return CEDAR_KEYWORDS.map((label) => ({
      label,
      kind: CompletionItemKind.Keyword,
    }));
  }
}
