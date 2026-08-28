import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Palette, Type, CaseSensitive } from 'lucide-react';

interface RichTextAreaProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  inline?: boolean;
}

const COLOR_PRESETS = [
  { name: '玫瑰红', value: '#ef4444' },
  { name: '琥珀橙', value: '#f97316' },
  { name: '翡翠绿', value: '#10b981' },
  { name: '天空蓝', value: '#3b82f6' },
  { name: '紫罗兰', value: '#8b5cf6' },
  { name: '古铜金', value: '#d97706' },
  { name: '暗影黑', value: '#1f2937' },
  { name: '纯净白', value: '#ffffff' }
];

const SIZE_PRESETS = [
  { name: '小号', value: 'font-size:0.85em' },
  { name: '标准', value: 'font-size:1em' },
  { name: '大号', value: 'font-size:1.15em' },
  { name: '特大', value: 'font-size:1.3em' }
];

const FONT_PRESETS = [
  { name: '古典衬线', value: 'font-family:serif' },
  { name: '现代无衬线', value: 'font-family:sans-serif' },
  { name: '工整等宽', value: 'font-family:monospace' },
  { name: '行楷风格', value: 'font-family:cursive' }
];

export const RichTextArea: React.FC<RichTextAreaProps> = ({
  label,
  value = '',
  onChange,
  placeholder,
  minHeight = 'min-h-[100px]',
  inline = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMenu, setActiveMenu] = useState<'color' | 'size' | 'font' | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormat = (type: string, detailValue?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);

    let replacement = '';
    let cursorOffsetStart = 0;
    let cursorOffsetEnd = 0;

    switch (type) {
      case 'bold':
        replacement = `**${selectedText || '加粗文本'}**`;
        cursorOffsetStart = 2;
        cursorOffsetEnd = selectedText ? selectedText.length + 2 : 6;
        break;
      case 'italic':
        replacement = `*${selectedText || '斜体文本'}*`;
        cursorOffsetStart = 1;
        cursorOffsetEnd = selectedText ? selectedText.length + 1 : 5;
        break;
      case 'bullet': {
        // Find if we are inserting after a newline
        const prepend = (start === 0 || currentVal[start - 1] === '\n') ? '' : '\n';
        replacement = `${prepend}- ${selectedText || '列表项'}`;
        cursorOffsetStart = prepend.length + 2;
        cursorOffsetEnd = selectedText ? selectedText.length + cursorOffsetStart : cursorOffsetStart + 3;
        break;
      }
      case 'number': {
        const prepend = (start === 0 || currentVal[start - 1] === '\n') ? '' : '\n';
        replacement = `${prepend}1. ${selectedText || '列表项'}`;
        cursorOffsetStart = prepend.length + 3;
        cursorOffsetEnd = selectedText ? selectedText.length + cursorOffsetStart : cursorOffsetStart + 3;
        break;
      }
      case 'color':
        replacement = `[${selectedText || '彩色文本'}]{color:${detailValue}}`;
        cursorOffsetStart = 1;
        cursorOffsetEnd = selectedText ? selectedText.length + 1 : 5;
        break;
      case 'size':
        replacement = `[${selectedText || '更改字号'}]{${detailValue}}`;
        cursorOffsetStart = 1;
        cursorOffsetEnd = selectedText ? selectedText.length + 1 : 5;
        break;
      case 'font':
        replacement = `[${selectedText || '更改字体'}]{${detailValue}}`;
        cursorOffsetStart = 1;
        cursorOffsetEnd = selectedText ? selectedText.length + 1 : 5;
        break;
      default:
        return;
    }

    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    onChange(newVal);
    setActiveMenu(null);

    // Refocus and reselect text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffsetStart, start + cursorOffsetEnd);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleFormat('bold');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        handleFormat('italic');
      }
    }
  };

  const toggleMenu = (menu: 'color' | 'size' | 'font') => {
    setActiveMenu(prev => (prev === menu ? null : menu));
  };

  return (
    <div ref={containerRef} className={`flex flex-col w-full relative ${inline ? '' : 'col-span-2 gap-1'}`}>
      {!inline && label && (
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="flex flex-col border border-slate-300 dark:border-zinc-700 rounded overflow-visible bg-white dark:bg-zinc-900 focus-within:border-blue-500 dark:focus-within:border-amber-500 transition-colors">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-1 bg-slate-50 dark:bg-zinc-800/40 border-b border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => handleFormat('bold')}
            className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-amber-500 transition-colors"
            title="加粗 (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('italic')}
            className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-amber-500 transition-colors"
            title="斜体 (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('bullet')}
            className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-amber-500 transition-colors"
            title="无序列表"
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('number')}
            className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-amber-500 transition-colors"
            title="有序列表"
          >
            <ListOrdered size={15} />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 dark:bg-zinc-800 mx-1"></div>

          {/* Color Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('color')}
              className={`p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded transition-colors ${activeMenu === 'color' ? 'bg-slate-200 dark:bg-zinc-700 text-blue-500 dark:text-amber-500' : 'text-slate-600 dark:text-zinc-400'}`}
              title="文字颜色"
            >
              <Palette size={15} />
            </button>
            {activeMenu === 'color' && (
              <div className="absolute left-0 top-full mt-1 p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 grid grid-cols-4 gap-1.5 min-w-[130px]">
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleFormat('color', c.value)}
                    className="w-5 h-5 rounded border border-slate-300 dark:border-zinc-700 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Size Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('size')}
              className={`p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded transition-colors ${activeMenu === 'size' ? 'bg-slate-200 dark:bg-zinc-700 text-blue-500 dark:text-amber-500' : 'text-slate-600 dark:text-zinc-400'}`}
              title="字体大小"
            >
              <Type size={15} />
            </button>
            {activeMenu === 'size' && (
              <div className="absolute left-0 top-full mt-1 p-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 flex flex-col min-w-[90px]">
                {SIZE_PRESETS.map(s => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => handleFormat('size', s.value)}
                    className="px-2 py-1 text-left text-xs hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('font')}
              className={`p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded transition-colors ${activeMenu === 'font' ? 'bg-slate-200 dark:bg-zinc-700 text-blue-500 dark:text-amber-500' : 'text-slate-600 dark:text-zinc-400'}`}
              title="字体样式"
            >
              <CaseSensitive size={15} />
            </button>
            {activeMenu === 'font' && (
              <div className="absolute left-0 top-full mt-1 p-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 flex flex-col min-w-[110px]">
                {FONT_PRESETS.map(f => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => handleFormat('font', f.value)}
                    className="px-2 py-1 text-left text-xs hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded font-serif"
                    style={{ fontFamily: f.value.split(':')[1] }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full bg-transparent px-3 py-2 text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none resize-y text-sm leading-relaxed ${minHeight}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default RichTextArea;
