# cedar-monaco-editor

[![npm version](https://img.shields.io/npm/v/cedar-monaco-editor.svg)](https://www.npmjs.com/package/cedar-monaco-editor)
[![license](https://img.shields.io/npm/l/cedar-monaco-editor.svg)](https://github.com/cedar-policy/cedar-monaco-editor/blob/main/LICENSE)

React components for editing [Cedar](https://www.cedarpolicy.com/) policies, schemas, and context using [Monaco Editor](https://microsoft.github.io/monaco-editor/).

## Features

- **CedarPolicyEditor** — Edit Cedar policies with syntax highlighting, schema-aware validation, and diagnostics
- **CedarSchemaEditor** — Edit Cedar schemas with syntax highlighting and validation
- **CedarJsonEditor** — Edit Cedar entities and authorization context as JSON with Cedar-aware validation
- **useCedar hook** — Programmatic access to Cedar WASM for validation, formatting, and parsing
- **Language registration** — Cedar and Cedar schema monarch tokenizers for Monaco
- **Web Worker architecture** — Validation runs off the main thread via LSP-based workers

## Installation

```bash
npm install cedar-monaco-editor monaco-editor
```

`react` and `react-dom` (^18.2.0) are required as peer dependencies.

## Quick Start

```tsx
import { CedarPolicyEditor } from 'cedar-monaco-editor';

function App() {
  const [policy, setPolicy] = useState(`permit(
  principal,
  action == Action::"ReadDocument",
  resource
);`);

  return (
    <CedarPolicyEditor
      value={policy}
      onChange={setPolicy}
      height="400px"
    />
  );
}
```

## API Reference

### CedarPolicyEditor

Editor for Cedar policy language with LSP-based validation.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Policy source text (required) |
| `onChange` | `(value: string) => void` | — | Called when the editor content changes |
| `schema` | `string` | — | Cedar schema text for schema-aware validation |
| `onValidate` | `(diagnostics: CedarEditorDiagnostic[]) => void` | — | Called with diagnostics after validation |
| `allowTemplates` | `boolean` | `false` | Allow `?principal` / `?resource` template slots |
| `allowMultiplePolicies` | `boolean` | `false` | Allow multiple policy statements |
| `theme` | `string` | `'vs'` | Monaco theme name |
| `height` | `string \| number` | `'400px'` | Editor height |
| `options` | `Record<string, unknown>` | — | Additional Monaco editor options |

### CedarSchemaEditor

Editor for Cedar schema language with LSP-based validation.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Schema source text (required) |
| `onChange` | `(value: string) => void` | — | Called when the editor content changes |
| `onValidate` | `(diagnostics: CedarEditorDiagnostic[]) => void` | — | Called with diagnostics after validation |
| `theme` | `string` | `'vs'` | Monaco theme name |
| `height` | `string \| number` | `'400px'` | Editor height |
| `options` | `Record<string, unknown>` | — | Additional Monaco editor options |

### CedarJsonEditor

JSON editor with Cedar-aware validation for entities and context.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | JSON source text (required) |
| `onChange` | `(value: string) => void` | — | Called when the editor content changes |
| `mode` | `'json' \| 'schema' \| 'entities' \| 'context'` | — | Validation mode (required) |
| `schema` | `string` | — | Cedar schema text for schema-aware validation |
| `action` | `{ type: string; id: string }` | — | Action entity for context validation |
| `onValidate` | `(diagnostics: CedarEditorDiagnostic[]) => void` | — | Called with diagnostics after validation |
| `theme` | `string` | `'vs'` | Monaco theme name |
| `height` | `string \| number` | `'400px'` | Editor height |
| `options` | `Record<string, unknown>` | — | Additional Monaco editor options |

### useCedar

Hook providing direct access to Cedar WASM operations.

```tsx
const { validate, format, parse, cedarVersion, isReady } = useCedar();
```

| Return | Type | Description |
|--------|------|-------------|
| `isReady` | `boolean` | `true` once the WASM module has loaded |
| `cedarVersion` | `string` | Version string of the loaded Cedar WASM |
| `validate` | `(policy: string, schema?: string) => { success: boolean; errors: string[] }` | Validate a policy, optionally against a schema |
| `format` | `(policy: string) => { success: boolean; formatted: string }` | Format a Cedar policy |
| `parse` | `(policy: string) => { success: boolean; errors: string[] }` | Parse a policy and check for syntax errors |

### CedarEditorDiagnostic

```ts
interface CedarEditorDiagnostic {
  message: string;
  severity: 'error' | 'warning' | 'info';
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}
```

### registerCedarLanguages

```ts
import { registerCedarLanguages } from 'cedar-monaco-editor';

// Register Cedar and Cedar schema languages with a Monaco instance
registerCedarLanguages(monaco);
```

## Bundler Configuration

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  optimizeDeps: {
    include: ['monaco-editor'],
  },
});
```

### Webpack 5

```js
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
      },
    ],
  },
};
```

## Example

A full working example is in [`examples/basic`](./examples/basic). To run it:

```bash
cd examples/basic
npm install
npm run dev
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` and `npm test` to verify
5. Submit a pull request

## License

[Apache-2.0](./LICENSE)
