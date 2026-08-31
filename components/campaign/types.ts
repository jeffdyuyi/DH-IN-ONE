

export type BlockType = 'text' | 'subsection' | 'table' | 'divider' | 'enemy' | 'environment' | 'image' | 'read_aloud' | 'callout' | 'outcome' | 'cyberware';

// --- Block Interfaces ---

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string; // Markdown supported
}

export interface SubsectionBlock extends BaseBlock {
  type: 'subsection';
  title: string;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  caption?: string;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface ReadAloudBlock extends BaseBlock {
  type: 'read_aloud';
  content: string;
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  title: string;
  content: string;
  variant: 'info' | 'warning' | 'tip';
}

export type OutcomeTag = 'hope' | 'fear' | 'success' | 'failure' | 'critical';

export interface OutcomeEntry {
  id: string;
  tags: OutcomeTag[];
  content: string;
}

export interface OutcomeBlock extends BaseBlock {
  type: 'outcome';
  // New flexible structure
  entries?: OutcomeEntry[];
  // Legacy fields kept for backward compatibility during display
  hope?: string;
  fear?: string;
  failure?: string;
  critical?: string;
}

export interface Trait {
  id: string;
  name: string;
  type: 'passive' | 'action' | 'reaction' | 'spotlight';
  description: string;
  english?: string;
  flavor?: string;
  isSpecial?: boolean;
}

export interface EnemyBlock extends BaseBlock {
  type: 'enemy';
  name: string;
  englishName?: string;
  tier: number;
  enemyType: string;
  isNpcMode?: boolean;
  avatarUrl?: string;
  avatarShape?: 'circle' | 'square' | 'none';
  healthDisplay?: 'number' | 'dots' | 'both';
  flavor?: string;
  tactics: string;
  experiences: string;
  stats: {
    difficulty: number;
    thresholdMinor: number;
    thresholdMajor: number;
    hp: number;
    stress: number;
  };
  attack: {
    name: string;
    modifier: string;
    damage: string;
    damageType?: 'physical' | 'magical';
    range: string;
  };
  traits: Trait[];
}

export interface EnvironmentFeature {
  id: string;
  name: string;
  type: 'passive' | 'action' | 'reaction' | 'spotlight';
  description: string;
  questions?: string;
}

export interface EnvironmentBlock extends BaseBlock {
  type: 'environment';
  name: string;
  englishName?: string;
  tier: number;
  envType: string;
  imageUrl?: string;
  description: string;
  trend: string;
  difficulty: number;
  potentialEnemies: string;
  countdown?: number;
  countdownDescription?: string;
  features: EnvironmentFeature[];
}

export interface CyberwareBlock extends BaseBlock {
  type: 'cyberware';
  name: string;
  tier: string;          // 位阶: T1, T2, T3, T4...
  cyberType: string;     // 类型: 植入体 (Implant), 仿生件 (Bionic), 时尚件 (Fashionware), 外置设备 (External), 消耗品 (Consumable)...
  zone: string;          // 安装部位: 上肢 (Arms), 下肢 (Legs), 躯干 (Torso), 头部 (Head), 全身 (Full Body)...
  slots: string;         // 占用槽位 (如 "1")
  restriction: string;   // 限制与前置条件 (如 "需要灵巧 +1 以上")
  effect: string;        // 机制效果说明 (支持 Markdown)
  tag: string;           // 特殊标签 (如 "【故障隐患】")
  compCost: string;      // 元件费用 (如 "1.5w 信用点")
  surgCost: string;      // 手术费用 (如 "5000 信用点")
  description?: string;  // 风味描述
  creator?: string;      // 创作者
  owner?: string;        // 所属
}

export type ContentBlock = 
  | TextBlock 
  | SubsectionBlock 
  | DividerBlock 
  | ImageBlock 
  | TableBlock 
  | EnemyBlock 
  | EnvironmentBlock
  | ReadAloudBlock
  | CalloutBlock
  | OutcomeBlock
  | CyberwareBlock;

// --- Structure Definitions ---

export interface DynamicSection {
  id: string;
  title: string;
  level: 1 | 2 | 3 | 4 | 5; 
  columnMode?: 'full' | 'cols';
  italicNote?: string;
  blocks: ContentBlock[];
}

export type ThemeType = 'default' | 'gothic' | 'fairytale' | 'chinese' | 'cyberpunk' | 'darkfantasy' | 'blocky' | 'nightracer';

export interface ThemeCardConfig {
  isDark: boolean;
  bg: string;
  border: string;
  text: string;
  textMuted: string;
  enemyBar: string;
  envBar: string;
  nameText: string;
  nameEnText: string;
  badgeTier: string;
  badgeTypeEnemy: string;
  badgeTypeEnv: string;
  badgeNpc: string;
  avatarBorder: string;
  metaBox: string;
  metaLabelEnemy: string;
  metaLabelEnv: string;
  metaText: string;
  statBox: string;
  statItem: string;
  statLabel: string;
  statVal: string;
  statHpVal: string;
  statStressVal: string;
  hpDot: string;
  stressDot: string;
  attackName: string;
  attackTypeMagic: string;
  attackTypePhys: string;
  attackStats: string;
  traitName: string;
  [key: string]: any;
}

export interface ThemeConfig {
  name: string;
  fontHead: string;
  fontBody: string;
  bg: string;
  text: string;
  accent: string;
  border: string;
  metaBg: string;
  card: ThemeCardConfig;
  [key: string]: any;
}

// --- Cover, Credits & DPCGL Copyright Settings ---

export type DPCGLLogoType = 
  | 'none'
  | 'dh_bottle_color'           // Daggerheart 社区许可全彩药瓶
  | 'dh_bottle_white_color'     // Daggerheart 白字全彩药瓶
  | 'dh_bottle_white'           // Daggerheart 单色纯白药瓶
  | 'dh_bottle_black'           // Daggerheart 单色纯黑药瓶
  | 'dh_compatible_color'       // Compatible with Daggerheart (彩色)
  | 'dh_compatible_white'       // Compatible with Daggerheart (白色)
  | 'dh_compatible_badge'       // Compatible with Daggerheart (黑金徽章)
  | 'candela_gold'              // Candela Obscura 社区徽标 (金黑)
  | 'candela_white'             // Candela Obscura 社区徽标 (纯白)
  | 'candela_black'             // Candela Obscura 社区徽标 (纯黑)
  | 'custom';

export type LogoPosition = 'top-right' | 'top-left' | 'center-top' | 'bottom-right' | 'bottom-left' | 'center-bottom';
export type LogoSize = 'sm' | 'md' | 'lg';

export interface CoverPage {
  enabled: boolean;
  coverImage?: string;          // base64 or URL
  title?: string;               // 主标题 (defaults to project title)
  subtitle?: string;            // 副标题 / tagline
  iconImage?: string;           // 小图标 (logo/seal)
  authorLine?: string;          // 作者栏文字 (defaults to project author)
  footerText?: string;          // 底部脚标
  
