import { describe, expect, it } from 'vitest';
import { tokenizeCode } from '@/components/hero/code-tokens';

describe('tokenizeCode', () => {
  it('marks keywords, strings and plain text while keeping whitespace', () => {
    const tokens = tokenizeCode("const type = 'webapp';");
    expect(tokens.map((token) => token.text).join('')).toBe("const type = 'webapp';");
    expect(tokens[0]).toEqual({ text: 'const', kind: 'keyword' });
    expect(tokens.find((token) => token.text === "'webapp';")?.kind).toBe('string');
    expect(tokens.find((token) => token.text === 'type')?.kind).toBe('plain');
  });

  it('treats everything after // as a comment', () => {
    const tokens = tokenizeCode('await ship(); // live');
    expect(tokens.at(-1)).toEqual({ text: '// live', kind: 'comment' });
    expect(tokens[0]).toEqual({ text: 'await', kind: 'keyword' });
  });

  it('returns an empty list for an empty line', () => {
    expect(tokenizeCode('')).toEqual([]);
  });

  it('does not start a comment inside a string', () => {
    const line = "const u = 'https://x';";
    const tokens = tokenizeCode(line);
    expect(tokens.some((token) => token.kind === 'comment')).toBe(false);
    expect(tokens.some((token) => token.kind === 'string')).toBe(true);
    expect(tokens.map((token) => token.text).join('')).toBe(line);
  });

  it('keeps a string with spaces as one token', () => {
    const tokens = tokenizeCode("const s = 'a b c';");
    expect(tokens.filter((token) => token.kind === 'string')).toEqual([
      { text: "'a b c';", kind: 'string' },
    ]);
  });

  it('highlights an indented leading type keyword', () => {
    const tokens = tokenizeCode('  type X = 1;');
    expect(tokens.find((token) => token.text === 'type')?.kind).toBe('keyword');
  });

  it('keeps type as a property plain', () => {
    expect(tokenizeCode("  type: 'x',").find((token) => token.text === 'type:')?.kind).toBe(
      'plain',
    );
  });

  it('splits a trailing comment after code', () => {
    const tokens = tokenizeCode('await ship(); // live');
    expect(tokens.map((token) => token.text).join('')).toBe('await ship(); // live');
    expect(tokens.at(-1)?.kind).toBe('comment');
  });

  it('handles double-quoted strings', () => {
    const tokens = tokenizeCode('const s = "a // b";');
    expect(tokens.some((token) => token.kind === 'comment')).toBe(false);
    expect(tokens.find((token) => token.text.startsWith('"'))?.kind).toBe('string');
  });
});
