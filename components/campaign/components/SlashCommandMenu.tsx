import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Skull, Table as TableIcon, BookOpen, 
  Quote, StickyNote, Sparkles, Flame, Zap, Heart, 
  Layers, Palette, SplitSquareVertical, FilePlus, 
  Clock, Image as ImageIcon, Cpu, Compass
} from 'lucide-react';

export interface SlashCommand {
  id: string;
  label: string;
  category: 'battle' | 'format' | 'tokens' | 'layout';
  keywords: string[]; // Chinese pinyin, shortcuts & english
  icon: React.ReactNode;
  template: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  // --- 战斗与规则卡片 ---
  {
    id: 'adversary',
    label: '👾 敌对生物数值卡 (带HP圆点与头像)',
    category: 'battle',
    keywords: ['dr', 'guai', 'adversary', 'enemy', 'statblock', 'duren', 'guaiwu'],
    icon: <Skull size={14} className="text-red-500" />,
    template: `\n{{adversary\n## 渊面潜伏者\n### Tier 2 伏击者\navatar: https://i.imgur.com/example.png (circle)\nhealthDisplay: dots\n*阴影中浮现的异化甲壳生物，利齿滴落着腐蚀性黏液。*\n**动机与战术：** 埋伏突袭、分化队伍、猎杀落单目标\n\n{{descriptive\n**Difficulty:** 15 | **Thresholds:** 12/24 | **HP:** 6 | **Stress:** 5\n**ATK:** +3 | **骨刺穿刺:** 近战 (物理) | 2d8+4 伤害\n___\n**Experience:** 潜行与伪装 +2, 剧毒抗性 +3\n}}\n\n#### 特性\n**暗影潜伏 - 被动：** 在昏暗环境中潜行检定获得优势。\n**腐蚀喷射 - 动作：标记 1 压力** 对近距离目标造成 1d10 魔法伤害并使其【脆弱】。\n**断尾逃生 - 反应：花费 1 恐惧** 生命降至 2 以下时立即隐形并后撤至远距离。\n}}\n`,
  },
  {
    id: 'outcome',
    label: '🎲 5维检定判定分歧卡 (希望/恐惧)',
    category: 'battle',
    keywords: ['fq', 'outcome', 'pan', 'fenqi', 'hope', 'fear'],
    icon: <Compass size={14} className="text-amber-500" />,
    template: `\n{{outcome\n[hope,success] 突破封锁并在桌上发现绝密信件（获得 1 希望点）。\n[fear,success] 成功撬开大门，但响声惊动了巡逻守卫（主持人获得 1 恐惧点）。\n[fear,failure] 警报被触发，两名精锐守卫围堵在走廊拐角。\n[critical] 完美潜入！不仅获得全部情报，还额外清除全队 1 压力点。\n}}\n`,
  },
  {
    id: 'environment',
    label: '🌪️ 环境危机与险境事件卡',
    category: 'battle',
    keywords: ['hj', 'env', 'huanjing', 'weiji', 'event', 'xianjing'],
    icon: <ShieldAlert size={14} className="text-sky-500" />,
    template: `\n{{environment\n## 崩塌的古代祭坛\n### Tier 2 险境事件\ncountdown: 4 (每轮推进 1 格，满格时奥术风暴爆发)\n*古代祭坛在地震中摇摇欲坠，奥术能量不稳定地向四周溢出。*\n**潜在威胁：** 乱石坠落、奥术冲击、地面塌陷\n\n{{descriptive\n**Difficulty:** 14 | **范围:** 祭坛大厅 (近距离至远距离)\n}}\n\n#### 触发机制\n**能量震荡 - 倒计时结算：** 每轮结束时推进 1 格。满格时触发奥术风暴，全场角色进行敏捷反应掷骰。\n\n{{gmQuestion\n**GM 启发提问：** 当地面开裂时，哪位角色的关键道具险些滑落深渊？\n}}\n}}\n`,
  },
  {
    id: 'cyberware',
    label: '🦾 赛博仿生义体卡 (科幻专属)',
    category: 'battle',
    keywords: ['yt', 'cyber', 'yiti', 'bionic', 'implant'],
    icon: <Cpu size={14} className="text-pink-500" />,
    template: `\n{{cyberware\nname: 螳螂刀刃 (Mantis Blades)\ntier: T2 | type: 仿生件 (Bionic) | zone: 上肢 (Arms) | slots: 1\nrestriction: 需要灵巧 +1 以上\ncompCost: 1.2w 信用点 | surgCost: 3000 信用点\ntag: 【高敏武器】\neffect: 展开腕部高频合金刃，近战攻击造成 2d8+3 物理伤害，并可在跳跃时作为攀爬支点。\n}}\n`,
  },

