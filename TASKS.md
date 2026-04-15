# cedar-monaco-editor — Detailed Task List

Each task has acceptance criteria and verification steps. Tasks are ordered by dependency — complete them top to bottom within each phase. Phases can partially overlap where noted.

---

## Phase 1: Project Scaffolding (0.5 day) ✅ COMPLETE

### 1.1 Initialize npm package ✅
### 1.2 Install dependencies ✅
### 1.3 Configure Vite library build ✅
### 1.4 Create directory structure ✅
### 1.5 Set up example app ✅

---

## Phase 2: Monarch Tokenizers (1 day) ✅ COMPLETE

### 2.1 Cedar policy Monarch grammar ✅
### 2.2 Cedar schema Monarch grammar ✅
### 2.3 Language registration ✅
### 2.4 Theme contributions (optional) — deferred

---

## Phase 3: Cedar Policy LSP Worker (1.5 days) ✅ COMPLETE

### 3.1 WASM loading utility ✅
### 3.2 Diagnostic conversion utilities ✅
### 3.3 Cedar policy LSP server ✅
### 3.4 Policy completion provider ✅ (static keywords only)
### 3.5 Policy LSP Web Worker entry ✅

---

## Phase 4: Cedar Schema LSP Worker (1 day) ✅ COMPLETE

### 4.1 Cedar schema LSP server ✅
### 4.2 Schema completion provider ✅
### 4.3 Schema LSP Web Worker entry ✅

---

## Phase 5: Cedar JSON Validation Worker (1 day) ✅ COMPLETE

### 5.1 JSON validation overlay ✅
### 5.2 JSON worker message protocol ✅

---

## Phase 6: Monaco ↔ Worker Bridge (1 day) ✅ COMPLETE

### 6.1 LSP client hook (useLSPWorker) ✅
### 6.2 JSON worker client hook (useJsonWorker) ✅
### 6.3 Diagnostic bridge to Monaco markers ✅
### 6.4 Worker factory pattern via configureCedarEditors() ✅

---

## Phase 7: React Components (1.5 days) ✅ COMPLETE

### 7.1 CedarPolicyEditor component ✅
### 7.2 CedarSchemaEditor component ✅
### 7.3 CedarJsonEditor component ✅
### 7.4 useCedar hook ✅
### 7.5 Public exports ✅

---

## Phase 8: Build & Packaging (1 day) ✅ COMPLETE

### 8.1 Library build output ✅
### 8.2 Package.json fields ✅
### 8.3 Consumer bundler compatibility — IN PROGRESS
### 8.4 Worker loading strategy — IN PROGRESS

---

## Phase 9: Example App, Docs & Verification (1.5 days) — IN PROGRESS

### 9.1 Example app ✅ (created, debugging worker loading)
### 9.2 README.md ✅
### 9.3 Monaco internal worker configuration

- [ ] Configure `self.MonacoEnvironment.getWorker` to load Monaco's editor.worker and json.worker from local node_modules via Vite `?worker` imports
- [ ] Verify NO requests to cdn.jsdelivr.net

**Verify:**
- Network tab shows zero requests to jsdelivr or any CDN
- Monaco editor renders and functions normally

### 9.4 Cedar LSP worker loading

- [ ] Configure Cedar LSP workers to load via Vite `?worker` imports in example app
- [ ] Verify NO `data:video/mp2t` requests
- [ ] Verify workers actually start and connect

**Verify:**
- No video/mp2t requests in network tab
- Console shows no worker loading errors
- Workers respond to LSP initialize handshake

### 9.5 End-to-end annotation verification

- [ ] Open policy editor, remove semicolon → red squiggly annotation appears
- [ ] Open schema editor, introduce syntax error → annotation appears
- [ ] Open JSON editor in entities mode, add invalid JSON → annotation appears
- [ ] Fix errors → annotations disappear

**Verify:**
- Visual confirmation of annotations in all 3 editor types
- `onValidate` callback fires with correct diagnostics

### 9.6 Unit test setup — TODO
### 9.7 CI setup — TODO

---

## Task Dependency Graph

```
Phase 1 (Scaffolding) ✅
    ├──→ Phase 2 (Monarch Tokenizers) ✅
    ├──→ Phase 3 (Policy LSP Worker) ✅
    ├──→ Phase 4 (Schema LSP Worker) ✅
    ├──→ Phase 5 (JSON Worker) ✅
    └──→ Phase 6 (Monaco ↔ Worker Bridge) ✅
             └──→ Phase 7 (React Components) ✅
                      └──→ Phase 8 (Build & Packaging) ✅
                               └──→ Phase 9 (Example, Docs, Verify) ← CURRENT
```

---

## Summary

| Phase | Tasks | Status |
|---|---|---|
| 1. Scaffolding | 5 tasks | ✅ Complete |
| 2. Monarch Tokenizers | 4 tasks | ✅ Complete |
| 3. Policy LSP Worker | 5 tasks | ✅ Complete |
| 4. Schema LSP Worker | 3 tasks | ✅ Complete |
| 5. JSON Validation Worker | 2 tasks | ✅ Complete |
| 6. Monaco ↔ Worker Bridge | 4 tasks | ✅ Complete |
| 7. React Components | 5 tasks | ✅ Complete |
| 8. Build & Packaging | 4 tasks | ✅ Complete |
| 9. Example, Docs, Verify | 7 tasks | 🔧 In Progress |
