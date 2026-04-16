import { useEffect, useRef, useCallback } from 'react';
import type { CedarEditorDiagnostic } from '../types';
import type { PolicyValidateRequest, PolicyValidateResponse, PolicyFormatResponse, InitResponse } from '../workers/cedar-policy.protocol';
import type { WorkerFactory } from '../config';

type WorkerResponse = PolicyValidateResponse | PolicyFormatResponse | InitResponse;

export function usePolicyWorker(workerFactory: WorkerFactory) {
  const workerRef = useRef<Worker | null>(null);
  const readyRef = useRef(false);
  const idRef = useRef(0);
  const pendingValidateRef = useRef<Map<number, (diags: CedarEditorDiagnostic[]) => void>>(new Map());
  const pendingFormatRef = useRef<Map<number, (formatted: string | null) => void>>(new Map());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevResolveRef = useRef<((value: CedarEditorDiagnostic[]) => void) | null>(null);

  useEffect(() => {
    const worker = workerFactory();
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'init-response') { readyRef.current = msg.ready; return; }
      if (msg.type === 'validate-response') {
        const cb = pendingValidateRef.current.get(msg.id);
        if (cb) { pendingValidateRef.current.delete(msg.id); cb(msg.diagnostics); }
      }
      if (msg.type === 'format-response') {
        const cb = pendingFormatRef.current.get(msg.id);
        if (cb) { pendingFormatRef.current.delete(msg.id); cb(msg.formatted); }
      }
    };

    worker.postMessage({ type: 'init' });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (prevResolveRef.current) { prevResolveRef.current([]); prevResolveRef.current = null; }
      worker.terminate();
      workerRef.current = null;
      pendingValidateRef.current.clear();
      pendingFormatRef.current.clear();
    };
  }, []);

  const validateImmediate = useCallback((content: string, schema?: string): Promise<CedarEditorDiagnostic[]> => {
    if (!workerRef.current || !readyRef.current) return Promise.resolve([]);
    const id = ++idRef.current;
    const msg: PolicyValidateRequest = { type: 'validate', id, content, schema };
    return new Promise((resolve) => {
      pendingValidateRef.current.set(id, resolve);
      workerRef.current!.postMessage(msg);
    });
  }, []);

  const validate = useCallback((content: string, schema?: string): Promise<CedarEditorDiagnostic[]> => {
    return new Promise((resolve) => {
      if (prevResolveRef.current) { prevResolveRef.current([]); }
      prevResolveRef.current = resolve;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        prevResolveRef.current = null;
        validateImmediate(content, schema).then(resolve);
      }, 300);
    });
  }, [validateImmediate]);

  const format = useCallback((content: string): Promise<string | null> => {
    if (!workerRef.current || !readyRef.current) return Promise.resolve(null);
    const id = ++idRef.current;
    return new Promise((resolve) => {
      pendingFormatRef.current.set(id, resolve);
      workerRef.current!.postMessage({ type: 'format', id, content });
    });
  }, []);

  return { validate, format };
}
