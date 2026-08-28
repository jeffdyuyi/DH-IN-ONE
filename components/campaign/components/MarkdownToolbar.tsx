import React from 'react';
import { 
  Bold, Italic, Strikethrough, Heading2, Heading3, 
  Quote, List, ListOrdered, Code, Table as TableIcon
} from 'lucide-react';

interface MarkdownToolbarProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  value?: string;
  onChange?: (newVal: string) => void;
  className?: string;
  compact?: boolean;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  textareaRef,
  value,
  onChange,
  className = '',
  compact = false,
}) => {
  const insertText = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    if (!textareaRef?.current) {
      if (onChange && value !== undefined) {
        onChange(`${value}\n${prefix}${defaultPlaceholder}${suffix}`);
      }
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const selectedText = currentText.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

    if (onChange) {
      onChange(newText);
    } else {
      textarea.value = newText;
    }

    const newStart = start + prefix.length;
    const newEnd = start + prefix.length + selectedText.length;

    // Use requestAnimationFrame to restore focus and selection cleanly with preventScroll: true
    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus({ preventScroll: true });
        try {
          textarea.setSelectionRange(newStart, newEnd);
        } catch (e) {
          // ignore selection range errors if unmounted
        }
      }
    });
  };

  const handleSelectSnippet = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      insertText(val, '', '');
      e.target.value = ''; // reset select
    }
  };

  const handleBtnMouseDown = (e: React.MouseEvent) => {
    // Prevent button click from stealing focus away from textarea
    e.preventDefault();
  };

  return (
    <div className={`flex items-center gap-1.5 p-1.5 bg-stone-100/90 border border-stone-200 rounded-t-lg text-xs text-stone-700 flex-wrap select-none ${className}`}>
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1">MD 格式:</span>
      
      <button
        type="button"
        onMouseDown={handleBtnMouseDown}
        onClick={() => insertText('**', '**', '加粗文本')}
        className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-800 rounded border border-stone-200 font-bold flex items-center gap-1 text-[11px] transition-colors shadow-xs cursor-pointer"
        title="加粗 **文本**"
      >
        <Bold size={12} /> 粗体
      </button>

      <button
        type="button"
        onMouseDown={handleBtnMouseDown}
        onClick={() => insertText('*', '*', '斜体描述')}
        className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-800 rounded border border-stone-200 italic flex items-center gap-1 text-[11px] transition-colors shadow-xs cursor-pointer"
        title="斜体 *文本*"
      >
        <Italic size={12} /> 斜体
      </button>

      {!compact && (
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('~~', '~~', '删除文本')}
          className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-800 rounded border border-stone-200 line-through flex items-center gap-1 text-[11px] transition-colors shadow-xs cursor-pointer"
          title="删除线 ~~文本~~"
        >
          <Strikethrough size={12} /> 删除线
        </button>
      )}

      <button
        type="button"
        onMouseDown={handleBtnMouseDown}
        onClick={() => insertText('## ', '\n', '二级标题')}
        className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-800 rounded border border-stone-200 font-bold flex items-center gap-1 text-[11px] transition-colors shadow-xs cursor-pointer"
        title="插入二级标题"
      >
        <Heading2 size={12} /> H2
      </button>

      {!compact && (
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('### ', '\n', '三级标题')}
          className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-800 rounded border border-stone-200 font-bold flex items-center gap-1 text-[11px] transition-colors shadow-xs cursor-pointer"
          title="插入三级标题"
        >
          <Heading3 size={12} /> H3
        </button>
      )}

      <button
        type="button"
        onMouseDown={handleBtnMouseDown}
        onClick={() => insertText('> ', '\n', '朗读或引文内容')}
        className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-800 rounded border border-stone-200 flex items-center gap-1 text-[11px] transition-colors shadow-xs cursor-pointer"
        title="引用段落"
      >
        <Quote size={12} /> 引用
      </button>

      <button
        type="button"
        onMouseDown={handleBtnMouseDown}
        onClick={() => insertText('- ', '\n', '列表要点')}
        className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-800 rounded border border-stone-200 flex items-center gap-1 text-[11px] transition-colors shadow-xs cursor-pointer"
        title="无序列表"
      >
        <List size={12} /> 列表
      </button>

      {!compact && (
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('1. ', '\n', '有序步骤')}
          className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-800 rounded border border-stone-200 flex items-center gap-1 text-[11px] transition-colors shadow-xs cursor-pointer"
          title="有序列表"
        >
          <ListOrdered size={12} /> 编号
        </button>
      )}

      {!compact && (
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('`', '`', '代码或标记')}
          className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-800 rounded border border-stone-200 font-mono flex items-center gap-1 text-[11px] transition-colors shadow-xs cursor-pointer"
          title="行内代码"
        >
          <Code size={12} /> 代码
        </button>
      )}

      {!compact && (
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n| 标题 1 | 标题 2 | 标题 3 |\n| :--- | :--- | :--- |\n| 条目 1 | 描述说明 | 检定效果 |\n| 条目 2 | 描述说明 | 检定效果 |\n', '', '')}
          className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-800 rounded border border-stone-200 flex items-center gap-1 text-[11px] transition-colors shadow-xs cursor-pointer"
          title="插入 Markdown 表格"
        >
          <TableIcon size={12} /> 表格
        </button>
      )}

      <div className="w-px h-4 bg-stone-300 mx-0.5" />

      {/* TRPG Standard Tokens */}
      <button
        type="button"
        onMouseDown={handleBtnMouseDown}
        onClick={() => insertText('【花费 1 希望点】', '', '')}
        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded border border-amber-300 font-medium text-[10px] transition-colors shadow-xs cursor-pointer"
        title="插入标准希望点描述"
      >
        +花费希望
      </button>

      <button
        type="button"
        onMouseDown={handleBtnMouseDown}
        onClick={() => insertText('【花费 1 恐惧点】', '', '')}
        className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded border border-purple-300 font-medium text-[10px] transition-colors shadow-xs cursor-pointer"
        title="插入标准恐惧点描述"
      >
        +花费恐惧
      </button>

      <button
        type="button"
        onMouseDown={handleBtnMouseDown}
        onClick={() => insertText('【标记 1 压力点】', '', '')}
        className="px-2 py-0.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 rounded border border-yellow-300 font-medium text-[10px] transition-colors shadow-xs cursor-pointer"
        title="插入标准压力点描述"
      >
        +标记压力
      </button>

      {/* Official Term Dropdown */}
      <select
        onChange={handleSelectSnippet}
        defaultValue=""
        className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[11px] text-stone-700 outline-none hover:border-amber-400 font-sans cursor-pointer transition-colors shadow-xs"
        title="选择插入官方术语"
      >
        <option value="" disabled>🏷️ 官方术语库...</option>
        <optgroup label="希望点与恐惧点">
          <option value="【花费 1 希望点】">【花费 1 希望点】</option>
          <option value="【获得 1 希望点】">【获得 1 希望点】</option>
          <option value="【花费 1 恐惧点】">【花费 1 恐惧点】</option>
          <option value="【获得 1 恐惧点】">【获得 1 恐惧点】</option>
          <option value="【清除 1 恐惧点】">【清除 1 恐惧点】</option>
        </optgroup>
        <optgroup label="生命、压力与护甲">
          <option value="【标记 1 压力点】">【标记 1 压力点】</option>
          <option value="【清除 1 压力点】">【清除 1 压力点】</option>
          <option value="【标记 1 生命点】">【标记 1 生命点】</option>
          <option value="【恢复 1 生命点】">【恢复 1 生命点】</option>
          <option value="【标记 1 护甲槽】">【标记 1 护甲槽】</option>
          <option value="【清除 1 护甲槽】">【清除 1 护甲槽】</option>
        </optgroup>
        <optgroup label="距离与范围">
          <option value="【近战范围】">【近战范围】</option>
          <option value="【邻近范围】">【邻近范围】</option>
          <option value="【近距离范围】">【近距离范围】</option>
          <option value="【远距离范围】">【远距离范围】</option>
          <option value="【极远范围】">【极远范围】</option>
        </optgroup>
      </select>

      {/* Rule Sentence Snippets */}
      <select
        onChange={handleSelectSnippet}
        defaultValue=""
        className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[11px] text-stone-700 outline-none hover:border-amber-400 font-sans cursor-pointer transition-colors shadow-xs"
        title="选择插入规则描述常用句式"
      >
        <option value="" disabled>📝 规则常用句式...</option>
        <option value="对近距离范围内的一个目标进行一次敏捷掷骰（难度 12）。">对近距离目标进行敏捷掷骰(难度 12)</option>
        <option value="成功时，目标处于【脆弱】状态；失败时，游戏主持人获得 1 恐惧点。">成功/失败分歧结算模板</option>
        <option value="造成 1d8+3 点物理伤害。">造成 1d8+3 点物理伤害</option>
        <option value="造成 2d6 点魔法伤害，并将其击退至近距离范围处。">造成 2d6 魔法伤害并击退</option>
        <option value="在其下一次动作掷骰中获得优势。">下一次动作掷骰获得优势</option>
        <option value="标记 1 压力点以少标记 1 生命点。">标记 1 压力以少标记 1 生命</option>
        <option value="与游戏主持人一起描述该物品并将其加入物品栏。">与GM共创确定物品句式</option>
      </select>
    </div>
  );
};
