import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Columns, Eye, Code, ZoomIn, ZoomOut, RotateCcw, 
  BookOpen, Layers, CheckCircle2, Copy,
  ListTree, Plus, Database, ChevronLeft, ChevronRight,
  Sparkles, FileText, SplitSquareVertical, FilePlus,
  SlidersHorizontal, ToggleLeft, ToggleRight, Settings
} from 'lucide-react';
import { SmartTextarea } from './SmartTextarea';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MarkdownToolbar } from './MarkdownToolbar';
import { ProjectData } from '../types';
import { THEMES } from '../campaign-editor-app';

interface CampaignSplitEditorProps {
  projectData: ProjectData;
  fullMarkdownText: string;
  onChangeMarkdown: (newText: string) => void;
  onSyncBackToSections?: () => void;
  activeTheme: string;
  onChangeTheme?: (t: any) => void;
  onUpdateSettings?: (key: string, val: boolean) => void;
  onGenerateToc?: () => void;
  onOpenVault?: () => void;
  onCloseSplitView?: () => void;
}

export const CampaignSplitEditor: React.FC<CampaignSplitEditorProps> = ({
  projectData,
  fullMarkdownText,
  onChangeMarkdown,
  onSyncBackToSections,
  activeTheme = 'default',
  onChangeTheme,
  onUpdateSettings,
  onGenerateToc,
  onOpenVault,
  onCloseSplitView,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [previewStyle, setPreviewStyle] = useState<'long' | 'a4'>('long'); // default to authentic long-vertical
  const [splitRatio, setSplitRatio] = useState<'50:50' | '60:40' | '40:60'>('50:50');
  const [isOutlineOpen, setIsOutlineOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copySuccess, setCopySuccess] = useState(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<'editor' | 'preview' | null>(null);

  const settings = projectData.settings || {};

  // Extract Heading Outline from Markdown Text
  const outlineItems = useMemo(() => {
    const lines = fullMarkdownText.split('\n');
    const items: { level: number; title: string; lineIndex: number }[] = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        const level = trimmed.startsWith('# ') ? 1 : trimmed.startsWith('## ') ? 2 : 3;
        const title = trimmed.replace(/^#{1,3}\s+/, '');
        items.push({ level, title, lineIndex: idx });
      }
    });
    return items;
  }, [fullMarkdownText]);

  // Jump to specific outline heading in editor
  const handleJumpToLine = (lineIndex: number) => {
    const lines = fullMarkdownText.split('\n');
    const charIndex = lines.slice(0, lineIndex).join('\n').length;
    
    const textarea = document.querySelector('.dh-split-editor textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(charIndex, charIndex + (lines[lineIndex]?.length || 0));
      const linePct = lineIndex / Math.max(1, lines.length);
      textarea.scrollTop = linePct * textarea.scrollHeight;
    }
  };

  // Sync scroll between Editor and Preview
  const handleEditorScroll = () => {
    if (isScrollingRef.current === 'preview') return;
    isScrollingRef.current = 'editor';

    const editorEl = editorContainerRef.current;
    const previewEl = previewContainerRef.current;

    if (editorEl && previewEl) {
      const scrollPct = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight || 1);
      previewEl.scrollTop = scrollPct * (previewEl.scrollHeight - previewEl.clientHeight);
    }

    setTimeout(() => {
      isScrollingRef.current = null;
    }, 50);
  };

  const handlePreviewScroll = () => {
    if (isScrollingRef.current === 'editor') return;
    isScrollingRef.current = 'preview';

    const editorEl = editorContainerRef.current;
    const previewEl = previewContainerRef.current;

    if (editorEl && previewEl) {
      const scrollPct = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight || 1);
      editorEl.scrollTop = scrollPct * (editorEl.scrollHeight - editorEl.clientHeight);
    }

    setTimeout(() => {
      isScrollingRef.current = null;
    }, 50);
  };

  const handleCopySource = () => {
    navigator.clipboard.writeText(fullMarkdownText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleAddChapter = () => {
    const chapterNum = outlineItems.filter(i => i.level === 1).length + 1;
    const newChapterText = `\n\n\\page\n{{Ch${Math.min(5, chapterNum)},tab}}\n# 第 ${chapterNum} 章：新的征程\n*在这里开始描述新的章节故事与场景...*\n\n`;
    onChangeMarkdown(fullMarkdownText + newChapterText);
  };

  const toggleSetting = (key: string) => {
    if (onUpdateSettings) {
      onUpdateSettings(key, !settings[key as keyof typeof settings]);
    }
  };

  // Calculate layout widths
  const editorWidthClass = 
    viewMode === 'editor' ? 'w-full max-w-5xl mx-auto' :
    splitRatio === '60:40' ? 'w-[60%]' :
    splitRatio === '40:60' ? 'w-[40%]' : 'w-1/2';

  const previewWidthClass = 
    viewMode === 'preview' ? 'w-full' :
    splitRatio === '60:40' ? 'w-[40%]' :
    splitRatio === '40:60' ? 'w-[60%]' : 'w-1/2';

  return (
    <div className="flex flex-col h-full w-full bg-stone-900 text-stone-100 overflow-hidden select-none border border-stone-800 rounded-xl shadow-2xl">
      
      {/* Top Studio Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-stone-950/95 border-b border-stone-800 shrink-0 text-xs flex-wrap gap-2">
        
        {/* Left: Outline Toggle & Title */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOutlineOpen(!isOutlineOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isOutlineOpen 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs' 
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
            title="展开/收起章节大纲目录"
          >
            <ListTree size={14} />
            <span>章节大纲</span>
            {outlineItems.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-black/40 rounded-full text-[10px] text-amber-300 font-mono">
                {outlineItems.length}
              </span>
            )}
          </button>

          {/* Layout Settings Toggle Popover Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                isSettingsOpen 
                  ? 'bg-amber-600 text-white border-amber-500 shadow-xs' 
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
              title="版面显示设置 (控制8项元数据开关)"
            >
              <SlidersHorizontal size={13} />
              <span>版面显示开关</span>
            </button>

            {/* Settings Popup Modal */}
            {isSettingsOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-stone-900 text-stone-200 rounded-xl shadow-2xl border border-stone-700 p-3.5 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-stone-400">
                  <span className="font-bold text-xs flex items-center gap-1 text-amber-400">
                    <Settings size={13} /> 版面显示开关设置
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-stone-500 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  {[
                    { key: 'showConcept', label: '1. 核心概念' },
                    { key: 'showComplexity', label: '2. 复杂度' },
                    { key: 'showLevelRange', label: '3. 适用等级' },
                    { key: 'showIntroduction', label: '4. 简介与导言' },
                    { key: 'showSummary', label: '5. 模组概要' },
                    { key: 'showPrologue', label: '6. 序言开场白' },
                    { key: 'showToneThemes', label: '7. 基调/主题/灵感' },
                    { key: 'showCopyright', label: '8. DPCGL 版权声明' },
                  ].map(({ key, label }) => {
                    const isChecked = !!settings[key as keyof typeof settings];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleSetting(key)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-semibold' 
                            : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800'
                        }`}
                      >
                        <span>{label}</span>
                        {isChecked ? (
                          <ToggleRight size={16} className="text-amber-400" />
                        ) : (
                          <ToggleLeft size={16} className="text-stone-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {onOpenVault && (
            <button
              type="button"
              onClick={onOpenVault}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs"
              title="从卡牌工坊/公共卡牌库插入怪物或装备卡"
            >
              <Database size={13} />
              <span>插入工坊卡牌</span>
            </button>
          )}

          <div className="h-4 w-px bg-stone-800 mx-1 hidden sm:block" />

          <span className="text-[11px] px-2 py-0.5 rounded bg-stone-800/80 text-stone-400 font-mono hidden md:inline">
            {fullMarkdownText.length} 字符 · 主题: {activeTheme}
          </span>
        </div>

        {/* Center: View Switcher & Split Ratio */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'editor' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="纯编辑模式"
            >
              <Code size={13} /> 纯代码
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'split' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="左右实时分屏"
            >
              <Columns size={13} /> 分屏编辑
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'preview' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="纯手册全览模式"
            >
              <Eye size={13} /> 纯预览
            </button>
          </div>

          {/* Preview Style Toggle: Long Vertical vs A4 Physical Book */}
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setPreviewStyle('long')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                previewStyle === 'long' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="原创长竖版自适应流式排版 (参考图3标准)"
            >
              长竖版
            </button>
            <button
              type="button"
              onClick={() => setPreviewStyle('a4')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                previewStyle === 'a4' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="实体 A4 双栏物理分页排版"
            >
              实体A4
            </button>
          </div>

          {viewMode === 'split' && (
            <div className="hidden lg:flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5 text-[11px] text-stone-400">
              <button
                type="button"
                onClick={() => setSplitRatio('60:40')}
                className={`px-2 py-0.5 rounded cursor-pointer ${splitRatio === '60:40' ? 'bg-stone-800 text-white font-bold' : 'hover:text-stone-200'}`}
                title="60% 编辑 : 40% 预览"
              >
                6:4
              </button>
              <button
                type="button"
                onClick={() => setSplitRatio('50:50')}
                className={`px-2 py-0.5 rounded cursor-pointer ${splitRatio === '50:50' ? 'bg-stone-800 text-white font-bold' : 'hover:text-stone-200'}`}
                title="50% 对等分屏"
              >
                1:1
              </button>
              <button
                type="button"
                onClick={() => setSplitRatio('40:60')}
                className={`px-2 py-0.5 rounded cursor-pointer ${splitRatio === '40:60' ? 'bg-stone-800 text-white font-bold' : 'hover:text-stone-200'}`}
                title="40% 编辑 : 60% 预览"
              >
                4:6
              </button>
            </div>
          )}
        </div>

        {/* Right: Zoom & Copy Action (Unified export is in top navbar) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg px-1.5 py-0.5 gap-1 text-stone-400">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(50, prev - 10))}
              className="p-1 hover:text-white cursor-pointer"
              title="缩小预览"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[11px] font-mono w-10 text-center">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
              className="p-1 hover:text-white cursor-pointer"
              title="放大预览"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="p-1 hover:text-white cursor-pointer border-l border-stone-800 ml-0.5"
              title="重置缩放 100%"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopySource}
            className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg border border-stone-700 font-medium text-xs transition-colors cursor-pointer"
            title="复制完整 Markdown 源码"
          >
            {copySuccess ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span className="hidden sm:inline">{copySuccess ? '已复制' : '复制代码'}</span>
          </button>
        </div>
      </div>

      {/* Full-Width Sticky Top Toolbar spanning across both editor and preview (100% width) */}
      {(viewMode === 'split' || viewMode === 'editor') && (
        <div className="w-full shrink-0 sticky top-0 z-30">
          <MarkdownToolbar
            value={fullMarkdownText}
            onChange={onChangeMarkdown}
            onGenerateToc={onGenerateToc}
          />
        </div>
      )}

      {/* Main Studio Body */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        
        {/* Leftmost: Collapsible Chapter Outline Tree */}
        {isOutlineOpen && (
          <aside className="w-56 shrink-0 h-full bg-stone-950/80 border-r border-stone-800 flex flex-col p-3 text-xs overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-stone-400">
              <span className="font-bold flex items-center gap-1 text-stone-300">
                <BookOpen size={13} className="text-amber-400" /> 章节大纲
              </span>
              <button
                type="button"
                onClick={handleAddChapter}
                className="p-1 hover:bg-stone-800 text-amber-400 hover:text-amber-300 rounded cursor-pointer"
                title="新建章节"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Outline list */}
            <div className="flex-1 space-y-1 overflow-y-auto pr-1">
              {outlineItems.length === 0 ? (
                <div className="text-[11px] text-stone-500 italic py-4 text-center">
                  暂无标题，输入 # 即可生成大纲
                </div>
              ) : (
                outlineItems.map((item, oIdx) => (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleJumpToLine(item.lineIndex)}
                    className={`w-full text-left truncate px-2 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                      item.level === 1 
                        ? 'font-bold text-amber-300 hover:bg-stone-800' 
                        : item.level === 2 
                        ? 'pl-4 text-stone-300 hover:bg-stone-800/80' 
                        : 'pl-6 text-stone-400 hover:bg-stone-800/60 text-[11px]'
                    }`}
                    title={`跳转至: ${item.title}`}
                  >
                    <span className="text-stone-600 font-mono text-[10px]">
                      {item.level === 1 ? 'H1' : item.level === 2 ? 'H2' : 'H3'}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </button>
                ))
              )}
            </div>

            {/* Outline quick actions footer */}
            <div className="pt-2 mt-2 border-t border-stone-800 space-y-1.5 shrink-0">
              <button
                type="button"
                onClick={handleAddChapter}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded font-medium text-[11px] transition-colors cursor-pointer"
              >
                <Plus size={12} className="text-amber-400" /> + 新建章节
              </button>
              {onGenerateToc && (
                <button
                  type="button"
                  onClick={onGenerateToc}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 rounded font-medium text-[11px] transition-colors cursor-pointer"
                >
                  <Sparkles size={12} /> 一键生成全书目录
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Center: Smart Continuous Markdown Editor Pane (without duplicate internal toolbar) */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            ref={editorContainerRef}
            onScroll={handleEditorScroll}
            className={`h-full overflow-y-auto p-3 md:p-4 flex flex-col bg-stone-900 border-r border-stone-800 transition-all dh-split-editor ${editorWidthClass}`}
          >
            <SmartTextarea
              value={fullMarkdownText}
              onChangeValue={onChangeMarkdown}
              showToolbar={false}
              minRows={30}
              onGenerateToc={onGenerateToc}
              className="min-h-[calc(100vh-210px)] font-mono text-xs leading-relaxed bg-stone-950/70 border-stone-800 text-stone-200 focus:ring-amber-500/30"
              placeholder="在这里畅快书写你的长篇战役... 支持标准 Markdown 语法，输入 '/' 唤出快捷选单..."
            />
          </div>
        )}

        {/* Right: Live Preview Pane (Defaults to authentic long vertical Image 3 style) */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            ref={previewContainerRef}
            onScroll={handlePreviewScroll}
            className={`h-full overflow-y-auto p-4 md:p-8 bg-stone-950/90 transition-all ${previewWidthClass}`}
          >
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full flex flex-col items-center"
            >
              {previewStyle === 'long' ? (
                <div className={`${(THEMES[activeTheme as keyof typeof THEMES] || THEMES.default).bg} ${(THEMES[activeTheme as keyof typeof THEMES] || THEMES.default).text} ${(THEMES[activeTheme as keyof typeof THEMES] || THEMES.default).fontBody} w-full max-w-4xl p-6 sm:p-12 rounded-2xl shadow-2xl transition-colors duration-300 leading-relaxed border border-current/10`}>
                  <MarkdownRenderer
                    content={fullMarkdownText}
                    theme={activeTheme}
                    isBookMode={false}
                    projectData={projectData}
                    className="w-full"
                  />
                </div>
              ) : (
                <MarkdownRenderer
                  content={fullMarkdownText}
                  theme={activeTheme}
                  isBookMode={true}
                  projectData={projectData}
                  className="w-full max-w-4xl"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