  // --- 高阶版式与大纲 ---
  {
    id: 'wide',
    label: '↔️ 通栏跨双栏排版块 (跨两栏横幅)',
    category: 'layout',
    keywords: ['tl', 'wide', 'tonglan', 'kualan', 'banner', 'hengfu'],
    icon: <SplitSquareVertical size={14} className="text-purple-500" />,
    template: `\n{{wide\n# 第一章：沉沦之城的低语\n*这里填写横跨左右双栏的通栏段落或史诗开篇大纲...*\n}}\n`,
  },
  {
    id: 'dhtable',
    label: '📊 官方黑底大写表头表格 (支持跨行跨列)',
    category: 'format',
    keywords: ['bg', 'tab', 'table', 'biaoge', 'dhtable'],
    icon: <TableIcon size={14} className="text-stone-700" />,
    template: `\n{{DHTable\n| 物品/装备名称 | 位阶 (Tier) | 属性与类型 | 机制效果与结算说明 ||\n| :--- | :---: | :---: | :--- |\n| 逐暗者短刃 | Tier 1 | 近战 (物理) | 攻击昏暗中的目标时获得优势 |\n| 守护者重铠 | Tier 2 | 护甲槽 +2 | 受到物理伤害时可【标记 1 护甲槽】 |\n}}\n`,
  },
  {
    id: 'toc',
    label: '📖 规则书自动目录大纲 (带点状引导线)',
    category: 'layout',
    keywords: ['ml', 'toc', 'mulu', 'contents', 'dagang'],
    icon: <BookOpen size={14} className="text-indigo-500" />,
    template: `\n{{toc\n# 战役目录\n- #### [{{ 序章：废墟上的启示}}{{ 4}}](#p4)\n- #### [{{ 第一章：幽暗地底潜行}}{{ 8}}](#p8)\n  - ##### [{{ 遭遇：守门石像鬼}}{{ 10}}](#p10)\n  - ##### [{{ 战利品与遗物}}{{ 14}}](#p14)\n- #### [{{ 附录：敌对生物速查}}{{ 22}}](#p22)\n}}\n`,
  },
  {
    id: 'column_break',
    label: '⑃ 强制双栏分栏符 (\\column)',
    category: 'layout',
    keywords: ['fl', 'col', 'column', 'fenlan'],
    icon: <Layers size={14} className="text-emerald-500" />,
    template: `\n\\column\n`,
  },
  {
    id: 'page_break',
    label: '📄 强制物理分页符 (\\page)',
    category: 'layout',
    keywords: ['fy', 'page', 'fenye', 'newpa'],
    icon: <FilePlus size={14} className="text-blue-500" />,
    template: `\n\\page\n`,
  },
  {
    id: 'spacer',
    label: '↕️ 弹性垂直留白行 (::)',
    category: 'layout',
    keywords: ['lb', 'space', 'liubai', 'kongge'],
    icon: <Clock size={14} className="text-stone-400" />,
    template: `\n::\n`,
  },
  {
    id: 'image_mask',
    label: '🖼️ 插画水墨/渐变羽化遮罩',
    category: 'format',
    keywords: ['yh', 'mask', 'yuhua', 'zhezhao', 'image', 'shuimo'],
    icon: <ImageIcon size={14} className="text-teal-500" />,
    template: `\n{{imageMaskEdge8,--offset:5%\n![插画描述](https://i.imgur.com/example.jpg){position:absolute,right:0%,top:-5%,height:100%}\n}}\n`,
  },
  {
    id: 'artist',
    label: '🏷️ 浮动画师与图源出处角标',
    category: 'format',
    keywords: ['hs', 'art', 'artist', 'huashi', 'chuchu', 'credit'],
    icon: <Palette size={14} className="text-amber-600" />,
    template: `\n{{artist,aLight,top:80px,right:30px\n##### 插画名称\n[画师署名](https://artstation.com)\n}}\n`,
  },
  {
    id: 'read_aloud',
    label: '📜 场景朗读框 (GM 开场白)',
    category: 'format',
    keywords: ['ld', 'flavor', 'langdu', 'quote', 'kaichang'],
    icon: <Quote size={14} className="text-amber-600" />,
    template: `\n> 浓雾在废弃神庙的石阶上翻滚，空气中弥漫着刺鼻的硫磺味与低语声...\n`,
  },
  {
    id: 'gm_note',
    label: '🔒 GM 隐秘备忘框',
    category: 'format',
    keywords: ['bw', 'note', 'beiwang', 'yinsi', 'mimi'],
    icon: <StickyNote size={14} className="text-indigo-600" />,
    template: `\n{{note\n##### 🔒 GM 隐秘备忘\n- 房间暗门需要进行洞察检定（难度 14）方可察觉。\n- 宝箱内藏有一柄带有诅咒印记的短剑。\n}}\n`,
  },

