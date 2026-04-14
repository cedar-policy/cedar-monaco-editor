import type { languages } from 'monaco-editor';

export const cedarSchemaLanguageConfig: languages.LanguageConfiguration = {
  comments: { lineComment: '//' },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"', notIn: ['string'] },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
  ],
};

export const cedarSchemaMonarchLanguage: languages.IMonarchLanguage = {
  keywords: ['namespace', 'entity', 'action', 'type', 'in', 'appliesTo'],
  scopeKeywords: ['principal', 'resource', 'context'],
  typeKeywords: ['Bool', 'Long', 'String', 'Set', 'Record', 'Entity', 'Extension'],

  tokenizer: {
    root: [
      // Line comments
      [/\/\/.*$/, 'comment'],

      // Namespace separator
      [/::/, 'delimiter'],

      // Identifiers, keywords, scope keywords, type keywords
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': 'keyword',
          '@scopeKeywords': 'type.identifier',
          '@typeKeywords': 'type',
          '@default': 'identifier',
        },
      }],

      // Numbers
      [/\d+/, 'number'],

      // Strings
      [/"/, 'string', '@string'],

      // Delimiters
      [/[{}()\[\],;.:]/, 'delimiter'],

      // Whitespace
      [/\s+/, 'white'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, 'string', '@pop'],
    ],
  },
};
