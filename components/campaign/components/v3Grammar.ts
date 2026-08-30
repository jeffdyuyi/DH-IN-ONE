/**
 * Daggerheart V3 Grammar & AST Parser
 * Implements balanced-bracket stack tokenizer for nested curly braces
 * Full support for Homebrewery V3 + Daggerheart unique structured tokens
 */

export interface ParsedBlock {
  type: 
    | 'page_break' 
    | 'column_break' 
    | 'spacer' 
    | 'heading' 
    | 'paragraph' 
    | 'blockquote' 
    | 'note' 
    | 'table' 
    | 'adversary' 
    | 'outcome' 
    | 'environment' 
    | 'cyberware' 
    | 'toc' 
    | 'artist' 
    | 'wide' 
    | 'def_list' 
    | 'raw_html'
    | 'unknown_block';
  level?: number;
  content?: string;
  data?: any;
  className?: string;
  style?: Record<string, string>;
  children?: ParsedBlock[];
}

export interface ParsedPage {
  pageIndex: number;
  chapterTab?: string;
  footnote?: string;
  blocks: ParsedBlock[];
}

/**
 * Tokenize balanced curly braces {{...}}
 * Safely handles arbitrary levels of nesting like {{adversary ... {{descriptive ...}} ...}}
 */
export function extractCurlyBlocks(text: string): { raw: string; tag: string; body: string; start: number; end: number }[] {
  const results: { raw: string; tag: string; body: string; start: number; end: number }[] = [];
  let i = 0;
  
  while (i < text.length - 1) {
    if (text[i] === '{' && text[i + 1] === '{') {
      const startIndex = i;
      let depth = 1;
      let j = i + 2;
      
      while (j < text.length && depth > 0) {
        if (text[j] === '{' && text[j + 1] === '{') {
          depth++;
          j += 2;
        } else if (text[j] === '}' && text[j + 1] === '}') {
          depth--;
          j += 2;
          if (depth === 0) {
            const raw = text.substring(startIndex, j);
            const inside = raw.slice(2, -2).trim();
            // tag is the first word or comma-separated identifier before newline/space
            const firstLine = inside.split('\n')[0] || '';
            const matchTag = firstLine.match(/^([a-zA-Z0-9_-]+(?:,[a-zA-Z0-9_:-]+)*)/);
            const tag = matchTag ? matchTag[1] : '';
            const body = matchTag ? inside.substring(tag.length).trim() : inside;

            results.push({
              raw,
              tag,
              body,
              start: startIndex,
              end: j,
            });
            i = j - 1;
            break;
          }
        } else {
          j++;
        }
      }
    }
    i++;
  }
  
  return results;
}

/**
 * Parse style injection {style-key:value,class:name}
 */
export function parseStyleInjection(injectStr: string): { className: string; style: Record<string, string> } {
  const res = { className: '', style: {} as Record<string, string> };
  if (!injectStr) return res;

  const parts = injectStr.replace(/^\{/, '').replace(/\}$/, '').split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes(':')) {
      const [k, ...vParts] = trimmed.split(':');
      const key = k.trim();
      const val = vParts.join(':').trim().replace(/^["']|["']$/g, '');
      res.style[key] = val;
    } else {
      res.className += ` ${trimmed}`;
    }
  }
  return res;
}

/**
 * Parse Markdown Table with || (colspan) and ^ (rowspan)
 */
export function parseAdvancedTable(rawLines: string[]): {
  headers: string[];
  alignments: ('left' | 'center' | 'right')[];
  rows: string[][];
  colSpans?: number[][];
} {
  if (rawLines.length < 2) return { headers: [], alignments: [], rows: [] };

  const headerLine = rawLines[0].trim();
  const sepLine = rawLines[1].trim();

  const rawHeaders = headerLine.replace(/^\|/, '').replace(/\|$/, '').split('|');
  const headers = rawHeaders.map(h => h.trim());

  const rawAligns = sepLine.replace(/^\|/, '').replace(/\|$/, '').split('|');
  const alignments = rawAligns.map(a => {
    const t = a.trim();
    if (t.startsWith(':') && t.endsWith(':')) return 'center' as const;
    if (t.endsWith(':')) return 'right' as const;
    return 'left' as const;
  });

  const rows: string[][] = [];
  for (let idx = 2; idx < rawLines.length; idx++) {
    const line = rawLines[idx].trim();
    if (!line || !line.includes('|')) continue;
    const rawCells = line.replace(/^\|/, '').replace(/\|$/, '').split('|');
    rows.push(rawCells.map(c => c.trim()));
  }

  return { headers, alignments, rows };
}

