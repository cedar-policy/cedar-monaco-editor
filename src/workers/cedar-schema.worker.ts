import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
} from 'vscode-languageserver/browser';
import { CedarSchemaLSP } from '../lsp/cedar-schema-lsp';
import { initCedarWasm } from '../lsp/wasm-loader';

const sw = self as any;
const reader = new BrowserMessageReader(sw);
const writer = new BrowserMessageWriter(sw);
const connection = createConnection(reader, writer);

const lsp = new CedarSchemaLSP(connection);

initCedarWasm().then((cedarWasm) => {
  lsp.init(cedarWasm);
  lsp.setup();
  connection.listen();
});
