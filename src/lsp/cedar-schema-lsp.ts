import {
  type Connection,
  TextDocumentSyncKind,
  type CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from 'vscode-languageserver/browser';
import type { CedarWasm } from './wasm-loader';
import { cedarErrorsToDiagnostics } from './diagnostics';

export class CedarSchemaLSP {
  private cedarWasm!: CedarWasm;

  constructor(private connection: Connection) {}

  init(cedarWasm: CedarWasm): void {
    this.cedarWasm = cedarWasm;
  }

  setup(): void {
    this.connection.onInitialize(() => ({
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Full,
        completionProvider: { triggerCharacters: [':'] },
      },
    }));

    this.connection.onDidOpenTextDocument((params) => {
      this.validateDocument(params.textDocument.uri, params.textDocument.text);
    });

    this.connection.onDidChangeTextDocument((params) => {
      if (params.contentChanges.length > 0) {
        const text = params.contentChanges[params.contentChanges.length - 1].text;
        this.validateDocument(params.textDocument.uri, text);
      }
    });

    this.connection.onCompletion(() => this.getCompletions());
  }

  validateDocument(uri: string, text: string): void {
    const result = this.cedarWasm.checkParseSchema(text);

    if (result.type === 'failure') {
      const diagnostics = cedarErrorsToDiagnostics(result.errors, text);
      this.connection.sendDiagnostics({ uri, diagnostics });
    } else {
      this.connection.sendDiagnostics({ uri, diagnostics: [] });
    }
  }

  getCompletions(): CompletionItem[] {
    const keywords = ['namespace', 'entity', 'action', 'type', 'in', 'appliesTo'];
    const scopeKeywords = ['principal', 'resource', 'context'];
    const builtinTypes = ['Bool', 'Long', 'String', 'Set', 'Record', 'Entity', 'Extension'];

    const items: CompletionItem[] = [
      ...keywords.map((kw, i) => ({
        label: kw,
        kind: CompletionItemKind.Keyword,
        data: i,
      })),
      ...scopeKeywords.map((kw, i) => ({
        label: kw,
        kind: CompletionItemKind.Keyword,
        data: keywords.length + i,
      })),
      ...builtinTypes.map((t, i) => ({
        label: t,
        kind: CompletionItemKind.TypeParameter,
        data: keywords.length + scopeKeywords.length + i,
      })),
      {
        label: 'entity',
        kind: CompletionItemKind.Snippet,
        insertText: 'entity ${1:Name} {\n  ${2}\n};',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Entity declaration',
        data: 100,
      },
      {
        label: 'action',
        kind: CompletionItemKind.Snippet,
        insertText: 'action ${1:Name} appliesTo {\n  principal: ${2},\n  resource: ${3}\n};',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Action declaration',
        data: 101,
      },
      {
        label: 'namespace',
        kind: CompletionItemKind.Snippet,
        insertText: 'namespace ${1:Name} {\n  ${2}\n}',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Namespace declaration',
        data: 102,
      },
    ];

    return items;
  }
}
