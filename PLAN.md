# cedar-monaco-editor — Project Plan

An open-source React component library that provides Monaco-based editors for Cedar policies, schemas, and context/entities. No Amazon internal dependencies — built entirely on open-source packages.

---

## Goals

1. Vend 3 React components: `CedarPolicyEditor`, `CedarSchemaEditor`, `CedarJsonEditor`
2. Use Monaco Editor (not Ace/CloudEditor) as the underlying editor
3. Integrate `@cedar-policy/cedar-wasm` for validation, formatting, and parsing
4. Implement Cedar LSP servers running in Web Workers for real-time language intelligence
5. Publish as a single npm package with tree-shakeable ESM output
6. Zero Amazon internal dependencies — fully open-source

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  React Application                                  │
│                                                     │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │ CedarPolicy     │  │ CedarSchemaEditor        │  │
│  │ Editor          │  │                          │  │
│  └────────┬────────┘  └────────────┬─────────────┘  │
│           │                        │                │
│  ┌────────┴────────┐  ┌───────────┴──────────────┐  │
│  │ Monaco Editor   │  │ Monaco Editor            │  │
│  │ (cedar lang)    │  │ (cedarschema lang)       │  │
│  └────────┬────────┘  └───────────┬──────────────┘  │
│           │                        │                │
│  ┌────────┴────────────────────────┴──────────────┐  │
│  │ monaco-languageclient                          │  │
│  │ BrowserMessageReader / BrowserMessageWriter    │  │
│  └────────┬────────────────────────┬──────────────┘  │
│           │    Web Worker          │  Web Worker     │
│  ┌────────┴────────┐  ┌───────────┴──────────────┐  │
│  │ Cedar Policy    │  │ Cedar Schema             │  │
│  │ LSP Server      │  │ LSP Server               │  │
│  │                 │  │                          │  │
│  │ vscode-language │  │ vscode-language          │  │
│  │ server/browser  │  │ server/browser           │  │
│  └────────┬────────┘  └───────────┬──────────────┘  │
│           │                        │                │
│  ┌────────┴────────────────────────┴──────────────┐  │
│  │ @cedar-policy/cedar-wasm                       │  │
│  │ (validation, formatting, parsing)              │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

For the JSON editor (`CedarJsonEditor`), Monaco's built-in JSON language support handles syntax, and a Web Worker overlays Cedar-specific WASM validation (schema validation, entity validation, context validation).

---

## Public API

### CedarPolicyEditor

```tsx
<CedarPolicyEditor
  value={policyText}
  onChange={setPolicyText}
  schema={schemaJson}             // optional — enables schema-aware validation & completion
  onValidate={handleDiagnostics}  // receives diagnostics array
  allowTemplates={false}          // allow ?principal/?resource template slots
  allowMultiplePolicies={true}    // allow multiple permit/forbid statements
  theme="vs-dark"                 // Monaco theme
  height="400px"
  options={{}}                    // pass-through Monaco editor options
/>
```

### CedarSchemaEditor

```tsx
<CedarSchemaEditor
  value={schemaText}
  onChange={setSchemaText}
  onValidate={handleDiagnostics}
  theme="vs-dark"
  height="400px"
  options={{}}
/>
```

### CedarJsonEditor

```tsx
<CedarJsonEditor
  value={jsonText}
  onChange={setJsonText}
  mode="entities"                 // 'schema' | 'entities' | 'context' | 'json'
  schema={schemaJson}             // optional — for entity/context validation
  action={actionUid}              // optional — for context validation
  onValidate={handleDiagnostics}
  theme="vs-dark"
  height="400px"
  options={{}}
/>
```

### Utility Hook

```tsx
const { validate, format, parse, cedarVersion } = useCedar();
```

---

## Open-Source Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@cedar-policy/cedar-wasm` | ^4.9.0 | Cedar validation, formatting, parsing (WASM) |
| `monaco-editor` | ^0.55.0 | Code editor |
| `@monaco-editor/react` | ^4.7.0 | React wrapper for Monaco |
| `vscode-languageserver` | ^9.0.0 | LSP server implementation (runs in workers) |
| `vscode-languageserver-protocol` | ^3.17.0 | LSP types + BrowserMessageReader/Writer |
| `vscode-languageserver-textdocument` | ^1.0.0 | Text document model for LSP |

Peer dependencies: `react ^18.2.0`, `react-dom ^18.2.0`, `monaco-editor`, `@monaco-editor/react`

---

## Package Structure

