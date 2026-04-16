import { useEffect, useRef, useState, useCallback } from 'react';
import {
  BrowserMessageReader,
  BrowserMessageWriter,
} from 'vscode-languageserver-protocol/browser';
import type {
  Message,
  RequestMessage,
  NotificationMessage,
  ResponseMessage,
  Diagnostic,
} from 'vscode-languageserver-protocol';
import type { CedarEditorDiagnostic } from '../types';
import type { WorkerFactory } from '../config';

const severityMap: Record<number, 'error' | 'warning' | 'info'> = {
  1: 'error',
  2: 'warning',
  3: 'info',
  4: 'info',
};

function lspDiagToCedar(d: Diagnostic): CedarEditorDiagnostic {
  return {
    message: d.message,
    severity: severityMap[d.severity ?? 1] ?? 'error',
    startLineNumber: d.range.start.line + 1,
    startColumn: d.range.start.character + 1,
    endLineNumber: d.range.end.line + 1,
    endColumn: d.range.end.character + 1,
  };
}

function isResponse(msg: Message): msg is ResponseMessage {
  return 'id' in msg && !('method' in msg);
}

function isNotification(msg: Message): msg is NotificationMessage {
  return 'method' in msg && !('id' in msg);
}

export function useLSPWorker(workerFactory: WorkerFactory, languageId: string) {
  const [diagnostics, setDiagnostics] = useState<CedarEditorDiagnostic[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const writerRef = useRef<BrowserMessageWriter | null>(null);
  const idRef = useRef(0);
  const pendingRef = useRef<Map<number, (resp: ResponseMessage) => void>>(new Map());
  const versionRef = useRef(0);
  const docUri = `file:///${languageId}`;

  const sendRequest = useCallback((method: string, params: object): Promise<ResponseMessage> => {
    const id = ++idRef.current;
    const msg: RequestMessage = { jsonrpc: '2.0', id, method, params };
    return new Promise((resolve) => {
      pendingRef.current.set(id, resolve);
      writerRef.current?.write(msg);
    });
  }, []);

  const sendNotification = useCallback((method: string, params: object) => {
    const msg: NotificationMessage = { jsonrpc: '2.0', method, params };
    writerRef.current?.write(msg);
  }, []);

  const sendDidOpen = useCallback((text: string) => {
    versionRef.current = 1;
    sendNotification('textDocument/didOpen', {
      textDocument: { uri: docUri, languageId, version: 1, text },
    });
  }, [docUri, languageId, sendNotification]);

  const sendDidChange = useCallback((text: string) => {
    const version = ++versionRef.current;
    sendNotification('textDocument/didChange', {
      textDocument: { uri: docUri, version },
      contentChanges: [{ text }],
    });
  }, [docUri, sendNotification]);

  const requestFormatting = useCallback((): Promise<ResponseMessage> => {
    return sendRequest('textDocument/formatting', {
      textDocument: { uri: docUri },
      options: { tabSize: 2, insertSpaces: true },
    });
  }, [docUri, sendRequest]);

  useEffect(() => {
    const worker = workerFactory();
    workerRef.current = worker;

    worker.onerror = (e) => {
      console.error(`[cedar-lsp:${languageId}] Worker error:`, e);
    };

    worker.addEventListener('message', (e) => {
      console.log(`[cedar-lsp:${languageId}] raw message:`, e.data);
    });

    const reader = new BrowserMessageReader(worker);
    const writer = new BrowserMessageWriter(worker);
    writerRef.current = writer;

    reader.listen((msg: Message) => {
      if (isResponse(msg) && msg.id !== undefined) {
        const cb = pendingRef.current.get(msg.id as number);
        if (cb) {
          pendingRef.current.delete(msg.id as number);
          cb(msg);
        }
      } else if (isNotification(msg) && msg.method === 'textDocument/publishDiagnostics') {
        const params = msg.params as { diagnostics: Diagnostic[] };
        setDiagnostics(params.diagnostics.map(lspDiagToCedar));
      }
    });

    // Send initialize request
    const initId = ++idRef.current;
    const initMsg: RequestMessage = {
      jsonrpc: '2.0',
      id: initId,
      method: 'initialize',
      params: { capabilities: {}, rootUri: null, processId: null },
    };
    pendingRef.current.set(initId, () => {
      // Send initialized notification after server responds
      writer.write({ jsonrpc: '2.0', method: 'initialized', params: {} } as NotificationMessage);
    });
    writer.write(initMsg);

    return () => {
      reader.dispose();
      writer.dispose();
      worker.terminate();
      workerRef.current = null;
      writerRef.current = null;
      pendingRef.current.clear();
    };
  }, [workerFactory, languageId]);

  const dispose = useCallback(() => {
    workerRef.current?.terminate();
  }, []);

  return { sendDidChange, sendDidOpen, requestFormatting, sendNotification, diagnostics, dispose };
}
