// src/languages/rustLanguageDefinition.ts
import * as monaco from 'monaco-editor';

// Register a new language for Rust
monaco.languages.register({ id: 'rust' });

// Define Rust language syntax
monaco.languages.setMonarchTokensProvider('rust', {
  keywords: [
    'as', 'break', 'const', 'continue', 'crate', 'else', 'enum', 'extern', 'false', 'fn', 'for', 
    'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 
    'self', 'Self', 'static', 'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use', 
    'where', 'while', 'async', 'await', 'dyn'
  ],
  typeKeywords: [
    'i8', 'i16', 'i32', 'i64', 'i128', 'isize', 'u8', 'u16', 'u32', 'u64', 'u128', 'usize',
    'f32', 'f64', 'str', 'char', 'bool', 'Option', 'Result', 'String', 'Vec', 'Box'
  ],
  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||', '++', '--', '+', '-',
    '*', '/', '&', '|', '^', '%', '<<', '>>', '>>>'
  ],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // The main tokenizer for Rust
  tokenizer: {
    root: [
        // Match variable declarations with `let`
        [/\blet\s+[a-zA-Z_]\w*/, 'custom-variable'],
        // Identifiers and keywords
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@default': 'identifier'
          }
        }],
        
        // Whitespace
        { include: '@whitespace' },
  
        // Delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }],
  
        // Numbers
        [/\d+/, 'number'],
  
        // Strings
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
    ],

    variableAssign: [
        [/=/, 'operator', '@pop'],
        [/[^=]+/, 'custom-variable']
    ],

    whitespace: [
      [/[ \t\r\n]+/, ''],
      [/\/\/.*$/, 'comment'],
      [/\/\*/, 'comment', '@comment']
    ],

    comment: [
      [/[^/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      ["\\*/", 'comment', '@pop'],
      [/[/*]/, 'comment']
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
    ],
  },
});

// Associate `.rs` files with the Rust language
monaco.languages.registerCompletionItemProvider('rust', {
  provideCompletionItems: (model, position) => {
    const word = model.getWordUntilPosition(position);
    const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);

    return {
      suggestions: [
        {
          label: 'fn',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'fn ',
          range: range,
        },
        {
          label: 'let',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'let ',
          range: range,
        },
      ],
    };
  },
});