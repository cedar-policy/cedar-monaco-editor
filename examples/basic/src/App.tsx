import { useState } from 'react';
import {
  CedarPolicyEditor,
  CedarSchemaEditor,
  CedarJsonEditor,
} from 'cedar-monaco-editor';
import type { CedarEditorDiagnostic } from 'cedar-monaco-editor';
import './App.css';

const DEFAULT_POLICY = `permit(
  principal,
  action == App::Action::"read",
  resource
);`;

const DEFAULT_JSON_SCHEMA = JSON.stringify({
    "App": {
        "actions": {
            "read": {
                "memberOf": [],
                "appliesTo": {
                    "context": {
                        "type": "Record",
                        "attributes": {
                          "attrLong": {"type": "Long"},
                          "attrString": {"type": "String"}
                        }
                    },
                    "principalTypes": ["User"],
                    "resourceTypes": ["T1", "T2"]
                }
            }
        },
        "entityTypes": {
            "T1": { "memberOfTypes": [], "shape": { "type": "Record", "attributes": {} } },
            "T2": { "memberOfTypes": [], "shape": { "type": "Record", "attributes": {} } },
            "User": { "memberOfTypes": [], "shape": { "type": "Record", "attributes": { "department": { "type": "String" } } } }
        }
    }
}, null, 4);

const DEFAULT_CEDAR_SCHEMA = `namespace App {
  entity T1 {};
  entity T2 {};
  entity User {
    department: String,
  };
  action "read" appliesTo {
    principal: User,
    resource: [T1, T2],
    context: {
      attrLong: Long,
      attrString: String,
    },
  };
}`;

const DEFAULT_ENTITIES = JSON.stringify(
  [{ uid: { type: 'App::User', id: 'alice' }, attrs: { department: 'Engineering' }, parents: [] }],
  null, 2,
);

const DEFAULT_CONTEXT = JSON.stringify({ attrLong: 55, attrString: 'aadf' }, null, 2);

function DiagnosticsPanel({ diagnostics }: { diagnostics: CedarEditorDiagnostic[] }) {
  if (diagnostics.length === 0) {
    return <div className="diagnostics">No issues found.</div>;
  }
  return (
    <div className="diagnostics">
      {diagnostics.map((d, i) => (
        <div key={i} className={d.severity}>
          [{d.startLineNumber}:{d.startColumn}] {d.severity}: {d.message}
        </div>
      ))}
    </div>
  );
}

type Tab = 'policy' | 'schema' | 'entities' | 'context';

function EditorTabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'policy', label: 'Policy' },
    { key: 'schema', label: 'Schema' },
    { key: 'entities', label: 'Entities' },
    { key: 'context', label: 'Context' },
  ];
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.key} className={tab === t.key ? 'tab active' : 'tab'} onClick={() => setTab(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function JsonSchemaPage() {
  const [tab, setTab] = useState<Tab>('policy');
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [schema, setSchema] = useState(DEFAULT_JSON_SCHEMA);
  const [entities, setEntities] = useState(DEFAULT_ENTITIES);
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [policyDiags, setPolicyDiags] = useState<CedarEditorDiagnostic[]>([]);
  const [schemaDiags, setSchemaDiags] = useState<CedarEditorDiagnostic[]>([]);
  const [entitiesDiags, setEntitiesDiags] = useState<CedarEditorDiagnostic[]>([]);
  const [contextDiags, setContextDiags] = useState<CedarEditorDiagnostic[]>([]);

  return (
    <>
      <EditorTabs tab={tab} setTab={setTab} />
      {tab === 'policy' && (
        <>
          <CedarPolicyEditor value={policy} onChange={setPolicy} schema={schema} onValidate={setPolicyDiags} height="400px" />
          <DiagnosticsPanel diagnostics={policyDiags} />
        </>
      )}
      {tab === 'schema' && (
        <>
          <CedarJsonEditor value={schema} onChange={setSchema} mode={{ type: 'schema' }} onValidate={setSchemaDiags} height="400px" />
          <DiagnosticsPanel diagnostics={schemaDiags} />
        </>
      )}
      {tab === 'entities' && (
        <>
          <CedarJsonEditor value={entities} onChange={setEntities} mode={{ type: 'entities' }} schema={schema} onValidate={setEntitiesDiags} height="400px" />
          <DiagnosticsPanel diagnostics={entitiesDiags} />
        </>
      )}
      {tab === 'context' && (
        <>
          <CedarJsonEditor value={context} onChange={setContext} mode={{ type: 'context', action: { actionType: 'App::Action', id: 'read' } }} schema={schema} onValidate={setContextDiags} height="400px" />
          <DiagnosticsPanel diagnostics={contextDiags} />
        </>
      )}
    </>
  );
}

function CedarSchemaPage() {
  const [tab, setTab] = useState<Tab>('policy');
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [schema, setSchema] = useState(DEFAULT_CEDAR_SCHEMA);
  const [entities, setEntities] = useState(DEFAULT_ENTITIES);
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [policyDiags, setPolicyDiags] = useState<CedarEditorDiagnostic[]>([]);
  const [schemaDiags, setSchemaDiags] = useState<CedarEditorDiagnostic[]>([]);
  const [entitiesDiags, setEntitiesDiags] = useState<CedarEditorDiagnostic[]>([]);
  const [contextDiags, setContextDiags] = useState<CedarEditorDiagnostic[]>([]);

  return (
    <>
      <EditorTabs tab={tab} setTab={setTab} />
      {tab === 'policy' && (
        <>
          <CedarPolicyEditor value={policy} onChange={setPolicy} onValidate={setPolicyDiags} height="400px" />
          <DiagnosticsPanel diagnostics={policyDiags} />
        </>
      )}
      {tab === 'schema' && (
        <>
          <CedarSchemaEditor value={schema} onChange={setSchema} onValidate={setSchemaDiags} height="400px" />
          <DiagnosticsPanel diagnostics={schemaDiags} />
        </>
      )}
      {tab === 'entities' && (
        <>
          <CedarJsonEditor value={entities} onChange={setEntities} mode={{ type: 'entities' }} onValidate={setEntitiesDiags} height="400px" />
          <DiagnosticsPanel diagnostics={entitiesDiags} />
        </>
      )}
      {tab === 'context' && (
        <>
          <CedarJsonEditor value={context} onChange={setContext} mode={{ type: 'context', action: { actionType: 'App::Action', id: 'read' } }} onValidate={setContextDiags} height="400px" />
          <DiagnosticsPanel diagnostics={contextDiags} />
        </>
      )}
    </>
  );
}

type Page = 'json-schema' | 'cedar-schema';

export function App() {
  const [page, setPage] = useState<Page>('json-schema');

  return (
    <div className="container">
      <h1>Cedar Monaco Editor</h1>
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={page === 'json-schema' ? 'tab active' : 'tab'} onClick={() => setPage('json-schema')}>
          Full Sample with JSON Schema
        </button>
        <button className={page === 'cedar-schema' ? 'tab active' : 'tab'} onClick={() => setPage('cedar-schema')}>
          Full Sample with Cedar Schema
        </button>
      </div>
      {page === 'json-schema' && <JsonSchemaPage />}
      {page === 'cedar-schema' && <CedarSchemaPage />}
    </div>
  );
}
