import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser';
import { createConnection } from 'vscode-languageserver/browser';
import { initCedarWasm } from '../lsp/wasm-loader';
import { CedarSchemaLSP } from '../lsp/cedar-schema-lsp';

const reader = new BrowserMessageReader(self as any);
const writer = new BrowserMessageWriter(self as any);
const connection = createConnection(reader, writer);

const wasmPromise = initCedarWasm();
const lsp = new CedarSchemaLSP(connection);
lsp.initAsync(wasmPromise);
lsp.setup();
connection.listen();
