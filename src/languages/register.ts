import { cedarMonarchLanguage, cedarLanguageConfig } from './cedar.monarch';
import { cedarSchemaMonarchLanguage, cedarSchemaLanguageConfig } from './cedarschema.monarch';

let registered = false;

export function registerCedarLanguages(monaco: typeof import('monaco-editor')): void {
  if (registered) {
    return;
  }

  monaco.languages.register({ id: 'cedar' });
  monaco.languages.setMonarchTokensProvider('cedar', cedarMonarchLanguage);
  monaco.languages.setLanguageConfiguration('cedar', cedarLanguageConfig);

  monaco.languages.register({ id: 'cedarschema' });
  monaco.languages.setMonarchTokensProvider('cedarschema', cedarSchemaMonarchLanguage);
  monaco.languages.setLanguageConfiguration('cedarschema', cedarSchemaLanguageConfig);

  registered = true;
}
