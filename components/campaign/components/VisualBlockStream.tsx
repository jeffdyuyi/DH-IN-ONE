import React, { useState, useCallback, useRef } from 'react';
import { 
  Plus, Trash2, MoveUp, MoveDown, Copy, GripVertical, 
  MessageSquareQuote, AlertCircle, Swords, Mountain, ListChecks, 
  Table as TableIcon, Image as ImageIcon, Minus, Type, Heading,
  SlidersHorizontal, Star, Sparkles, BookOpen, ChevronDown, ChevronRight,
  Eye, Edit3, SplitSquareVertical, Layers, Check, X, ShieldAlert, Cpu
} from 'lucide-react';
import { 
  ProjectData, DynamicSection, ContentBlock, BlockType,
  EnemyBlock, EnvironmentBlock, OutcomeBlock, OutcomeEntry, OutcomeTag,
  CyberwareBlock
} from '../types';
import { SmartTextarea } from './SmartTextarea';

// Block type metadata
export const BLOCK_TYPE_CONFIGS: { type: BlockType; label: string; icon: any; color: string; badgeColor: string }[] = [
  { type: 'text', label: '正文', icon: Type, color: 'text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200', badgeColor: 'bg-stone-100 text-stone-700 border-stone-200' },
  { type: 'subsection', label: '小节', icon: Heading, color: 'text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200', badgeColor: 'bg-stone-100 text-stone-700 border-stone-200' },
  { type: 'read_aloud', label: '朗读', icon: MessageSquareQuote, color: 'text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { type: 'callout', label: 'GM提示', icon: AlertCircle, color: 'text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' },
  { type: 'enemy', label: '敌人卡', icon: Swords, color: 'text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100', badgeColor: 'bg-red-50 text-red-700 border-red-200' },
  { type: 'environment', label: '环境卡', icon: Mountain, color: 'text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { type: 'cyberware', label: '赛博义体', icon: Cpu, color: 'text-yellow-700 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100', badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { type: 'outcome', label: '检定', icon: ListChecks, color: 'text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200' },
  { type: 'table', label: '数据表', icon: TableIcon, color: 'text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100', badgeColor: 'bg-amber-50 text-amber-800 border-amber-200' },
  { type: 'image', label: '图片', icon: ImageIcon, color: 'text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200' },
  { type: 'divider', label: '分割线', icon: Minus, color: 'text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200', badgeColor: 'bg-stone-100 text-stone-600 border-stone-200' },
];

export const generateBlockId = () => 'b_' + Math.random().toString(36).substring(2, 9);

export const createDefaultContentBlock = (type: BlockType): ContentBlock => {
  let b: any = { id: generateBlockId(), type };
  if (type === 'text') b.content = '在此输入正文内容 (支持 Markdown 语法与格式工具)...';
  if (type === 'subsection') b.title = '小节标题';
  if (type === 'read_aloud') b.content = '在此输入朗读给玩家的场景氛围或开场白描述...';
  if (type === 'callout') { b.title = 'GM 隐秘提示'; b.content = '在此记录仅主持可见的隐秘DC、剧情线索与突发机制...'; b.variant = 'info'; }
  if (type === 'enemy') { 
    b.name = '渊面潜伏者'; b.englishName = 'LURKER'; b.tier = 2; b.enemyType = '伏击者'; b.tactics = '埋伏突袭、分化队伍'; 
    b.isNpcMode = false; b.avatarUrl = ''; b.avatarShape = 'circle'; b.healthDisplay = 'both';
    b.flavor = '异化甲壳生物，利齿滴落着腐蚀性黏液。'; b.experiences = '潜行与伪装 +2, 剧毒抗性 +3';
    b.stats = { difficulty: 15, hp: 6, stress: 5, thresholdMinor: 12, thresholdMajor: 24 }; 
    b.attack = { name: '骨刺穿刺', modifier: '+3', damage: '2d8+4', damageType: 'physical', range: '近战范围' }; 
    b.traits = [
      { id: generateBlockId(), name: '暗影潜伏', type: 'passive', description: '在昏暗环境中潜行检定获得优势。', flavor: '', isSpecial: false }
    ]; 
  }
  if (type === 'environment') { 
    b.name = '崩塌的古代祭坛'; b.englishName = 'COLLAPSING ALTAR'; b.difficulty = 14; b.features = []; b.tier = 2; 
    b.imageUrl = ''; b.description = '古代祭坛在地震中摇摇欲坠，奥术能量不稳定地向四周溢出。'; b.envType = '险境'; b.trend = ''; b.potentialEnemies = ''; 
  }
  if (type === 'cyberware') {
    b.name = '微型皮下线圈';
    b.tier = 'T1';
    b.cyberType = '植入体 (Implant)';
    b.zone = '上肢 (Arms)';
    b.slots = '1';
    b.restriction = '需要灵巧 +1 以上';
    b.effect = '你的徒手近战攻击视为具有【迅捷】特性。';
    b.tag = '';
    b.compCost = '1.5w 信用点';
    b.surgCost = '5000 信用点';
    b.description = '精密的皮下微型伺服电机与神经脉冲传导线圈。';
    b.creator = 'GM';
    b.owner = '-';
  }
  if (type === 'table') { 
    b.headers = ['物品/装备名称', '位阶', '属性类型', '效果说明']; 
    b.rows = [
      ['逐暗者短刃', 'Tier 1', '近战 (物理)', '攻击昏暗中的目标时获得优势'],
      ['守护者重铠', 'Tier 2', '护甲槽 +2', '受到物理伤害时可【标记 1 护甲槽】']
    ]; 
  }
  if (type === 'outcome') { 
    b.entries = [
      { id: generateBlockId(), tags: ['success', 'hope'], content: '突破封锁并在目标桌上发现绝密信件（获得 1 希望点）。' },
      { id: generateBlockId(), tags: ['success', 'fear'], content: '成功撬开大门，但发出的声响惊动了守卫（主持人获得 1 恐惧点）。' },
      { id: generateBlockId(), tags: ['failure', 'fear'], content: '警报被触发，两名精锐守卫围堵在走廊拐角。' },
      { id: generateBlockId(), tags: ['critical'], content: '完美潜入！不仅获得全部情报，还额外清除全队 1 压力点。' }
    ]; 
  }
  if (type === 'divider') { /* empty */ }
  if (type === 'image') { b.url = ''; b.caption = ''; }
  return b;
};

// --- Helper: Ghost Inserter between blocks ---
const GhostBlockInserter: React.FC<{ onInsert: (t: BlockType) => void }> = ({ onInsert }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative py-1 group/ghost my-0.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-transparent group-hover/ghost:bg-amber-400/40 transition-colors" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs ${
            isOpen 
              ? 'bg-amber-600 text-white border-amber-600 shadow-md opacity-100 scale-100' 
              : 'opacity-0 group-hover/ghost:opacity-100 bg-white text-stone-500 border-stone-200 hover:border-amber-400 hover:text-amber-700 hover:shadow-xs scale-95 hover:scale-100'
          }`}
          title="在此插入内容块"
        >
          <Plus className="w-3 h-3" />
          <span>{isOpen ? '收起' : '+ 插入内容块'}</span>
        </button>
        <div className="flex-1 h-px bg-transparent group-hover/ghost:bg-amber-400/40 transition-colors" />
      </div>

      {isOpen && (
        <div className="mt-2 p-3 bg-white border border-amber-200 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-1 z-20 space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <Plus className="w-3 h-3 text-amber-600" /> 选择插入的内容块类型:
            </span>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-start items-center">
            {BLOCK_TYPE_CONFIGS.map(cfg => {
              const Icon = cfg.icon;
              return (
                <button
                  key={cfg.type}
                  type="button"
                  onClick={() => {
                    onInsert(cfg.type);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-stone-200/80 transition-all cursor-pointer shadow-2xs ${cfg.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface VisualBlockStreamProps {
  projectData: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
  onRegisterFocus?: (ref: any, setter: (val: string) => void) => void;
  onScrollToSection?: string | null;
}

export const VisualBlockStream: React.FC<VisualBlockStreamProps> = ({
  projectData,
  onUpdateProject,
  onRegisterFocus,
  onScrollToSection,
}) => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const settings = projectData.settings || {};

  // Update Section Helpers
  const updateSection = useCallback((secId: string, updates: Partial<DynamicSection>) => {
    onUpdateProject(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === secId ? { ...s, ...updates } : s)
    }));
  }, [onUpdateProject]);

  const addSection = useCallback((afterIndex: number = -1) => {
    const newSec: DynamicSection = {
      id: 'sec_' + Math.random().toString(36).substring(2, 9),
      title: '新章节小节',
      level: 2,
      blocks: [createDefaultContentBlock('text')]
    };
    onUpdateProject(prev => {
      const sections = [...(prev.sections || [])];
      if (afterIndex >= 0 && afterIndex < sections.length) {
        sections.splice(afterIndex + 1, 0, newSec);
      } else {
        sections.push(newSec);
      }
      return { ...prev, sections };
    });
  }, [onUpdateProject]);

  const removeSection = useCallback((secId: string) => {
    if (window.confirm('确定要删除此章节及其所有内容块吗？')) {
      onUpdateProject(prev => ({
        ...prev,
        sections: (prev.sections || []).filter(s => s.id !== secId)
      }));
    }
  }, [onUpdateProject]);

  // Block level helpers within a section
  const updateBlock = useCallback((secId: string, blockId: string, updates: any) => {
    onUpdateProject(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => {
        if (s.id !== secId) return s;
        return {
          ...s,
          blocks: s.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b)
        };
      })
    }));
  }, [onUpdateProject]);

  const insertBlockAt = useCallback((secId: string, index: number, type: BlockType) => {
    const newBlock = createDefaultContentBlock(type);
    onUpdateProject(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => {
        if (s.id !== secId) return s;
        const blocks = [...s.blocks];
        blocks.splice(index, 0, newBlock);
        return { ...s, blocks };
      })
    }));
  }, [onUpdateProject]);

  const removeBlock = useCallback((secId: string, blockId: string) => {
    onUpdateProject(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => {
        if (s.id !== secId) return s;
        return {
          ...s,
          blocks: s.blocks.filter(b => b.id !== blockId)
        };
      })
    }));
  }, [onUpdateProject]);

  const moveBlock = useCallback((secId: string, blockIndex: number, direction: 'up' | 'down') => {
    onUpdateProject(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => {
        if (s.id !== secId) return s;
        const blocks = [...s.blocks];
        const targetIdx = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
        if (targetIdx < 0 || targetIdx >= blocks.length) return s;
        [blocks[blockIndex], blocks[targetIdx]] = [blocks[targetIdx], blocks[blockIndex]];
        return { ...s, blocks };
      })
    }));
  }, [onUpdateProject]);

  const duplicateBlock = useCallback((secId: string, blockIndex: number) => {
    onUpdateProject(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => {
        if (s.id !== secId) return s;
        const blocks = [...s.blocks];
        const original = blocks[blockIndex];
        const cloned = { ...JSON.parse(JSON.stringify(original)), id: generateBlockId() };
        blocks.splice(blockIndex + 1, 0, cloned);
        return { ...s, blocks };
      })
    }));
  }, [onUpdateProject]);

  return (
    <div className="w-full space-y-6 pb-20 select-text">
      
      {/* 1. Story Metadata & Overview Card (Respects 8 switches) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all duration-200">
        <div 
          onClick={() => setIsOverviewOpen(!isOverviewOpen)}
          className="flex items-center justify-between p-4 bg-stone-50/80 hover:bg-stone-50 cursor-pointer border-b border-stone-100"
        >
          <div className="flex items-center gap-2 font-bold text-stone-800 text-sm">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>战役元数据与故事架构</span>
            <span className="text-[11px] text-stone-400 font-normal ml-2">
              (依据右上角版面显示开关动态显隐)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-bold">{isOverviewOpen ? '收起' : '展开'}</span>
            {isOverviewOpen ? <ChevronDown size={15} className="text-stone-400" /> : <ChevronRight size={15} className="text-stone-400" />}
          </div>
        </div>

        {isOverviewOpen && (
          <div className="p-5 space-y-4">
            {/* Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">战役标题</label>
                <input
                  type="text"
                  value={projectData.title || ''}
                  onChange={(e) => onUpdateProject(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-transparent border-b border-stone-200 px-1 py-1.5 focus:border-amber-500 outline-none text-base font-bold text-stone-900 placeholder:text-stone-300"
                  placeholder="战役模组名称..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">作者 / 设计团队</label>
                <input
                  type="text"
                  value={projectData.author || ''}
                  onChange={(e) => onUpdateProject(p => ({ ...p, author: e.target.value }))}
                  className="w-full bg-transparent border-b border-stone-200 px-1 py-1.5 focus:border-amber-500 outline-none text-sm text-stone-800 placeholder:text-stone-300"
                  placeholder="例如：不咕鸟（基德）"
                />
              </div>
            </div>

            {/* Switch 1: Concept */}
            {settings.showConcept && (
              <div className="space-y-1 pt-2 border-t border-stone-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <span>1. 核心概念 (HIGH CONCEPT)</span>
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={projectData.concept || ''}
                  onChange={(e) => onUpdateProject(p => ({ ...p, concept: e.target.value }))}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg p-2.5 text-xs leading-relaxed outline-none focus:border-amber-500 focus:bg-white resize-y text-stone-800"
                  placeholder="例如：在核火中重塑的赛博都市，佣兵们游走于巨头版图之间..."
                />
              </div>
            )}

            {/* Switch 2 & 3: Complexity & Level Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              {settings.showComplexity && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">2. 复杂度评级</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => onUpdateProject(p => ({ ...p, complexity: star }))}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        title={`设为 ${star} 星复杂度`}
                      >
                        <Star className={`w-4 h-4 ${star <= (projectData.complexity || 3) ? 'fill-current' : 'opacity-25'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-stone-500 ml-2">
                      ({projectData.complexity || 3}/5 星)
                    </span>
                  </div>
                </div>
              )}

              {settings.showLevelRange && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">3. 适用等级</label>
                  <input
                    type="text"
                    value={projectData.levelRange || ''}
                    onChange={(e) => onUpdateProject(p => ({ ...p, levelRange: e.target.value }))}
                    className="w-full bg-transparent border-b border-stone-200 py-1 text-xs outline-none focus:border-amber-500 text-stone-800 font-bold"
                    placeholder="例如：1-10 级 或 Tier 1-2"
                  />
                </div>
              )}
            </div>

            {/* Switch 7: Tone / Themes / Inspiration (3-column neat grid) */}
            {settings.showToneThemes && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">7. 基调 / 主题 / 灵感</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block mb-0.5">基调 (Tone)</span>
                    <input
                      type="text"
                      value={projectData.tone || ''}
                      onChange={(e) => onUpdateProject(p => ({ ...p, tone: e.target.value }))}
                      className="w-full bg-stone-50/60 border border-stone-200 rounded px-2 py-1 text-xs outline-none focus:border-amber-500 text-stone-800"
                      placeholder="快意恩仇、街头传奇..."
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block mb-0.5">主题 (Themes)</span>
                    <input
                      type="text"
                      value={projectData.themes || ''}
                      onChange={(e) => onUpdateProject(p => ({ ...p, themes: e.target.value }))}
                      className="w-full bg-stone-50/60 border border-stone-200 rounded px-2 py-1 text-xs outline-none focus:border-amber-500 text-stone-800"
                      placeholder="扬名立万、打破枷锁..."
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block mb-0.5">灵感 (Inspiration)</span>
                    <input
                      type="text"
                      value={projectData.inspiration || ''}
                      onChange={(e) => onUpdateProject(p => ({ ...p, inspiration: e.target.value }))}
                      className="w-full bg-stone-50/60 border border-stone-200 rounded px-2 py-1 text-xs outline-none focus:border-amber-500 text-stone-800"
                      placeholder="赛博朋克2077、银翼杀手..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Switch 4: Introduction */}
            {settings.showIntroduction && (
              <div className="space-y-1 pt-2 border-t border-stone-100">
                <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">4. 简介与导言 (INTRODUCTION)</label>
                <textarea
                  rows={3}
                  value={projectData.introduction || ''}
                  onChange={(e) => onUpdateProject(p => ({ ...p, introduction: e.target.value }))}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg p-2.5 text-xs leading-relaxed outline-none focus:border-amber-500 focus:bg-white resize-y text-stone-800"
                  placeholder="在此输入战役简介，向玩家介绍模组的故事框架与阅读引导..."
                />
              </div>
            )}

            {/* Switch 5: Summary */}
            {settings.showSummary && (
              <div className="space-y-1 pt-2 border-t border-stone-100">
                <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">5. 模组概要 (SUMMARY)</label>
                <textarea
                  rows={3}
                  value={projectData.summary || ''}
                  onChange={(e) => onUpdateProject(p => ({ ...p, summary: e.target.value }))}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg p-2.5 text-xs leading-relaxed outline-none focus:border-amber-500 focus:bg-white resize-y text-stone-800"
                  placeholder="在此输入模组剧情概要与主线脉络..."
                />
              </div>
            )}

            {/* Switch 6: Prologue */}
            {settings.showPrologue && (
              <div className="space-y-1 pt-2 border-t border-stone-100">
                <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">6. 序言开场白 (PROLOGUE)</label>
                <textarea
                  rows={3}
                  value={projectData.prologue || ''}
                  onChange={(e) => onUpdateProject(p => ({ ...p, prologue: e.target.value }))}
                  className="w-full bg-stone-50/50 border border-stone-200 rounded-lg p-2.5 text-xs leading-relaxed outline-none focus:border-amber-500 focus:bg-white resize-y text-stone-800"
                  placeholder="在此输入序言文本或开场白朗读..."
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Dynamic Sections & Content Blocks Stream */}
      {(projectData.sections || []).map((sec, sIdx) => {
        return (
          <section 
            key={sec.id} 
            id={`editor-section-${sec.id}`}
            className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-6 space-y-4 transition-all duration-200 relative group/section"
          >
            {/* Section Header Bar */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-stone-100 gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                {/* Level Badges */}
                <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg shrink-0">
                  {[
                    { l: 1 as const, label: 'H1 卷' },
                    { l: 2 as const, label: 'H2 幕' },
                    { l: 3 as const, label: 'H3 场' },
                    { l: 4 as const, label: 'H4 节' },
                  ].map(opt => (
                    <button
                      key={opt.l}
                      type="button"
                      onClick={() => updateSection(sec.id, { level: opt.l })}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                        (sec.level || 2) === opt.l
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={sec.title || ''}
                  onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                  className="font-bold text-base text-stone-900 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-amber-500 outline-none flex-1 py-1 px-1 transition-colors"
                  placeholder="章节/小节标题..."
                />
              </div>

              {/* Section Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Column Mode */}
                <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => updateSection(sec.id, { columnMode: 'full' })}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      sec.columnMode !== 'cols' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                    }`}
                  >
                    📄 单栏
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSection(sec.id, { columnMode: 'cols' })}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      sec.columnMode === 'cols' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-stone-500'
                    }`}
                  >
                    📰 双栏
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeSection(sec.id)}
                  className="p-1 hover:bg-red-50 text-stone-300 hover:text-red-500 rounded transition-colors cursor-pointer"
                  title="删除此章节"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Section Italic Note */}
            <input
              type="text"
              value={sec.italicNote || ''}
              onChange={(e) => updateSection(sec.id, { italicNote: e.target.value })}
              className="w-full text-xs italic text-stone-600 bg-transparent border-b border-stone-100 hover:border-stone-200 focus:border-amber-400 py-1 outline-none font-serif placeholder:text-stone-300"
              placeholder="添加章节引言、场景描述或副标题 (可选)..."
            />

            {/* Section Content Blocks List with Focus-Driven Elevation */}
            <div className="space-y-3 pt-2">
              <GhostBlockInserter onInsert={(t) => insertBlockAt(sec.id, 0, t)} />

              {(sec.blocks || []).map((block, bIdx) => {
                const config = BLOCK_TYPE_CONFIGS.find(c => c.type === block.type) || BLOCK_TYPE_CONFIGS[0];
                const Icon = config.icon;

                return (
                  <React.Fragment key={block.id}>
                    <div 
                      className="group/block relative bg-white rounded-xl border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-400/60 focus-within:shadow-md focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-400 transition-all duration-200 overflow-hidden"
                    >
                      {/* Quiet Header: Type Badge (Left) & Elevated Actions (Right - Fades in on Hover/Focus) */}
                      <div className="flex items-center justify-between px-3 py-1.5 bg-stone-50/70 border-b border-stone-100/80 select-none">
                        <div className="flex items-center gap-1.5">
                          <GripVertical size={12} className="text-stone-300" />
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${config.badgeColor}`}>
                            <Icon size={11} />
                            <span>{config.label}</span>
                          </span>
                        </div>

                        {/* Action Buttons: Fades in on Hover/Focus */}
                        <div className="flex items-center gap-1 opacity-0 group-hover/block:opacity-100 group-focus-within/block:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => duplicateBlock(sec.id, bIdx)}
                            className="p-1 hover:bg-stone-200 text-stone-500 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                            title="在下方复制一份"
                          >
                            <Copy size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={bIdx === 0}
                            onClick={() => moveBlock(sec.id, bIdx, 'up')}
                            className="p-1 hover:bg-stone-200 text-stone-500 disabled:opacity-20 rounded cursor-pointer"
                            title="上移"
                          >
                            <MoveUp size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={bIdx === (sec.blocks.length - 1)}
                            onClick={() => moveBlock(sec.id, bIdx, 'down')}
                            className="p-1 hover:bg-stone-200 text-stone-500 disabled:opacity-20 rounded cursor-pointer"
                            title="下移"
                          >
                            <MoveDown size={11} />
                          </button>
                          <div className="w-px h-2.5 bg-stone-300 mx-0.5" />
                          <button
                            type="button"
                            onClick={() => removeBlock(sec.id, block.id)}
                            className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded cursor-pointer"
                            title="删除此块"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Content Form Editor */}
                      <div className="p-3 sm:p-4">
                        <VisualBlockItemEditor
                          block={block}
                          onUpdate={(updates) => updateBlock(sec.id, block.id, updates)}
                          onRegisterFocus={onRegisterFocus}
                        />
                      </div>
                    </div>

                    <GhostBlockInserter onInsert={(t) => insertBlockAt(sec.id, bIdx + 1, t)} />
                  </React.Fragment>
                );
              })}

              {(!sec.blocks || sec.blocks.length === 0) && (
                <div className="text-center py-6 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-xs italic">
                  本章节暂无内容，使用上方的虚线按钮添加第一个积木块
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Bottom: Add New Section Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => addSection(-1)}
          className="w-full py-3.5 bg-amber-50/60 hover:bg-amber-100 text-amber-900 border border-dashed border-amber-300 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={15} className="text-amber-600" />
          <span>+ 新建章节小节</span>
        </button>
      </div>
    </div>
  );
};

// --- Individual Visual Block Form Editors ---
const VisualBlockItemEditor: React.FC<{
  block: ContentBlock;
  onUpdate: (updates: any) => void;
  onRegisterFocus?: any;
}> = ({ block, onUpdate, onRegisterFocus }) => {
  switch (block.type) {
    case 'text':
      return (
        <SmartTextarea
          value={block.content || ''}
          onChangeValue={(val) => onUpdate({ content: val })}
          onRegisterFocus={onRegisterFocus}
          showToolbar={false}
          minRows={4}
          placeholder="在此输入正文内容 (支持 Markdown 语法与上方工具栏)..."
        />
      );

    case 'read_aloud':
      return (
        <div className="flex gap-3">
          <div className="w-1 bg-indigo-400 rounded-full shrink-0" />
          <div className="flex-1">
            <SmartTextarea
              value={block.content || ''}
              onChangeValue={(val) => onUpdate({ content: val })}
              onRegisterFocus={onRegisterFocus}
              showToolbar={false}
              minRows={3}
              placeholder="输入向玩家朗读的场景描述或开场白..."
            />
          </div>
        </div>
      );

    case 'callout':
      return (
        <div className={`p-3 rounded-lg border space-y-2.5 ${
          block.variant === 'warning' ? 'bg-red-50/50 border-red-200' :
          block.variant === 'tip' ? 'bg-amber-50/50 border-amber-200' :
          'bg-stone-50/60 border-stone-200'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-stone-500">GM 提示盒</span>
            <div className="flex gap-1.5">
              <button 
                type="button" 
                onClick={() => onUpdate({ variant: 'info' })} 
                className={`w-3.5 h-3.5 rounded-full bg-stone-400 hover:ring-2 cursor-pointer ${block.variant === 'info' || !block.variant ? 'ring-2 ring-stone-600' : ''}`} 
                title="信息提示" 
              />
              <button 
                type="button" 
                onClick={() => onUpdate({ variant: 'tip' })} 
                className={`w-3.5 h-3.5 rounded-full bg-amber-400 hover:ring-2 cursor-pointer ${block.variant === 'tip' ? 'ring-2 ring-amber-600' : ''}`} 
                title="技巧建议" 
              />
              <button 
                type="button" 
                onClick={() => onUpdate({ variant: 'warning' })} 
                className={`w-3.5 h-3.5 rounded-full bg-red-400 hover:ring-2 cursor-pointer ${block.variant === 'warning' ? 'ring-2 ring-red-600' : ''}`} 
                title="危险警告" 
              />
            </div>
          </div>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full font-bold text-xs text-stone-800 bg-transparent border-b border-stone-200 focus:border-amber-500 py-1 outline-none placeholder:text-stone-400"
            placeholder="提示标题..."
          />
          <SmartTextarea
            value={block.content || ''}
            onChangeValue={(val) => onUpdate({ content: val })}
            onRegisterFocus={onRegisterFocus}
            showToolbar={false}
            minRows={2}
            placeholder="提示内容详情..."
          />
        </div>
      );

    case 'subsection':
      return (
        <input
          type="text"
          value={block.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="font-bold text-lg text-stone-800 w-full border-b border-transparent hover:border-stone-200 focus:border-amber-500 py-1.5 outline-none transition-all placeholder:text-stone-300"
          placeholder="小节标题..."
        />
      );

    case 'divider':
      return (
        <div className="h-4 flex items-center justify-center">
          <div className="w-full border-t border-stone-300 border-dashed" />
        </div>
      );

    case 'image':
      return (
        <div className="space-y-3">
          {block.url ? (
            <div className="h-48 bg-stone-50 rounded-lg flex items-center justify-center overflow-hidden border border-stone-200 relative group">
              <img src={block.url} alt={block.caption || '图片'} className="h-full object-contain" />
              <button 
                type="button"
                onClick={() => onUpdate({ url: '' })}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full text-xs cursor-pointer"
                title="移除图片"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-stone-200 rounded-lg text-center text-xs text-stone-400 space-y-2">
              <ImageIcon className="w-6 h-6 mx-auto opacity-50" />
              <span>输入下方图片 URL 即可显示插图</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={block.url || ''}
              onChange={(e) => onUpdate({ url: e.target.value })}
              className="w-full bg-transparent border-b border-stone-200 px-1 py-1 text-xs outline-none focus:border-amber-500 text-stone-800"
              placeholder="图片 URL 地址..."
            />
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              className="w-full bg-transparent border-b border-stone-200 px-1 py-1 text-xs outline-none focus:border-amber-500 text-stone-800"
              placeholder="图片说明文字 (可选)..."
            />
          </div>
        </div>
      );

    case 'enemy':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-red-50/30 p-3 rounded-xl border border-red-100">
            <div>
              <label className="text-[10px] font-bold text-stone-500 block mb-0.5">敌人名称</label>
              <input
                type="text"
                value={block.name || ''}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full bg-transparent border-b border-stone-200 py-1 text-xs font-bold text-stone-800 outline-none focus:border-red-500"
                placeholder="例如：锯齿刀强盗"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 block mb-0.5">位阶 (Tier)</label>
              <select
                value={block.tier || 1}
                onChange={(e) => onUpdate({ tier: parseInt(e.target.value) })}
                className="w-full bg-transparent border-b border-stone-200 py-1 text-xs font-bold text-stone-700 outline-none cursor-pointer"
              >
                <option value={1}>Tier 1</option>
                <option value={2}>Tier 2</option>
                <option value={3}>Tier 3</option>
                <option value={4}>Tier 4</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 block mb-0.5">类型</label>
              <input
                type="text"
                value={block.enemyType || ''}
                onChange={(e) => onUpdate({ enemyType: e.target.value })}
                className="w-full bg-transparent border-b border-stone-200 py-1 text-xs text-stone-800 outline-none focus:border-red-500"
                placeholder="标准/斗士/头目/伏击者"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50/60 p-3 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-[10px] text-stone-400 font-bold block">难度 (DC)</span>
              <input
                type="number"
                value={block.stats?.difficulty || 12}
                onChange={(e) => onUpdate({ stats: { ...block.stats, difficulty: parseInt(e.target.value) } })}
                className="w-full bg-transparent border-b border-stone-200 py-1 font-bold outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-bold block">微创/重创阈值</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={block.stats?.thresholdMinor || 10}
                  onChange={(e) => onUpdate({ stats: { ...block.stats, thresholdMinor: parseInt(e.target.value) } })}
                  className="w-12 bg-transparent border-b border-stone-200 py-1 outline-none text-center"
                />
                <span>/</span>
                <input
                  type="number"
                  value={block.stats?.thresholdMajor || 20}
                  onChange={(e) => onUpdate({ stats: { ...block.stats, thresholdMajor: parseInt(e.target.value) } })}
                  className="w-12 bg-transparent border-b border-stone-200 py-1 outline-none text-center"
                />
              </div>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-bold block">HP (生命槽)</span>
              <input
                type="number"
                value={block.stats?.hp || 5}
                onChange={(e) => onUpdate({ stats: { ...block.stats, hp: parseInt(e.target.value) } })}
                className="w-full bg-transparent border-b border-stone-200 py-1 font-bold text-red-600 outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-bold block">压力 (Stress)</span>
              <input
                type="number"
                value={block.stats?.stress || 3}
                onChange={(e) => onUpdate({ stats: { ...block.stats, stress: parseInt(e.target.value) } })}
                className="w-full bg-transparent border-b border-stone-200 py-1 font-bold text-amber-600 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold block">动机与战术 (Tactics)</span>
            <input
              type="text"
              value={block.tactics || ''}
              onChange={(e) => onUpdate({ tactics: e.target.value })}
              className="w-full bg-transparent border-b border-stone-200 py-1 text-xs outline-none focus:border-red-500 text-stone-800"
              placeholder="例如：埋伏突袭、优先攻击后排施法者..."
            />
          </div>
        </div>
      );

    case 'outcome':
      return (
        <div className="bg-teal-50/30 p-3 rounded-xl border border-teal-100 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-teal-800">
            <span className="flex items-center gap-1"><ListChecks size={13} /> 检定分歧判定矩阵</span>
            <button
              type="button"
              onClick={() => onUpdate({
                entries: [...(block.entries || []), { id: generateBlockId(), tags: ['success'], content: '' }]
              })}
              className="text-[10px] bg-white text-teal-700 border border-teal-200 px-2 py-0.5 rounded font-bold cursor-pointer hover:bg-teal-50"
            >
              + 添加结果分支
            </button>
          </div>
          <div className="space-y-2">
            {(block.entries || []).map((entry: OutcomeEntry) => (
              <div key={entry.id} className="bg-white p-2.5 rounded-lg border border-teal-100 space-y-1.5">
                <div className="flex flex-wrap gap-1">
                  {(['critical', 'success', 'failure', 'hope', 'fear'] as OutcomeTag[]).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const newTags = entry.tags?.includes(tag)
                          ? entry.tags.filter(t => t !== tag)
                          : [...(entry.tags || []), tag];
                        onUpdate({
                          entries: block.entries?.map(e => e.id === entry.id ? { ...e, tags: newTags } : e)
                        });
                      }}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        entry.tags?.includes(tag)
                          ? tag === 'hope' ? 'bg-sky-100 text-sky-700 border-sky-300' :
                            tag === 'fear' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                            tag === 'critical' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            tag === 'success' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                            'bg-red-100 text-red-700 border-red-300'
                          : 'bg-stone-50 text-stone-400 border-stone-200'
                      }`}
                    >
                      {tag === 'critical' ? '关键成功' : tag === 'success' ? '成功' : tag === 'failure' ? '失败' : tag === 'hope' ? '希望' : '恐惧'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onUpdate({
                      entries: block.entries?.filter(e => e.id !== entry.id)
                    })}
                    className="ml-auto text-stone-300 hover:text-red-500 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={entry.content || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdate({
                      entries: block.entries?.map(item => item.id === entry.id ? { ...item, content: val } : item)
                    });
                  }}
                  className="w-full text-xs text-stone-800 bg-transparent outline-none resize-none placeholder:text-stone-300"
                  placeholder="在此输入判定结果结算描述..."
                />
              </div>
            ))}
          </div>
        </div>
      );

    case 'table':
      return (
        <div className="space-y-2">
          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100 border-b border-stone-200 font-bold text-stone-700">
                <tr>
                  {(block.headers || []).map((h: string, hi: number) => (
                    <th key={hi} className="p-2 border-r border-stone-200 last:border-0">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const nh = [...block.headers];
                          nh[hi] = e.target.value;
                          onUpdate({ headers: nh });
                        }}
                        className="w-full bg-transparent font-bold outline-none text-stone-800"
                        placeholder={`列 ${hi + 1}`}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(block.rows || []).map((row: string[], ri: number) => (
                  <tr key={ri} className="border-b border-stone-100 last:border-0 bg-white">
                    {row.map((cell: string, ci: number) => (
                      <td key={ci} className="p-2 border-r border-stone-100 last:border-0">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const nr = [...block.rows];
                            nr[ri][ci] = e.target.value;
                            onUpdate({ rows: nr });
                          }}
                          className="w-full bg-transparent outline-none text-stone-700"
                          placeholder="单元格..."
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onUpdate({ rows: [...(block.rows || []), new Array(block.headers.length).fill('')] })}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded font-bold text-stone-600 cursor-pointer"
            >
              + 添加行
            </button>
            <button
              type="button"
              onClick={() => {
                const nh = [...block.headers, '新列'];
                const nr = (block.rows || []).map((r: string[]) => [...r, '']);
                onUpdate({ headers: nh, rows: nr });
              }}
              className="text-[11px] px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded font-bold text-stone-600 cursor-pointer"
            >
              + 添加列
            </button>
          </div>
        </div>
      );

    default:
      return <div className="text-xs text-stone-400 italic">常规内容区块</div>;
  }
};
