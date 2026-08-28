import React from 'react';

interface MarkdownProps {
  text: string;
  className?: string;
}

// Converts CSS style string (e.g., "color: red; font-size: 1.2em") into React CSSProperties
function parseStyleString(styleStr: string): React.CSSProperties {
  const style: Record<string, string> = {};
  styleStr.split(';').forEach(part => {
    const colonIdx = part.indexOf(':');
    if (colonIdx > -1) {
      const key = part.slice(0, colonIdx).trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      const value = part.slice(colonIdx + 1).trim();
      if (key && value) {
        style[key] = value;
      }
    }
  });
  return style as React.CSSProperties;
}

// Parses inline Markdown elements (Bold, Italic, Strikethrough, Custom styles)
export function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // 1. [text]{style-rules}
  // 2. **bold**
  // 3. *italic*
  // 4. ~~strikethrough~~
  const regex = /(\[([^\]]+)\]\{([^\}]+)\})|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(~~([^~]+)~~)/g;

  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const index = match.index;

    // Add normal text preceding the match
    if (index > lastIndex) {
      result.push(text.slice(lastIndex, index));
    }

    if (match[1]) {
      // Custom styling [text]{css-rules}
      const innerText = match[2];
      const styleStr = match[3];
      const style = parseStyleString(styleStr);
      result.push(
        <span key={index} style={style}>
          {parseInline(innerText)}
        </span>
      );
    } else if (match[4]) {
      // Bold **text**
      const innerText = match[5];
      result.push(
        <strong key={index} className="font-bold">
          {parseInline(innerText)}
        </strong>
      );
    } else if (match[6]) {
      // Italic *text*
      const innerText = match[7];
      result.push(
        <em key={index} className="italic">
          {parseInline(innerText)}
        </em>
      );
    } else if (match[8]) {
      // Strikethrough ~~text~~
      const innerText = match[9];
      result.push(
        <del key={index} className="line-through">
          {parseInline(innerText)}
        </del>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

// Parses blocks (lists, headings, paragraphs) and groups consecutive list items
export function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const normalizedText = text.replace(/\r\n/g, '\n');
  const lines = normalizedText.split('\n');
  const elements: React.ReactNode[] = [];

  let currentListType: 'bullet' | 'number' | null = null;
  let currentListItems: React.ReactNode[] = [];

  const flushList = (key: number) => {
    if (currentListType === 'bullet') {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 my-1.5 space-y-0.5">
          {currentListItems}
        </ul>
      );
    } else if (currentListType === 'number') {
      elements.push(
        <ol key={`ol-${key}`} className="list-decimal pl-5 my-1.5 space-y-0.5">
          {currentListItems}
        </ol>
      );
    }
    currentListItems = [];
    currentListType = null;
  };

  lines.forEach((line, index) => {
    const bulletMatch = line.match(/^[\s]*[-*][\s]+(.*)/);
    const numberMatch = line.match(/^[\s]*\d+\.[\s]+(.*)/);
    const headingMatch = line.match(/^[\s]*(#{1,6})[\s]+(.*)/);

    if (bulletMatch) {
      if (currentListType !== 'bullet') {
        flushList(index);
        currentListType = 'bullet';
      }
      currentListItems.push(
        <li key={`li-${index}`} className="text-sm leading-relaxed">
          {parseInline(bulletMatch[1])}
        </li>
      );
    } else if (numberMatch) {
      if (currentListType !== 'number') {
        flushList(index);
        currentListType = 'number';
      }
      currentListItems.push(
        <li key={`li-${index}`} className="text-sm leading-relaxed">
          {parseInline(numberMatch[1])}
        </li>
      );
    } else {
      flushList(index);

      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];
        const HeadingTag = `h${level}` as any;
        
        let headingClass = 'font-bold font-serif my-1.5 ';
        if (level === 1) headingClass += 'text-base border-b border-slate-200 dark:border-zinc-800 pb-0.5';
        else if (level === 2) headingClass += 'text-sm';
        else headingClass += 'text-xs';

        elements.push(
          <HeadingTag key={`h-${index}`} className={headingClass}>
            {parseInline(content)}
          </HeadingTag>
        );
      } else {
        if (line.trim() === '') {
          elements.push(<div key={`br-${index}`} className="h-1.5" />);
        } else {
          elements.push(
            <div key={`p-${index}`} className="leading-relaxed min-h-[1.25rem]">
              {parseInline(line)}
            </div>
          );
        }
      }
    }
  });

  flushList(lines.length);

  return <div className="space-y-0.5">{elements}</div>;
}

export const Markdown: React.FC<MarkdownProps> = ({ text, className = '' }) => {
  return <div className={className}>{parseMarkdown(text)}</div>;
};

export default Markdown;
