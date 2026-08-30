import React, { useMemo } from 'react';
import './daggerheart-v3.css';
import { parseDocumentToPages, ParsedBlock, ParsedPage } from './v3Grammar';
import { Skull, ShieldAlert, Compass, Cpu, BookOpen, Quote, StickyNote, Sparkles, Flame, Zap, Heart, Shield } from 'lucide-react';
import { ProjectData } from '../types';
import { getLogoUrl } from '../dpcglHelper';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  theme?: string;
  isBookMode?: boolean; // If true, render as continuous A4 pages with double-columns
  projectData?: ProjectData;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  theme = 'default',
  isBookMode = false,
  projectData,
}) => {
  if (!content) return null;

  // Resolve image tags like [战役封面] or [插画:id] to real data URLs
  const resolveImageUrl = (rawSrc: string): string => {
    if (!rawSrc) return '';
    const trimmed = rawSrc.trim();

    if (trimmed === '[战役封面]' || trimmed === 'cover' || trimmed === '@cover') {
      return projectData?.coverPage?.coverImage || '';
    }

    if (trimmed.startsWith('[插画:') && trimmed.endsWith(']')) {
      const blockId = trimmed.slice(4, -1).trim();
      const foundBlock = projectData?.sections?.flatMap(s => s.blocks || []).find(b => b.id === blockId);
      return (foundBlock as any)?.url || '';
    }

    if (trimmed.startsWith('[头像:') && trimmed.endsWith(']')) {
      const blockId = trimmed.slice(4, -1).trim();
      const foundBlock = projectData?.sections?.flatMap(s => s.blocks || []).find(b => b.id === blockId);
      return (foundBlock as any)?.avatarUrl || '';
    }

    return trimmed;
  };

  // Helper to parse inline markdown (bold, italic, strikethrough, highlight ==...==, code, images, TRPG tokens)
  const parseInline = (text: string): React.ReactNode[] => {
    if (!text) return [];
    const regex = /(!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)|==.*?==|\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`|【[^】]+】)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Image: ![alt](url)
      if (part.startsWith('![') && part.includes('](')) {
        const match = part.match(/!\[(.*?)\]\((.*?)\)(?:\{(.*?)\})?/);
        if (match) {
          const alt = match[1];
          const rawUrl = match[2];
          const resolved = resolveImageUrl(rawUrl);
          if (!resolved) {
            return (
              <div key={index} className="my-2 p-3 bg-stone-100 dark:bg-stone-800 border border-dashed border-stone-300 dark:border-stone-700 rounded text-center text-xs text-stone-500">
                🖼️ [{alt || '插画'}]
              </div>
            );
          }
          return (
            <img
              key={index}
              src={resolved}
              alt={alt}
              className="max-w-full h-auto rounded my-2 shadow-xs object-cover"
            />
          );
        }
      }

      // Link: [text](url)
      if (part.startsWith('[') && part.includes('](')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a key={index} href={match[2]} className="text-inherit underline font-semibold hover:opacity-80">
              {match[1]}
            </a>
          );
        }
      }

      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={index} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return <em key={index} className="italic text-inherit">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
        return <del key={index} className="line-through opacity-70">{part.slice(2, -2)}</del>;
      }
      if (part.startsWith('==') && part.endsWith('==') && part.length >= 4) {
        return (
          <mark key={index} className="bg-amber-400/30 text-inherit font-semibold px-1 py-0.5 rounded mx-0.5">
            {part.slice(2, -2)}
          </mark>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return <code key={index} className="bg-current/10 font-mono text-xs px-1.5 py-0.5 rounded border border-current/20 text-inherit font-semibold">{part.slice(1, -1)}</code>;
      }

      // TRPG Tokens 【...】
      if (part.startsWith('【') && part.endsWith('】')) {
        if (part.includes('希望')) {
          return (
            <span key={index} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 text-[11px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 rounded shadow-2xs">
              <Sparkles size={11} className="inline" /> {part}
            </span>
          );
        }
        if (part.includes('恐惧')) {
          return (
            <span key={index} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 text-[11px] font-bold bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/40 rounded shadow-2xs">
              <Flame size={11} className="inline" /> {part}
            </span>
          );
        }
        if (part.includes('压力')) {
          return (
            <span key={index} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 text-[11px] font-bold bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/40 rounded shadow-2xs">
              <Zap size={11} className="inline" /> {part}
            </span>
          );
        }
        if (part.includes('生命')) {
          return (
            <span key={index} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 text-[11px] font-bold bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/40 rounded shadow-2xs">
              <Heart size={11} className="inline" /> {part}
            </span>
          );
        }
        if (part.includes('护甲')) {
          return (
            <span key={index} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 text-[11px] font-bold bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/40 rounded shadow-2xs">
              <Shield size={11} className="inline" /> {part}
            </span>
          );
        }

        return (
          <span key={index} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 text-[11px] font-bold bg-current/10 text-inherit border border-current/25 rounded shadow-2xs">
            {part}
          </span>
        );
      }

      return part;
    });
  };

  // Render a single block AST element
  const renderBlock = (block: ParsedBlock, bIdx: number): React.ReactNode => {
    switch (block.type) {
      case 'column_break':
        return <div key={`col-break-${bIdx}`} style={{ breakAfter: 'column', height: 0 }} />;

      case 'spacer':
        return <span key={`spacer-${bIdx}`} className={`dh-spacer dh-spacer-${block.level || 1}`} />;

      case 'heading': {
        const Comp = `h${block.level || 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        return (
          <Comp key={`h-${bIdx}`} className="text-inherit">
            {parseInline(block.content || '')}
          </Comp>
        );
      }

      case 'divider':
        return <hr key={`divider-${bIdx}`} className="my-4 border-t border-current/20 border-dashed" />;

      case 'list': {
        const { ordered, items } = block.data || { ordered: false, items: [] };
        if (ordered) {
          return (
            <ol key={`ol-${bIdx}`} className="list-decimal list-inside space-y-1 my-2 pl-2 text-inherit">
              {items.map((it: string, itIdx: number) => (
                <li key={itIdx} className="leading-relaxed">{parseInline(it)}</li>
              ))}
            </ol>
          );
        }
        return (
          <ul key={`ul-${bIdx}`} className="list-disc list-inside space-y-1 my-2 pl-2 text-inherit">
            {items.map((it: string, itIdx: number) => (
              <li key={itIdx} className="leading-relaxed">{parseInline(it)}</li>
            ))}
          </ul>
        );
      }

      case 'paragraph':
        return (
          <p key={`p-${bIdx}`} className="leading-relaxed mb-2 text-inherit">
            {parseInline(block.content || '')}
          </p>
        );

      case 'blockquote':
        return (
          <blockquote key={`quote-${bIdx}`} className="dh-flavor">
            {block.content?.split('\n').map((qLine, qIdx) => (
              <p key={qIdx} className="mb-1 last:mb-0">
                {parseInline(qLine)}
              </p>
            ))}
          </blockquote>
        );

      case 'note': {
        const variant = block.data?.variant || 'info';
        const noteStyles = 
          variant === 'warning' ? 'border-red-500/80 bg-red-950/20 text-inherit' :
          variant === 'tip' ? 'border-amber-500/80 bg-amber-950/20 text-inherit' :
          'border-current/30 bg-current/5 text-inherit';

        const IconComp = variant === 'warning' ? ShieldAlert : variant === 'tip' ? Sparkles : StickyNote;
        const defaultTitle = variant === 'warning' ? '重要警告与危险判定' : variant === 'tip' ? '规则提示与实操建议' : '游戏主持人备忘';

        return (
          <div key={`note-${bIdx}`} className={`dh-note p-3.5 my-3 rounded-lg border-2 border-dashed ${noteStyles}`}>
            <div className="dh-note-title font-bold text-xs flex items-center gap-1.5 mb-1.5 opacity-90">
              <IconComp size={14} className={variant === 'warning' ? 'text-red-400' : variant === 'tip' ? 'text-amber-400' : 'text-sky-400'} />
              {defaultTitle}
            </div>
            {block.content?.split('\n').map((nLine, nIdx) => {
              if (nLine.startsWith('#')) {
                const match = nLine.match(/^(#{1,6})\s+(.*)$/);
                if (match) {
                  const Comp = `h${match[1].length}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                  return <Comp key={nIdx} className="font-black text-sm my-1">{parseInline(match[2])}</Comp>;
                }
              }
              return (
                <p key={nIdx} className="text-xs mb-1 last:mb-0 leading-relaxed">
                  {parseInline(nLine)}
                </p>
              );
            })}
          </div>
        );
      }

      case 'wide':
        return (
          <div key={`wide-${bIdx}`} className="dh-wide">
            {block.content?.split('\n').map((wLine, wIdx) => {
              if (wLine.startsWith('#')) {
                const match = wLine.match(/^(#{1,6})\s+(.*)$/);
                if (match) {
                  const Comp = `h${match[1].length}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                  return <Comp key={wIdx}>{parseInline(match[2])}</Comp>;
                }
              }
              return <p key={wIdx}>{parseInline(wLine)}</p>;
            })}
          </div>
        );

      case 'toc':
        return (
          <div key={`toc-${bIdx}`} className="dh-toc dh-wide">
            <div className="dh-toc-title">
              <BookOpen size={18} className="inline mr-2" /> 战役目录 (Contents)
            </div>
            <div className="space-y-1">
              {block.content?.split('\n').map((tLine, tIdx) => {
                const match = tLine.match(/\[\{\{\s*(.*?)\s*\}\}\{\{\s*(\d+)\s*\}\}\]\((#.*?)\)/);
                if (match) {
                  return (
                    <div key={tIdx} className="dh-toc-item">
                      <a href={match[3]} className="font-semibold hover:underline">
                        {match[1]}
                      </a>
                      <div className="dh-toc-leader" />
                      <span className="dh-toc-page">{match[2]}</span>
                    </div>
                  );
                }
                if (tLine.trim()) {
                  return <div key={tIdx} className="text-xs font-bold text-inherit">{parseInline(tLine)}</div>;
                }
                return null;
              })}
            </div>
          </div>
        );

      case 'artist':
        return (
          <div key={`artist-${bIdx}`} className={`dh-artist ${block.data?.isLight ? 'dh-artist-light' : ''}`}>
            {parseInline(block.content || '')}
          </div>
        );

      case 'def_list':
        return (
          <div key={`def-${bIdx}`} className="dh-def-list">
            <span className="dh-def-term">{block.data?.term}</span> :: {parseInline(block.data?.definition || '')}
          </div>
        );

      case 'table': {
        const { headers, alignments, rows } = block.data || { headers: [], alignments: [], rows: [] };
        return (
          <div key={`table-${bIdx}`} className="dh-table-container">
            <table className="dh-table">
              <thead>
                <tr>
                  {headers.map((h: string, hIdx: number) => {
                    const align = alignments[hIdx] || 'left';
                    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                    return (
                      <th key={hIdx} className={alignClass}>
                        {parseInline(h)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: string[], rIdx: number) => (
                  <tr key={rIdx}>
                    {row.map((cell: string, cIdx: number) => {
                      const align = alignments[cIdx] || 'left';
                      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                      return (
                        <td key={cIdx} className={alignClass}>
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
      }

      case 'adversary': {
        const adv = block.data || {};
        const realAvatar = resolveImageUrl(adv.avatarUrl);

        return (
          <div key={`adv-${bIdx}`} className="dh-adversary">
            <div className="flex items-start justify-between gap-2 border-b border-current/20 pb-1 mb-1">
              <div>
                <h3 className="font-bold text-base m-0 text-inherit flex items-center gap-1.5">
                  <Skull size={15} className="text-red-500" />
                  {adv.name}
                </h3>
                {adv.tierRole && <div className="text-xs italic opacity-80">{adv.tierRole}</div>}
              </div>
              {realAvatar && (
                <img
                  src={realAvatar}
                  alt={adv.name}
                  className={`w-10 h-10 object-cover border-2 border-current shadow-xs ${
                    adv.avatarShape === 'square' ? 'rounded-md' : 'rounded-full'
                  }`}
                />
              )}
            </div>

            {adv.flavor && <div className="text-xs italic opacity-75 my-1">{parseInline(adv.flavor)}</div>}
            {adv.tactics && <div className="text-xs my-1"><strong className="text-inherit">动机与战术:</strong> {parseInline(adv.tactics)}</div>}

            <div className="dh-descriptive text-xs space-y-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 font-semibold">
                <div>难度 (DC): <span className="font-bold text-inherit">{adv.difficulty}</span></div>
                <div>护甲阈值: {adv.thresholdMinor}/{adv.thresholdMajor}</div>
                <div>生命值 (HP): <span className="text-red-500 font-bold">{adv.hp}</span></div>
                <div>压力 (Stress): <span className="text-amber-500 font-bold">{adv.stress}</span></div>
              </div>

              {/* Dots display mode */}
              {(adv.healthDisplay === 'dots' || adv.healthDisplay === 'both') && (
                <div className="pt-1 space-y-1 border-t border-current/10">
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="font-bold text-red-500">生命槽:</span>
                    <div className="dh-dots-container">
                      {Array.from({ length: Math.min(24, adv.hp || 5) }).map((_, dIdx) => (
                        <span key={`hp-${dIdx}`} className="dh-dot-hp" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="font-bold text-amber-500">压力槽:</span>
                    <div className="dh-dots-container">
                      {Array.from({ length: Math.min(18, adv.stress || 4) }).map((_, dIdx) => (
                        <span key={`str-${dIdx}`} className="dh-dot-stress" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {adv.attack && (
                <div className="text-xs pt-1 border-t border-current/10">
                  <strong className="text-red-500 dark:text-red-400">{parseInline(adv.attack)}</strong>
                </div>
              )}
            </div>

            {/* Traits */}
            {adv.traits && adv.traits.length > 0 && (
              <div className="space-y-1.5 mt-2 pt-1 border-t border-current/10">
                <div className="text-xs font-bold uppercase tracking-wider opacity-70">特性与动作:</div>
                {adv.traits.map((tr: any, tIdx: number) => (
                  <div key={tIdx} className="text-xs leading-relaxed">
                    <span className="font-bold text-inherit">
                      {tr.name} {tr.type ? `[${tr.type.toUpperCase()}]` : ''}:
                    </span>{' '}
                    <span>{parseInline(tr.desc)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'outcome': {
        const entries = block.data || [];
        return (
          <div key={`out-${bIdx}`} className="dh-outcome-card">
            <div className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 text-inherit">
              <Compass size={14} className="text-amber-500" />
              检定判定分歧结算矩阵:
            </div>
            <div className="space-y-1">
              {entries.map((entry: any, eIdx: number) => (
                <div key={eIdx} className="dh-outcome-entry text-xs">
                  <div className="flex gap-1 shrink-0">
                    {entry.tags?.map((tag: string, tagIdx: number) => {
                      const tagColor = 
                        tag === 'hope' ? 'bg-amber-500/20 text-amber-600 border-amber-400' :
                        tag === 'fear' ? 'bg-purple-500/20 text-purple-600 border-purple-400' :
                        tag === 'success' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-400' :
                        tag === 'failure' ? 'bg-red-500/20 text-red-600 border-red-400' :
                        'bg-yellow-500/30 text-yellow-700 border-yellow-500';
                      return (
                        <span key={tagIdx} className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${tagColor}`}>
                          {tag.toUpperCase()}
                        </span>
                      );
                    })}
                  </div>
                  <div className="leading-relaxed">{parseInline(entry.content)}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'environment': {
        const env = block.data || {};
        return (
          <div key={`env-${bIdx}`} className="dh-environment">
            <h3 className="font-bold text-base text-inherit flex items-center gap-1.5 mb-1">
              <ShieldAlert size={15} className="text-sky-500" />
              {env.title}
            </h3>
            {env.tierEvent && <div className="text-xs italic opacity-80 mb-1">{env.tierEvent}</div>}
            <div className="dh-descriptive text-xs space-y-1">
              <div>难度 (DC): <span className="font-bold text-sky-500">{env.difficulty}</span></div>
              {env.countdown && <div>危机倒计时: <span className="font-bold text-amber-500">{env.countdown} 格</span></div>}
            </div>
            <div className="text-xs mt-1 leading-relaxed">{parseInline(block.content || '')}</div>
          </div>
        );
      }

      case 'cyberware': {
        const cyb = block.data || {};
        return (
          <div key={`cyb-${bIdx}`} className="dh-cyberware">
            <h3 className="font-bold text-base text-inherit flex items-center gap-1.5 mb-1">
              <Cpu size={15} className="text-pink-500" />
              {cyb.name} <span className="text-xs opacity-70 font-normal">({cyb.tier} · {cyb.zone})</span>
            </h3>
            <div className="dh-descriptive text-xs space-y-0.5">
              <div>槽位: {cyb.slots} | 元件费用: {cyb.compCost} | 手术费用: {cyb.surgCost}</div>
              {cyb.effect && <div className="pt-1 font-semibold text-inherit">{parseInline(cyb.effect)}</div>}
            </div>
          </div>
        );
      }

      default:
        return (
          <div key={`unk-${bIdx}`} className={block.className || ''}>
            {parseInline(block.content || '')}
          </div>
        );
    }
  };

  // Parse document into pages
  const parsedPages: ParsedPage[] = useMemo(() => {
    return parseDocumentToPages(content);
  }, [content]);

  // If Book Mode: Render continuous A4 Pages with double columns
  if (isBookMode) {
    return (
      <div className={`dh-book-viewport ${className}`} data-theme={theme}>
        {parsedPages.map((page) => {
          if (page.isFrontCover) {
            const rawCover = page.coverData?.coverImage || projectData?.coverPage?.coverImage;
            const coverImage = resolveImageUrl(rawCover || '');
            const logoUrl = getLogoUrl(
              projectData?.coverPage?.dpcglLogo || 'dh_bottle_white_color',
              projectData?.coverPage?.customLogoUrl
            );
            const title = page.coverData?.title || projectData?.coverPage?.title || projectData?.title || '战役名称';
            const subtitle = page.coverData?.subtitle || projectData?.coverPage?.subtitle;
            const author = page.coverData?.author || projectData?.coverPage?.authorLine || projectData?.author || '匿名';
            const footerText = page.coverData?.footerText || projectData?.coverPage?.footerText;

            return (
              <div
                key={page.pageIndex}
                className="relative w-full min-h-[297mm] mx-auto max-w-[210mm] shadow-2xl rounded-2xl overflow-hidden flex flex-col mb-6 print:break-after-page print:rounded-none print:shadow-none"
                style={
                  coverImage
                    ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: 'linear-gradient(160deg, #1c1917 0%, #292524 60%, #44403c 100%)' }
                }
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/75" />

                {/* DPCGL Official Compliance Logo */}
                {logoUrl && (
                  <div className="absolute z-20 top-6 right-6">
                    <img
                      src={logoUrl}
                      alt="DPCGL Compliance Logo"
                      className="w-20 sm:w-24 object-contain drop-shadow-md"
                    />
                  </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom text */}
                <div className="relative z-10 text-white text-center px-12 pb-20 space-y-3">
                  {subtitle && (
                    <p className="text-sm font-medium text-white/60 uppercase tracking-[0.3em]">{subtitle}</p>
                  )}
                  <h1 className="text-5xl font-black tracking-tight leading-tight drop-shadow-2xl font-serif">
                    {title}
                  </h1>
                  <p className="text-base text-white/75 font-medium tracking-wide">
                    By {author}
                  </p>
                </div>

                {/* Footer bar */}
                {footerText && (
                  <div className="relative z-10 text-center text-[11px] text-white/50 border-t border-white/15 py-4 px-8">
                    {footerText}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={page.pageIndex} className="dh-page" id={`p${page.pageIndex}`}>
              {/* Side tab for chapter indicator */}
              {page.chapterTab && <div className="dh-side-tab" title={`Chapter ${page.chapterTab}`} />}

              {/* A4 Double Column Content Flow */}
              <div className="dh-page-content">
                {page.blocks.map((block, bIdx) => renderBlock(block, bIdx))}
              </div>

              {/* Footer with Footnote and Page Number */}
              <div className="dh-page-footer">
                <span>{page.footnote || 'Daggerheart Campaign Book'}</span>
                <span>第 {page.pageIndex} 页</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Standard inline rendering (for within small cards/block view)
  return (
    <div className={`max-w-none text-left leading-relaxed text-inherit ${className}`}>
      {parsedPages.flatMap((p) => p.blocks).map((block, bIdx) => renderBlock(block, bIdx))}
    </div>
  );
};
