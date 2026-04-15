import React, { useCallback, useEffect, useRef } from 'react';
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { registerCedarLanguages } from '../languages/register';
import { useLSPWorker } from './useLSPWorker';
import { getConfig } from '../config';
import type { CedarEditorDiagnostic } from '../types';

export interface CedarPolicyEditorProps {
  value: string;
  onChange?: (value: string) => void;
  schema?: string;
  onValidate?: (diagnostics: CedarEditorDiagnostic[]) => void;
  allowTemplates?: boolean;
  allowMultiplePolicies?: boolean;
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
  allowTemplates,
  allowMultiplePolicies,
  theme = 'vs',
  height = '400px',
  options,
}) => {
  const { sendDidChange, sendDidOpen, sendNotification, diagnostics } =
    useLSPWorker(() => getConfig().policyWorkerFactory!(), 'cedar');
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const openedRef = useRef(false);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    registerCedarLanguages(monaco);
    monacoRef.current = monaco;
  }, []);

  const handleMount: OnMount = useCallback((ed) => {
    editorRef.current = ed;
    sendDidOpen(value);
    openedRef.current = true;
  }, [sendDidOpen, value]);

  const handleChange = useCallback((v: string | undefined) => {
    const text = v ?? '';
    if (openedRef.current) sendDidChange(text);
    onChange?.(text);
  }, [sendDidChange, onChange]);

  useEffect(() => {
    if (schema !== undefined) {
      sendNotification('cedar/updateSchema', { schema });
    }
  }, [schema, sendNotification]);

  useEffect(() => {
    sendNotification('cedar/updateConfig', {
      allowTemplates: allowTemplates ?? false,
      allowMultiplePolicies: allowMultiplePolicies ?? false,
    });
  }, [allowTemplates, allowMultiplePolicies, sendNotification]);

  useEffect(() => {
    onValidate?.(diagnostics);
    const model = editorRef.current?.getModel();
    const monaco = monacoRef.current;
    if (model && monaco) {
      monaco.editor.setModelMarkers(
        model,
        'cedar-lsp',
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
  }, [diagnostics, onValidate]);

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
