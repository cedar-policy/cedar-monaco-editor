import React, { useCallback, useEffect, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useJsonWorker } from './useJsonWorker';
import type { CedarEditorDiagnostic } from '../types';

export interface CedarJsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  mode: 'json' | 'schema' | 'entities' | 'context';
  schema?: string;
  action?: { type: string; id: string };
  onValidate?: (diagnostics: CedarEditorDiagnostic[]) => void;
  theme?: string;
  height?: string | number;
  options?: Record<string, unknown>;
}

const SEVERITY_MAP: Record<string, number> = { error: 8, warning: 4, info: 2 };

const jsonWorkerUrl = new URL('../workers/cedar-json.worker.ts', import.meta.url);

export const CedarJsonEditor: React.FC<CedarJsonEditorProps> = ({
  value,
  onChange,
  mode,
  schema,
  action,
  onValidate,
  theme = 'vs',
  height = '400px',
  options,
}) => {
  const { validate } = useJsonWorker(jsonWorkerUrl);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const setMarkers = useCallback((diagnostics: CedarEditorDiagnostic[]) => {
    onValidate?.(diagnostics);
    const model = editorRef.current?.getModel();
    const monaco = monacoRef.current;
    if (model && monaco) {
      monaco.editor.setModelMarkers(
        model,
        'cedar-json',
        diagnostics.map((d) => ({
          startLineNumber: d.startLineNumber,
          startColumn: d.startColumn,
          endLineNumber: d.endLineNumber,
          endColumn: d.endColumn,
          message: d.message,
          severity: SEVERITY_MAP[d.severity] ?? 8,
        })),
      );
    }
  }, [onValidate]);

  const runValidation = useCallback((content: string) => {
    validate(mode, content, schema, action).then(setMarkers);
  }, [mode, schema, action, validate, setMarkers]);

  const handleMount: OnMount = useCallback((ed, monaco) => {
    editorRef.current = ed;
    monacoRef.current = monaco;
    runValidation(value);
  }, [runValidation, value]);

  const handleChange = useCallback((v: string | undefined) => {
    const text = v ?? '';
    onChange?.(text);
    runValidation(text);
  }, [onChange, runValidation]);

  useEffect(() => {
    runValidation(valueRef.current);
  }, [runValidation]);

  return (
    <Editor
      height={height}
      language="json"
      theme={theme}
      value={value}
      onMount={handleMount}
      onChange={handleChange}
      options={options as editor.IStandaloneEditorConstructionOptions}
    />
  );
};
