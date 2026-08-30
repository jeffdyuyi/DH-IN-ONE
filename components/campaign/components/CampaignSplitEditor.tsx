import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Columns, Eye, Code, ZoomIn, ZoomOut, RotateCcw, 
  Printer, BookOpen, Layers, CheckCircle2, Copy
} from 'lucide-react';
import { SmartTextarea } from './SmartTextarea';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ProjectData } from '../types';

interface CampaignSplitEditorProps {
  projectData: ProjectData;
  fullMarkdownText: string;
  onChangeMarkdown: (newText: string) => void;
  onSyncBackToSections?: () => void;
  activeTheme: string;
  onChangeTheme?: (t: any) => void;
  onGenerateToc?: () => void;
  onCloseSplitView?: () => void;
}

export const CampaignSplitEditor: React.FC<CampaignSplitEditorProps> = ({
  projectData,
  fullMarkdownText,
  onChangeMarkdown,
  onSyncBackToSections,
  activeTheme = 'default',
  onChangeTheme,
  onGenerateToc,
  onCloseSplitView,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copySuccess, setCopySuccess] = useState(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<'editor' | 'preview' | null>(null);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] w-full bg-stone-900 text-stone-100 overflow-hidden select-none border border-stone-800 rounded-xl shadow-2xl">
      
      {/* Top Studio Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950/90 border-b border-stone-800 shrink-0 text-xs flex-wrap gap-2">
        
        {/* Left: Title & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-amber-500">
            <BookOpen size={16} />
            <span>一页流 · 左右所见即所得工作台</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-mono">
            {fullMarkdownText.length} 字符 · 主题: {activeTheme}
          </span>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'editor' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="纯编辑模式"
          >
            <Code size={13} /> 源码
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'split' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="左右双栏分屏 (50/50)"
          >
            <Columns size={13} /> 分屏 (50:50)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'preview' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="纯手册全览模式"
          >
            <Eye size={13} /> 手册全览
          </button>
        </div>

        {/* Right: Zoom & Export Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
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
            title="复制 Homebrewery V3 完整源码"
          >
            {copySuccess ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copySuccess ? '已复制' : '复制代码'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs"
            title="打印或导出 A4 实体手册 PDF"
          >
            <Printer size={13} />
            <span>打印 / 导出 PDF</span>
          </button>

          {onCloseSplitView && (
            <button
              type="button"
              onClick={onCloseSplitView}
              className="px-2.5 py-1 bg-stone-800 hover:bg-red-950/60 hover:text-red-300 text-stone-400 rounded-lg border border-stone-700 text-xs transition-colors cursor-pointer"
              title="返回积木表单视图"
            >
              退出分屏
            </button>
          )}
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex flex-1 w-full overflow-hidden">
        
        {/* Left: Continuous Markdown Editor Pane */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            ref={editorContainerRef}
            onScroll={handleEditorScroll}
            className={`h-full overflow-y-auto p-4 flex flex-col bg-stone-900 border-r border-stone-800 transition-all ${
              viewMode === 'split' ? 'w-1/2' : 'w-full max-w-5xl mx-auto'
            }`}
          >
            <SmartTextarea
              value={fullMarkdownText}
              onChangeValue={onChangeMarkdown}
              showToolbar={true}
              minRows={30}
              onGenerateToc={onGenerateToc}
              className="min-h-[calc(100vh-230px)] font-mono text-xs leading-relaxed bg-stone-950/60 border-stone-800 text-stone-200 focus:ring-amber-500/30"
              placeholder="在这里畅快书写你的长篇战役... 支持标准 Markdown 与 Homebrewery V3 语法，输入 '/' 唤出快捷选单..."
            />
          </div>
        )}

        {/* Right: Live A4 Physical Book Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            ref={previewContainerRef}
            onScroll={handlePreviewScroll}
            className={`h-full overflow-y-auto p-6 bg-stone-950/90 transition-all ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full flex flex-col items-center"
            >
              <MarkdownRenderer
                content={fullMarkdownText}
                theme={activeTheme}
                isBookMode={true}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