  // --- Daggerheart 规则代币 ---
  {
    id: 'token_hope',
    label: '🌟 【花费 1 希望点】',
    category: 'tokens',
    keywords: ['xw', 'hope', 'xiwang', 'huafeixiwang'],
    icon: <Sparkles size={14} className="text-amber-500" />,
    template: '【花费 1 希望点】',
  },
  {
    id: 'token_fear',
    label: '🔮 【花费 1 恐惧点】',
    category: 'tokens',
    keywords: ['kj', 'fear', 'kongju', 'huafeikongju'],
    icon: <Flame size={14} className="text-purple-500" />,
    template: '【花费 1 恐惧点】',
  },
  {
    id: 'token_stress',
    label: '⚡ 【标记 1 压力点】',
    category: 'tokens',
    keywords: ['yl', 'stress', 'yali', 'biaojiyali'],
    icon: <Zap size={14} className="text-yellow-500" />,
    template: '【标记 1 压力点】',
  },
  {
    id: 'token_hp',
    label: '❤️ 【标记 1 生命点】',
    category: 'tokens',
    keywords: ['sm', 'hp', 'shengming', 'xueliang'],
    icon: <Heart size={14} className="text-red-500" />,
    template: '【标记 1 生命点】',
  },
];

interface SlashCommandMenuProps {
  query: string;
  position: { top: number; left: number };
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  query,
  position,
  onSelect,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter commands by search query
  const filtered = SLASH_COMMANDS.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard events (Up/Down/Enter/Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-50 w-72 max-h-80 overflow-y-auto bg-stone-900/95 text-stone-200 border border-stone-700 rounded-xl shadow-2xl backdrop-blur-md p-1.5 text-xs select-none"
    >
      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-800 flex justify-between items-center mb-1">
        <span>快捷指令选单 ({filtered.length})</span>
        <span className="text-[9px] text-stone-500 font-mono">↑↓选择 / ↵插入</span>
      </div>

      <div className="space-y-0.5">
        {filtered.map((cmd, idx) => (
          <button
            key={cmd.id}
            type="button"
            onClick={() => onSelect(cmd)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
              idx === selectedIndex
                ? 'bg-amber-600/90 text-white font-medium shadow-xs'
                : 'hover:bg-stone-800 text-stone-300'
            }`}
          >
            <div className="shrink-0">{cmd.icon}</div>
            <div className="truncate font-sans text-[11px]">{cmd.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