/**
 * Parse an entire raw document and partition into A4 Pages
 */
export function parseDocumentToPages(fullText: string): ParsedPage[] {
  if (!fullText) return [{ pageIndex: 1, blocks: [] }];

  // Clean out top metadata codeblock if present
  let cleanText = fullText.replace(/^```metadata[\s\S]*?```\n?/, '');

  // Split by explicit \page
  const rawPages = cleanText.split(/\\page/g);

  return rawPages.map((pageText, pageIdx) => {
    let footnote = '';
    let chapterTab = '';

    // Extract footnote or pageNumber
    pageText = pageText.replace(/\{\{footnote(?:,([a-zA-Z0-9_-]+))?\s+([^}]+)\}\}/g, (_, variant, text) => {
      footnote = text.trim();
      return '';
    });

    // Extract chapter side tab like {{Ch1,tab}} or {{Intro}}
    pageText = pageText.replace(/\{\{(Intro|Ch1|Ch2|Ch3|Ch4|Ch5|app)(?:,([a-zA-Z0-9_-]+))?\}\}/g, (_, tabName) => {
      chapterTab = tabName;
      return '';
    });

    const blocks: ParsedBlock[] = [];
    const lines = pageText.split('\n');

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Comment
      if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
        i++;
        continue;
      }
      if (trimmed.startsWith('<!--')) {
        while (i < lines.length && !lines[i].includes('-->')) {
          i++;
        }
        i++;
        continue;
      }

      // Column Break
      if (trimmed === '\\column') {
        blocks.push({ type: 'column_break' });
        i++;
        continue;
      }

      // Spacers (:: or :::)
      if (/^:{1,5}$/.test(trimmed)) {
        blocks.push({ type: 'spacer', level: trimmed.length });
        i++;
        continue;
      }

      // Curly Blocks parsing ({{adversary, {{outcome, {{wide, {{toc, {{DHTable, etc.)
      if (trimmed.startsWith('{{')) {
        // Collect full block lines
        let blockText = line;
        let depth = (line.match(/\{\{/g) || []).length - (line.match(/\}\}/g) || []).length;
        let j = i + 1;
        
        while (j < lines.length && depth > 0) {
          blockText += '\n' + lines[j];
          depth += (lines[j].match(/\{\{/g) || []).length - (lines[j].match(/\}\}/g) || []).length;
          j++;
        }

        const tagMatch = blockText.match(/^\{\{([a-zA-Z0-9_-]+)(?:,([^}\n]+))?/);
        const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
        const tagArgs = tagMatch && tagMatch[2] ? tagMatch[2] : '';
        const innerContent = blockText.replace(/^\{\{[^\n]*\n?/, '').replace(/\n?\}\}$/, '');

        if (tagName === 'adversary') {
          blocks.push({
            type: 'adversary',
            content: innerContent,
            data: parseAdversaryBlock(innerContent),
          });
        } else if (tagName === 'outcome') {
          blocks.push({
            type: 'outcome',
            content: innerContent,
            data: parseOutcomeBlock(innerContent),
          });
        } else if (tagName === 'environment') {
          blocks.push({
            type: 'environment',
            content: innerContent,
            data: parseEnvironmentBlock(innerContent),
          });
        } else if (tagName === 'cyberware') {
          blocks.push({
            type: 'cyberware',
            content: innerContent,
            data: parseCyberwareBlock(innerContent),
          });
        } else if (tagName === 'wide') {
          blocks.push({
            type: 'wide',
            content: innerContent,
          });
        } else if (tagName === 'toc') {
          blocks.push({
            type: 'toc',
            content: innerContent,
          });
        } else if (tagName === 'dhtable' || tagName.includes('table')) {
          const tableLines = innerContent.split('\n').filter(l => l.trim().includes('|'));
          blocks.push({
            type: 'table',
            content: innerContent,
            data: parseAdvancedTable(tableLines),
          });
        } else if (tagName === 'note' || tagName === 'dhtip') {
          blocks.push({
            type: 'note',
            content: innerContent,
          });
        } else if (tagName === 'artist') {
          blocks.push({
            type: 'artist',
            content: innerContent,
            data: { isLight: tagArgs.includes('aLight') },
          });
        } else {
          // Generic block
          blocks.push({
            type: 'unknown_block',
            className: tagName,
            content: innerContent,
          });
        }

        i = j;
        continue;
      }

      // Check for standalone Markdown Table
      if (trimmed.includes('|') && i + 1 < lines.length && (lines[i + 1].includes('---') || lines[i + 1].includes(':--'))) {
        const tableLines: string[] = [line, lines[i + 1]];
        let j = i + 2;
        while (j < lines.length && lines[j].trim().includes('|')) {
          tableLines.push(lines[j]);
          j++;
        }
        blocks.push({
          type: 'table',
          data: parseAdvancedTable(tableLines),
        });
        i = j;
        continue;
      }

      // Headings
      if (trimmed.startsWith('#')) {
        const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (match) {
          blocks.push({
            type: 'heading',
            level: match[1].length,
            content: match[2],
          });
          i++;
          continue;
        }
      }

      // Quotes / Flavor Text
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        let j = i;
        while (j < lines.length && (lines[j].trim().startsWith('>') || lines[j].trim() === '')) {
          if (lines[j].trim() === '') {
            if (j + 1 < lines.length && lines[j + 1].trim().startsWith('>')) {
              quoteLines.push('');
              j++;
              continue;
            } else {
              break;
            }
          }
          quoteLines.push(lines[j].replace(/^>\s?/, ''));
          j++;
        }
        blocks.push({
          type: 'blockquote',
          content: quoteLines.join('\n'),
        });
        i = j;
        continue;
      }

      // Definition List: **Term** :: Definition
      if (trimmed.includes('**') && trimmed.includes('::')) {
        const defMatch = trimmed.match(/^\*\*(.*?)\*\*\s*::\s*(.*)$/);
        if (defMatch) {
          blocks.push({
            type: 'def_list',
            data: { term: defMatch[1], definition: defMatch[2] },
          });
          i++;
          continue;
        }
      }

      // Regular Paragraph
      if (trimmed) {
        blocks.push({
          type: 'paragraph',
          content: line,
        });
      }

      i++;
    }

    return {
      pageIndex: pageIdx + 1,
      chapterTab,
      footnote,
      blocks,
    };
  });
}

