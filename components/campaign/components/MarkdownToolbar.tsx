import React from 'react';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  Quote, List, ListOrdered, Code, Table as TableIcon,
  Skull, Compass, ShieldAlert, Cpu, SplitSquareVertical,
  BookOpen, Layers, FilePlus, Sparkles, Flame, Zap, Heart,
  Palette, Image as ImageIcon, Indent, Outdent, StickyNote
} from 'lucide-react';

interface MarkdownToolbarProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  value?: string;
  onChange?: (newVal: string) => void;
  className?: string;
  compact?: boolean;
  onGenerateToc?: () => void;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  textareaRef,
  value,
  onChange,
  className = '',
  compact = false,
  onGenerateToc,
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
    e.preventDefault(); // Prevent stealing focus
  };

  return (
    <div className={`flex items-center gap-1.5 p-1.5 bg-stone-100/95 dark:bg-stone-800/95 border border-stone-200 dark:border-stone-700 rounded-t-lg text-xs text-stone-700 dark:text-stone-300 flex-wrap select-none shadow-xs ${className}`}>
      
      {/* Group 1: Basic Formatting */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('**', '**', '加粗文本')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-stone-600 rounded border border-stone-200 dark:border-stone-600 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="粗体 (Ctrl+B)"
        >
          <Bold size={13} />
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('*', '*', '斜体描述')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-stone-600 rounded border border-stone-200 dark:border-stone-600 italic flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="斜体 (Ctrl+I)"
        >
          <Italic size={13} />
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('==', '==', '高亮重点')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-stone-600 rounded border border-stone-200 dark:border-stone-600 text-amber-600 font-semibold flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="高亮 (Ctrl+U)"
        >
          <span className="underline decoration-amber-400 font-bold">U</span>
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('## ', '\n', '二级标题')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-stone-600 rounded border border-stone-200 dark:border-stone-600 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="二级标题 (Ctrl+2)"
        >
          <Heading2 size={13} />
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('### ', '\n', '三级标题')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-stone-600 rounded border border-stone-200 dark:border-stone-600 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="三级标题 (Ctrl+3)"
        >
          <Heading3 size={13} />
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('> ', '\n', '场景朗读或开场白描述...')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-stone-600 rounded border border-stone-200 dark:border-stone-600 flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="场景朗读框 (Ctrl+Q)"
        >
          <Quote size={13} />
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n{{note\n##### 🔒 GM 隐秘备忘\n这里填写仅主持可见的隐秘DC与剧情线索...\n}}\n', '', '')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-stone-600 rounded border border-stone-200 dark:border-stone-600 flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="GM 隐秘备忘框 (Ctrl+Shift+N)"
        >
          <StickyNote size={13} className="text-amber-600" />
        </button>
      </div>

      <div className="w-px h-4 bg-stone-300 dark:bg-stone-600 mx-0.5" />

      {/* Group 2: Daggerheart Core Specialized Blocks */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n{{adversary\n## 渊面潜伏者\n### Tier 2 伏击者\navatar: https://i.imgur.com/example.png (circle)\nhealthDisplay: dots\n*阴影中浮现的异化甲壳生物，利齿滴落着腐蚀性黏液。*\n**动机与战术：** 埋伏突袭、分化队伍、猎杀落单目标\n\n{{descriptive\n**Difficulty:** 15 | **Thresholds:** 12/24 | **HP:** 6 | **Stress:** 5\n**ATK:** +3 | **骨刺穿刺:** 近战 (物理) | 2d8+4 伤害\n___\n**Experience:** 潜行与伪装 +2, 剧毒抗性 +3\n}}\n\n#### 特性\n**暗影潜伏 - 被动：** 在昏暗环境中潜行检定获得优势。\n**腐蚀喷射 - 动作：标记 1 压力** 对近距离目标造成 1d10 魔法伤害并使其【脆弱】。\n**断尾逃生 - 反应：花费 1 恐惧** 生命降至 2 以下时立即隐形并撤退至远距离。\n}}\n', '', '')}
          className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-900 dark:text-red-300 rounded border border-red-300 dark:border-red-800 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="插入带HP圆点与头像的敌对生物卡 (Ctrl+Shift+A)"
        >
          <Skull size={12} /> +敌人卡
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n{{outcome\n[hope,success] 突破封锁并在目标桌上发现绝密信件（获得 1 希望点）。\n[fear,success] 成功撬开大门，但发出的声响惊动了守卫（主持人获得 1 恐惧点）。\n[fear,failure] 警报被触发，两名精锐守卫围堵在走廊拐角。\n[critical] 完美潜入！不仅获得全部情报，还额外清除全队 1 压力点。\n}}\n', '', '')}
          className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="插入5维希望/恐惧判定分歧卡 (Ctrl+Shift+O)"
        >
          <Compass size={12} /> +判定分歧
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n{{environment\n## 崩塌的古代祭坛\n### Tier 2 险境事件\ncountdown: 4 (每轮推进 1 格，满格时奥术风暴爆发)\n*古代祭坛在地震中摇摇欲坠，奥术能量不稳定地向四周溢出。*\n**潜在威胁：** 乱石坠落、奥术冲击、地面塌陷\n\n{{descriptive\n**Difficulty:** 14 | **范围:** 祭坛大厅 (近距离至远距离)\n}}\n\n#### 触发机制\n**能量震荡 - 倒计时结算：** 每轮结束时推进 1 格。满格时触发奥术风暴，全场角色进行反应掷骰。\n\n{{gmQuestion\n**GM 启发提问：** 当地面开裂时，哪位角色的随身道具险些滑落深渊？\n}}\n}}\n', '', '')}
          className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-900 dark:text-sky-300 rounded border border-sky-300 dark:border-sky-800 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="插入带倒计时与提问的环境危机卡 (Ctrl+Shift+E)"
        >
          <ShieldAlert size={12} /> +环境卡
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n{{DHTable\n| 物品/装备名称 | 位阶 (Tier) | 属性与类型 | 机制效果与结算说明 ||\n| :--- | :---: | :---: | :--- |\n| 逐暗者短刃 | Tier 1 | 近战 (物理) | 攻击昏暗中的目标时获得优势 |\n| 守护者重铠 | Tier 2 | 护甲槽 +2 | 受到物理伤害时可【标记 1 护甲槽】 |\n}}\n', '', '')}
          className="px-2 py-0.5 bg-stone-800 hover:bg-stone-900 text-white rounded border border-stone-900 font-bold flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="插入官方黑底大写表头表格 (Ctrl+Shift+T)"
        >
          <TableIcon size={12} /> +黑底表格
        </button>
      </div>

      <div className="w-px h-4 bg-stone-300 dark:bg-stone-600 mx-0.5" />

      {/* Group 3: Layout & Spacers */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n{{wide\n# 通栏大标题\n*这里填写横跨左右两栏的通栏引言或全景地图描述...*\n}}\n', '', '')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-purple-50 text-purple-900 dark:text-purple-300 rounded border border-stone-200 dark:border-stone-600 font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="通栏跨双栏排版块 (Ctrl+Shift+W)"
        >
          <SplitSquareVertical size={13} /> 通栏
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n\\column\n', '', '')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-300 rounded border border-stone-200 dark:border-stone-600 font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="强制双栏分栏符 (\\column)"
        >
          <Layers size={13} /> 分栏
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n\\page\n', '', '')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-blue-50 text-blue-800 dark:text-blue-300 rounded border border-stone-200 dark:border-stone-600 font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="强制物理分页符 (\\page) (Ctrl+Enter)"
        >
          <FilePlus size={13} /> 分页
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('\n::\n', '', '')}
          className="px-1.5 py-1 bg-white dark:bg-stone-700 hover:bg-stone-100 rounded border border-stone-200 dark:border-stone-600 font-mono text-[11px] transition-colors cursor-pointer shadow-2xs"
          title="弹性留白 (::)"
        >
          ::
        </button>
      </div>

      <div className="w-px h-4 bg-stone-300 dark:bg-stone-600 mx-0.5" />

      {/* Group 4: Quick Tokens */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('【花费 1 希望点】', '', '')}
          className="px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded border border-amber-300 font-medium text-[10px] transition-colors shadow-2xs cursor-pointer"
        >
          +希望
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('【花费 1 恐惧点】', '', '')}
          className="px-1.5 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded border border-purple-300 font-medium text-[10px] transition-colors shadow-2xs cursor-pointer"
        >
          +恐惧
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => insertText('【标记 1 压力点】', '', '')}
          className="px-1.5 py-0.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 rounded border border-yellow-300 font-medium text-[10px] transition-colors shadow-2xs cursor-pointer"
        >
          +压力
        </button>
      </div>

      {/* Official Term Dropdown */}
      <select
        onChange={handleSelectSnippet}
        defaultValue=""
        className="px-1.5 py-0.5 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded text-[11px] text-stone-700 dark:text-stone-200 outline-none hover:border-amber-400 font-sans cursor-pointer transition-colors shadow-2xs"
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
        className="px-1.5 py-0.5 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded text-[11px] text-stone-700 dark:text-stone-200 outline-none hover:border-amber-400 font-sans cursor-pointer transition-colors shadow-2xs"
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

      {/* Dropdown for More Templates & Sections */}
      <select
        onChange={handleSelectSnippet}
        defaultValue=""
        className="px-2 py-0.5 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded text-[11px] text-stone-700 dark:text-stone-200 outline-none hover:border-amber-400 font-sans cursor-pointer transition-colors shadow-2xs ml-auto"
        title="更多排版与专有组件"
      >
        <option value="" disabled>✨ 更多排版组件库...</option>
        <optgroup label="大纲与典籍目录">
          <option value="GENERATE_TOC">📑 一键全自动扫描生成战役目录 (TOC)</option>
          <option value={'\n{{toc\n# 战役目录\n- #### [{{ 序章：废墟上的启示}}{{ 4}}](#p4)\n- #### [{{ 第一章：幽暗地底潜行}}{{ 8}}](#p8)\n  - ##### [{{ 遭遇：守门石像鬼}}{{ 10}}](#p10)\n- #### [{{ 附录：战利品速查}}{{ 22}}](#p22)\n}}\n'}>📖 插入标准目录模板</option>
          <option value={'\n{{footnote 第一章：幽暗地底潜行}}\n{{pageNumber,auto}}\n'}>📄 插入页脚章节名与自增页码</option>
        </optgroup>
        <optgroup label="章节切口色标 (Side Tabs)">
          <option value={'\n{{Intro}}\n'}>🌟 序言切口 (暖金)</option>
          <option value={'\n{{Ch1,tab}}\n'}>🌲 第 1 章切口 (墨绿)</option>
          <option value={'\n{{Ch2,tab}}\n'}>🔥 第 2 章切口 (焦橙)</option>
          <option value={'\n{{Ch3,tab}}\n'}>🔮 第 3 章切口 (深紫)</option>
          <option value={'\n{{Ch4,tab}}\n'}>⚔️ 第 4 章切口 (赤红)</option>
          <option value={'\n{{Ch5,tab}}\n'}>🌊 第 5 章切口 (青蓝)</option>
          <option value={'\n{{app}}\n'}>📜 附录切口 (深灰)</option>
        </optgroup>
        <optgroup label="插图与署名">
          <option value={'\n{{imageMaskEdge8,--offset:5%\n![插画描述](https://i.imgur.com/example.jpg){position:absolute,right:0%,top:-5%,height:100%}\n}}\n'}>🖼️ 插画水墨/渐变羽化遮罩</option>
          <option value={'\n{{artist,aLight,top:80px,right:30px\n##### 插画名称\n[画师署名](https://artstation.com)\n}}\n'}>🏷️ 浮动画师与图源出处角标</option>
        </optgroup>
        <optgroup label="职业与特色组件">
          <option value={'\n{{cyberware\nname: 仿生强化义体\ntier: T2 | type: 仿生件 | zone: 躯干 | slots: 1\nrestriction: 需要体魄 +1 以上\ncompCost: 1.5w | surgCost: 3000\ntag: 【高负荷】\neffect: 受到物理伤害时少标记 1 生命点。\n}}\n'}>🦾 赛博义体卡 (Cyberware)</option>
          <option value={'\n{{questionSection\n{{block\n### 背景提问 (Background Questions)\n- 你是在哪个瞬间决定踏上冒险旅程的？\n\n### 玩家羁绊 (Connections)\n- 问问身旁的队友：你最信任我的哪一点？\n}}\n}}\n'}>💬 背景提问与角色羁绊连接</option>
        </optgroup>
      </select>
    </div>
  );
};
