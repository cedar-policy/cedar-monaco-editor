import { useEffect, useRef, useCallback } from 'react';
import type { CedarEditorDiagnostic } from '../types';
import type { SchemaValidateRequest, SchemaValidateResponse, InitResponse } from '../workers/cedar-schema.protocol';
import type { WorkerFactory } from '../config';

type WorkerResponse = SchemaValidateResponse | InitResponse;

export function useSchemaWorker(workerFactory: WorkerFactory) {
  const workerRef = useRef<Worker | null>(null);
  const readyRef = useRef(false);
  const idRef = useRef(0);
  const pendingRef = useRef<Map<number, (diags: CedarEditorDiagnostic[]) => void>>(new Map());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevResolveRef = useRef<((value: CedarEditorDiagnostic[]) => void) | null>(null);

  useEffect(() => {
    const worker = workerFactory();
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'init-response') { readyRef.current = msg.ready; return; }
      if (msg.type === 'validate-response') {
        const cb = pendingRef.current.get(msg.id);
        if (cb) { pendingRef.current.delete(msg.id); cb(msg.diagnostics); }
      }
    };

    worker.postMessage({ type: 'init' });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (prevResolveRef.current) { prevResolveRef.current([]); prevResolveRef.current = null; }
      worker.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    };
  }, []);

  const validateImmediate = useCallback((content: string): Promise<CedarEditorDiagnostic[]> => {
    if (!workerRef.current || !readyRef.current) return Promise.resolve([]);
    const id = ++idRef.current;
    const msg: SchemaValidateRequest = { type: 'validate', id, content };
    return new Promise((resolve) => {
      pendingRef.current.set(id, resolve);
      workerRef.current!.postMessage(msg);
    });
  }, []);

  const validate = useCallback((content: string): Promise<CedarEditorDiagnostic[]> => {
    return new Promise((resolve) => {
      if (prevResolveRef.current) { prevResolveRef.current([]); }
      prevResolveRef.current = resolve;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        prevResolveRef.current = null;
        validateImmediate(content).then(resolve);
      }, 300);
    });
  }, [validateImmediate]);

  return { validate };
}