  // DPCGL Official Compliance Logo
  dpcglLogo?: DPCGLLogoType;
  dpcglLogoPosition?: LogoPosition;
  dpcglLogoSize?: LogoSize;
  customLogoUrl?: string;
}

export type DPCGLTemplateType = 
  | 'dh_2_0'           // Daggerheart 2.0 官方标准声明 (2026 最新版)
  | 'dh_1_0'           // Daggerheart 1.0 官方标准声明
  | 'dh_bilingual'     // 中英双语合规声明 (推荐)
  | 'candela'          // Candela Obscura 官方声明
  | 'commercial'       // 商业出版完整声明 (含商标许可条款)
  | 'non_commercial'   // 个人非商业分享声明
  | 'custom';          // 完全自定义

export interface CopyrightSettings {
  enabled: boolean;
  template: DPCGLTemplateType;
  workTitle?: string;
  authorName?: string;
  year?: string;
  hasModifications?: boolean;
  modificationsNote?: string;
  customNotice?: string;
  showDPCGLLogo?: boolean;
  dpcglLogo?: DPCGLLogoType;
  rawDeclarationText?: string;
}

export interface CreditsPage {
  enabled: boolean;
  backgroundImage?: string;     // base64 or URL
  creditsText?: string;          // 鸣谢文本 (Markdown)
  footerText?: string;           // 底部附注
  copyright?: CopyrightSettings; // 版权声明与 DPCGL 栏位
}

export interface ProjectSettings {
  showConcept: boolean;     // 1. 核心概念
  showComplexity: boolean;  // 2. 复杂度评级
  showLevelRange: boolean;  // 3. 适用角色等级
  showIntroduction: boolean;// 4. 简介
  showSummary: boolean;     // 5. 概要
  showPrologue: boolean;    // 6. 序言
  showToneThemes: boolean;  // 7. 基调、主题、灵感
  showCopyright: boolean;   // 8. DPCGL 版权声明页/栏位 (即使无封面尾页也可独立展示)
}

export interface ProjectData {
  id?: string;
  title: string;
  author: string;
  
