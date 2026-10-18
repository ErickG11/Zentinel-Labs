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
});
