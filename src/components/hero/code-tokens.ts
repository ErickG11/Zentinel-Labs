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
]);

const TYPE_KEYWORD = 'type';

const QUOTES = new Set(["'", '"', '`']);

const classify = (part: string): TokenKind => {
  if (KEYWORDS.has(part)) return 'keyword';
  if ([...part].some((char) => QUOTES.has(char))) return 'string';
  return 'plain';
};

export const tokenizeCode = (line: string): CodeToken[] => {
  if (line === '') return [];
  const tokens: CodeToken[] = [];
  let index = 0;

  while (index < line.length) {
    // Comentario: "//" solo cuenta fuera de comillas (se detecta abajo al escanear)
    if (/\s/.test(line[index])) {
      let end = index;
      while (end < line.length && /\s/.test(line[end])) end++;
      tokens.push({ text: line.slice(index, end), kind: 'plain' });
      index = end;
      continue;
    }

    let end = index;
    let quote: string | null = null;
    let commentAt = -1;
    while (end < line.length) {
      const char = line[end];
      if (quote) {
        if (char === quote) quote = null;
      } else if (QUOTES.has(char)) {
        quote = char;
      } else if (/\s/.test(char)) {
        break;
      } else if (char === '/' && line[end + 1] === '/') {
        commentAt = end;
        break;
      }
      end++;
    }

    if (commentAt !== -1) {
      if (commentAt > index) tokens.push(makeWord(line.slice(index, commentAt), tokens));
      tokens.push({ text: line.slice(commentAt), kind: 'comment' });
      return tokens;
    }
    tokens.push(makeWord(line.slice(index, end), tokens));
    index = end;
  }
  return tokens;
};

// "type" solo es keyword como primer token no vacío de la línea
const makeWord = (text: string, previous: CodeToken[]): CodeToken => {
  const isFirst = previous.every((token) => token.kind === 'plain' && /^\s+$/.test(token.text));
  if (text === TYPE_KEYWORD) return { text, kind: isFirst ? 'keyword' : 'plain' };
  return { text, kind: classify(text) };
};
