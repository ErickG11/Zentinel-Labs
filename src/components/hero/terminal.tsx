'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { REDUCED_MOTION_QUERY } from '@/lib/motion';
import { tokenizeCode, type TokenKind } from './code-tokens';

interface TerminalSnippet {
  file: string;
  lines: readonly string[];
}

const SNIPPETS: readonly TerminalSnippet[] = [
  {
    file: 'zentinel.config.ts',
    lines: [
      'const project = await zentinel.create({',
      "  type: 'webapp',",
      "  stack: ['Next.js', 'TypeScript'],",
      "  lighthouse: '95+',",
      '});',
      '',
      'await project.deploy(); // ✓ live',
    ],
  },
  {
    file: 'process.ts',
    lines: [
      'export async function build(brief: Brief) {',
      '  const plan = await discover(brief);',
      '  const design = await prototype(plan);',
      '  return ship(design, { tests: true });',
      '}',
    ],
  },
];

const CHAR_DELAY = 18;
const LINE_DELAY = 120;
const SNIPPET_DELAY = 2200;

const TOKEN_CLASSES: Record<TokenKind, string> = {
  keyword: 'text-ink font-semibold',
  string: 'text-muted',
  comment: 'text-muted/70 italic',
  plain: 'text-ink/80',
};

function CodeLine({ text }: { text: string }) {
  return (
    <>
      {tokenizeCode(text).map((token, index) => (
        <span key={index} className={TOKEN_CLASSES[token.kind]}>
          {token.text}
        </span>
      ))}
    </>
  );
}

export function Terminal() {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const current = SNIPPETS[snippetIndex];

  useEffect(() => {
    if (reducedMotion) return;
    const line = current.lines[visibleLines];

    if (line === undefined) {
      const timeout = setTimeout(() => {
        setSnippetIndex((index) => (index + 1) % SNIPPETS.length);
        setVisibleLines(0);
        setCharIndex(0);
      }, SNIPPET_DELAY);
      return () => clearTimeout(timeout);
    }

    if (charIndex < line.length) {
      const timeout = setTimeout(() => setCharIndex((value) => value + 1), CHAR_DELAY);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setVisibleLines((value) => value + 1);
      setCharIndex(0);
    }, LINE_DELAY);
    return () => clearTimeout(timeout);
  }, [charIndex, visibleLines, current, reducedMotion]);

  const shownLines = reducedMotion ? current.lines : current.lines.slice(0, visibleLines);
  const typingLine = reducedMotion ? undefined : current.lines[visibleLines];

  return (
    <motion.div
      className="relative w-full max-w-md"
      initial={{ rotate: -2 }}
      animate={{ rotate: -2 }}
      whileHover={{ rotate: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="absolute -top-10 -right-10 h-56 w-56 animate-blob rounded-full bg-(--zl-blob) blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-56 w-56 animate-blob rounded-full bg-(--zl-blob) blur-3xl [animation-delay:-4s]" />

      <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/30 glass">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-ink/20" />
          <span className="h-3 w-3 rounded-full bg-ink/20" />
          <span className="h-3 w-3 rounded-full bg-ink/20" />
          <span className="ml-3 font-mono text-xs text-muted">{current.file}</span>
        </div>
        <pre className="min-h-[220px] overflow-hidden p-5 font-mono text-xs leading-relaxed sm:text-sm">
          {shownLines.map((line, index) => (
            <div key={`${current.file}-${index}`}>
              <CodeLine text={line} />
              {line === '' ? ' ' : null}
            </div>
          ))}
          {typingLine !== undefined ? (
            <div>
              <CodeLine text={typingLine.slice(0, charIndex)} />
              <span className="ml-0.5 inline-block h-4 w-2 animate-blink bg-accent align-middle" />
            </div>
          ) : null}
        </pre>
      </div>
    </motion.div>
  );
}
