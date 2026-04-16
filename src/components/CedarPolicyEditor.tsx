import React, { useCallback, useEffect, useRef } from 'react';
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { registerCedarLanguages } from '../languages/register';
import { usePolicyWorker } from './usePolicyWorker';
import { getConfig } from '../config';
import type { CedarEditorDiagnostic } from '../types';

export interface CedarPolicyEditorProps {
  value: string;
  onChange?: (value: string) => void;
  schema?: string;
  onValidate?: (diagnostics: CedarEditorDiagnostic[]) => void;
  theme?: string;
  height?: string | number;
  options?: Record<string, unknown>;
}

const SEVERITY_MAP: Record<string, number> = { error: 8, warning: 4, info: 2 };

export const CedarPolicyEditor: React.FC<CedarPolicyEditorProps> = ({
  value,
  onChange,
  schema,
  onValidate,
  theme = 'vs',
  height = '400px',
  options,
}) => {
  const { validate } = usePolicyWorker(() => getConfig().policyWorkerFactory!());
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
        'cedar',
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
    validate(content, schema).then(setMarkers);
  }, [schema, validate, setMarkers]);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    registerCedarLanguages(monaco);
    monacoRef.current = monaco;
  }, []);

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
      language="cedar"
      theme={theme}
      value={value}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      onChange={handleChange}
      options={options as editor.IStandaloneEditorConstructionOptions}
    />
  );
};