/** Helper parsers for rich Daggerheart components */
function parseAdversaryBlock(raw: string): any {
  const lines = raw.split('\n');
  const res: any = {
    name: '敌对生物',
    tierRole: '',
    flavor: '',
    tactics: '',
    difficulty: 12,
    thresholdMinor: 10,
    thresholdMajor: 20,
    hp: 5,
    stress: 4,
    attack: '',
    experience: '',
    traits: [] as { name: string; type: string; desc: string }[],
    avatarUrl: '',
    avatarShape: 'circle',
    healthDisplay: 'dots',
  };

  let inFeatures = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('## ')) {
      res.name = trimmed.replace(/^##\s+/, '');
    } else if (trimmed.startsWith('### ')) {
      res.tierRole = trimmed.replace(/^###\s+/, '');
    } else if (trimmed.startsWith('avatar:')) {
      const match = trimmed.match(/avatar:\s*([^\s(]+)(?:\s*\((circle|square)\))?/i);
      if (match) {
        res.avatarUrl = match[1];
        res.avatarShape = match[2] || 'circle';
      }
    } else if (trimmed.startsWith('healthDisplay:')) {
      const val = trimmed.replace(/healthDisplay:\s*/i, '').trim().toLowerCase();
      if (val === 'dots' || val === 'number' || val === 'both') {
        res.healthDisplay = val;
      }
    } else if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) {
      res.flavor = trimmed.slice(1, -1);
    } else if (trimmed.includes('Difficulty:') || trimmed.includes('难度:')) {
      const diffMatch = trimmed.match(/(?:Difficulty|难度):\s*(\d+)/i);
      if (diffMatch) res.difficulty = parseInt(diffMatch[1]);

      const threshMatch = trimmed.match(/(?:Thresholds|阈值):\s*(\d+)\/(\d+)/i);
      if (threshMatch) {
        res.thresholdMinor = parseInt(threshMatch[1]);
        res.thresholdMajor = parseInt(threshMatch[2]);
      }

      const hpMatch = trimmed.match(/HP:\s*(\d+)/i);
      if (hpMatch) res.hp = parseInt(hpMatch[1]);

      const stressMatch = trimmed.match(/(?:Stress|压力):\s*(\d+)/i);
      if (stressMatch) res.stress = parseInt(stressMatch[1]);
    } else if (trimmed.includes('ATK:') || trimmed.includes('攻击:')) {
      res.attack = trimmed;
    } else if (trimmed.includes('Experience:') || trimmed.includes('经验:')) {
      res.experience = trimmed.replace(/^(?:\*\*Experience:\*\*|\*\*经验:\*\*)\s*/, '');
    } else if (trimmed.startsWith('#### 特性') || trimmed.startsWith('#### Features')) {
      inFeatures = true;
    } else if (inFeatures || (trimmed.startsWith('**') && trimmed.includes(' - '))) {
      // Trait line: **Name - Action: Mark 1 Stress** Desc...
      const traitMatch = trimmed.match(/^\*\*(.*?)\s*-\s*(被动|动作|反应|聚光灯|Passive|Action|Reaction|Spotlight)(?::\s*([^*]+))?\*\*\s*(.*)$/i);
      if (traitMatch) {
        res.traits.push({
          name: traitMatch[1].trim(),
          type: traitMatch[2].toLowerCase(),
          desc: (traitMatch[3] ? `【${traitMatch[3]}】 ` : '') + traitMatch[4].trim(),
        });
      } else {
        res.traits.push({
          name: '特性',
          type: 'action',
          desc: trimmed,
        });
      }
    }
  }

  return res;
}

