import type * as MonacoNS from 'monaco-editor';

/**
 * Per-model format function — each <CedarPolicyEditor/> instance owns its own
 * worker, so the formatter it exposes is also per-instance. We key off the
 * model the user is actively editing so that Monaco's built-in format command
 * (Shift+Alt+F, right-click → Format Document, command palette) dispatches to
 * the right worker.
 */
type FormatFn = (content: string) => Promise<string | null>;
const modelFormatters = new WeakMap<MonacoNS.editor.ITextModel, FormatFn>();

let providerRegistered = false;

/**
 * Register the `cedar` DocumentFormattingEditProvider exactly once per monaco
 * instance. Safe to call multiple times — subsequent calls are no-ops.
 */
export function ensureCedarFormatProviderRegistered(
  monaco: typeof MonacoNS,
): void {
  if (providerRegistered) return;
  providerRegistered = true;

  monaco.languages.registerDocumentFormattingEditProvider('cedar', {
    async provideDocumentFormattingEdits(model) {
      const formatter = modelFormatters.get(model);
      if (!formatter) return [];
      const formatted = await formatter(model.getValue());
      if (formatted == null || formatted === model.getValue()) return [];
      return [{ range: model.getFullModelRange(), text: formatted }];
    },
  });
}

export function bindFormatterToModel(
  model: MonacoNS.editor.ITextModel,
  fn: FormatFn,
): () => void {
  modelFormatters.set(model, fn);
  return () => {
    if (modelFormatters.get(model) === fn) modelFormatters.delete(model);
  };
}
