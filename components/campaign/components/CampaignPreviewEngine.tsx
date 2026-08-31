import React, { useEffect } from 'react';
import { 
  ProjectData, DynamicSection, ContentBlock, 
  EnemyBlock, EnvironmentBlock, CyberwareBlock, 
  OutcomeBlock, Trait 
} from '../types';
import { THEMES } from '../campaign-editor-app';
import { 
  getLogoUrl, getPositionClass, getSizeClass, 
  DPCGL_TEMPLATES 
} from '../dpcglHelper';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Star, ShieldCheck, Swords, Mountain, Cpu, ListChecks } from 'lucide-react';

export interface CampaignPreviewEngineProps {
  data: ProjectData;
  activeSectionId?: string | null;
  mode?: 'full' | 'single';
  viewStyle?: 'long' | 'a4';
  onToggleMode?: () => void;
  hideTopBar?: boolean;
  className?: string;
}

export const CampaignPreviewEngine: React.FC<CampaignPreviewEngineProps> = ({ 
  data, 
  activeSectionId, 
  mode = 'full', 
  viewStyle = 'long',
  onToggleMode, 
  hideTopBar = true,
  className = ''
}) => {
  const theme = THEMES[data.theme || 'default'] || THEMES.default;
  const bgStyle = data.backgroundImage ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {};

  // If in 'single' section mode
  if (mode === 'single' && activeSectionId) {
    const section = data.sections?.find(s => s.id === activeSectionId);
    if (section) {
      const isCols = (section.columnMode === 'cols') || (section.level === 5 && section.columnMode !== 'full');

      return (
        <div className={`space-y-4 w-full flex flex-col items-center ${className}`}>
          {/* Section Publication Card */}
          <div 
            id="preview-content" 
            style={bgStyle} 
            className={`${theme.bg} ${theme.text} ${theme.fontBody} ${viewStyle === 'a4' ? 'max-w-[210mm] min-h-[297mm] rounded-none' : 'max-w-4xl rounded-2xl'} shadow-2xl p-[8mm] sm:p-[12mm] w-full print:shadow-none print:w-full print:max-w-none leading-relaxed transition-colors duration-300 border border-current/10`}
          >
            <div className={`mb-6 ${section.level === 1 ? `border-b-2 ${theme.border} pb-4` : ''}`}>
              <h2 className={`${theme.fontHead} ${
                section.level === 1 ? `text-4xl font-black ${theme.accent} tracking-tight` : 
                section.level === 2 ? `text-2xl font-bold ${theme.accent} border-l-4 ${theme.border} pl-3` : 
                section.level === 3 ? `text-xl font-bold ${theme.accent} border-b ${theme.border} border-opacity-30 pb-0.5 pr-4` : 
                section.level === 4 ? `text-lg font-bold text-stone-800 dark:text-stone-100` :
                `text-base font-bold italic opacity-75`
              } mb-2`}>
                {section.title || "未命名章节"}
              </h2>
              {section.italicNote && <p className="italic text-sm mb-3 opacity-60 font-serif">{section.italicNote}</p>}
            </div>

            <div className={isCols ? 'columns-1 md:columns-2 gap-8 space-y-6' : 'space-y-6 text-justify'}>
              {section.blocks?.map(block => (
                <BlockRenderer key={block.id} block={block} theme={theme} />
              ))}
              {(!section.blocks || section.blocks.length === 0) && (
                <div className="text-center py-12 opacity-40 italic text-sm border-2 border-dashed border-current rounded-xl">
                  (在左侧添加正文、敌人卡或规则提示后，此处将实时展示最终出书排版)
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // Full campaign book rendering mode
  const layoutGroups: { type: 'full' | 'cols', items: DynamicSection[] }[] = [];
  let currentCols: DynamicSection[] = [];

  (data.sections || []).forEach(section => {
    const effectiveMode = section.columnMode || (section.level === 5 ? 'cols' : 'full');
    if (effectiveMode === 'full') {
      if (currentCols.length > 0) {
        layoutGroups.push({ type: 'cols', items: [...currentCols] });
        currentCols = [];
      }
      layoutGroups.push({ type: 'full', items: [section] });
    } else {
      currentCols.push(section);
    }
  });
  if (currentCols.length > 0) layoutGroups.push({ type: 'cols', items: currentCols });

  useEffect(() => {
    if (activeSectionId) {
      const timer = setTimeout(() => {
        const target = document.getElementById(`preview-section-${activeSectionId}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2');
          setTimeout(() => {
            target.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2');
          }, 2000);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeSectionId, mode]);

  const containerClasses = viewStyle === 'a4' 
    ? 'w-full max-w-[210mm] min-h-[297mm] shadow-2xl rounded-none mx-auto' 
    : 'w-full max-w-4xl shadow-2xl rounded-2xl mx-auto';

  return (
    <div className={`space-y-6 w-full flex flex-col items-center select-text ${className}`}>
      
      {/* Cover Page */}
      {data.coverPage?.enabled && (
        <div
          id="preview-cover-page"
          className="relative w-full min-h-[297mm] mx-auto max-w-[210mm] shadow-2xl rounded-2xl overflow-hidden flex flex-col print:break-after-page print:rounded-none print:shadow-none"
          style={data.coverPage.coverImage
            ? { backgroundImage: `url(${data.coverPage.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(160deg, #1c1917 0%, #292524 60%, #44403c 100%)' }
          }
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/75" />

          {/* DPCGL Official Compliance Logo */}
          {getLogoUrl(data.coverPage.dpcglLogo || 'dh_bottle_white_color', data.coverPage.customLogoUrl) && (
            <div className={`absolute z-20 ${getPositionClass(data.coverPage.dpcglLogoPosition || 'top-right')}`}>
              <img
                src={getLogoUrl(data.coverPage.dpcglLogo || 'dh_bottle_white_color', data.coverPage.customLogoUrl)}
                alt="DPCGL Compliance Logo"
                className={`${getSizeClass(data.coverPage.dpcglLogoSize || 'md').width} object-contain drop-shadow-md`}
              />
            </div>
          )}

          {/* Icon */}
          {data.coverPage.iconImage && (
            <div className="relative z-10 pt-16 flex justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-white/30 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                <img src={data.coverPage.iconImage} alt="icon" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom text */}
          <div className="relative z-10 text-white text-center px-12 pb-20 space-y-3">
            {data.coverPage.subtitle && (
              <p className="text-sm font-medium text-white/60 uppercase tracking-[0.3em]">{data.coverPage.subtitle}</p>
            )}
            <h1 className={`text-5xl font-black tracking-tight leading-tight drop-shadow-2xl ${theme.fontHead}`}>
              {data.coverPage.title || data.title || '战役标题'}
            </h1>
            <p className="text-base text-white/75 font-medium tracking-wide">
              By {data.coverPage.authorLine || data.author}
            </p>
          </div>

          {/* Footer bar */}
          {data.coverPage.footerText && (
            <div className="relative z-10 text-center text-[11px] text-white/50 border-t border-white/15 py-4 px-8">
              {data.coverPage.footerText}
            </div>
          )}
        </div>
      )}

      {/* Main Publication Content */}
      <div 
        id="preview-content" 
        style={bgStyle} 
        className={`${theme.bg} ${theme.text} ${theme.fontBody} ${containerClasses} p-[10mm] sm:p-[15mm] print:shadow-none print:w-full print:max-w-none leading-relaxed transition-colors duration-300 border border-current/10`}
      >
        <header className="mb-8 break-inside-avoid">
          <h1 className={`text-5xl sm:text-6xl font-black ${theme.accent} ${theme.fontHead} mb-6 tracking-tight uppercase leading-none`}>
            {data.title || "未命名"}
          </h1>
          
          {data.settings?.showConcept && data.concept && (
            <p className="font-serif italic text-xl mb-6 text-current opacity-80 leading-relaxed">
              {data.concept}
            </p>
          )}

          <div className="flex justify-between items-end font-bold text-sm tracking-wide opacity-80 flex-wrap gap-2">
            <p>由 {data.author} 设计</p>
            <div className="flex items-center gap-4">
               {data.settings?.showComplexity && (
                  <div className="flex items-center gap-2">
                     <span>复杂度：</span>
                     <div className="flex">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-4 h-4 ${(data.complexity || 0) >= n ? 'fill-current text-amber-500' : 'opacity-20'}`} />
                        ))}
                     </div>
                  </div>
               )}
               {data.settings?.showLevelRange && (
                  <div className="flex items-center gap-2">
                     <span>适用等级：</span>
                     <span>{data.levelRange}</span>
                  </div>
               )}
            </div>
          </div>
        </header>

        {/* Narrative Blocks */}
        <div className="mb-10 w-full space-y-4">
           {/* Summary */}
           {data.settings?.showSummary && data.summary && (
              <div className={`mb-6 font-serif text-lg italic leading-relaxed opacity-90 border-l-4 pl-4 py-1 ${theme.accent.replace('text','border')}`}>
                 <MarkdownRenderer content={data.summary} />
              </div>
           )}

           {/* Prologue */}
           {data.settings?.showPrologue && data.prologue && (
              <div className="mb-6">
                 <h3 className={`${theme.accent} font-bold uppercase tracking-widest text-sm mb-2 border-b ${theme.border} border-opacity-20 pb-1`}>序言</h3>
                 <MarkdownRenderer content={data.prologue} />
              </div>
           )}

           {/* Introduction */}
           {data.settings?.showIntroduction && data.introduction && (
              <div className="mb-6">
                 <h3 className={`${theme.accent} font-bold uppercase tracking-widest text-sm mb-2 border-b ${theme.border} border-opacity-20 pb-1`}>简介</h3>
                 <MarkdownRenderer content={data.introduction} />
              </div>
           )}
        </div>

        {/* Tone, Themes, Inspiration */}
        {data.settings?.showToneThemes && (data.tone || data.themes || data.inspiration) && (
          <section className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 ${theme.metaBg} p-6 rounded-lg text-sm border ${theme.border} border-opacity-10 break-inside-avoid shadow-sm`}>
             <div>
               {data.tone && <><h4 className={`${theme.accent} font-bold uppercase text-xs mb-1`}>基调</h4><p>{data.tone}</p></>}
             </div>
             <div>
               {data.themes && <><h4 className={`${theme.accent} font-bold uppercase text-xs mb-1`}>主题</h4><p>{data.themes}</p></>}
             </div>
             <div>
               {data.inspiration && <><h4 className={`${theme.accent} font-bold uppercase text-xs mb-1`}>灵感</h4><p className="italic">{data.inspiration}</p></>}
             </div>
          </section>
        )}

        {/* Sections Stream */}
        <div className="space-y-8">
          {layoutGroups.map((group, gIdx) => (
            <div key={gIdx} className={group.type === 'cols' ? 'columns-1 md:columns-2 gap-8 space-y-8' : 'w-full mb-8'}>
              {group.items.map(section => (
                <div key={section.id} id={`preview-section-${section.id}`} className="break-inside-avoid mb-8">
                  <div className={`mb-4 ${section.level === 1 ? `border-b-2 ${theme.border}` : ''}`}>
                     <h2 className={`${theme.fontHead} ${
                       section.level === 1 ? `text-4xl font-black ${theme.accent} tracking-tight` : 
                       section.level === 2 ? `text-2xl font-bold ${theme.accent} border-l-4 ${theme.border} pl-3` : 
                       section.level === 3 ? `text-xl font-bold ${theme.accent} border-b ${theme.border} border-opacity-30 pb-0.5 pr-4` : 
                       section.level === 4 ? `text-lg font-bold text-stone-800 dark:text-stone-100` :
                       `text-base font-bold italic opacity-75`
                     } mb-2`}>
                       {section.title}
                     </h2>
                     {section.italicNote && <p className="italic text-sm mb-3 opacity-60 font-serif">{section.italicNote}</p>}
                  </div>
                  <div className="space-y-4 text-justify">
                     {section.blocks?.map(block => <BlockRenderer key={block.id} block={block} theme={theme} />)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Credits Page */}
      {data.creditsPage?.enabled && (
        <div
          id="preview-credits-page"
          className="relative w-full min-h-[297mm] mx-auto max-w-[210mm] shadow-2xl rounded-2xl overflow-hidden flex flex-col print:break-before-page print:rounded-none print:shadow-none"
          style={data.creditsPage.backgroundImage
            ? { backgroundImage: `url(${data.creditsPage.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)' }
          }
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 to-black/85" />

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-16 px-10 sm:px-14 pb-12 text-white space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🙏</div>
              <h2 className={`text-2xl font-black uppercase tracking-[0.25em] text-white/90 ${theme.fontHead}`}>鸣谢</h2>
            </div>

            {data.creditsPage.creditsText && (
              <div className="w-full max-w-xl text-sm text-white/85 leading-relaxed space-y-3 text-center">
                <MarkdownRenderer content={data.creditsPage.creditsText} />
              </div>
            )}

            {/* DPCGL Copyright & Attribution Box */}
            {data.creditsPage.copyright?.enabled !== false && (
              <div className="w-full max-w-2xl mt-auto bg-black/40 border border-white/15 rounded-2xl p-5 text-left text-xs text-white/85 space-y-3 backdrop-blur-md shadow-xl">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                  <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> DPCGL 版权与许可声明
                  </span>
                  {data.creditsPage.copyright?.showDPCGLLogo !== false && getLogoUrl(data.creditsPage.copyright?.dpcglLogo || 'dh_bottle_white_color') && (
                    <img
                      src={getLogoUrl(data.creditsPage.copyright?.dpcglLogo || 'dh_bottle_white_color')}
                      alt="DPCGL Logo"
                      className="h-6 object-contain"
                    />
                  )}
                </div>
                <div className="leading-relaxed opacity-95 text-stone-200 text-[11px]">
                  <MarkdownRenderer content={
                    data.creditsPage.copyright?.rawDeclarationText || 
                    DPCGL_TEMPLATES[0].generateText({
                      workTitle: data.title,
                      authorName: data.author,
                      year: '2026',
                      hasMod: false,
                    })
                  } />
                </div>
              </div>
            )}
          </div>

          {/* Footer bar */}
          {data.creditsPage.footerText && (
            <div className="relative z-10 text-center text-[11px] text-white/40 border-t border-white/15 py-4 px-8">
              {data.creditsPage.footerText}
            </div>
          )}
        </div>
      )}

      {/* Standalone DPCGL Copyright Page */}
      {!data.creditsPage?.enabled && (data.settings?.showCopyright ?? true) && (data.copyrightPage?.enabled !== false) && (
        <div
          id="preview-copyright-page"
          className="relative w-full min-h-[297mm] mx-auto max-w-[210mm] shadow-2xl rounded-2xl overflow-hidden flex flex-col justify-between print:break-before-page print:rounded-none print:shadow-none bg-gradient-to-b from-[#181614] via-[#151413] to-[#100f0e] text-stone-200 p-10 sm:p-14 border border-stone-800"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className={`text-lg font-black uppercase tracking-wider text-white ${theme.fontHead}`}>
                  DPCGL 版权与出版许可声明
                </h2>
                <p className="text-xs text-stone-400 font-sans">
                  Darrington Press Community Gaming License Compliance
                </p>
              </div>
            </div>

            {data.copyrightPage?.showDPCGLLogo !== false && getLogoUrl(data.copyrightPage?.dpcglLogo || 'dh_bottle_white_color') && (
              <div className="flex items-center gap-2 bg-black/40 border border-stone-800 rounded-xl px-3 py-1.5 shadow-sm">
                <img
                  src={getLogoUrl(data.copyrightPage?.dpcglLogo || 'dh_bottle_white_color')}
                  alt="DPCGL Logo"
                  className="h-9 object-contain"
                />
              </div>
            )}
          </div>

          {/* Main Notice Body */}
          <div className="my-auto py-8 text-xs sm:text-sm text-stone-300 leading-relaxed space-y-4 font-sans bg-black/40 border border-stone-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xs shadow-inner">
            <MarkdownRenderer content={
              data.copyrightPage?.rawDeclarationText || 
              DPCGL_TEMPLATES[0].generateText({
                workTitle: data.copyrightPage?.workTitle || data.title,
                authorName: data.copyrightPage?.authorName || data.author,
                year: data.copyrightPage?.year || '2026',
                hasMod: !!data.copyrightPage?.hasModifications,
                modNote: data.copyrightPage?.modificationsNote,
                customNotice: data.copyrightPage?.customNotice
              })
            } />
          </div>

          {/* Footer Bar */}
          <div className="border-t border-stone-800 pt-5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-500 font-mono gap-2">
            <span>{data.copyrightPage?.workTitle || data.title} · 版权所有 © {data.copyrightPage?.year || '2026'} {data.copyrightPage?.authorName || data.author}</span>
            <span>DPCGL 2.0 / DRP Compliance Document</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const PreviewView = CampaignPreviewEngine;

export const BlockRenderer: React.FC<{ block: ContentBlock; theme: any }> = React.memo(({ block, theme }) => {
  const isDark = theme?.card?.isDark;
  switch (block.type) {
    case 'text': 
      return <div className="max-w-none mb-4"><MarkdownRenderer content={block.content} /></div>;
    case 'subsection':
      return <h4 className={`font-bold text-lg mt-6 mb-2 border-b ${theme.border} border-opacity-20 pb-1 break-after-avoid`}>{block.title}</h4>;
    case 'divider':
      return <hr className={`${theme.border} opacity-20 my-4 border-dashed`} />;
    case 'image':
      return (
        <figure className="my-4 break-inside-avoid">
          <img src={block.url} alt="content" className={`w-full rounded shadow-sm border ${theme.border} border-opacity-10`} />
          {block.caption && <figcaption className="text-center text-xs opacity-60 mt-1 italic">{block.caption}</figcaption>}
        </figure>
      );
    case 'table':
      return (
        <div className={`my-4 overflow-hidden border ${theme.border} border-opacity-20 rounded-lg text-sm font-sans break-inside-avoid shadow-xs`}>
          <table className="w-full border-collapse">
            <thead className={`${theme.metaBg} font-bold`}>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className={`p-2.5 text-left border-b ${theme.border} border-opacity-20 font-bold`}>
                    <MarkdownRenderer content={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className={`border-b ${theme.border} border-opacity-10 last:border-0 ${i % 2 === 1 ? 'bg-black/[0.02] dark:bg-white/[0.03]' : ''}`}>
                  {row.map((c, j) => (
                    <td key={j} className="p-2.5 align-top">
                      <MarkdownRenderer content={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'read_aloud':
      return (
        <div className={`my-6 p-5 rounded-r-lg border-l-4 break-inside-avoid italic font-serif relative ${theme.metaBg} ${theme.border.replace('border','border-l')} ${theme.text}`}>
           <div className={`not-italic text-[10px] font-bold uppercase mb-2 tracking-widest absolute -top-3 left-2 px-1.5 py-0.5 rounded ${theme.card.bg} ${theme.accent} shadow-sm border ${theme.border} border-opacity-30`}>向玩家朗读</div>
           <MarkdownRenderer content={block.content} />
        </div>
      );
    case 'callout': {
      const calloutClass = block.variant === 'warning'
        ? (isDark ? 'border-red-500 bg-red-950/40 text-red-100' : 'border-red-800 bg-red-50 text-stone-900')
        : block.variant === 'tip'
        ? (isDark ? 'border-amber-400 bg-amber-950/40 text-amber-100' : 'border-amber-600 bg-amber-50 text-stone-900')
        : `${theme.border} ${theme.metaBg} ${theme.text}`;
      return (
        <div className={`my-6 p-4 border-2 break-inside-avoid shadow-sm rounded-lg ${calloutClass}`}>
           <h4 className="font-black uppercase mb-1 text-sm tracking-wide">{block.title}</h4>
           <MarkdownRenderer content={block.content} />
        </div>
      );
    }
    case 'outcome':
      if (block.entries && block.entries.length > 0) {
        return (
          <div className={`my-6 space-y-3 text-sm break-inside-avoid font-sans border-l-2 ${theme.border} pl-4 border-opacity-40`}>
             <div className="font-bold border-b border-opacity-20 pb-1 mb-2 text-xs uppercase tracking-wide opacity-60">检定结果</div>
             {block.entries.map((entry) => (
                <div key={entry.id} className="flex gap-2 items-baseline leading-relaxed">
                   <div className="flex gap-1 items-center flex-shrink-0">
                      {entry.tags.includes('critical') && <span className={`font-bold whitespace-nowrap uppercase text-xs ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>[关键成功]</span>}
                      {entry.tags.includes('success') && <span className={`font-bold whitespace-nowrap uppercase text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>[成功]</span>}
                      {entry.tags.includes('failure') && <span className={`font-bold whitespace-nowrap uppercase text-xs ${isDark ? 'text-red-400' : 'text-red-700'}`}>[失败]</span>}
                      {entry.tags.includes('hope') && <span className={`font-bold whitespace-nowrap uppercase text-xs ${isDark ? 'text-sky-300' : 'text-sky-600'}`}>[希望]</span>}
                      {entry.tags.includes('fear') && <span className={`font-bold whitespace-nowrap uppercase text-xs ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>[恐惧]</span>}
                   </div>
                   <MarkdownRenderer content={entry.content} className="flex-1" />
                </div>
             ))}
          </div>
        );
      }
      return null;
    case 'enemy': return <EnemyCard block={block} theme={theme} />;
    case 'environment': return <EnvironmentCard block={block} theme={theme} />;
    case 'cyberware': return <CyberwareCard block={block} theme={theme} />;
    default: return null;
  }
});

export const CyberwareCard: React.FC<{ block: CyberwareBlock; theme?: any }> = React.memo(({ block }) => {
  const tierVal = (block.tier || '').trim();
  const zoneVal = (block.zone || '').trim();
  const slotsVal = (block.slots || '').trim();
  const restrictionVal = (block.restriction || '').trim();
  const tagVal = (block.tag || '').trim();

  return (
    <div className="break-inside-avoid my-6 font-sans flex justify-center">
      <div
        className="w-full max-w-[360px] min-h-[440px] bg-[#0D0D0D] text-white border-2 border-[#1F2229] flex flex-col justify-between overflow-hidden shadow-2xl transition-colors duration-300 text-left rounded-sm"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif'
        }}
      >
        {/* Header */}
        <div className="bg-[#FCEE0A] text-[#0D0D0D] p-3 px-4 relative shrink-0">
          {tierVal ? (
            <div className="absolute top-0 right-6 bg-[#0D0D0D] text-[#FCEE0A] text-[11px] font-black px-2 py-0.5 tracking-wider">
              {tierVal}
            </div>
          ) : null}
          <div className={`text-[18px] font-black leading-tight tracking-wide text-[#0D0D0D] break-words ${tierVal ? 'pr-14' : 'pr-2'}`}>
            {block.name || '微型皮下线圈'}
          </div>
          {block.cyberType && (
            <div className="text-[11px] font-bold text-[#4A4600] uppercase tracking-wider mt-0.5">
              {block.cyberType}
            </div>
          )}
        </div>

        {/* Meta Bar */}
        {(zoneVal || slotsVal) ? (
          <div className="bg-[#15181E] border-t border-b border-[#2B313D] px-4 py-2 flex justify-between items-center shrink-0">
            <div className="text-[11px] font-bold text-[#00F0FF] flex items-center gap-1">
              {zoneVal ? (
                <>部位: <span className="text-white font-normal">{zoneVal}</span></>
              ) : null}
            </div>
            {slotsVal ? (
              <div className="bg-[#FF003C] text-white text-[10px] font-black px-1.5 py-0.5 tracking-wide">
                {slotsVal.includes('槽') ? slotsVal : `占用 ${slotsVal} 槽`}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 flex-1 bg-[#0D0D0D]">
          {restrictionVal && (
            <div className="text-[11px] text-[#8F98A3] border-l-2 border-[#00F0FF] pl-2 leading-tight">
              {restrictionVal.startsWith('限制') ? restrictionVal : `限制: ${restrictionVal}`}
            </div>
          )}

          {block.effect && (
            <div className="text-[13px] leading-relaxed text-[#E1E4EA]">
              <MarkdownRenderer content={block.effect} />
            </div>
          )}

          {block.description && (
            <div className="text-[12px] italic text-[#8F98A3] pt-1 border-t border-[#1F2229]">
              <MarkdownRenderer content={block.description} />
            </div>
          )}

          {tagVal && (
            <div className="bg-[rgba(255,0,60,0.15)] border border-[#FF003C] text-[#FF003C] text-[11px] font-bold p-1.5 px-2 tracking-wide mt-auto">
              {tagVal.startsWith('//') ? tagVal : `// 警告: ${tagVal}`}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#08090C] border-t border-[#1F2229] p-3 px-4 flex justify-between text-[11px] shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[#8F98A3] text-[9px] uppercase tracking-wider">元件基础价</span>
            <span className="font-extrabold text-[#FCEE0A]">{block.compCost || '未设定'}</span>
          </div>
          <div className="flex flex-col gap-0.5 text-right">
            <span className="text-[#8F98A3] text-[9px] uppercase tracking-wider">安装手术费</span>
            <span className="font-extrabold text-[#FCEE0A]">{block.surgCost || '未设定'}</span>
          </div>
        </div>

        {/* Sub-footer for Creator and Owner */}
        <div className="bg-[#050608] border-t border-[#15181E] px-4 py-1.5 flex justify-between items-center text-[10px] text-[#8F98A3] uppercase tracking-wider shrink-0">
          <span className="truncate max-w-[48%]">创作者: <span className="text-[#00F0FF] font-semibold">{block.creator || '未知'}</span></span>
          <span className="truncate max-w-[48%] text-right">所属: <span className="text-[#FCEE0A] font-semibold">{block.owner || '未指定'}</span></span>
        </div>
      </div>
    </div>
  );
});

export const EnemyCard: React.FC<{ block: EnemyBlock, theme: any }> = React.memo(({ block, theme }) => {
  const s = theme.card;
  const normalTraits = (block.traits || []).filter(t => !t.isSpecial);
  const specialTraits = (block.traits || []).filter(t => t.isSpecial);

  const hpCount = Math.max(1, Math.min(block.stats?.hp || 1, 30));
  const stressCount = Math.max(0, Math.min(block.stats?.stress || 0, 20));
  const showDots = block.healthDisplay === 'dots' || block.healthDisplay === 'both';
  const showNumber = block.healthDisplay === 'number' || block.healthDisplay === 'both' || !block.healthDisplay;

  return (
    <div className="break-inside-avoid my-6 font-sans relative">
       <div className={`${s.bg} ${s.border} border-2 rounded-2xl p-5 pl-7 md:p-6 md:pl-8 shadow-md ${s.text} transition-colors duration-300 relative overflow-hidden`}>
          {/* Left Accent Bar */}
          <div className={`absolute top-0 bottom-0 left-0 w-2.5 md:w-3 ${s.enemyBar} rounded-l-2xl z-10`} />

          {/* Header area with Optional Avatar & Badges */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 pb-3 border-b border-current border-opacity-15">
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                   <h3 className={`text-2xl sm:text-3xl font-black uppercase leading-tight tracking-tight ${s.nameText} ${theme.fontHead}`}>
                      {block.name || '未命名敌人'}
                   </h3>
                   {block.isNpcMode && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.badgeNpc}`}>
                         NPC
                      </span>
                   )}
                </div>

                {block.englishName && (
                   <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${s.nameEnText}`}>
                      {block.englishName}
                   </div>
                )}

                <div className="flex items-center gap-2 text-xs font-bold mb-2 flex-wrap">
                   <span className={`px-2 py-0.5 rounded ${s.badgeTier}`}>
                      位阶 {block.tier || 1}
                   </span>
                   <span className={`px-2 py-0.5 rounded ${s.badgeTypeEnemy}`}>
                      {block.enemyType || '标准'}
                   </span>
                   {block.isNpcMode && (
                      <span className={`px-2 py-0.5 rounded ${s.badgeNpc}`}>
                         难度 {block.stats?.difficulty || 12}
                      </span>
                   )}
                </div>

                {block.flavor && (
                   <div className={`italic text-xs sm:text-sm leading-relaxed mb-2 ${s.textMuted}`}>
                      <MarkdownRenderer content={block.flavor} />
                   </div>
                )}
             </div>

             {/* Avatar Box */}
             {block.avatarUrl && (
                <div className="shrink-0 self-center sm:self-start">
                   <div className={`w-20 h-20 sm:w-24 sm:h-24 ${s.statBox} overflow-hidden shadow-sm ${
                      block.avatarShape === 'square' 
                         ? `rounded-xl border-2 ${s.avatarBorder}` 
                         : block.avatarShape === 'none' 
                         ? 'rounded-none' 
                         : `rounded-full border-2 ${s.avatarBorder}`
                   }`}>
                      <img src={block.avatarUrl} alt={block.name} className="w-full h-full object-cover" />
                   </div>
                </div>
             )}
          </div>

          {/* Meta Row: Tactics & Experiences */}
          {(block.tactics || block.experiences) && (
             <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4 p-3 rounded-lg ${s.metaBox}`}>
                {block.tactics && (
                   <div>
                      <span className={`font-bold uppercase tracking-wide mr-1.5 ${s.metaLabelEnemy}`}>动机与战术:</span>
                      <span className={`${s.metaText} inline`}><MarkdownRenderer content={block.tactics} className="inline" /></span>
                   </div>
                )}
                {block.experiences && (
                   <div className={block.tactics ? "sm:border-l sm:border-current sm:border-opacity-20 sm:pl-3" : ""}>
                      <span className={`font-bold uppercase tracking-wide mr-1.5 ${s.metaLabelEnemy}`}>经历与加成:</span>
                      <span className={`${s.metaText} inline`}><MarkdownRenderer content={block.experiences} className="inline" /></span>
                   </div>
                )}
             </div>
          )}

          {/* Combat Stats Grid */}
          <div className={`${s.statBox} rounded-xl p-3.5 text-xs shadow-xs mb-4 space-y-3`}>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-2.5 border-b border-current border-opacity-15 text-center">
                {/* 1. Difficulty */}
                <div className={`flex flex-col items-center justify-center p-1.5 rounded ${s.statItem}`}>
                   <span className={`text-[10px] uppercase font-bold ${s.statLabel}`}>难度 (DC)</span>
                   <span className={`font-black text-lg sm:text-xl ${s.statVal}`}>{block.stats?.difficulty || 12}</span>
                </div>
                {/* 2. Thresholds */}
                <div className={`flex flex-col items-center justify-center p-1.5 rounded ${s.statItem}`}>
                   <span className={`text-[10px] uppercase font-bold ${s.statLabel}`}>伤害阈值 (轻/重)</span>
                   <span className={`font-bold text-base sm:text-lg ${s.statVal}`}>
                      {block.stats?.thresholdMinor || 5} <span className="opacity-40">/</span> {block.stats?.thresholdMajor || 10}
                   </span>
                </div>
                {/* 3. HP */}
                <div className={`flex flex-col items-center justify-center p-1.5 rounded ${s.statItem}`}>
                   <span className={`text-[10px] uppercase font-bold ${s.statHpVal}`}>生命 (HP)</span>
                   <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {showNumber && <span className={`font-black text-lg sm:text-xl ${s.statHpVal}`}>{block.stats?.hp || 5}</span>}
                      {showDots && (
                         <div className="flex items-center gap-0.5 flex-wrap justify-center max-w-[120px]" title={`HP: ${block.stats?.hp || 5}`}>
                            {Array.from({ length: hpCount }).map((_, i) => (
                               <span key={i} className={`inline-block w-2.5 h-2.5 rounded-full border ${s.hpDot}`} />
                            ))}
                         </div>
                      )}
                   </div>
                </div>
                {/* 4. Stress */}
                <div className={`flex flex-col items-center justify-center p-1.5 rounded ${s.statItem}`}>
                   <span className={`text-[10px] uppercase font-bold ${s.statStressVal}`}>压力 (Stress)</span>
                   <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {showNumber && <span className={`font-black text-lg sm:text-xl ${s.statStressVal}`}>{block.stats?.stress || 0}</span>}
                      {showDots && (
                         <div className="flex items-center gap-0.5 flex-wrap justify-center max-w-[120px]" title={`Stress: ${block.stats?.stress || 0}`}>
                            {Array.from({ length: stressCount }).map((_, i) => (
                               <span key={i} className={`inline-block w-2.5 h-2.5 rounded-sm border ${s.stressDot} rotate-45`} />
                            ))}
                         </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Attack Row */}
             {block.attack && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 px-1">
                   <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-black text-xs flex items-center gap-1 ${s.attackName}`}>
                         ⚔️ {block.attack.name || '主要攻击'}
                      </span>
                      {block.attack.range && (
                         <span className={`text-[11px] italic font-serif ${s.textMuted}`}>
                            ({block.attack.range})
                         </span>
                      )}
                      {block.attack.damageType && (
                         <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            block.attack.damageType === 'magical' ? s.attackTypeMagic : s.attackTypePhys
                         }`}>
                            {block.attack.damageType === 'magical' ? '魔法' : '物理'}
                         </span>
                      )}
                   </div>
                   <div className="flex items-center gap-3 font-bold text-xs">
                      <span>命中: <span className={`font-mono ${s.attackStats}`}>{block.attack.modifier || '+0'}</span></span>
                      <span className="opacity-30">|</span>
                      <span>伤害: <span className={`font-mono ${s.attackStats}`}>{block.attack.damage || 'd8'}</span></span>
                   </div>
                </div>
             )}
          </div>

          {/* Normal Traits */}
          {normalTraits.length > 0 && (
             <div className="space-y-3 mb-3">
                <h4 className={`font-black uppercase text-[10px] tracking-widest opacity-60 ${s.textMuted}`}>常规特性与能力</h4>
                {normalTraits.map((t: Trait) => (
                   <div key={t.id} className="text-xs sm:text-sm leading-relaxed space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                         <span className={`font-bold ${s.traitName}`}>{t.name}</span>
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            t.type === 'passive' ? s.traitPassive :
                            t.type === 'action' ? s.traitAction :
                            t.type === 'spotlight' ? s.traitSpotlight :
                            s.traitReaction
                         }`}>
                            {t.type === 'passive' ? '被动' : t.type === 'action' ? '动作' : t.type === 'spotlight' ? '聚焦动作' : '反应'}
                         </span>
                      </div>
                      <div className={`opacity-95 pl-2 border-l-2 ${s.traitDescBorder}`}>
                         <MarkdownRenderer content={t.description} />
                      </div>
                      {t.flavor && (
                         <div className={`italic text-[11px] pl-2 ${s.traitFlavor}`}>
                            {t.flavor}
                         </div>
                      )}
                   </div>
                ))}
             </div>
          )}

          {/* Special Traits / Boss Phase Abilities */}
          {specialTraits.length > 0 && (
             <div className={`mt-3 p-3.5 rounded-xl ${s.specialBox} space-y-2.5`}>
                <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wide ${s.specialTitle}`}>
                   <span>🌟 特殊机制 / 阶段能力</span>
                </div>
                {specialTraits.map((t: Trait) => (
                   <div key={t.id} className="text-xs sm:text-sm leading-relaxed space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                         <span className={`font-bold ${s.specialTitle}`}>{t.name}</span>
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${s.specialTag}`}>
                            {t.type === 'passive' ? '被动' : t.type === 'action' ? '动作' : t.type === 'spotlight' ? '聚焦动作' : '反应'}
                         </span>
                      </div>
                      <div className={`opacity-95 pl-2 border-l-2 ${s.specialTitle.replace('text-', 'border-')}`}>
                         <MarkdownRenderer content={t.description} />
                      </div>
                      {t.flavor && (
                         <div className={`italic text-[11px] opacity-80 pl-2 ${s.specialTitle}`}>
                            {t.flavor}
                         </div>
                      )}
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
});

export const EnvironmentCard: React.FC<{ block: EnvironmentBlock, theme: any }> = React.memo(({ block, theme }) => {
  const s = theme.card;
  return (
    <div className="break-inside-avoid my-6 font-sans relative">
       <div className={`${s.bg} ${s.border} border-2 rounded-2xl p-5 pl-7 md:p-6 md:pl-8 shadow-md ${s.text} transition-colors duration-300 relative overflow-hidden`}>
          {/* Left Accent Bar */}
          <div className={`absolute top-0 bottom-0 left-0 w-2.5 md:w-3 ${s.envBar} rounded-l-2xl z-10`} />

          {/* Scene Illustration / Banner */}
          {block.imageUrl && (
             <div className={`w-full max-h-56 rounded-xl overflow-hidden mb-4 border ${s.border} shadow-xs`}>
                <img src={block.imageUrl} alt={block.name} className="w-full h-full object-cover" />
             </div>
          )}

          {/* Header area */}
          <div className="mb-4 pb-3 border-b border-current border-opacity-15">
             <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className={`text-2xl sm:text-3xl font-black uppercase leading-tight tracking-tight ${s.nameText} ${theme.fontHead}`}>
                   {block.name || '未命名环境'}
                </h3>
             </div>

             {block.englishName && (
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${s.nameEnText}`}>
                   {block.englishName}
                </div>
             )}

             <div className="flex items-center gap-2 text-xs font-bold mb-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded ${s.badgeTier}`}>
                   位阶 {block.tier || 1}
                </span>
                <span className={`px-2 py-0.5 rounded ${s.badgeTypeEnv}`}>
                   {block.envType || '险境'}
                </span>
                <span className={`px-2 py-0.5 rounded ${s.badgeTier}`}>
                   难度 (DC): {block.difficulty || 12}
                </span>
             </div>

             {block.description && (
                <div className={`italic text-xs sm:text-sm leading-relaxed mb-1 ${s.textMuted}`}>
                   <MarkdownRenderer content={block.description} />
                </div>
             )}
          </div>

          {/* Tendencies & Potential Enemies Grid */}
          {(block.trend || block.potentialEnemies) && (
             <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4 p-3 rounded-lg ${s.metaBox}`}>
                {block.trend && (
                   <div>
                      <span className={`font-bold uppercase tracking-wide mr-1.5 ${s.metaLabelEnv}`}>🌊 趋向与动向:</span>
                      <span className={`${s.metaText} inline`}><MarkdownRenderer content={block.trend} className="inline" /></span>
                   </div>
                )}
                {block.potentialEnemies && (
                   <div className={block.trend ? "sm:border-l sm:border-current sm:border-opacity-20 sm:pl-3" : ""}>
                      <span className={`font-bold uppercase tracking-wide mr-1.5 ${s.metaLabelEnv}`}>⚔️ 潜在威胁/敌人:</span>
                      <span className={`${s.metaText} inline`}><MarkdownRenderer content={block.potentialEnemies} className="inline" /></span>
                   </div>
                )}
             </div>
          )}

          {/* Countdown Mechanism Box */}
          {(block.countdown || block.countdownDescription) && (
             <div className={`mb-4 p-3.5 rounded-xl ${s.countdownBox} space-y-1.5 shadow-2xs`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                   <span className={`text-xs font-black flex items-center gap-1.5 ${s.countdownTitle}`}>
                      ⏱️ 环境倒计时 (Countdown)
                   </span>
                   {block.countdown && (
                      <span className={`font-bold text-xs px-2.5 py-0.5 rounded-full shadow-2xs ${s.countdownBadge}`}>
                         倒计时步数: {block.countdown}
                      </span>
                   )}
                </div>
                {block.countdownDescription && (
                   <div className={`text-xs leading-relaxed pl-1 ${s.countdownText}`}>
                      <MarkdownRenderer content={block.countdownDescription} />
                   </div>
                )}
             </div>
          )}

          {/* Features with GM Questions */}
          {(block.features || []).length > 0 && (
             <div className="space-y-3.5">
                <h4 className={`font-black uppercase text-[10px] tracking-widest opacity-60 ${s.textMuted}`}>环境特性与互动机制</h4>
                {block.features.map(feature => (
                   <div key={feature.id} className="text-xs sm:text-sm leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                         <span className={`font-bold ${s.traitName}`}>{feature.name}</span>
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            feature.type === 'passive' ? s.traitPassive :
                            feature.type === 'action' ? s.traitAction :
                            feature.type === 'spotlight' ? s.traitSpotlight :
                            s.traitReaction
                         }`}>
                            {feature.type === 'passive' ? '被动' : feature.type === 'action' ? '动作' : feature.type === 'spotlight' ? '聚焦动作' : '反应'}
                         </span>
                      </div>
                      
                      <div className={`opacity-95 pl-2 border-l-2 ${s.traitDescBorder}`}>
                         <MarkdownRenderer content={feature.description} />
                      </div>

                      {feature.questions && (
                         <div className={`italic text-[11px] rounded-md px-2.5 py-1.5 flex items-start gap-1.5 ${s.gmQuestionBox}`}>
                            <span className={`shrink-0 font-bold not-italic ${s.gmQuestionTitle}`}>💡 GM 引导:</span>
                            <span className={s.gmQuestionText}>{feature.questions}</span>
                         </div>
                      )}
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
});