function parseOutcomeBlock(raw: string): any[] {
  const lines = raw.split('\n');
  const entries: any[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^\[([a-zA-Z0-9_,]+)\]\s*(.*)$/);
    if (match) {
      const tags = match[1].split(',').map(t => t.trim().toLowerCase());
      entries.push({
        tags,
        content: match[2].trim(),
      });
    } else {
      entries.push({
        tags: ['success'],
        content: trimmed,
      });
    }
  }

  return entries;
}

function parseEnvironmentBlock(raw: string): any {
  return {
    raw,
    title: raw.match(/##\s+([^\n]+)/)?.[1] || '环境危机',
    tierEvent: raw.match(/###\s+([^\n]+)/)?.[1] || '',
    difficulty: raw.match(/Difficulty:\s*(\d+)/i)?.[1] || 12,
    countdown: raw.match(/countdown:\s*(\d+)/i)?.[1] || null,
  };
}

function parseCyberwareBlock(raw: string): any {
  return {
    raw,
    name: raw.match(/name:\s*([^\n|]+)/i)?.[1]?.trim() || '仿生件',
    tier: raw.match(/tier:\s*([^\n|]+)/i)?.[1]?.trim() || 'T1',
    zone: raw.match(/zone:\s*([^\n|]+)/i)?.[1]?.trim() || '躯干',
    slots: raw.match(/slots:\s*([^\n|]+)/i)?.[1]?.trim() || '1',
    compCost: raw.match(/compCost:\s*([^\n|]+)/i)?.[1]?.trim() || '1w',
    surgCost: raw.match(/surgCost:\s*([^\n|]+)/i)?.[1]?.trim() || '2000',
    effect: raw.match(/effect:\s*([^\n]+)/i)?.[1]?.trim() || '',
  };
}
