import { cedarMonarchLanguage, cedarLanguageConfig } from './cedar.monarch';
import { cedarSchemaMonarchLanguage, cedarSchemaLanguageConfig } from './cedarschema.monarch';

export function registerCedarLanguages(monaco: typeof import('monaco-editor')): void {
  const existing = monaco.languages.getLanguages().map((l) => l.id);

  if (!existing.includes('cedar')) {
    console.log('registering cedar from this package because not already registered');
    monaco.languages.register({ id: 'cedar' });
    monaco.languages.setMonarchTokensProvider('cedar', cedarMonarchLanguage);
    monaco.languages.setLanguageConfiguration('cedar', cedarLanguageConfig);
  }

  if (!existing.includes('cedarschema')) {
    monaco.languages.register({ id: 'cedarschema' });
    monaco.languages.setMonarchTokensProvider('cedarschema', cedarSchemaMonarchLanguage);
    monaco.languages.setLanguageConfiguration('cedarschema', cedarSchemaLanguageConfig);
  }
}
