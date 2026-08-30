import React, { useRef, useState, useCallback } from 'react';
import { MarkdownToolbar } from './MarkdownToolbar';
import { SlashCommandMenu, SlashCommand } from './SlashCommandMenu';

interface SmartTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  value: string;
  onChangeValue: (val: string) => void;
  showToolbar?: boolean;
  compactToolbar?: boolean;
  minRows?: number;
  className?: string;
  onRegisterFocus?: (ref: React.RefObject<HTMLTextAreaElement | null>, setValue: (v: string) => void) => void;
  onGenerateToc?: () => void;
}

export const SmartTextarea: React.FC<SmartTextareaProps> = ({
  label,
  value,
  onChangeValue,
  showToolbar = false,
  compactToolbar = false,
  minRows = 3,
  className = '',
  placeholder,
  onRegisterFocus,
  onGenerateToc,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Slash Command Menu state
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const [slashStartIndex, setSlashStartIndex] = useState<number | null>(null);

  const insertText = useCallback((prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    if (!textareaRef.current) {
      onChangeValue(`${value}\n${prefix}${defaultPlaceholder}${suffix}`);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const selectedText = currentText.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
    onChangeValue(newText);

    const newStart = start + prefix.length;
    const newEnd = start + prefix.length + selectedText.length;

    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus({ preventScroll: true });
        try {
          textarea.setSelectionRange(newStart, newEnd);
        } catch (e) {
          // ignore
        }
      }
    });
  }, [value, onChangeValue]);

  // Handle Hotkeys (Ctrl+B, Ctrl+I, Ctrl+Shift+A, Tab, etc.)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    // Tab / Shift+Tab indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;

      if (!e.shiftKey) {
        // Indent 2 spaces
        const newText = currentText.substring(0, start) + '  ' + currentText.substring(end);
        onChangeValue(newText);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        });
      } else {
        // Unindent
        if (currentText.substring(start - 2, start) === '  ') {
          const newText = currentText.substring(0, start - 2) + currentText.substring(start);
          onChangeValue(newText);
          requestAnimationFrame(() => {
            textarea.setSelectionRange(start - 2, start - 2);
          });
        }
      }
      return;
    }

    if (isCtrlOrCmd) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        insertText('**', '**', '加粗文本');
        return;
      }
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        insertText('*', '*', '斜体描述');
        return;
      }
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        insertText('==', '==', '高亮重点');
        return;
      }
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        insertText('> ', '\n', '场景朗读或开场白描述...');
        return;
      }
      if (e.key === '1') {
        e.preventDefault();
        insertText('# ', '\n', '一级大标题');
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        insertText('## ', '\n', '二级标题');
        return;
      }
      if (e.key === '3') {
        e.preventDefault();
        insertText('### ', '\n', '三级标题');
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertText('\n\\page\n', '', '');
        return;
      }
      if (e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        insertText('\n{{adversary\n## 敌对生物名称\n### Tier 1 杂兵\navatar: https://i.imgur.com/example.png (circle)\nhealthDisplay: dots\n*怪物的风味描述文字。*\n**动机与战术：** 埋伏突袭、分化队伍\n\n{{descriptive\n**Difficulty:** 12 | **Thresholds:** 10/20 | **HP:** 4 | **Stress:** 3\n**ATK:** +2 | **主要攻击技能:** 近战 (物理) | 1d8+2 伤害\n___\n**Experience:** 专长条目 +2\n}}\n\n#### 特性\n**动作名称 - 动作：标记 1 压力** 效果描述...\n}}\n', '', '');
        return;
      }
      if (e.shiftKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        insertText('\n{{outcome\n[hope,success] 成功潜入并获得关键线索（获得 1 希望点）。\n[fear,success] 成功完成但惊动了巡逻守卫（主持人获得 1 恐惧点）。\n[fear,failure] 遭遇突袭陷入不利。\n[critical] 完美结算，全队清除 1 压力点。\n}}\n', '', '');
        return;
      }
      if (e.shiftKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        insertText('\n{{environment\n## 环境危机名称\n### Tier 2 险境事件\ncountdown: 4\n*环境风味描述。*\n**潜在威胁：** 致命险情\n\n{{descriptive\n**Difficulty:** 14 | **范围:** 整个区域\n}}\n\n#### 触发机制\n**险境结算：** 进行体魄检定，失败则标记 1 压力。\n}}\n', '', '');
        return;
      }
      if (e.shiftKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        insertText('\n{{DHTable\n| 物品名称 | 阶层 (Tier) | 属性与类型 | 机制效果与结算说明 ||\n| :--- | :---: | :---: | :--- |\n| 破晓圣水 | Tier 1 | 消耗品 | 净化近战范围不死生物 |\n| 秘银战铠 | Tier 2 | 护甲槽 +2 | 受到物理伤害时可【标记 1 护甲槽】 |\n}}\n', '', '');
        return;
      }
      if (e.shiftKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        insertText('\n{{note\n##### 🔒 GM 隐秘备忘\n这里填写仅主持可见的隐秘DC与剧情线索...\n}}\n', '', '');
        return;
      }
    }

    // Slash command trigger
    if (e.key === '/') {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursor = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursor);
        const lastChar = textBefore.slice(-1);

        if (cursor === 0 || lastChar === '\n' || lastChar === ' ' || lastChar === '') {
          const rect = textarea.getBoundingClientRect();
          setSlashPos({
            top: Math.min(window.innerHeight - 320, rect.top + 40),
            left: Math.min(window.innerWidth - 300, rect.left + 20),
          });
          setSlashStartIndex(cursor);
          setSlashQuery('');
          setSlashMenuOpen(true);
        }
      }
    }

    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    onChangeValue(newVal);

    if (slashMenuOpen && slashStartIndex !== null) {
      const cursor = e.target.selectionStart;
      if (cursor <= slashStartIndex) {
        setSlashMenuOpen(false);
      } else {
        const queryText = newVal.substring(slashStartIndex + 1, cursor);
        if (queryText.includes('\n') || queryText.includes(' ')) {
          setSlashMenuOpen(false);
        } else {
          setSlashQuery(queryText);
        }
      }
    }
  };

  const handleSelectSlashCommand = (cmd: SlashCommand) => {
    const textarea = textareaRef.current;
    if (!textarea || slashStartIndex === null) return;

    const currentText = textarea.value;
    const cursor = textarea.selectionStart;

    // Replace the slash and query with the template
    const newText = currentText.substring(0, slashStartIndex) + cmd.template + currentText.substring(cursor);
    onChangeValue(newText);
    setSlashMenuOpen(false);

    const newPos = slashStartIndex + cmd.template.length;
    requestAnimationFrame(() => {
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(newPos, newPos);
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onRegisterFocus) {
      onRegisterFocus(textareaRef, onChangeValue);
    }
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  return (
    <div className="w-full space-y-1 relative">
      {label && <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</label>}
      {showToolbar && (
        <MarkdownToolbar
          textareaRef={textareaRef}
          value={value}
          onChange={onChangeValue}
          compact={compactToolbar}
          onGenerateToc={onGenerateToc}
        />
      )}
      <textarea
        ref={textareaRef}
        rows={minRows}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder || "支持标准 Markdown 与 Homebrewery V3 语法，输入 '/' 唤出快捷选单..."}
        className={`w-full bg-transparent border border-stone-200 dark:border-stone-700 p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-sans text-sm leading-relaxed shadow-xs placeholder:text-stone-300 dark:placeholder:text-stone-600 resize-y whitespace-pre-wrap break-words ${
          showToolbar ? 'rounded-b-lg border-t-0' : 'rounded-lg'
        } ${className}`}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          ...props.style,
        }}
        {...props}
      />

      {/* Floating Slash Command Menu */}
      {slashMenuOpen && (
        <SlashCommandMenu
          query={slashQuery}
          position={slashPos}
          onSelect={handleSelectSlashCommand}
          onClose={() => setSlashMenuOpen(false)}
        />
      )}
    </div>
  );
};
