import type { languages } from 'monaco-editor';

export const cedarLanguageConfig: languages.LanguageConfiguration = {
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

export const cedarMonarchLanguage: languages.IMonarchLanguage = {
  keywords: [
    'permit', 'forbid', 'when', 'unless', 'if', 'then', 'else',
    'in', 'has', 'like', 'is', 'true', 'false',
  ],
  builtins: ['principal', 'action', 'resource', 'context'],

  tokenizer: {
    root: [
      // Line comments
      [/\/\/.*$/, 'comment'],

      // Template slots
      [/\?(principal|resource)/, 'variable'],

      // Namespace separator
      [/::/, 'delimiter'],

      // Identifiers, keywords, builtins
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': 'keyword',
          '@builtins': 'type.identifier',
          '@default': 'identifier',
        },
      }],

      // Numbers
      [/\d+/, 'number'],

      // Strings
      [/"/, 'string', '@string'],

      // Operators
      [/[=!<>]=?|&&|\|\|/, 'operator'],
      [/!/, 'operator'],

      // Delimiters
      [/[{}()\[\],;.]/, 'delimiter'],

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