```
cedar-monaco-editor/
├── src/
│   ├── index.ts                      # Public exports
│   ├── types.ts                      # Shared types (diagnostics, props)
│   ├── config.ts                     # configureCedarEditors() setup
│   ├── components/
│   │   ├── CedarPolicyEditor.tsx     # Policy editor component
│   │   ├── CedarSchemaEditor.tsx     # Schema editor component
│   │   ├── CedarJsonEditor.tsx       # JSON editor component (multi-mode)
│   │   ├── useLSPWorker.ts           # LSP worker lifecycle hook
│   │   └── useJsonWorker.ts          # JSON validation worker hook
│   ├── languages/
│   │   ├── cedar.monarch.ts          # Monarch tokenizer for Cedar policy syntax
│   │   ├── cedarschema.monarch.ts    # Monarch tokenizer for Cedar schema syntax
│   │   └── register.ts              # Language registration with Monaco
│   ├── workers/
│   │   ├── cedar-policy.worker.ts    # Web Worker entry: policy LSP
│   │   ├── cedar-schema.worker.ts    # Web Worker entry: schema LSP
│   │   ├── cedar-json.worker.ts      # Web Worker entry: JSON + WASM validation
│   │   └── cedar-json.protocol.ts    # Message types for JSON worker
│   ├── lsp/
│   │   ├── cedar-policy-lsp.ts       # Policy LSP: validation, completion, formatting
│   │   ├── cedar-schema-lsp.ts       # Schema LSP: validation, completion
│   │   ├── diagnostics.ts            # Diagnostic conversion utilities
│   │   └── wasm-loader.ts            # Cedar WASM loading utility
│   └── hooks/
│       └── useCedar.ts               # React hook for direct WASM usage
├── examples/
│   └── basic/                        # Vite example app
├── package.json
├── tsconfig.json
├── vite.config.ts                    # Library build config
├── README.md
├── LICENSE                           # Apache-2.0 (matching cedar-policy)
├── PLAN.md                           # This file
└── TASKS.md                          # Detailed task breakdown
```

---

## Key Design Decisions

### 1. Monarch over TextMate for syntax highlighting

TextMate grammars exist in `vscode-cedar` but require `monaco-vscode-api` which adds significant bundle weight. Monarch tokenizers are Monaco-native, simpler to maintain, and sufficient for Cedar's relatively small keyword set. Can upgrade to TextMate later if needed.

### 2. Worker factory pattern for consumer bundler compatibility

The library does NOT bundle workers — it exports worker source files and accepts `WorkerFactory` functions via `configureCedarEditors()`. The consumer's bundler (Vite, Webpack) handles worker bundling. This avoids the `data:video/mp2t` base64 encoding issue that occurs when Vite lib mode tries to inline `.ts` worker files.

### 3. Separate workers per editor type

Each editor type gets its own Web Worker to avoid cross-contamination and simplify the LSP implementation. Workers are lightweight — the main cost is the WASM module.

### 4. Vite for library build

Vite's library mode produces clean ESM output. Workers are NOT bundled by the library — consumers use Vite's `?worker` import suffix or Webpack's worker-loader to bundle them.

### 5. Progressive feature delivery

- **v0.1**: Validation + formatting (diagnostics via WASM, no completion)
- **v0.2**: Basic completion (keywords, built-in types)
- **v0.3**: Schema-aware completion (entity types, attributes, actions)
- **v1.0**: Full feature parity with internal CedarCodeEditor

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| WASM loading in CSP-restricted envs | Blocks usage in some apps | Document CSP requirements, offer `initSync` fallback |
| Worker bundling across bundlers | Consumer build issues | Provide `?worker` examples for Vite, worker-loader for Webpack |
| Bundle size (Monaco is ~2MB) | Large for some apps | Document tree-shaking, offer lazy-loading pattern |
| Cedar WASM API changes | Breaking updates | Pin to specific cedar-wasm version, test in CI |

---

## Effort Estimate

| Phase | Effort | Description |
|---|---|---|
| 1. Scaffolding | 0.5 day | Project setup, Vite config, TypeScript, dependencies |
| 2. Monarch tokenizers | 1 day | Cedar + Cedar schema syntax highlighting |
| 3. Policy LSP worker | 1.5 days | Validation, formatting, basic completion |
| 4. Schema LSP worker | 1 day | Validation, keyword completion |
| 5. JSON validation worker | 1 day | Monaco JSON + WASM validation overlay |
| 6. Monaco ↔ Worker bridge | 1 day | Worker factory pattern + LSP client hooks |
| 7. React components | 1.5 days | 3 components + shared utilities |
| 8. Build & packaging | 1 day | Library build, worker bundling, WASM loading |
| 9. Tests & docs | 1.5 days | Unit tests, example app, README |
| **Total** | **~10 days** | Single experienced engineer |
