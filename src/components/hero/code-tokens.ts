export type TokenKind = 'keyword' | 'string' | 'comment' | 'plain';

export interface CodeToken {
  text: string;
  kind: TokenKind;
}

const KEYWORDS = new Set([
  'const',
  'await',
  'async',
  'export',
  'function',
  'return',
  'import',
  'from',
  'new',
  'type',
]);

const classify = (part: string): TokenKind => {
  if (KEYWORDS.has(part)) return 'keyword';
  if (part.includes("'")) return 'string';
  return 'plain';
};

export const tokenizeCode = (line: string): CodeToken[] => {
  if (line === '') return [];
  const commentStart = line.indexOf('//');
  const code = commentStart === -1 ? line : line.slice(0, commentStart);
  const comment = commentStart === -1 ? '' : line.slice(commentStart);

  const tokens: CodeToken[] = code
    .split(/(\s+)/)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, kind: /^\s+$/.test(part) ? 'plain' : classify(part) }));

  // "type" solo es keyword al inicio de la línea; como propiedad es texto plano
  tokens.forEach((token, index) => {
    if (token.text === 'type' && index !== 0) token.kind = 'plain';
  });

  if (comment) tokens.push({ text: comment, kind: 'comment' });
  return tokens;
};
