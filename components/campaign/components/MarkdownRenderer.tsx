import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  theme?: any;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  if (!content) return null;

  // Helper to parse inline markdown (bold, italic, strikethrough, highlight ==...==, code, TRPG tokens)
  const parseInline = (text: string): React.ReactNode[] => {
    // Regex for bold **text**, italic *text*, strikethrough ~~text~~, highlight ==text==, inline code `text`, and TRPG bracketed tokens 【...】
    const regex = /(\*\*.*?\*\*|\*.*?\*|~~.*?~~|==.*?==|`.*?`|【[^】]+】)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={index} className="font-bold text-current">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return <em key={index} className="italic text-current">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
        return <del key={index} className="line-through opacity-70">{part.slice(2, -2)}</del>;
      }
      if (part.startsWith('==') && part.endsWith('==') && part.length >= 4) {
        return (
          <mark key={index} className="bg-amber-200/80 dark:bg-amber-500/30 text-amber-950 dark:text-amber-100 font-semibold px-1 py-0.5 rounded shadow-2xs mx-0.5">
            {part.slice(2, -2)}
          </mark>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return <code key={index} className="bg-current/10 font-mono text-xs px-1.5 py-0.5 rounded border border-current/20 text-inherit font-semibold">{part.slice(1, -1)}</code>;
      }

      // Strictly format bracketed TRPG tokens: 【...】
      if (part.startsWith('【') && part.endsWith('】')) {
        if (part.includes('希望')) {
          return (
            <span key={index} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 rounded shadow-2xs">
              {part}
            </span>
          );
        }
        if (part.includes('恐惧')) {
          return (
            <span key={index} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 text-xs font-bold bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/40 rounded shadow-2xs">
              {part}
            </span>
          );
        }
        if (part.includes('压力')) {
          return (
            <span key={index} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/40 rounded shadow-2xs">
              {part}
            </span>
          );
        }
        if (part.includes('生命')) {
          return (
            <span key={index} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 text-xs font-bold bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/40 rounded shadow-2xs">
              {part}
            </span>
          );
        }
        if (part.includes('护甲')) {
          return (
            <span key={index} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 text-xs font-bold bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/40 rounded shadow-2xs">
              {part}
            </span>
          );
        }

        // Other TRPG bracketed tokens like 【近战范围】, 【脆弱】
        return (
          <span key={index} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 text-xs font-bold bg-current/10 text-inherit border border-current/25 rounded shadow-2xs">
            {part}
          </span>
        );
      }

      return part;
    });
  };

  // Process block-level syntax (lines starting with #, >, -, etc., and Markdown Tables)
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (keyPrefix: string) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-ul`} className="list-disc list-inside space-y-1 my-2 pl-2 text-inherit">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for Markdown Table: current line has | and next line is table separator
    if (trimmed.includes('|') && i + 1 < lines.length) {
      const nextTrimmed = lines[i + 1].trim();
      const isSeparator = /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(nextTrimmed) || 
                          (nextTrimmed.includes('|') && nextTrimmed.includes('---'));
      
      if (isSeparator) {
        flushList(`line-${i}`);
        
        // Parse header
        const rawHeaders = trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|');
        const headers = rawHeaders.map(h => h.trim());
        
        // Parse separator alignments
        const rawAligns = nextTrimmed.replace(/^\|/, '').replace(/\|$/, '').split('|');
        const alignments = rawAligns.map(a => {
          const t = a.trim();
          if (t.startsWith(':') && t.endsWith(':')) return 'center';
          if (t.endsWith(':')) return 'right';
          return 'left';
        });

        // Collect body rows
        const rows: string[][] = [];
        let j = i + 2;
        while (j < lines.length && lines[j].trim().includes('|')) {
          const rowLine = lines[j].trim();
          if (rowLine === '') break;
          const rawCells = rowLine.replace(/^\|/, '').replace(/\|$/, '').split('|');
          rows.push(rawCells.map(c => c.trim()));
          j++;
        }

        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-3">
            <table className="w-full text-xs md:text-sm border-collapse border border-current/20 bg-current/5 rounded-lg overflow-hidden shadow-xs">
              <thead className="bg-current/10 text-inherit font-bold border-b border-current/20">
                <tr>
                  {headers.map((h, hIdx) => {
                    const align = alignments[hIdx] || 'left';
                    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                    return (
                      <th key={hIdx} className={`px-3 py-2 border-r border-current/20 last:border-r-0 ${alignClass}`}>
                        {parseInline(h)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-current/5' : 'bg-transparent'}>
                    {row.map((cell, cIdx) => {
                      const align = alignments[cIdx] || 'left';
                      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                      return (
                        <td key={cIdx} className={`px-3 py-2 border-r border-current/10 last:border-r-0 ${alignClass}`}>
                          {parseInline(cell)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

        i = j;
        continue;
      }
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      inList = true;
      const itemText = trimmed.substring(2);
      listItems.push(<li key={i} className="leading-relaxed">{parseInline(itemText)}</li>);
      i++;
      continue;
    }

    // Flush list if we hit non-list line
    flushList(`line-${i}`);

    if (trimmed.startsWith('### ')) {
      elements.push(<h4 key={i} className="font-bold text-sm md:text-base mt-4 mb-1.5 text-inherit flex items-center gap-1.5">{parseInline(trimmed.substring(4))}</h4>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h3 key={i} className="font-bold text-base md:text-lg mt-5 mb-2 border-b border-current/20 pb-1 text-inherit">{parseInline(trimmed.substring(3))}</h3>);
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h2 key={i} className="font-black text-lg md:text-xl mt-6 mb-2 text-inherit">{parseInline(trimmed.substring(2))}</h2>);
    } else if (trimmed.startsWith('>') || trimmed === '>') {
      const quoteLines: string[] = [];
      let j = i;
      while (j < lines.length) {
        const nextTrim = lines[j].trim();
        if (nextTrim.startsWith('>') || nextTrim === '>') {
          const rawText = nextTrim.replace(/^>\s?/, '');
          quoteLines.push(rawText);
          j++;
        } else {
          break;
        }
      }

      // Group into paragraphs by blank lines
      const quoteContent = quoteLines.join('\n');
      const quoteParagraphs = quoteContent.split(/\n{2,}/);

      elements.push(
        <blockquote key={`quote-${i}`} className="my-2.5 border-l-4 border-amber-500/80 bg-black/10 dark:bg-white/5 p-3.5 rounded-r-xl text-xs md:text-sm text-inherit font-sans leading-relaxed space-y-2 border border-current/15 shadow-2xs">
          {quoteParagraphs.map((p, pIdx) => {
            const pTrimmed = p.trim();
            if (!pTrimmed) return null;
            return (
              <p key={pIdx} className="leading-relaxed text-inherit">
                {parseInline(pTrimmed)}
              </p>
            );
          })}
        </blockquote>
      );
      i = j;
      continue;
    } else if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={i} className="my-4 border-t border-current/20 border-dashed" />);
    } else if (trimmed === '') {
      // Empty line spacing
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="whitespace-pre-wrap break-words leading-relaxed mb-2 text-inherit">
          {parseInline(line)}
        </p>
      );
    }
    i++;
  }

  flushList('end');

  return (
    <div
      className={`max-w-none whitespace-pre-wrap break-words text-left leading-relaxed text-inherit ${className}`}
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
      }}
    >
      {elements}
    </div>
  );
};
