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

const DEFAULT_SCHEMA = JSON.stringify({
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
                    "principalTypes": [
                        "User"
                    ],
                    "resourceTypes": [
                        "T1",
                        "T2"
                    ]
                }
            }
        },
        "entityTypes": {
            "T1": {
                "memberOfTypes": [],
                "shape": {
                    "type": "Record",
                    "attributes": {}
                }
            },
            "T2": {
                "memberOfTypes": [],
                "shape": {
                    "type": "Record",
                    "attributes": {}
                }
            },
            "User": {
                "memberOfTypes": [],
                "shape": {
                    "type": "Record",
                    "attributes": {
                      department: {type: 'String'},
                    }
                }
            }
        }
    }
}, null, 4);

const DEFAULT_ENTITIES = JSON.stringify(
  [
    {
      uid: { type: 'App::User', id: 'alice' },
      attrs: { department: 'Engineering', jobLevel: 6 },
      parents: [],
    },
  ],
  null,
  2,
);

const DEFAULT_CONTEXT = JSON.stringify(
  {
    attrLong: 55,
    attrString: 'aadf',
  },
  null,
  2,
);

type Tab = 'policy' | 'schema' | 'entities' | 'context';

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

export function App() {
  const [tab, setTab] = useState<Tab>('policy');
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [schema, setSchema] = useState(DEFAULT_SCHEMA);
  const [entities, setEntities] = useState(DEFAULT_ENTITIES);
  const [context, setContext] = useState(DEFAULT_CONTEXT);

  const [policyDiags, setPolicyDiags] = useState<CedarEditorDiagnostic[]>([]);
  const [schemaDiags, setSchemaDiags] = useState<CedarEditorDiagnostic[]>([]);
  const [entitiesDiags, setEntitiesDiags] = useState<CedarEditorDiagnostic[]>([]);
  const [contextDiags, setContextDiags] = useState<CedarEditorDiagnostic[]>([]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'policy', label: 'Policy' },
    { key: 'schema', label: 'Schema' },
    { key: 'entities', label: 'Entities' },
    { key: 'context', label: 'Context' },
  ];

  return (
    <div className="container">
      <h1>Cedar Monaco Editor</h1>
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'tab active' : 'tab'}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'policy' && (
        <>
          <CedarPolicyEditor
            value={policy}
            onChange={setPolicy}
            schema={schema}
            onValidate={setPolicyDiags}
            height="400px"
          />
          <DiagnosticsPanel diagnostics={policyDiags} />
        </>
      )}

      {tab === 'schema' && (
        <>
          <CedarSchemaEditor
            value={schema}
            onChange={setSchema}
            onValidate={setSchemaDiags}
            height="400px"
          />
          <DiagnosticsPanel diagnostics={schemaDiags} />
        </>
      )}

      {tab === 'entities' && (
        <>
          <CedarJsonEditor
            value={entities}
            onChange={setEntities}
            mode="entities"
            schema={schema}
            onValidate={setEntitiesDiags}
            height="400px"
          />
          <DiagnosticsPanel diagnostics={entitiesDiags} />
        </>
      )}

      {tab === 'context' && (
        <>
          <CedarJsonEditor
            value={context}
            onChange={setContext}
            mode="context"
            schema={schema}
            onValidate={setContextDiags}
            height="400px"
          />
          <DiagnosticsPanel diagnostics={contextDiags} />
        </>
      )}
    </div>
  );
}