  // Content Fields
  concept: string;
  complexity: number;
  levelRange: string;
  introduction: string;
  summary: string;
  prologue: string;
  tone: string;
  themes: string;
  inspiration: string;

  // Config
  settings: ProjectSettings;
  theme: ThemeType;
  backgroundImage?: string;
  
  // Special Pages
  coverPage?: CoverPage;
  creditsPage?: CreditsPage;
  copyrightPage?: CopyrightSettings; // 独立版权声明页

  // Content
  sections: DynamicSection[];
}

export interface SavedProject {
  id: string;
  title: string;
  author?: string;
  updatedAt: number;
  sectionCount?: number;
  concept?: string;
  data: ProjectData;
}

// --- Default Data ---

export const DEFAULT_PROJECT: ProjectData = {
  id: 'proj_default',
  title: "战役框架模板",
  author: "不咕鸟",
  theme: 'default',
  
  // Field Data
  concept: "在这里填写战役的一句话核心概念（High Concept）。",
  complexity: 3,
  levelRange: "1-10级",
  introduction: "在这里填写战役的简短介绍，用于向玩家推销此战役。",
  summary: "在这里填写模组的剧情概要。",
  prologue: "在这里填写模组的序章或开场白。",
  tone: "例如：史诗、黑暗、轻松",
  themes: "例如：复仇、探索、成长",
  inspiration: "例如：指环王、权力的游戏",

  // Special Pages
  coverPage: { enabled: false },
  creditsPage: { enabled: false },
  copyrightPage: {
    enabled: true,
    template: 'dh_bilingual',
    year: '2026',
    showDPCGLLogo: true,
    dpcglLogo: 'dh_bottle_white_color',
  },

  // Visibility Defaults
  settings: {
    showConcept: true,
    showComplexity: true,
    showLevelRange: false,
    showIntroduction: true,
    showSummary: false,
    showPrologue: false,
    showToneThemes: true,
    showCopyright: true
  },

  sections: [
    {
      id: "s_bg",
      title: "背景概述",
      level: 1,
      blocks: [
        {
          id: "b_bg_1",
          type: "text",
          content: "背景概述是对战役框架的更详细描述（通常不超过⼀⻚半）涵盖战役的主要元素以及玩家可从中期待的内容。它应⽐⼀段式简介更为全⾯，但并⾮详尽⽆遗——背景概述属于⾼层次描述，玩家可通过阅读获取关于世界和故事的更多信息。由于背景概述⾯向玩家，因此不应包含任何不希望玩家知晓的秘密。"
        }
      ]
    },
    {
      id: "s_heritage",
      title: "传承与职业",
      level: 2,
      blocks: [
        {
          id: "b_heritage_1",
          type: "text",
          content: "战役框架中包含关于社群、种族和职业的部分，将提供关于传承或职业在此战役框架中可能如何以不同⽅式运作的信息，或在某些情况下，哪些选项不可⽤（以及原因）。这些部分通常会为拥有这些传承或职业的⻆⾊提供额外的背景提⽰，以帮助他们更牢固地融⼊设定。"
        }
      ]
    },
    {
      id: "s_player_rules",
      title: "玩家守则",
      level: 3,
      blocks: [
        {
          id: "b_player_rules_1",
          type: "text",
          content: "正如《⼔⾸之⼼》中有玩家守则，每个战役框架也设有主题指导⽅针，供玩家在战役过程中遵循。遵循这些指导⽅针有助于玩家保持理想的⼼态，从⽽更好地体验战役框架。在制定这些⽅针时，应确保它们具有感染⼒、具体明确，并且对玩家⽽⾔具有可操作性。"
        }
      ]
    },
    {
      id: "s_gm_rules",
      title: "游戏主持⼈守则",
      level: 3,
      blocks: [
        {
          id: "b_gm_rules_1",
          type: "text",
          content: "每个战役框架还设有对应的游戏主持⼈守则，⽤以补充核⼼游戏守则。这些守则为游戏主持⼈规划并引导⼀场符合战役框架设计的游戏提供⽀持与指导。在制定这些守则时，应引导游戏主持⼈贴合战役主题，并⿎励其采取你希望的⾏动⽅式。"
        }
      ]
    },
    {
      id: "s_features",
      title: "特⾊设定",
      level: 3,
      blocks: [
        {
          id: "b_features_1",
          type: "text",
          content: "特⾊设定是将战役框架的世界与其他设定区别开来的具体⽅⾯。它们是⽀撑战役画布的⽀柱，是游戏主持⼈构建故事的基⽯。它们确⽴了战役的⽀柱，包括关于世界设定的核⼼真相、主要地点、重要的团体或派系，以及有助于营造设定氛围或主题的叙事元素（如⽂化、重要的历史事件、近期灾难、冲突和宇宙观等）。值得注意的是，它们不包含战役框架的⾃定义规则——这些内容将在后续独⽴章节中说明。"
        },
        {
          id: "b_features_2",
          type: "text",
          content: "特⾊设定也标志着⾯向游戏主持⼈的信息正式开始。虽然游戏主持⼈可以与玩家分享本章节中的部分内容，但这⾥才是你开始铺设秘密的地⽅，这些秘密将⽤于在整个战役中构建引⼈⼊胜的故事弧线。"
        }
      ]
    },
    {
      id: "s_prologue_sample",
      title: "楔⼦",
      level: 3,
      blocks: [
        {
          id: "b_prologue_sample_1",
          type: "text",
          content: "楔⼦是使⽤该战役框架的开场⽰例。它旨在向团队介绍核⼼主题以及框架的⼀些特⾊设定，同时演⽰游戏主持⼈启动战役的⼀种可能⽅式。"
        }
      ]
    },
    {
      id: "s_mechanics",
      title: "⾃定义机制",
      level: 3,
      blocks: [
        {
          id: "b_mechanics_1",
          type: "text",
          content: "每个战役框架都包含新的游戏机制和⼯具，这些机制和⼯具代表了战役框架独有的元素，旨在增强在该设定中进⾏游戏的体验。有时这些机制源于战役框架所采⽤的类型惯例，有时它们则是为了⽀持框架独特的背景故事⽽设计的⼯具。"
        }
      ]
    },
    {
      id: "s_zero_session",
      title: "第零场游戏问题",
      level: 3,
      blocks: [
        {
          id: "b_zero_1",
          type: "text",
          content: "这些是该战役框架特有的新问题，应在第零场游戏期间提出。这些问题既能帮助玩家⻆⾊融⼊设定，也能促使团队明确他们希望如何处理或应对战役中重要的主题或内容元素（例如⾎腥场景、战争影响或队内冲突）。"
        },
        {
          id: "b_zero_2",
          type: "text",
          content: "作为参考，你可以查阅核⼼规则书中各战役框架的第零场问题，以及每个职业⻆⾊指引中的背景和关系问题。"
        }
      ]
    },
    {
      id: "s_appendix",
      title: "附录",
      level: 2,
      blocks: [
        {
          id: "b_blank_enemy",
          type: "enemy",
          name: "空白敌人",
          englishName: "BLANK ENEMY",
          tier: 1,
          enemyType: "类型",
          flavor: "在此处描述敌人的外观...",
          tactics: "在此处描述敌人的战术...",
          experiences: "",
          stats: {
            difficulty: 10,
            thresholdMinor: 5,
            thresholdMajor: 10,
            hp: 5,
            stress: 3
          },
          attack: {
            name: "攻击名称",
            modifier: "+0",
            damage: "d8",
            range: "近战"
          },
          traits: []
        },
        {
          id: "b_blank_env",
          type: "environment",
          name: "空白环境",
          englishName: "BLANK ENVIRONMENT",
          tier: 1,
          envType: "类型",
          description: "环境描述...",
          trend: "",
          difficulty: 10,
          potentialEnemies: "",
          features: []
        }
      ]
    }
  ]
};