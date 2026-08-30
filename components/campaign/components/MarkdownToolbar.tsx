import React from 'react';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  Quote, List, ListOrdered, Code, Table as TableIcon,
  Skull, Compass, ShieldAlert, Cpu, SplitSquareVertical,
  BookOpen, Layers, FilePlus, Sparkles, Flame, Zap, Heart,
  Palette, Image as ImageIcon, Indent, Outdent, StickyNote,
  Highlighter, Type, Heading, MessageSquareQuote, AlertCircle,
  Swords, Mountain, ListChecks, Minus
} from 'lucide-react';
import { BlockType } from '../types';

interface MarkdownToolbarProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  value?: string;
  onChange?: (newVal: string) => void;
  onInsertBlock?: (type: BlockType) => void;
  className?: string;
  compact?: boolean;
  onGenerateToc?: () => void;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  textareaRef,
  value,
  onChange,
  onInsertBlock,
  className = '',
  compact = false,
  onGenerateToc,
}) => {
  const insertText = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    // 1. Check if there's a currently focused input or textarea in split editor (e.g. in VisualBlockStream)
    const activeEl = document.activeElement as HTMLTextAreaElement | HTMLInputElement | null;
    const isEditorInput = activeEl && (activeEl.tagName === 'TEXTAREA' || (activeEl.tagName === 'INPUT' && activeEl.type === 'text')) && document.querySelector('.dh-split-editor')?.contains(activeEl);

    if (isEditorInput && activeEl) {
      const start = activeEl.selectionStart ?? activeEl.value.length;
      const end = activeEl.selectionEnd ?? activeEl.value.length;
      const currentText = activeEl.value;
      const selectedText = currentText.substring(start, end) || defaultPlaceholder;
      const replacement = `${prefix}${selectedText}${suffix}`;
      const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
      
      // Update DOM value & dispatch input event
      activeEl.value = newText;
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      activeEl.dispatchEvent(new Event('change', { bubbles: true }));

      const newStart = start + prefix.length;
      const newEnd = start + prefix.length + selectedText.length;
      requestAnimationFrame(() => {
        activeEl.focus({ preventScroll: true });
        try {
          activeEl.setSelectionRange(newStart, newEnd);
        } catch (e) {}
      });
      return;
    }

    // 2. Otherwise use root textarea ref or DOM split editor textarea
    const domTextarea = textareaRef?.current || (document.querySelector('.dh-split-editor textarea') as HTMLTextAreaElement | null);
    if (domTextarea) {
      const start = domTextarea.selectionStart;
      const end = domTextarea.selectionEnd;
      const currentText = domTextarea.value;
      const selectedText = currentText.substring(start, end) || defaultPlaceholder;
      const replacement = `${prefix}${selectedText}${suffix}`;
      const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
      
      if (onChange) {
        onChange(newText);
      } else {
        domTextarea.value = newText;
      }

      const newStart = start + prefix.length;
      const newEnd = start + prefix.length + selectedText.length;
      requestAnimationFrame(() => {
        domTextarea.focus({ preventScroll: true });
        try {
          domTextarea.setSelectionRange(newStart, newEnd);
        } catch (e) {}
      });
      return;
    }

    if (onChange && value !== undefined) {
      onChange(`${value}\n${prefix}${defaultPlaceholder}${suffix}`);
    }
  };

  const handleBlockAction = (type: BlockType, fallbackSnippet: string) => {
    if (onInsertBlock) {
      onInsertBlock(type);
    } else {
      insertText(fallbackSnippet, '', '');
    }
  };

  const handleSelectSnippet = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      if (val === 'GENERATE_TOC' && onGenerateToc) {
        onGenerateToc();
      } else {
        insertText(val, '', '');
      }
      e.target.value = '';
    }
  };

  const handleBtnMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent stealing focus from textarea
  };

  return (
    <div className={`w-full bg-stone-900 border-b border-stone-800 px-3 py-2 text-xs text-stone-200 select-none shadow-sm space-y-1.5 ${className}`}>
      
      {/* Top Row: 格式 (Format) & 规则 (Rules) */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        
        {/* 1. 格式 (Format) */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[11px] font-bold text-stone-400 mr-1 flex items-center gap-1">
            <span>✏️</span> 格式:
          </span>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('**', '**', '加粗文本')}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            title="粗体 (Ctrl+B)"
          >
            <Bold size={13} /> 粗体
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('*', '*', '斜体描述')}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 italic flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            title="斜体 (Ctrl+I)"
          >
            <Italic size={13} /> 斜体
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('==', '==', '高亮重点')}
            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 font-semibold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            title="高亮 (==重点==)"
          >
            <Highlighter size={12} className="text-amber-400" /> 高亮
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('~~', '~~', '删除文本')}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 line-through flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            title="删除线 (~~文本~~)"
          >
            <Strikethrough size={13} /> 删除
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('## ', '', '二级小节标题')}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 font-bold text-[11px] transition-colors cursor-pointer"
            title="二级标题 (##)"
          >
            H2
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('### ', '', '三级条目标题')}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 font-bold text-[11px] transition-colors cursor-pointer"
            title="三级标题 (###)"
          >
            H3
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('> ', '', '引用或朗读段落')}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            title="引用段落 (> )"
          >
            <Quote size={12} /> 引用
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('- ', '', '列表要点项')}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            title="无序列表 (- )"
          >
            <List size={13} /> 列表
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('1. ', '', '步骤要点项')}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            title="有序序号 (1. )"
          >
            <ListOrdered size={13} /> 序号
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('`', '`', '行内代码或专有名词')}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 font-mono flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            title="行内代码 (`code`)"
          >
            <Code size={12} /> 代码
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('\n| 表头列 1 | 表头列 2 | 表头列 3 |\n| :--- | :---: | :--- |\n| 条目数据 A | 位阶 1 | 效果说明描述 |\n| 条目数据 B | 位阶 2 | 效果说明描述 |\n\n', '', '')}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            title="插入标准 Markdown 表格"
          >
            <TableIcon size={12} /> 表格
          </button>
        </div>

        {/* 2. 规则 (Rules & Tokens) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-stone-400 mr-1 flex items-center gap-1">
            <span>🎲</span> 规则:
          </span>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('【花费 1 希望点】', '', '')}
            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded font-bold text-[11px] transition-colors cursor-pointer"
            title="插入花费希望点标记"
          >
            +花费希望
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('【花费 1 恐惧点】', '', '')}
            className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded font-bold text-[11px] transition-colors cursor-pointer"
            title="插入花费恐惧点标记"
          >
            +花费恐惧
          </button>

          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => insertText('【标记 1 压力点】', '', '')}
            className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 rounded font-bold text-[11px] transition-colors cursor-pointer"
            title="插入标记压力点描述"
          >
            +标记压力
          </button>

          {/* 官方术语库下拉 */}
          <select
            onChange={handleSelectSnippet}
            defaultValue=""
            className="bg-stone-800 text-stone-200 border border-stone-700 rounded px-2 py-1 text-[11px] outline-none hover:border-stone-500 cursor-pointer max-w-[130px]"
            title="快速插入 Daggerheart 官方术语"
          >
            <option value="" disabled>🏷️ 官方术语库...</option>
            <option value="【难度 (Difficulty)】">难度 (DC)</option>
            <option value="【微创阈值 (Minor Threshold)】">微创阈值</option>
            <option value="【重创阈值 (Major Threshold)】">重创阈值</option>
            <option value="【极度重创阈值 (Severe Threshold)】">极创阈值</option>
            <option value="【生命值 (Hit Points)】">生命值 (HP)</option>
            <option value="【压力槽 (Stress)】">压力槽 (Stress)</option>
            <option value="【护甲槽 (Armor Slots)】">护甲槽 (Armor)</option>
            <option value="【优势 (Advantage)】">获得优势</option>
            <option value="【劣势 (Disadvantage)】">受到劣势</option>
            <option value="【脆弱 (Vulnerable)】">状态：脆弱</option>
            <option value="【束缚 (Restrained)】">状态：束缚</option>
            <option value="【隐藏 (Hidden)】">状态：隐藏</option>
          </select>

          {/* 规则常用句式下拉 */}
          <select
            onChange={handleSelectSnippet}
            defaultValue=""
            className="bg-stone-800 text-stone-200 border border-stone-700 rounded px-2 py-1 text-[11px] outline-none hover:border-stone-500 cursor-pointer max-w-[140px]"
            title="快速插入规则判定常用句式"
          >
            <option value="" disabled>📝 规则常用句式...</option>
            <option value="进行一次 **灵巧 (Agility)** 反应掷骰，难度为 14。">灵巧反应检定 (DC 14)</option>
            <option value="进行一次 **力量 (Strength)** 检定，若失败则承受 1d8 物理伤害并标记 1 压力。">力量检定+伤害惩罚</option>
            <option value="当角色进入该区域时，进行一次 **本能 (Instinct)** 检定以察觉潜伏的危险。">本能察觉险情检定</option>
            <option value="角色可以花费 1 点希望，使本次掷骰直接获得优势。">花费希望换取优势</option>
            <option value="在短休期间，角色可以清除与其位阶相等的压力点数。">短休结算规则句式</option>
            <option value="GENERATE_TOC">📑 一键生成全书目录</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: 插入组件组 (Insert Components) */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-stone-800/80">
        <span className="text-[11px] font-bold text-stone-400 mr-1 flex items-center gap-1">
          <span>🧩</span> 插入:
        </span>

        {/* T 正文 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => handleBlockAction('text', '\n这里输入正文段落描述，描写生动的剧情、环境或背景细节...\n\n')}
          className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="插入标准正文段落"
        >
          <Type size={12} /> 正文
        </button>

        {/* H 小节 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => handleBlockAction('subsection', '\n## 新小节标题\n*这里是小节引言或环境基调描述*\n\n')}
          className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="插入带引言的新小节"
        >
          <Heading size={12} /> 小节
        </button>

        {/* 💬 朗读 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => handleBlockAction('read_aloud', '\n> 🎙️ **向玩家朗读：**\n> 这里的空气中弥漫着潮湿与古老的尘埃气息，石壁上的火把忽明忽暗...\n\n')}
          className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="插入场景向玩家朗读框 (Read Aloud)"
        >
          <MessageSquareQuote size={12} className="text-indigo-400" /> 朗读
        </button>

        {/* ℹ️ GM提示 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => handleBlockAction('callout', '\n{{note\n##### 🔒 GM 隐秘备忘与提示\n这里填写仅主持可见的隐秘DC、剧情线索与突发机制...\n}}\n\n')}
          className="px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="插入主持专属 GM 提示盒"
        >
          <AlertCircle size={12} className="text-orange-400" /> GM提示
        </button>

        {/* ⚔️ 敌人卡 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => handleBlockAction('enemy', '\n{{adversary\n## 渊面潜伏者\n### Tier 2 伏击者\navatar: https://i.imgur.com/example.png (circle)\nhealthDisplay: dots\n*阴影中浮现的异化甲壳生物，利齿滴落着腐蚀性黏液。*\n**动机与战术：** 埋伏突袭、分化队伍、猎杀落单目标\n\n{{descriptive\n**Difficulty:** 15 | **Thresholds:** 12/24 | **HP:** 6 | **Stress:** 5\n**ATK:** +3 | **骨刺穿刺:** 近战 (物理) | 2d8+4 伤害\n___\n**Experience:** 潜行与伪装 +2, 剧毒抗性 +3\n}}\n\n#### 特性\n**暗影潜伏 - 被动：** 在昏暗环境中潜行检定获得优势。\n**腐蚀喷射 - 动作：标记 1 压力** 对近距离目标造成 1d10 魔法伤害并使其【脆弱】。\n**断尾逃生 - 反应：花费 1 恐惧** 生命降至 2 以下时立即隐形并撤退至远距离。\n}}\n\n')}
          className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="插入带HP圆点与头像的敌对生物卡"
        >
          <Swords size={12} className="text-red-400" /> 敌人卡
        </button>

        {/* ⛰️ 环境卡 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => handleBlockAction('environment', '\n{{environment\n## 崩塌的古代祭坛\n### Tier 2 险境事件\ncountdown: 4 (每轮推进 1 格，满格时奥术风暴爆发)\n*古代祭坛在地震中摇摇欲坠，奥术能量不稳定地向四周溢出。*\n**潜在威胁：** 乱石坠落、奥术冲击、地面塌陷\n\n{{descriptive\n**Difficulty:** 14 | **范围:** 祭坛大厅 (近距离至远距离)\n}}\n\n#### 触发机制\n**能量震荡 - 倒计时结算：** 每轮结束时推进 1 格。满格时触发奥术风暴，全场角色进行反应掷骰。\n\n{{gmQuestion\n**GM 启发提问：** 当地面开裂时，哪位角色的随身道具险些滑落深渊？\n}}\n}}\n\n')}
          className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="插入带倒计时与提问的环境危机卡"
        >
          <Mountain size={12} className="text-emerald-400" /> 环境卡
        </button>

        {/* ⚖️ 检定/判定分歧 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => handleBlockAction('outcome', '\n{{outcome\n[hope,success] 突破封锁并在目标桌上发现绝密信件（获得 1 希望点）。\n[fear,success] 成功撬开大门，但发出的声响惊动了守卫（主持人获得 1 恐惧点）。\n[fear,failure] 警报被触发，两名精锐守卫围堵在走廊拐角。\n[critical] 完美潜入！不仅获得全部情报，还额外清除全队 1 压力点。\n}}\n\n')}
          className="px-2 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 rounded font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="插入5维希望/恐惧判定分歧矩阵"
        >
          <ListChecks size={12} className="text-teal-400" /> 检定
        </button>

        {/* 田 数据表 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => handleBlockAction('table', '\n{{DHTable\n| 物品/装备名称 | 位阶 (Tier) | 属性与类型 | 机制效果与结算说明 ||\n| :--- | :---: | :---: | :--- |\n| 逐暗者短刃 | Tier 1 | 近战 (物理) | 攻击昏暗中的目标时获得优势 |\n| 守护者重铠 | Tier 2 | 护甲槽 +2 | 受到物理伤害时可【标记 1 护甲槽】 |\n}}\n\n')}
          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="插入官方黑底大写表头数据表"
        >
          <TableIcon size={12} className="text-amber-400" /> 数据表
        </button>

        {/* 🖼️ 图片 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => handleBlockAction('image', '\n![插画说明描述](https://example.com/image.webp)\n\n')}
          className="px-2 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="插入配图插画"
        >
          <ImageIcon size={12} className="text-sky-400" /> 图片
        </button>

        {/* — 分割线 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => handleBlockAction('divider', '\n---\n\n')}
          className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="插入版面分割线 (---)"
        >
          <Minus size={12} /> 分割线
        </button>

        <div className="w-px h-3.5 bg-stone-700 mx-1 hidden sm:block" />

        {/* 版面控制: 通栏 / 分栏 / 分页 */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n{{wide\n# 通栏大标题\n*这里填写横跨两栏的通栏内容描述...*\n}}\n\n', '', '')}
          className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="通栏排版块"
        >
          <SplitSquareVertical size={12} /> 通栏
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n\\column\n\n', '', '')}
          className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="分栏符 (\\column)"
        >
          <Layers size={12} /> 分栏
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n\\page\n\n', '', '')}
          className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          title="分页符 (\\page)"
        >
          <FilePlus size={12} /> 分页
        </button>
      </div>
    </div>
  );
};
